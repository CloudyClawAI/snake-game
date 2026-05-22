#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const GAMES_JS_PATH = 'games.js';
const README_PATH = 'README.md';
const SITEMAP_PATH = 'sitemap.xml';
const SW_JS_PATH = 'sw.js';
const SMOKE_TEST_PATH = 'scripts/verify-shared-shell-pages.mjs';

function logError(msg) {
  console.error(`❌ ${msg}`);
}

function logSuccess(msg) {
  console.log(`✅ ${msg}`);
}

async function verify() {
  let hasErrors = false;

  // 1. Load authoritative catalog from games.js
  const gamesJsContent = fs.readFileSync(GAMES_JS_PATH, 'utf8');
  const gamesMatch = gamesJsContent.match(/const GAMES = (\[[\s\S]*?\]);/);
  if (!gamesMatch) {
    logError('Could not find GAMES array in games.js');
    process.exit(1);
  }
  
  // Simple eval to get the array. In a real build step we'd use a proper parser.
  const GAMES = eval(gamesMatch[1]);
  const gameHrefs = GAMES.map(g => g.href);
  const gameKeys = GAMES.map(g => g.key);

  logSuccess(`Loaded ${GAMES.length} games from games.js`);

  // 2. Check if .html files exist
  for (const href of gameHrefs) {
    if (!fs.existsSync(href)) {
      logError(`Game file ${href} (from games.js) does not exist on disk`);
      hasErrors = true;
    }
  }

  // 3. Check for orphaned .html files (games not in games.js)
  const allHtmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html');
  for (const file of allHtmlFiles) {
    if (!gameHrefs.includes(file)) {
      logError(`Orphaned game file: ${file} is not in games.js`);
      hasErrors = true;
    }
  }

  // 4. Check README.md table
  const readmeContent = fs.readFileSync(README_PATH, 'utf8');
  for (const href of gameHrefs) {
    if (!readmeContent.includes(href)) {
      logError(`Game ${href} is missing from README.md`);
      hasErrors = true;
    }
  }

  // 5. Check sitemap.xml
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
  for (const href of gameHrefs) {
    if (!sitemapContent.includes(`<loc>https://cloudyclawai.github.io/snake-game/${href}</loc>`)) {
      logError(`Game ${href} is missing from sitemap.xml`);
      hasErrors = true;
    }
  }

  // 6. Check sw.js PRECACHE
  const swContent = fs.readFileSync(SW_JS_PATH, 'utf8');
  for (const href of gameHrefs) {
    if (!swContent.includes(`'./${href}'`)) {
      logError(`Game ${href} is missing from sw.js PRECACHE`);
      hasErrors = true;
    }
  }
  if (/['"]\/(?:index\.html|design-system\.css|manifest\.json|[^'"]+\.html)['"]/.test(swContent)) {
    logError('sw.js PRECACHE contains root-relative paths; use ./ paths so GitHub Pages subpath deploys do not 404');
    hasErrors = true;
  }
  const precacheMatches = [...swContent.matchAll(/['"]\.\/([^'"]+)['"]/g)].map((match) => match[1]);
  for (const precachePath of precacheMatches) {
    if (precachePath === '') continue;
    if (!fs.existsSync(precachePath)) {
      logError(`sw.js PRECACHE references missing file ${precachePath}`);
      hasErrors = true;
    }
  }

  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  if (manifest.start_url !== '.' || manifest.scope !== '.') {
    logError('manifest.json must use "." for start_url and scope so the PWA works under the GitHub Pages project path');
    hasErrors = true;
  }

  // 7. Check smoke-test page lists (verify-shared-shell-pages.mjs)
  // Note: Not all games might be in smoke tests if they are not "shared-shell", 
  // but the task says "compare to smoke-test page lists". 
  // Let's see if we should enforce all games being there.
  const smokeTestContent = fs.readFileSync(SMOKE_TEST_PATH, 'utf8');
  const smokePagesMatch = smokeTestContent.match(/const PAGES = (\[[\s\S]*?\]);/);
  if (smokePagesMatch) {
    const smokePages = eval(smokePagesMatch[1]);
    for (const href of gameHrefs) {
      if (!smokePages.includes(href)) {
        logError(`Game ${href} is missing from ${SMOKE_TEST_PATH} PAGES`);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.log('\nCatalog consistency check FAILED.');
    process.exit(1);
  } else {
    console.log('\nCatalog consistency check PASSED.');
  }
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
