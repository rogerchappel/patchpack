export const help = `patchpack — portable patch bundles for agent handoffs

Usage:
  patchpack create --out change.ppack [--base HEAD] [--notes HANDOFF.md] [--validate "npm test"]
  patchpack inspect change.ppack [--format markdown|json]
  patchpack apply change.ppack [--write] [--skip-clean-check]

Safety defaults:
  create refuses likely secrets and unsafe paths
  inspect is read-only
  apply runs git apply --check unless bare --write is explicit
  boolean flags do not accept values (for example, --write=false is invalid)
`;

export const commandHelp: Record<string, string> = {
  create: `patchpack create --out change.ppack [--base HEAD] [--notes HANDOFF.md] [--validate "npm test"]\n\nPackages the current git diff against the selected base into a deterministic .ppack file.`,
  inspect: `patchpack inspect change.ppack [--format markdown|json]\n\nPrints reviewable bundle metadata without applying changes.`,
  apply: `patchpack apply change.ppack [--write] [--skip-clean-check]\n\nChecks a bundle against the current repo. Without bare --write this is a dry-run. Boolean flags do not accept values.`
};
