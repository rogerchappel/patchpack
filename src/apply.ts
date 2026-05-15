import { fail } from './errors.js';
import { applyCheck, applyPatch, hasCleanTree } from './git.js';
import { sha256 } from './hash.js';
import { readBundle } from './bundle.js';
import type { ApplyOptions } from './types.js';

export async function applyBundle(options: ApplyOptions): Promise<{ applied: boolean; files: number }> {
  const bundle = await readBundle(options.bundlePath);
  const actualHash = sha256(bundle.patch);
  if (actualHash !== bundle.manifest.patchSha256) fail('patch hash mismatch; bundle may be corrupted', 'HASH_MISMATCH');
  if (!options.skipCleanCheck && !hasCleanTree(options.cwd)) {
    fail('working tree is not clean; commit/stash changes or pass --skip-clean-check', 'DIRTY_TREE');
  }
  applyCheck(bundle.patch, options.cwd);
  if (options.write) {
    applyPatch(bundle.patch, options.cwd);
    return { applied: true, files: bundle.manifest.stats.files };
  }
  return { applied: false, files: bundle.manifest.stats.files };
}
