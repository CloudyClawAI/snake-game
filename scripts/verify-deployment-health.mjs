#!/usr/bin/env node
/**
 * Deployment and PWA health checks (SYM-141).
 * Validates manifest, icons, service worker precache, canonical URLs,
 * sitemap links, internal assets, and GitHub Pages base-path serving.
 */
import fs from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startStaticServer, setupPage } from './smoke-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const CANONICAL_BASE = 'https://cloudyclawai.github.io/snake-game';
const GHPAGES_BASE = '/snake-game';

const REQUIRED_MANIFEST_FIELDS = ['name', 'short_name', 'start_url', 'display', 'icons'];
const HUB_PWA_SELECTORS = [
  'link[rel="manifest"]',
  'meta[name="theme-color"]',
  'link[rel="apple-touch-icon"]',
];

function logError(msg) {
  console.error(`❌ ${msg}`);
}

function logSuccess(msg) {
  console.log(`✅ ${msg}`);
}

function loadGames() {
  const content = fs.readFileSync(join(ROOT, 'games.js'), 'utf8');
  const match = content.match(/const GAMES = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not parse GAMES from games.js');
  return eval(match[1]);
}

function parsePrecache(swContent) {
  const match = swContent.match(/const PRECACHE = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not parse PRECACHE from sw.js');
  return eval(match[1]);
}

function parseSitemapLocs(sitemapContent) {
  return [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function resolveInternalAsset(root, fromFile, ref) {
  if (!ref || ref.startsWith('#') || ref.startsWith('data:') || ref.startsWith('mailto:')) return null;
  if (/^https?:\/\//i.test(ref)) return null;
  const clean = ref.split('?')[0].split('#')[0];
  if (!clean || clean.startsWith('javascript:')) return null;
  const fromDir = dirname(join(root, fromFile));
  const resolved = normalize(join(fromDir, clean));
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

function stripScriptAndStyle(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function extractInternalRefs(html) {
  const refs = [];
  for (const m of stripScriptAndStyle(html).matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const ref = m[1];
    if (ref.includes('${')) continue;
    refs.push(ref);
  }
  return refs;
}

function checkManifest(errors) {
  const manifestPath = join(ROOT, 'manifest.json');
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    logError(`manifest.json is invalid JSON: ${err.message}`);
    errors.push('manifest');
    return;
  }

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (manifest[field] == null || manifest[field] === '') {
      logError(`manifest.json missing required field: ${field}`);
      errors.push('manifest');
    }
  }

  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    logError('manifest.json must declare at least one icon');
    errors.push('manifest');
    return;
  }

  for (const icon of manifest.icons) {
    if (!icon.src || !icon.sizes || !icon.type) {
      logError(`manifest icon entry incomplete: ${JSON.stringify(icon)}`);
      errors.push('manifest');
      continue;
    }
    const iconPath = join(ROOT, icon.src.replace(/^\//, ''));
    if (!fs.existsSync(iconPath)) {
      logError(`manifest icon file missing on disk: ${icon.src}`);
      errors.push('icons');
    }
  }

  if (manifest.start_url !== '/' && manifest.start_url !== './') {
    logError(`manifest start_url should be "/" for GitHub Pages (got ${manifest.start_url})`);
    errors.push('manifest');
  }

  logSuccess('manifest.json is valid and icon files exist');
}

function checkServiceWorkerPrecache(errors) {
  const swContent = fs.readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const precache = parsePrecache(swContent);

  const recommended = ['/manifest.json', '/icon-192.png', '/icon-512.png'];
  for (const asset of recommended) {
    if (!precache.includes(asset)) {
      logError(`sw.js PRECACHE missing recommended PWA asset: ${asset}`);
      errors.push('sw-precache');
    }
  }

  for (const entry of precache) {
    const rel = entry.replace(/^\//, '');
    const filePath = join(ROOT, rel === '' ? 'index.html' : rel);
    if (!fs.existsSync(filePath)) {
      logError(`sw.js PRECACHE entry missing on disk: ${entry}`);
      errors.push('sw-precache');
    }
  }

  if (!errors.includes('sw-precache')) {
    logSuccess(`sw.js PRECACHE covers ${precache.length} assets (all present on disk)`);
  }
}

function checkSitemap(errors, gameHrefs) {
  const sitemapContent = fs.readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = parseSitemapLocs(sitemapContent);

  const hubLoc = `${CANONICAL_BASE}/`;
  if (!locs.includes(hubLoc)) {
    logError(`sitemap.xml missing hub URL: ${hubLoc}`);
    errors.push('sitemap');
  }

  for (const href of gameHrefs) {
    const expected = `${CANONICAL_BASE}/${href}`;
    if (!locs.includes(expected)) {
      logError(`sitemap.xml missing loc for ${href}`);
      errors.push('sitemap');
    }
    if (!expected.startsWith(CANONICAL_BASE)) {
      logError(`sitemap loc uses non-canonical base: ${expected}`);
      errors.push('sitemap');
    }
  }

  for (const loc of locs) {
    if (!loc.startsWith(CANONICAL_BASE)) {
      logError(`sitemap loc must use ${CANONICAL_BASE}: ${loc}`);
      errors.push('sitemap');
      continue;
    }
    const pathPart = loc.slice(CANONICAL_BASE.length).replace(/^\//, '');
    const file = pathPart === '' ? 'index.html' : pathPart;
    if (!fs.existsSync(join(ROOT, file))) {
      logError(`sitemap loc points to missing file: ${loc}`);
      errors.push('sitemap');
    }
  }

  if (!errors.includes('sitemap')) {
    logSuccess(`sitemap.xml has ${locs.length} canonical GitHub Pages URLs`);
  }
}

function checkCanonical(errors, pages) {
  for (const { file, expected } of pages) {
    const content = fs.readFileSync(join(ROOT, file), 'utf8');
    const match = content.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    if (!match) {
      logError(`${file} missing canonical link (expected ${expected})`);
      errors.push('canonical');
      continue;
    }
    const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
    const href = hrefMatch?.[1];
    if (href !== expected) {
      logError(`${file} canonical mismatch: got ${href}, expected ${expected}`);
      errors.push('canonical');
    }
  }

  if (!errors.includes('canonical')) {
    logSuccess(`canonical URLs verified for ${pages.length} pages`);
  }
}

function checkInternalLinks(errors, files) {
  let checked = 0;
  for (const file of files) {
    const content = fs.readFileSync(join(ROOT, file), 'utf8');
    for (const ref of extractInternalRefs(content)) {
      const resolved = resolveInternalAsset(ROOT, file, ref);
      if (!resolved) continue;
      checked += 1;
      if (!fs.existsSync(resolved)) {
        logError(`${file} references missing asset: ${ref}`);
        errors.push('internal-links');
      }
    }
  }

  if (!errors.includes('internal-links')) {
    logSuccess(`internal link scan passed (${checked} relative refs checked)`);
  }
}

async function checkHubPwaMetadata(errors) {
  const { server, port } = await startStaticServer(ROOT, 0);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const { errors: setupErrors } = await setupPage(page);
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    const hubCheck = await page.evaluate((selectors) => {
      const missing = selectors.filter((sel) => !document.querySelector(sel));
      const manifestHref = document.querySelector('link[rel="manifest"]')?.getAttribute('href');
      return { missing, manifestHref };
    }, HUB_PWA_SELECTORS);

    for (const sel of hubCheck.missing) {
      logError(`hub missing PWA metadata element: ${sel}`);
      errors.push('hub-pwa');
    }

    if (hubCheck.manifestHref !== 'manifest.json') {
      logError(`hub manifest href should be manifest.json (got ${hubCheck.manifestHref})`);
      errors.push('hub-pwa');
    }

    const manifestRes = await page.goto(`${baseUrl}/manifest.json`);
    if (!manifestRes?.ok()) {
      logError('hub could not fetch manifest.json over static server');
      errors.push('hub-pwa');
    }

    const swOk = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ok: false, reason: 'no serviceWorker API' };
      try {
        const reg = await navigator.serviceWorker.register('sw.js');
        return { ok: !!reg, reason: null };
      } catch (err) {
        return { ok: false, reason: err.message };
      }
    });

    if (!swOk.ok) {
      logError(`hub service worker registration failed: ${swOk.reason}`);
      errors.push('hub-pwa');
    }

    if (setupErrors.length) {
      for (const err of setupErrors) logError(`hub runtime: ${err}`);
      errors.push('hub-pwa');
    }

    if (!errors.includes('hub-pwa')) {
      logSuccess('hub PWA metadata and service worker registration OK');
    }
  } finally {
    await browser.close();
    server.close();
  }
}

async function checkGitHubPagesBasePath(errors) {
  const { server, port, basePath } = await startStaticServer(ROOT, 0, GHPAGES_BASE);
  const baseUrl = `http://127.0.0.1:${port}${basePath}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const { errors: setupErrors } = await setupPage(page);
    const res = await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle0', timeout: 30000 });
    if (!res?.ok()) {
      logError(`GitHub Pages base path ${GHPAGES_BASE} failed to load index.html`);
      errors.push('ghpages-base');
    }

    const assets = await page.evaluate(async (prefix) => {
      const checks = [
        { url: `${prefix}/manifest.json`, label: 'manifest' },
        { url: `${prefix}/design-system.css`, label: 'design-system.css' },
        { url: `${prefix}/games.js`, label: 'games.js' },
      ];
      const failures = [];
      for (const { url, label } of checks) {
        const r = await fetch(url);
        if (!r.ok) failures.push(label);
      }
      return failures;
    }, baseUrl);

    for (const label of assets) {
      logError(`asset not reachable under ${GHPAGES_BASE}: ${label}`);
      errors.push('ghpages-base');
    }

    if (setupErrors.length) {
      for (const err of setupErrors) logError(`ghpages-base runtime: ${err}`);
      errors.push('ghpages-base');
    }

    if (!errors.includes('ghpages-base')) {
      logSuccess(`GitHub Pages base path ${GHPAGES_BASE} serves hub and core assets`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

async function main() {
  const errors = [];
  const GAMES = loadGames();
  const gameHrefs = GAMES.map((g) => g.href);

  const canonicalPages = [
    { file: 'index.html', expected: `${CANONICAL_BASE}/` },
    ...gameHrefs.map((href) => ({ file: href, expected: `${CANONICAL_BASE}/${href}` })),
  ];

  const htmlFiles = ['index.html', ...gameHrefs];

  console.log('Deployment & PWA health checks\n');

  checkManifest(errors);
  checkServiceWorkerPrecache(errors);
  checkSitemap(errors, gameHrefs);
  checkCanonical(errors, canonicalPages);
  checkInternalLinks(errors, htmlFiles);

  await checkHubPwaMetadata(errors);
  await checkGitHubPagesBasePath(errors);

  if (errors.length) {
    console.log('\nDeployment health check FAILED.');
    process.exit(1);
  }

  console.log('\nDeployment health check PASSED.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
