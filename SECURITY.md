# Security Policy

PatchPack handles code diffs, which may contain secrets or malicious changes. Treat every bundle as untrusted input.

## Reporting vulnerabilities

Open a private security advisory on GitHub when available, or contact the maintainer directly. Please do not publish exploit details before a fix is available.

## Supported versions

Until 1.0, only the latest release receives security fixes.

## Safety expectations

PatchPack should:

- never require network access to create, inspect, or apply bundles
- dry-run apply operations unless `--write` is explicit
- reject suspicious paths such as absolute paths or `..` traversal
- reject likely secrets in added patch lines during bundle creation
- verify patch payload hashes before apply

PatchPack cannot prove a patch is semantically safe. Review the diff, run validation, and apply only in a repo you trust.
