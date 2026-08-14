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
const installDirectory = path.join(tmp, 'install');

const requiredEntries = new Set([
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'SECURITY.md',
  'examples/HANDOFF.md',
  'examples/expected-inspect.md',
  'package.json',
  'dist/cli.js',
  'dist/index.d.ts',
  'dist/index.js'
]);
const allowedEntry = /^(?:CHANGELOG\.md|CONTRIBUTING\.md|LICENSE|README\.md|SECURITY\.md|package\.json|examples\/(?:HANDOFF\.md|expected-inspect\.md)|dist\/(?!test\/)[^/]+\.(?:js|js\.map|d\.ts))$/;

try {
  mkdirSync(packDirectory);
  const packResult = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', packDirectory], {
    cwd: root,
    encoding: 'utf8'
  }));

  if (packResult.length !== 1) {
    throw new Error(`expected one packed package, found ${packResult.length}`);
  }
  const entries = packResult[0].files.map(({ path: entry }) => entry);
  const unexpected = entries.filter(entry => !allowedEntry.test(entry));
  if (unexpected.length > 0) {
    throw new Error(`package contains forbidden entries: ${unexpected.join(', ')}`);
  }
  const missing = [...requiredEntries].filter(entry => !entries.includes(entry));
  if (missing.length > 0) {
    throw new Error(`package is missing required entries: ${missing.join(', ')}`);
  }

  const archives = readdirSync(packDirectory).filter(file => file.endsWith('.tgz'));
  if (archives.length !== 1) {
    throw new Error(`expected one package archive, found ${archives.length}`);
  }

  const archive = path.join(packDirectory, archives[0]);
  execFileSync('npm', ['install', '--prefix', installDirectory, archive], {
    cwd: tmp,
    stdio: 'pipe'
  });

  const executable = path.join(
    installDirectory,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'patchpack.cmd' : 'patchpack'
  );
  const help = execFileSync(executable, ['--help'], { encoding: 'utf8' });
  if (!help.includes('patchpack — portable patch bundles for agent handoffs')) {
    throw new Error('installed patchpack --help did not identify this project');
  }

  const imported = execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', "import('patchpack').then(m => console.log(typeof m.createBundle))"],
    { cwd: installDirectory, encoding: 'utf8' }
  ).trim();
  if (imported !== 'function') {
    throw new Error(`installed patchpack library import failed: expected function, found ${imported}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
