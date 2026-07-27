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

test('decodes quoted non-ASCII paths and counts modifications', () => {
  const files = parsePatchFiles(`diff --git "a/caf\\303\\251.txt" "b/caf\\303\\251.txt"
--- "a/caf\\303\\251.txt"
+++ "b/caf\\303\\251.txt"
@@ -1 +1 @@
-old
+new
`);
  assert.deepEqual(files, [{ path: 'café.txt', status: 'modified', additions: 1, deletions: 1 }]);
  assert.deepEqual(patchStats(files), { files: 1, additions: 1, deletions: 1 });
});

test('decodes quoted added and deleted paths', () => {
  const files = parsePatchFiles(`diff --git "a/\\346\\226\\260.txt" "b/\\346\\226\\260.txt"
new file mode 100644
--- /dev/null
+++ "b/\\346\\226\\260.txt"
@@ -0,0 +1 @@
+new
diff --git "a/\\345\\217\\244.txt" "b/\\345\\217\\244.txt"
deleted file mode 100644
--- "a/\\345\\217\\244.txt"
+++ /dev/null
@@ -1 +0,0 @@
-old
`);
  assert.deepEqual(files, [
    { path: '古.txt', status: 'deleted', additions: 0, deletions: 1 },
    { path: '新.txt', status: 'added', additions: 1, deletions: 0 }
  ]);
});

test('decodes quoted rename metadata', () => {
  const files = parsePatchFiles(`diff --git "a/caf\\303\\251 old.txt" "b/caf\\303\\251 new.txt"
similarity index 100%
rename from "caf\\303\\251 old.txt"
rename to "caf\\303\\251 new.txt"
`);
  assert.deepEqual(files, [{ path: 'café new.txt', status: 'renamed', additions: 0, deletions: 0 }]);
});

test('retains unquoted paths containing spaces', () => {
  const files = parsePatchFiles(`diff --git a/old name.txt b/old name.txt
--- a/old name.txt
+++ b/old name.txt
@@ -1 +1 @@
-old
+new
`);
  assert.deepEqual(files, [{ path: 'old name.txt', status: 'modified', additions: 1, deletions: 1 }]);
});

test('validates decoded quoted paths', () => {
  assert.throws(
    () => parsePatchFiles(`diff --git "a/..\\057secret" "b/..\\057secret"\n`),
    /path traversal blocked/
  );
});
