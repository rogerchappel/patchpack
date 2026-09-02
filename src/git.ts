import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fail } from './errors.js';

export function git(args: string[], cwd: string): string {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`git ${args.join(' ')} failed: ${detail}`, 'GIT_FAILED');
  }
}

export function gitMaybe(args: string[], cwd: string): string | null {
  try {
    return git(args, cwd);
  } catch {
    return null;
  }
}

export function requireGitRepo(cwd: string): void {
  git(['rev-parse', '--show-toplevel'], cwd);
}

export function currentHead(cwd: string): string | null {
  return gitMaybe(['rev-parse', 'HEAD'], cwd);
}

export function hasCleanTree(cwd: string): boolean {
  return git(['status', '--porcelain'], cwd).length === 0;
}

export function diffAgainst(base: string, cwd: string, excludedPath?: string): string {
  try {
    const tracked = execFileSync('git', ['diff', '--binary', '--full-index', base, '--'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const root = git(['rev-parse', '--show-toplevel'], cwd);
    const excluded = excludedPath ? path.resolve(cwd, excludedPath) : null;
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--full-name', '-z'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).split('\0').filter(Boolean).filter(file => path.resolve(root, file) !== excluded).sort();
    const additions = untracked.map(file => newFileDiff(file, root)).join('');
    return tracked + additions;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`git diff failed: ${detail}`, 'GIT_FAILED');
  }
}

function newFileDiff(file: string, root: string): string {
  const result = spawnSync('git', ['diff', '--no-index', '--binary', '--full-index', '--', '/dev/null', file], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 1 || result.error) {
    const detail = result.error?.message ?? result.stderr.trim() ?? `exit status ${result.status}`;
    fail(`git diff failed for untracked file ${file}: ${detail}`, 'GIT_FAILED');
  }
  return result.stdout;
}

export function applyCheck(patch: string, cwd: string): void {
  execFileSync('git', ['apply', '--check', '-'], { cwd, input: patch, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

export function applyPatch(patch: string, cwd: string): void {
  execFileSync('git', ['apply', '-'], { cwd, input: patch, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}
