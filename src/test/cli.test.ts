import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const cli = path.resolve('dist/cli.js');

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function run(cwd: string, ...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

test('apply rejects valued booleans without writing or bypassing the clean-tree guard', () => {
  const source = mkdtempSync(path.join(tmpdir(), 'patchpack-cli-source-'));
  const target = mkdtempSync(path.join(tmpdir(), 'patchpack-cli-target-'));
  const bundle = path.join(tmpdir(), `patchpack-cli-${path.basename(source)}.ppack`);
  try {
    for (const cwd of [source, target]) {
      git(cwd, 'init', '-b', 'main');
      git(cwd, 'config', 'user.name', 'PatchPack Test');
      git(cwd, 'config', 'user.email', 'test@example.invalid');
      writeFileSync(path.join(cwd, 'tracked.txt'), 'before\n');
      git(cwd, 'add', '.');
      git(cwd, 'commit', '-m', 'base');
    }
    writeFileSync(path.join(source, 'tracked.txt'), 'after\n');
    assert.equal(run(source, 'create', '--out', bundle).status, 0);

    const valuedWrite = run(target, 'apply', bundle, '--write=false');
    assert.equal(valuedWrite.status, 1);
    assert.match(valuedWrite.stderr, /--write does not take a value/);
    assert.equal(readFileSync(path.join(target, 'tracked.txt'), 'utf8'), 'before\n');

    writeFileSync(path.join(target, 'untracked.txt'), 'dirty\n');
    const valuedSkip = run(target, 'apply', bundle, '--skip-clean-check=false');
    assert.equal(valuedSkip.status, 1);
    assert.match(valuedSkip.stderr, /--skip-clean-check does not take a value/);

    assert.equal(run(target, 'apply', bundle, '--skip-clean-check').status, 0);
    assert.equal(run(target, 'apply', bundle, '--skip-clean-check', '--write').status, 0);
    assert.equal(readFileSync(path.join(target, 'tracked.txt'), 'utf8'), 'after\n');
  } finally {
    rmSync(source, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
    rmSync(bundle, { force: true });
  }
});

test('apply rejects unknown flags and extra positional arguments', () => {
  assert.match(run(process.cwd(), 'apply', 'bundle.ppack', '--wirte').stderr, /unknown flag: --wirte/);
  assert.match(run(process.cwd(), 'apply', 'bundle.ppack', 'extra').stderr, /usage: patchpack apply/);
});
