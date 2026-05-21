#!/usr/bin/env node
/**
 * Shared-shell smoke for the SYM-91 migration page set.
 *
 * This intentionally checks platform frame invariants and responsive canvas
 * framing without driving every game to completion.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname, normalize } from 'node:path';
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
  '.png': 'image/png',
};

const PAGES = [
  'neon-dash.html',
  'neon-snake.html',
  'neon-circuit.html',
  'neon-overdrive.html',
  'prism-courier.html',
  'echo-bloom.html',
  'tower-defense.html',
  'connect-four-online.html',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'mobile', width: 390, height: 740, isMobile: true },
];

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
        const filePath = normalize(join(ROOT, decodeURIComponent(urlPath)));
        if (!filePath.startsWith(ROOT)) throw new Error('Path escapes root');
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

async function checkPage(browser, baseUrl, route, viewport) {
  const errors = [];
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    window.CC_SUPABASE_URL = 'YOUR_PROJECT';
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource:.*(404|net::ERR_BLOCKED_BY_CLIENT)/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  try {
    await page.setViewport(viewport);
    await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 350));

    const structural = await page.evaluate(() => {
      const hasDesignSystem = [...document.querySelectorAll('link[rel="stylesheet"]')]
        .some((link) => /design-system\.css(?:$|\?)/.test(link.getAttribute('href') || ''));
      const hasHubLink = !!document.querySelector('a[href="index.html"], a[href="./index.html"]');
      const visibleCanvases = [...document.querySelectorAll('canvas')].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        const style = getComputedStyle(canvas);
        return {
          id: canvas.id || null,
          cssWidth: Math.round(rect.width),
          cssHeight: Math.round(rect.height),
          width: canvas.width,
          height: canvas.height,
          visible: rect.width > 20 && rect.height > 20 && style.display !== 'none' && style.visibility !== 'hidden',
        };
      });
      const hasBoard = !!document.querySelector('.board, #board');
      return { hasDesignSystem, hasHubLink, visibleCanvases, hasBoard };
    });

    if (!structural.hasDesignSystem) errors.push('missing design-system.css');
    if (!structural.hasHubLink) errors.push('missing hub/back link');
    if (route !== 'connect-four-online.html' && structural.visibleCanvases.length === 0) {
      errors.push('no visible canvas');
    }
    for (const canvas of structural.visibleCanvases) {
      if (canvas.cssWidth < 240 || canvas.cssHeight < 180 || canvas.width < 240 || canvas.height < 180) {
        errors.push(`canvas ${canvas.id || '(unnamed)'} too small: ${canvas.cssWidth}x${canvas.cssHeight} css, ${canvas.width}x${canvas.height} backing`);
      }
    }
    if (route === 'connect-four-online.html' && !structural.hasBoard) {
      errors.push('connect-four board surface missing');
    }

    return { route, viewport: viewport.name, ok: errors.length === 0, errors, structural };
  } finally {
    await page.close();
  }
}

async function main() {
  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  try {
    const results = [];
    for (const route of PAGES) {
      for (const viewport of VIEWPORTS) {
        results.push(await checkPage(browser, baseUrl, route, viewport));
      }
    }

    const failures = results.filter((result) => !result.ok);
    console.log(JSON.stringify({
      ok: failures.length === 0,
      checkedPages: PAGES,
      checkedViewports: VIEWPORTS.map((viewport) => viewport.name),
      failures,
    }, null, 2));
    if (failures.length) process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message, stack: err.stack }));
  process.exit(1);
});
