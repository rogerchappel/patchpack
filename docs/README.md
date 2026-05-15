# PatchPack docs

Start with the product requirements in `PRD.md`, then use `TASKS.md` for delivery tracking and `ORCHESTRATION.md` for repository rules.

The MVP is intentionally small:

1. `patchpack create` captures a git diff into a deterministic bundle.
2. `patchpack inspect` prints reviewable metadata.
3. `patchpack apply` verifies and dry-runs by default, writing only with `--write`.

Examples live in `../examples` and smoke fixtures live in `../test/fixtures`.
