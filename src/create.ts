import { readFile } from 'node:fs/promises';
import { fail } from './errors.js';
import { currentHead, diffAgainst, requireGitRepo } from './git.js';
import { sha256 } from './hash.js';
import { parsePatchFiles, patchStats } from './patch.js';
import { findSecrets } from './secrets.js';
import { writeBundle } from './bundle.js';
import type { CreateOptions, PatchPackBundle } from './types.js';

export async function createBundle(options: CreateOptions): Promise<PatchPackBundle> {
  requireGitRepo(options.cwd);
  const base = options.base ?? 'HEAD';
  const patch = diffAgainst(base, options.cwd);
  if (!patch.trim()) fail('no diff found to package', 'EMPTY_DIFF');
  const secretFindings = findSecrets(patch);
  if (secretFindings.length) {
    fail(`refusing to package likely secret (${secretFindings[0]?.label} on patch line ${secretFindings[0]?.line})`, 'SECRET_DETECTED');
  }
  const files = parsePatchFiles(patch);
  const notes = options.notes ? await readFile(options.notes, 'utf8') : undefined;
  const manifest = {
    version: 1 as const,
    createdAt: '1970-01-01T00:00:00.000Z',
    tool: 'patchpack' as const,
    base,
    gitHead: currentHead(options.cwd),
    notes,
    validate: options.validate,
    files,
    stats: patchStats(files),
    patchSha256: sha256(patch)
  };
  const bundle = { manifest, patch };
  await writeBundle(options.out, bundle);
  return bundle;
}
