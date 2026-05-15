export class PatchPackError extends Error {
  constructor(message: string, readonly code = 'PATCHPACK_ERROR') {
    super(message);
    this.name = 'PatchPackError';
  }
}

export function fail(message: string, code?: string): never {
  throw new PatchPackError(message, code);
}
