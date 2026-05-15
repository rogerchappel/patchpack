import { assertSafePath } from './paths.js';
import type { PatchPackFile } from './types.js';

export function parsePatchFiles(patch: string): PatchPackFile[] {
  const byPath = new Map<string, PatchPackFile>();
  let current: PatchPackFile | null = null;

  for (const line of patch.split('\n')) {
    if (line.startsWith('diff --git ')) {
      const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
      if (!match) continue;
      const path = match[2];
      assertSafePath(path);
      current = { path, status: 'modified', additions: 0, deletions: 0 };
      byPath.set(path, current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('new file mode')) current.status = 'added';
    if (line.startsWith('deleted file mode')) current.status = 'deleted';
    if (line.startsWith('rename to ')) {
      current.path = line.slice('rename to '.length);
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
