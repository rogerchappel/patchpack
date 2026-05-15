export type PatchPackVersion = 1;

export interface PatchPackFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'unknown';
  additions: number;
  deletions: number;
  beforeSha256?: string;
  afterSha256?: string;
}

export interface PatchPackManifest {
  version: PatchPackVersion;
  createdAt: string;
  tool: 'patchpack';
  base: string;
  gitHead: string | null;
  notes?: string;
  validate: string[];
  files: PatchPackFile[];
  stats: {
    files: number;
    additions: number;
    deletions: number;
  };
  patchSha256: string;
}

export interface PatchPackBundle {
  manifest: PatchPackManifest;
  patch: string;
}

export interface CreateOptions {
  out: string;
  notes?: string;
  base?: string;
  validate: string[];
  cwd: string;
}

export interface ApplyOptions {
  bundlePath: string;
  cwd: string;
  write: boolean;
  skipCleanCheck: boolean;
}
