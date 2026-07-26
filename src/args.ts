import { fail } from './errors.js';

export interface ParsedArgs { _: string[]; flags: Record<string, string | boolean | string[]>; }

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean | string[]> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const [rawKey, inlineValue] = token.slice(2).split('=', 2);
    const key = rawKey;
    const value = inlineValue ?? (argv[index + 1] && !argv[index + 1]!.startsWith('--') ? argv[++index] : true);
    if (flags[key] === undefined) flags[key] = value;
    else if (Array.isArray(flags[key])) (flags[key] as string[]).push(String(value));
    else flags[key] = [String(flags[key]), String(value)];
  }
  return { _: positional, flags };
}

export function stringFlag(flags: ParsedArgs['flags'], key: string): string | undefined {
  const value = flags[key];
  if (Array.isArray(value)) return value.at(-1);
  if (typeof value === 'boolean') fail(`--${key} needs a value`, 'USAGE');
  return value;
}

export function booleanFlag(flags: ParsedArgs['flags'], key: string): boolean {
  const value = flags[key];
  if (value === undefined) return false;
  if (value !== true) fail(`--${key} does not take a value`, 'USAGE');
  return true;
}

export function arrayFlag(flags: ParsedArgs['flags'], key: string): string[] {
  const value = flags[key];
  if (!value) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export function rejectUnknownFlags(flags: ParsedArgs['flags'], allowed: string[]): void {
  const unknown = Object.keys(flags).find(key => !allowed.includes(key));
  if (unknown) fail(`unknown flag: --${unknown}`, 'USAGE');
}

export function requirePositionals(positionals: string[], count: number, usage: string): void {
  if (positionals.length !== count) fail(`usage: ${usage}`, 'USAGE');
}
