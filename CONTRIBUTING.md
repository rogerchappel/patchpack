# Contributing to PatchPack

Thanks for helping make patch handoffs safer.

## Local workflow

```bash
npm install
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

Keep changes small and reviewable. PatchPack is a safety tool, so tests should cover both happy paths and refusal paths.

## Design principles

- Local-first beats cloud-first.
- Read-only defaults beat surprising writes.
- Deterministic output beats clever formatting.
- Clear refusal messages beat permissive ambiguity.

## Pull requests

Please include:

- what changed and why
- fixtures or tests for new behavior
- any safety tradeoffs
- command output from `bash scripts/validate.sh`
