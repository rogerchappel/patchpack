import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function expectedTag(version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`package.json has an invalid release version: ${version}`);
  }
  return `v${version}`;
}

export function assertReleaseTag(refName, version) {
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(refName ?? '')) {
    throw new Error(`Malformed release tag: ${refName || '<empty>'}`);
  }
  const expected = expectedTag(version);
  if (refName !== expected) {
    throw new Error(`Release tag ${refName} does not match package version ${expected}`);
  }
  return expected;
}

export function assertSingleTarball(files, directory) {
  const tarballs = files.filter((file) => file.endsWith('.tgz'));
  if (tarballs.length !== 1) {
    throw new Error(`Expected exactly one tarball in ${directory}; found ${tarballs.length}`);
  }
  return resolve(directory, tarballs[0]);
}

export function releaseCommands({ exists, tag, notesFile, artifact }) {
  if (!exists) {
    return [['release', 'create', tag, '--notes-file', notesFile, artifact]];
  }
  return [
    ['release', 'edit', tag, '--notes-file', notesFile],
    ['release', 'upload', tag, artifact, '--clobber'],
  ];
}

function runGh(args, options = {}) {
  const result = spawnSync('gh', args, { stdio: options.quiet ? 'ignore' : 'inherit' });
  return result.status ?? 1;
}

async function packageVersion() {
  return JSON.parse(await readFile('package.json', 'utf8')).version;
}

async function main([command, ...args]) {
  if (command === 'check-tag') {
    console.log(assertReleaseTag(args[0] ?? process.env.GITHUB_REF_NAME, await packageVersion()));
    return;
  }
  if (command === 'artifact') {
    const directory = args[0] ?? 'release-artifacts';
    console.log(assertSingleTarball(await readdir(directory), directory));
    return;
  }
  if (command === 'publish') {
    const [tag, notesFile, artifact] = args;
    if (!tag || !notesFile || !artifact) throw new Error('publish requires <tag> <notes-file> <artifact>');
    const exists = runGh(['release', 'view', tag], { quiet: true }) === 0;
    for (const ghArgs of releaseCommands({ exists, tag, notesFile, artifact })) {
      if (runGh(ghArgs) !== 0) throw new Error(`gh ${ghArgs.slice(0, 2).join(' ')} failed`);
    }
    return;
  }
  throw new Error('usage: release-guard.mjs <check-tag|artifact|publish> [arguments]');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
