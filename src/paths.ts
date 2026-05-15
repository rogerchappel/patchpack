import path from 'node:path';
import { fail } from './errors.js';

export function assertSafePath(filePath: string): void {
  const normalized = filePath.replaceAll('\\\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('\0')) {
    fail(`unsafe path in patch: ${filePath}`, 'UNSAFE_PATH');
  }
  const parts = normalized.split('/');
  if (parts.includes('..')) fail(`path traversal blocked: ${filePath}`, 'UNSAFE_PATH');
}

export function readPathArg(value: string | undefined, name: string): string {
  if (!value) fail(`missing required ${name}`, 'USAGE');
  return path.resolve(value);
}
