#!/usr/bin/env node
/**
 * Leaderboard audit verification: cloud-disabled hub, local persistence sample.
 */
import { createServer } from 'node:http';
import { readFile, access } from 'node:fs/promises';
import { extname, join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const AUDIT_PATH = join(ROOT, 'LEADERBOARD_AUDIT.md');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
        const filePath = normalize(join(ROOT, decodeURIComponent(urlPath)));
        if (!filePath.startsWith(ROOT)) throw new Error('Path escapes root');
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function checkCloudDisabledHub(browser, baseUrl) {
  const errors = [];
  const page = await browser.newPage();
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource:.*(404|net::ERR_)/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  await page.evaluateOnNewDocument(() => {
    window.CC_SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    window.CC_SUPABASE_KEY = 'placeholder';
  });

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise((r) => setTimeout(r, 400));

  const state = await page.evaluate(() => ({
    cloudConfigured: typeof CloudLeaderboard !== 'undefined' && CloudLeaderboard.configured,
    globalPanelDisplay: document.getElementById('lb-global-panel')?.style.display,
    hubRows: document.querySelectorAll('.lb-hub-row').length,
    nickFormChildren: document.getElementById('lb-nick-area')?.childElementCount ?? 0,
  }));

  if (state.cloudConfigured) errors.push('cloud should be disabled with YOUR_PROJECT URL');
  if (state.globalPanelDisplay !== 'none' && state.globalPanelDisplay !== '') {
    errors.push(`lb-global-panel should stay hidden, got display=${state.globalPanelDisplay}`);
  }
  if (state.hubRows < 30) errors.push(`expected hub summary rows, got ${state.hubRows}`);
  if (state.nickFormChildren > 0) errors.push('nickname form should not render when cloud disabled');

  await page.close();
  return { name: 'cloud-disabled-hub', ok: errors.length === 0, errors };
}

async function checkLocalPersistence(browser, baseUrl) {
  const errors = [];
  const page = await browser.newPage();
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource:.*(404|net::ERR_)/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  const testKey = `verify-snake-${Date.now()}`;

  await page.evaluateOnNewDocument(() => {
    window.CC_SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
  });

  await page.goto(`${baseUrl}/snake.html`, { waitUntil: 'networkidle0', timeout: 20000 });

  const first = await page.evaluate((key) => {
    if (typeof Leaderboard === 'undefined') return { ok: false, reason: 'no Leaderboard' };
    Leaderboard.saveScore(key, 4242);
    return { ok: true, best: Leaderboard.getBest(key), storage: localStorage.getItem('lb_v1_' + key) };
  }, testKey);
  if (!first.ok || first.best !== 4242) {
    errors.push(`first save failed: ${JSON.stringify(first)}`);
    await page.close();
    return { name: 'local-persistence', ok: false, errors };
  }

  await page.reload({ waitUntil: 'networkidle0' });
  const second = await page.evaluate((key) => ({
    best: Leaderboard.getBest(key),
    storage: localStorage.getItem('lb_v1_' + key),
  }), testKey);
  if (second.best !== 4242) errors.push(`after reload expected 4242, got ${second.best} (storage=${second.storage})`);

  await page.close();
  return { name: 'local-persistence', ok: errors.length === 0, errors };
}

async function main() {
  try {
    await access(AUDIT_PATH);
  } catch {
    console.error('❌ LEADERBOARD_AUDIT.md missing');
    process.exit(1);
  }

  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const results = [
      await checkCloudDisabledHub(browser, baseUrl),
      await checkLocalPersistence(browser, baseUrl),
    ];
    const failures = results.filter((r) => !r.ok);
    if (failures.length) {
      console.error(JSON.stringify(failures, null, 2));
      process.exit(1);
    }
    console.log('✅ Leaderboard verification passed');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
