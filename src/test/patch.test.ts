import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePatchFiles, patchStats } from '../patch.js';

const patch = `diff --git a/hello.txt b/hello.txt
index e69de29..ce01362 100644
--- a/hello.txt
+++ b/hello.txt
@@ -0,0 +1,2 @@
+hello
+world
`;

test('parsePatchFiles returns sorted stats', () => {
  const files = parsePatchFiles(patch);
  assert.deepEqual(files, [{ path: 'hello.txt', status: 'modified', additions: 2, deletions: 0, beforeSha256: 'e69de29', afterSha256: 'ce01362' }]);
  assert.deepEqual(patchStats(files), { files: 1, additions: 2, deletions: 0 });
});
