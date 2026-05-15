import type { PatchPackBundle } from './types.js';
import { stableJson } from './hash.js';

export type InspectFormat = 'json' | 'markdown';

export function inspectBundle(bundle: PatchPackBundle, format: InspectFormat): string {
  if (format === 'json') return stableJson(bundle.manifest);
  const { manifest } = bundle;
  const rows = manifest.files.map(file => `- \`${file.path}\` — ${file.status}, +${file.additions}/-${file.deletions}`).join('\n');
  const validate = manifest.validate.length ? manifest.validate.map(cmd => `- \`${cmd}\``).join('\n') : '- _(none recorded)_';
  const notes = manifest.notes ? `\n## Notes\n\n${manifest.notes.trim()}\n` : '';
  return `# PatchPack\n\n- Base: \`${manifest.base}\`\n- Git HEAD: \`${manifest.gitHead ?? 'unknown'}\`\n- Files: ${manifest.stats.files}\n- Additions: ${manifest.stats.additions}\n- Deletions: ${manifest.stats.deletions}\n- Patch SHA-256: \`${manifest.patchSha256}\`\n\n## Files\n\n${rows || '- _(none)_'}\n\n## Validation\n\n${validate}\n${notes}`;
}
