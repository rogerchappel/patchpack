#!/usr/bin/env node
import process from 'node:process';
import { applyBundle } from './apply.js';
import { arrayFlag, booleanFlag, parseArgs, rejectUnknownFlags, requirePositionals, stringFlag } from './args.js';
import { createBundle } from './create.js';
import { PatchPackError, fail } from './errors.js';
import { commandHelp, help } from './help.js';
import { inspectBundle, type InspectFormat } from './inspect.js';
import { readPathArg } from './paths.js';
import { readBundle } from './bundle.js';

async function main(argv: string[]): Promise<void> {
  const parsed = parseArgs(argv);
  const [command, first] = parsed._;
  if (!command || command === 'help' || booleanFlag(parsed.flags, 'help')) {
    console.log(command && commandHelp[command] ? commandHelp[command] : help);
    return;
  }
  if (command === 'create') {
    rejectUnknownFlags(parsed.flags, ['out', 'notes', 'base', 'validate']);
    requirePositionals(parsed._, 1, 'patchpack create --out change.ppack [options]');
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
    rejectUnknownFlags(parsed.flags, ['format']);
    requirePositionals(parsed._, 2, 'patchpack inspect <bundle> [--format markdown|json]');
    const bundlePath = readPathArg(first, 'bundle');
    const format = (stringFlag(parsed.flags, 'format') ?? 'markdown') as InspectFormat;
    if (format !== 'json' && format !== 'markdown') fail('--format must be markdown or json', 'USAGE');
    console.log(inspectBundle(await readBundle(bundlePath), format));
    return;
  }
  if (command === 'apply') {
    rejectUnknownFlags(parsed.flags, ['write', 'skip-clean-check']);
    requirePositionals(parsed._, 2, 'patchpack apply <bundle> [--write] [--skip-clean-check]');
    const bundlePath = readPathArg(first, 'bundle');
    const result = await applyBundle({
      bundlePath,
      cwd: process.cwd(),
      write: booleanFlag(parsed.flags, 'write'),
      skipCleanCheck: booleanFlag(parsed.flags, 'skip-clean-check')
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
