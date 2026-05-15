import { execFileSync } from 'node:child_process';
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

export function diffAgainst(base: string, cwd: string): string {
  try {
    return execFileSync('git', ['diff', '--binary', '--full-index', base, '--'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`git diff failed: ${detail}`, 'GIT_FAILED');
  }
}

export function applyCheck(patch: string, cwd: string): void {
  execFileSync('git', ['apply', '--check', '-'], { cwd, input: patch, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

export function applyPatch(patch: string, cwd: string): void {
  execFileSync('git', ['apply', '-'], { cwd, input: patch, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}
