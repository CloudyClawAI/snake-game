# vendor/

Local copies of third-party libraries. No CDN dependencies at runtime.

## Contents

| File | Library | Version | License | SHA-256 (first 16 hex) |
|------|---------|---------|---------|------------------------|
| `three.module.min.js` | Three.js | r160 (0.160.1) | MIT | — see npm |

## Policy

- All runtime JS dependencies must be vendored here before use in games.
- Pin to a specific version; do not use `latest` references.
- ES module builds (`*.module.min.js`) are preferred for tree-shaking compatibility.
- CDN imports are forbidden in production HTML (supply-chain policy).

## Upgrading a vendor file

1. Download the new build: `curl -fsSL https://cdn.jsdelivr.net/npm/<pkg>@<ver>/build/<file> -o vendor/<file>`
2. Update this README with the new version.
3. Open a CTO-approved issue before bumping major versions.
