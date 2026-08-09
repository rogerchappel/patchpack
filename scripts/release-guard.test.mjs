import test from 'node:test';
import assert from 'node:assert/strict';
import { assertReleaseTag, assertSingleTarball, releaseCommands } from './release-guard.mjs';

test('release tag must be well formed and match package version', () => {
  assert.equal(assertReleaseTag('v0.1.0', '0.1.0'), 'v0.1.0');
  assert.throws(() => assertReleaseTag('release-0.1.0', '0.1.0'), /Malformed release tag/);
  assert.throws(() => assertReleaseTag('v0.2.0', '0.1.0'), /does not match package version/);
});

test('artifact directory must contain exactly one tarball', () => {
  assert.match(assertSingleTarball(['patchpack-0.1.0.tgz'], 'out'), /out\/patchpack-0\.1\.0\.tgz$/);
  assert.throws(() => assertSingleTarball([], 'out'), /found 0/);
  assert.throws(() => assertSingleTarball(['a.tgz', 'b.tgz'], 'out'), /found 2/);
});

test('first publish creates a release with its artifact', () => {
  assert.deepEqual(releaseCommands({ exists: false, tag: 'v0.1.0', notesFile: 'notes.md', artifact: 'out/a.tgz' }), [
    ['release', 'create', 'v0.1.0', '--notes-file', 'notes.md', 'out/a.tgz'],
  ]);
});

test('rerun repairs notes and replaces the artifact', () => {
  assert.deepEqual(releaseCommands({ exists: true, tag: 'v0.1.0', notesFile: 'notes.md', artifact: 'out/a.tgz' }), [
    ['release', 'edit', 'v0.1.0', '--notes-file', 'notes.md'],
    ['release', 'upload', 'v0.1.0', 'out/a.tgz', '--clobber'],
  ]);
});
