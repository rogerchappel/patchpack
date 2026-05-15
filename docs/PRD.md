# PatchPack PRD

Status: in-progress

## One-liner

Portable patch bundles for agent handoffs 📦

## Problem

Agents hand off code changes as ad hoc diffs, but reviewers need provenance, file hashes, apply instructions, and a safe way to inspect what will change before touching a repo.

## Proposed solution

A CLI that packages git diffs with manifests, base refs, file checksums, notes, and validation commands, then verifies/applies them locally with explicit guardrails.

## Primary users

Maintainers reviewing agent patches, coding agents moving work between sandboxes, teams sharing changes without granting repo access.

## V1 scope

- Create a bundle from a git diff plus optional notes and validation commands
- Verify base commit, clean working tree, target paths, and patch stats before apply
- Inspect bundle metadata as Markdown or JSON
- Apply with dry-run by default and explicit --write for real changes
- Support redaction checks for secrets in patch content

## CLI shape

```bash
patchpack create --out fix-login.ppack --notes HANDOFF.md
patchpack inspect fix-login.ppack --format markdown
patchpack apply fix-login.ppack --dry-run
```

## Non-goals

- No hosted service, hidden telemetry, or required account.
- No secret collection; fixture and metadata redaction should be conservative.
- No broad framework lock-in beyond a practical Node/TypeScript CLI MVP.

## Local-first safety

- Default to dry-run or read-only behavior for write/apply style commands.
- Keep generated artifacts deterministic and reviewable.
- Fail closed on suspicious paths, binary blobs, or likely secrets.

## Acceptance criteria

- Functional CLI with help text and at least three useful commands.
- Fixture-backed tests covering happy path, validation failure, and deterministic output.
- README with concise examples, safety notes, and practical developer workflow.
- `npm test`, `npm run check`, `npm run build`, `npm run smoke`, and `bash scripts/validate.sh` pass where present.
- Public GitHub repo under `rogerchappel/patchpack` with description and topics.

## Attribution / inspiration

Inspired by git format-patch and bundle review habits, renamed/reframed for local-first agent handoffs rather than email patch series.
