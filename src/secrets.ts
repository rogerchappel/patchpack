const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/AKIA[0-9A-Z]{16}/, 'aws access key'],
  [/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, 'private key'],
  [/(?:api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[A-Za-z0-9_\-.]{16,}/i, 'credential-looking assignment'],
  [/gh[pousr]_[A-Za-z0-9_]{20,}/, 'github token']
];

export interface SecretFinding { label: string; line: number; }

export function findSecrets(text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (!line.startsWith('+') || line.startsWith('+++')) return;
    for (const [pattern, label] of SECRET_PATTERNS) {
      if (pattern.test(line)) findings.push({ label, line: index + 1 });
    }
  });
  return findings;
}
