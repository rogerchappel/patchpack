import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readBundle, writeBundle } from '../bundle.js';
import type { PatchPackBundle } from '../types.js';

const bundle: PatchPackBundle = {
  patch: 'patch',
  manifest: {
    version: 1,
    createdAt: '1970-01-01T00:00:00.000Z',
    tool: 'patchpack',
    base: 'HEAD',
    gitHead: null,
    validate: [],
    files: [],
    stats: { files: 0, additions: 0, deletions: 0 },
    patchSha256: 'x'
  }
};

test('bundle round-trips from disk', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'patchpack-'));
  const file = path.join(dir, 'x.ppack');
  await writeBundle(file, bundle);
  assert.deepEqual(await readBundle(file), bundle);
  await rm(dir, { recursive: true, force: true });
});
