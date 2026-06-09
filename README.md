# PatchPack 📦

PatchPack turns a local git diff into a small, inspectable handoff bundle for humans and coding agents. It is deliberately boring: no hosted service, no account, no telemetry, and no write action unless you ask for it.

## Why it exists

Agent handoffs often arrive as loose diffs with missing context. PatchPack wraps the diff with:

- base ref and current HEAD
- touched files and line stats
- a SHA-256 hash of the patch payload
- optional reviewer notes
- suggested validation commands
- conservative safety checks for suspicious paths and likely secrets

## Install

```bash
npm install -g patchpack
```

For local development:

```bash
npm install
npm run build
node dist/cli.js --help
```

## Quick start

```bash
# In a git repo with uncommitted changes
patchpack create --out fix-login.ppack --notes HANDOFF.md --validate "npm test"

# Review without touching the working tree
patchpack inspect fix-login.ppack --format markdown
patchpack inspect fix-login.ppack --format json

# Check applyability; this is dry-run by default
patchpack apply fix-login.ppack

# Actually write changes after review
patchpack apply fix-login.ppack --write
```

## Commands

### `patchpack create`

Packages the current diff against `HEAD` unless `--base` is supplied.

```bash
patchpack create --out change.ppack --base main --notes HANDOFF.md --validate "npm test"
```

### `patchpack inspect`

Prints bundle metadata as Markdown or JSON.

```bash
patchpack inspect change.ppack --format markdown
```

### `patchpack apply`

Runs `git apply --check` by default. Use `--write` for real changes.

```bash
patchpack apply change.ppack
patchpack apply change.ppack --write
```

## Safety model

PatchPack is local-first and fail-closed:

- apply is a dry-run unless `--write` is explicit
- dirty working trees are rejected before apply unless `--skip-clean-check` is explicit
- path traversal and absolute paths are blocked
- likely secrets in added patch lines are rejected during create
- bundle payloads include a patch hash and are deterministic for the same diff/notes

It is not a sandbox. Always inspect bundles before applying them.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

The smoke test creates a real temporary git repo from fixtures, bundles a change, inspects it, dry-runs it, and applies it.

## Personality

PatchPack is the cardboard box with a label, tamper tape, and a polite note on top. It does not try to be a platform. It just helps reviewers know what they are holding before they open it.

## Release Readiness

Use the checked-in scripts before opening or publishing a release:

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

The package smoke uses `npm pack --dry-run` so the published file list can be reviewed without publishing.
