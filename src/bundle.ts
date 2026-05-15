import { readFile, writeFile } from 'node:fs/promises';
import { fail } from './errors.js';
import { stableJson } from './hash.js';
import type { PatchPackBundle } from './types.js';

const MAGIC = 'PATCHPACK/1';

export async function writeBundle(path: string, bundle: PatchPackBundle): Promise<void> {
  await writeFile(path, `${MAGIC}\n${stableJson(bundle)}`, 'utf8');
}

export async function readBundle(path: string): Promise<PatchPackBundle> {
  const raw = await readFile(path, 'utf8');
  if (!raw.startsWith(`${MAGIC}\n`)) fail('not a patchpack bundle', 'BAD_BUNDLE');
  const parsed = JSON.parse(raw.slice(MAGIC.length + 1)) as PatchPackBundle;
  if (!parsed.manifest || typeof parsed.patch !== 'string') fail('invalid patchpack payload', 'BAD_BUNDLE');
  return parsed;
}
