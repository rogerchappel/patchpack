import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const cli = path.join(root, 'dist', 'cli.js');
const tmp = mkdtempSync(path.join(tmpdir(), 'patchpack-smoke-'));
try {
  cpSync(path.join(root, 'test', 'fixtures', 'basic'), tmp, { recursive: true });
  execFileSync('git', ['init', '-b', 'main'], { cwd: tmp, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'smoke@example.invalid'], { cwd: tmp });
  execFileSync('git', ['config', 'user.name', 'PatchPack Smoke'], { cwd: tmp });
  execFileSync('git', ['add', '.'], { cwd: tmp });
  execFileSync('git', ['commit', '-m', 'base'], { cwd: tmp, stdio: 'ignore' });
  writeFileSync(path.join(tmp, 'greeting.txt'), 'hello from patchpack\n');
  const bundle = path.join(tmp, 'greeting.ppack');
  execFileSync('node', [cli, 'create', '--out', bundle, '--validate', 'npm test'], { cwd: tmp, stdio: 'pipe' });
  const inspect = execFileSync('node', [cli, 'inspect', bundle, '--format', 'json'], { cwd: tmp, encoding: 'utf8' });
  if (!inspect.includes('greeting.txt')) throw new Error('inspect did not include changed file');
  execFileSync('git', ['checkout', '--', '.'], { cwd: tmp });
  execFileSync('node', [cli, 'apply', bundle], { cwd: tmp, stdio: 'pipe' });
  execFileSync('node', [cli, 'apply', bundle, '--write'], { cwd: tmp, stdio: 'pipe' });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
