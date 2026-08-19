import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/release-dry-run.yml', import.meta.url), 'utf8');

function pullRequestPaths(source) {
  const lines = source.split(/\r?\n/);
  const pullRequestIndex = lines.findIndex(line => /^  pull_request:\s*$/.test(line));
  assert.notEqual(pullRequestIndex, -1, 'release dry run must have a pull_request trigger');

  const pathsIndex = lines.findIndex((line, index) => index > pullRequestIndex && /^    paths:\s*$/.test(line));
  assert.notEqual(pathsIndex, -1, 'release dry run pull_request trigger must filter paths');

  const paths = [];
  for (const line of lines.slice(pathsIndex + 1)) {
    const match = line.match(/^      -\s+(.+?)\s*$/);
    if (!match) break;
    paths.push(match[1].replace(/^['"]|['"]$/g, ''));
  }
  return paths;
}

test('release dry run watches every release-check and packed-surface input', () => {
  const paths = new Set(pullRequestPaths(workflow));
  const required = [
    'src/**',
    'scripts/**',
    'examples/**',
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'LICENSE',
    'SECURITY.md',
    'tsconfig*.json',
    'releasebox.config.json',
    'package.json',
    'package-lock.json',
    '.github/workflows/release*.yml',
  ];

  assert.deepEqual(required.filter(path => !paths.has(path)), []);
  assert.ok(paths.has('src/**'), 'source-only changes must trigger the release dry run');
  assert.ok(paths.has('scripts/**'), 'release-script-only changes must trigger the release dry run');
  assert.ok(paths.has('scripts/**'), 'the workflow contract test must trigger the release dry run');
});
