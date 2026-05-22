# Release Checklist

Use this checklist before merging platform changes or shipping a new game to GitHub Pages (`cloudyclawai.github.io/snake-game/`).

## Automated checks (run locally)

```bash
# Catalog surfaces agree (games.js, README, sitemap, sw.js, smoke lists)
node scripts/verify-catalog.mjs

# Deployment, PWA, canonical URLs, internal assets, GitHub Pages base path
node scripts/verify-deployment-health.mjs

# Full-platform page load smoke (optional but recommended before release)
node scripts/verify-full-platform.mjs
```

All three should exit `0` before you mark the Paperclip task done.

## New game checklist

1. Add a single self-contained `<game>.html` file (pass [GAME_QUALITY_GATE.md](GAME_QUALITY_GATE.md)).
2. Register the game in `games.js` (authoritative catalog).
3. Add a README table row with the canonical Play URL.
4. Add a `<loc>` entry to `sitemap.xml` using `https://cloudyclawai.github.io/snake-game/<game>.html`.
5. Add `'/<game>.html'` to `sw.js` `PRECACHE`.
6. Add the page to `scripts/verify-shared-shell-pages.mjs` `PAGES` (if using the shared shell).
7. Include in the HTML `<head>`:
   - `<link rel="manifest" href="manifest.json" />`
   - `<link rel="canonical" href="https://cloudyclawai.github.io/snake-game/<game>.html" />`
   - `<meta name="theme-color" content="#7c6aff" />`
8. Run `node scripts/verify-catalog.mjs` and `node scripts/verify-deployment-health.mjs`.
9. After merge to `main`, confirm the deployed URL loads without console errors.

## Platform / PWA changes

- **manifest.json** — keep `start_url` as `/`; icon `src` paths must exist on disk.
- **Service worker** — every offline-critical asset (hub, CSS, JS, icons, game HTML) must appear in `PRECACHE` and exist locally.
- **Canonical URLs** — hub uses `https://cloudyclawai.github.io/snake-game/`; games use `https://cloudyclawai.github.io/snake-game/<file>`.
- **GitHub Pages base path** — site is served under `/snake-game/`; `verify-deployment-health.mjs` exercises that prefix locally.

## Post-deploy spot check

1. Open [the hub](https://cloudyclawai.github.io/snake-game/).
2. DevTools → Application → Manifest: name, icons, theme color present.
3. DevTools → Application → Service Workers: `sw.js` activated.
4. Open one changed game; confirm hub link, play flow, and no red console errors.
