import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectBundle } from '../inspect.js';
import type { PatchPackBundle } from '../types.js';

const bundle: PatchPackBundle = {
  patch: 'diff --git a/a b/a\n',
  manifest: {
    version: 1,
    createdAt: '1970-01-01T00:00:00.000Z',
    tool: 'patchpack',
    base: 'HEAD',
    gitHead: 'abc',
    validate: ['npm test'],
    files: [{ path: 'a', status: 'modified', additions: 1, deletions: 0 }],
    stats: { files: 1, additions: 1, deletions: 0 },
    patchSha256: 'hash'
  }
};

test('inspectBundle renders markdown and json', () => {
  assert.match(inspectBundle(bundle, 'markdown'), /PatchPack/);
  assert.match(inspectBundle(bundle, 'json'), /"patchSha256": "hash"/);
});
