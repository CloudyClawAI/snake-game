#!/usr/bin/env node
/**
 * Headless smoke for neon-circuit.html (SYM-58).
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.VERIFY_PORT) || 0;
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

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
        const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
        const filePath = join(ROOT, decodeURIComponent(path));
        const data = await readFile(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(PORT, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function main() {
  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const errors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      window.CC_SUPABASE_URL = 'YOUR_PROJECT';
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (/Failed to load resource:.*404/i.test(text)) return;
      errors.push(`console: ${text}`);
    });

    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`${baseUrl}/neon-circuit.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    const startVisible = await page.$eval('#start-screen', (el) => el.classList.contains('visible'));
    if (!startVisible) throw new Error('Start screen not visible on load');

    await page.click('#start-btn');
    await page.waitForFunction(
      () => !document.getElementById('countdown-overlay').classList.contains('visible')
        && document.getElementById('lap-display').textContent.includes('LAP 1/3'),
      { timeout: 25000 },
    );

    await page.focus('body');
    await page.keyboard.down('ArrowUp');
    const finished = await page.waitForFunction(
      () => document.getElementById('results-screen').classList.contains('visible'),
      { timeout: 180000 },
    );
    await page.keyboard.up('ArrowUp');
    if (!finished) throw new Error('Race did not finish within timeout');

    const finalTime = await page.$eval('#final-time', (el) => el.textContent.trim());
    const finalScore = await page.$eval('#final-score', (el) => el.textContent.trim());
    if (!finalTime || finalTime === '0:00.0') throw new Error('Final time not set');
    if (!finalScore.startsWith('SCORE:')) throw new Error('Final score not set');

    const lbResults = await page.$eval('#lb-widget-results', (el) => el.innerHTML.trim().length > 0);
    if (!lbResults) throw new Error('Results leaderboard widget empty');

    await page.click('#retry-btn');
    await page.waitForFunction(
      () => !document.getElementById('results-screen').classList.contains('visible')
        && (document.getElementById('countdown-overlay').classList.contains('visible')
          || document.getElementById('lap-display').textContent.includes('LAP')),
      { timeout: 8000 },
    );

    await page.setViewport({ width: 400, height: 300 });
    await new Promise((r) => setTimeout(r, 500));
    const canvasOk = await page.evaluate(() => {
      const c = document.getElementById('game-canvas');
      return c && c.width >= 300 && c.height >= 200;
    });
    if (!canvasOk) throw new Error('Canvas did not resize on narrow viewport');

    const hub = await browser.newPage();
    hub.on('pageerror', (err) => errors.push(`hub pageerror: ${err.message}`));
    await hub.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle0' });
    const hasHubLink = await hub.$$eval('a[href="neon-circuit.html"]', (els) => els.length > 0);
    if (!hasHubLink) throw new Error('Hub card missing neon-circuit link');

    console.log(JSON.stringify({
      ok: true,
      finalTime,
      finalScore,
      errors,
      checks: ['load', 'countdown', '3-lap-finish', 'leaderboard', 'retry', 'resize', 'hub'],
    }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }

  if (errors.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message, stack: err.stack }));
  process.exit(1);
});
