import { assertSafePath } from './paths.js';
import type { PatchPackFile } from './types.js';

function decodeGitPath(value: string): string {
  if (!value.startsWith('"')) return value;
  if (!value.endsWith('"')) throw new Error(`Invalid quoted Git path: ${value}`);

  const bytes: number[] = [];
  const escapes: Record<string, number> = {
    a: 0x07, b: 0x08, t: 0x09, n: 0x0a, v: 0x0b, f: 0x0c, r: 0x0d,
    '"': 0x22, '\\': 0x5c
  };
  const inner = value.slice(1, -1);
  for (let index = 0; index < inner.length; index += 1) {
    const character = inner[index];
    if (character !== '\\') {
      bytes.push(...Buffer.from(character));
      continue;
    }
    const escaped = inner[++index];
    if (escaped === undefined) throw new Error(`Invalid quoted Git path: ${value}`);
    if (/[0-7]/.test(escaped)) {
      const octal = inner.slice(index, index + 3);
      if (!/^[0-7]{3}$/.test(octal)) throw new Error(`Invalid octal escape in Git path: ${value}`);
      bytes.push(Number.parseInt(octal, 8));
      index += 2;
    } else if (escaped in escapes) {
      bytes.push(escapes[escaped]);
    } else {
      throw new Error(`Invalid escape in Git path: ${value}`);
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

function diffDestination(line: string): string | null {
  const quoted = /^diff --git "(?:[^"\\]|\\.)*" ("(?:[^"\\]|\\.)*")$/.exec(line);
  if (quoted) return decodeGitPath(quoted[1]).replace(/^b\//, '');
  const unquoted = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
  return unquoted?.[2] ?? null;
}

export function parsePatchFiles(patch: string): PatchPackFile[] {
  const byPath = new Map<string, PatchPackFile>();
  let current: PatchPackFile | null = null;

  for (const line of patch.split('\n')) {
    if (line.startsWith('diff --git ')) {
      const path = diffDestination(line);
      if (path === null) continue;
      assertSafePath(path);
      current = { path, status: 'modified', additions: 0, deletions: 0 };
      byPath.set(path, current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('new file mode')) current.status = 'added';
    if (line.startsWith('deleted file mode')) current.status = 'deleted';
    if (line.startsWith('rename to ')) {
      current.path = decodeGitPath(line.slice('rename to '.length));
      current.status = 'renamed';
      assertSafePath(current.path);
    }
    if (line.startsWith('index ')) {
      const match = /^index ([a-f0-9]+)\.\.([a-f0-9]+)/.exec(line);
      if (match) {
        current.beforeSha256 = match[1];
        current.afterSha256 = match[2];
      }
    }
    if (line.startsWith('+') && !line.startsWith('+++')) current.additions += 1;
    if (line.startsWith('-') && !line.startsWith('---')) current.deletions += 1;
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function patchStats(files: PatchPackFile[]): { files: number; additions: number; deletions: number } {
  return {
    files: files.length,
    additions: files.reduce((sum, file) => sum + file.additions, 0),
    deletions: files.reduce((sum, file) => sum + file.deletions, 0)
  };
}
