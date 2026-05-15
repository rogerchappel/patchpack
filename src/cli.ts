#!/usr/bin/env node
import process from 'node:process';
import { applyBundle } from './apply.js';
import { arrayFlag, parseArgs, stringFlag } from './args.js';
import { createBundle } from './create.js';
import { PatchPackError, fail } from './errors.js';
import { commandHelp, help } from './help.js';
import { inspectBundle, type InspectFormat } from './inspect.js';
import { readPathArg } from './paths.js';
import { readBundle } from './bundle.js';

async function main(argv: string[]): Promise<void> {
  const parsed = parseArgs(argv);
  const [command, first] = parsed._;
  if (!command || command === 'help' || parsed.flags.help) {
    console.log(command && commandHelp[command] ? commandHelp[command] : help);
    return;
  }
  if (command === 'create') {
    const out = readPathArg(stringFlag(parsed.flags, 'out'), '--out');
    const bundle = await createBundle({
      out,
      notes: stringFlag(parsed.flags, 'notes'),
      base: stringFlag(parsed.flags, 'base'),
      validate: arrayFlag(parsed.flags, 'validate'),
      cwd: process.cwd()
    });
    console.log(`created ${out} with ${bundle.manifest.stats.files} file(s)`);
    return;
  }
  if (command === 'inspect') {
    const bundlePath = readPathArg(first, 'bundle');
    const format = (stringFlag(parsed.flags, 'format') ?? 'markdown') as InspectFormat;
    if (format !== 'json' && format !== 'markdown') fail('--format must be markdown or json', 'USAGE');
    console.log(inspectBundle(await readBundle(bundlePath), format));
    return;
  }
  if (command === 'apply') {
    const bundlePath = readPathArg(first, 'bundle');
    const result = await applyBundle({
      bundlePath,
      cwd: process.cwd(),
      write: Boolean(parsed.flags.write),
      skipCleanCheck: Boolean(parsed.flags['skip-clean-check'])
    });
    console.log(result.applied ? `applied ${result.files} file(s)` : `dry-run ok for ${result.files} file(s); pass --write to apply`);
    return;
  }
  fail(`unknown command: ${command}`, 'USAGE');
}

main(process.argv.slice(2)).catch(error => {
  if (error instanceof PatchPackError) {
    console.error(`patchpack: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
