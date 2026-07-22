import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const readme = readFileSync(path.join(root, 'README.md'), 'utf8');

if (/^\s*npm install -g patchpack\s*$/m.test(readme)) {
  throw new Error('README must not install the unrelated npm package named patchpack');
}

const tmp = mkdtempSync(path.join(tmpdir(), 'patchpack-package-smoke-'));
const packDirectory = path.join(tmp, 'pack');
const installPrefix = path.join(tmp, 'install');

try {
  mkdirSync(packDirectory);
  execFileSync('npm', ['pack', '--pack-destination', packDirectory], {
    cwd: root,
    stdio: 'pipe'
  });

  const archives = readdirSync(packDirectory).filter(file => file.endsWith('.tgz'));
  if (archives.length !== 1) {
    throw new Error(`expected one package archive, found ${archives.length}`);
  }

  const archive = path.join(packDirectory, archives[0]);
  execFileSync('npm', ['install', '--global', '--prefix', installPrefix, archive], {
    cwd: tmp,
    stdio: 'pipe'
  });

  const executable = path.join(
    installPrefix,
    process.platform === 'win32' ? 'patchpack.cmd' : 'bin/patchpack'
  );
  const help = execFileSync(executable, ['--help'], { encoding: 'utf8' });
  if (!help.includes('patchpack — portable patch bundles for agent handoffs')) {
    throw new Error('installed patchpack --help did not identify this project');
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
