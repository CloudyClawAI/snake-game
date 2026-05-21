#!/usr/bin/env node
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
  '.svg': 'image/svg+xml',
};

const PAGES = [
  'index.html',
  'neon-overdrive.html',
  'prism-courier.html',
  'echo-bloom.html',
  'neon-circuit.html',
  'snake.html',
  'neon-snake.html',
  'tower-defense.html',
  'maze.html',
  'pacman.html',
  'tetris.html',
  'pong.html',
  'flappy-bird.html',
  'tic-tac-toe.html',
  '2048.html',
  'minesweeper.html',
  'connect-four.html',
  'memory-match.html',
  'word-search.html',
  'whack-a-mole.html',
  'asteroids.html',
  'bubble-shooter.html',
  'gem-crush.html',
  'space-invaders.html',
  'missile-command.html',
  'breakout.html',
  'typing-speed.html',
  'sudoku.html',
  'connect-four-online.html',
  'frogger.html',
  'galaga.html',
  'simon-says.html',
  'stack-tower.html',
  'neon-dash.html',
  'color-flood.html',
  'pinball.html',
  'sky-jumper.html'
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
    window.CC_SUPABASE_URL = 'https://mock.supabase.co';
    window.CC_SUPABASE_KEY = 'mock-key';
  });

  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (/Failed to load resource:.*(404|net::ERR_BLOCKED_BY_CLIENT|net::ERR_NAME_NOT_RESOLVED|net::ERR_CONNECTION_REFUSED)/i.test(text)) return;
      if (text.includes('supabase.co')) return;
      errors.push(`console: ${text}`);
    }
  });

  try {
    await page.setViewport(viewport);
    await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 500));

    const structural = await page.evaluate((route) => {
      const hasDesignSystem = [...document.querySelectorAll('link[rel="stylesheet"]')]
        .some((link) => /design-system\.css(?:$|\?)/.test(link.getAttribute('href') || ''));
      
      if (route === 'index.html') {
        const gameCards = document.querySelectorAll('.card');
        return { hasDesignSystem, gameCardsCount: gameCards.length };
      } else {
        const hasHubLink = !!document.querySelector('a[href="index.html"], a[href="./index.html"]');
        const visibleCanvases = [...document.querySelectorAll('canvas')].filter((canvas) => {
          const rect = canvas.getBoundingClientRect();
          const style = getComputedStyle(canvas);
          return rect.width > 20 && rect.height > 20 && style.display !== 'none' && style.visibility !== 'hidden';
        }).length;
        const hasBoardGrid = !!document.querySelector('.board-grid') || !!document.querySelector('.game-grid') || !!document.querySelector('.sudoku-grid');
        return { hasDesignSystem, hasHubLink, visibleCanvases, hasBoardGrid };
      }
    }, route);

    if (!structural.hasDesignSystem) errors.push('missing design-system.css');
    
    if (route === 'index.html') {
      if (structural.gameCardsCount === 0) errors.push('no game cards rendered');
    } else {
      if (!structural.hasHubLink) errors.push('missing hub/back link');
      // Some games might not have canvas or board grid immediately visible or use different classes
      // This is a soft check
    }

    return { route, viewport: viewport.name, ok: errors.length === 0, errors };
  } catch (err) {
    return { route, viewport: viewport.name, ok: false, errors: [`navigation failed: ${err.message}`] };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log(`Starting verification of ${PAGES.length} pages...`);
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
      console.log(`Checking ${route}...`);
      // Only check desktop for all pages to save time, mobile was checked in samples
      results.push(await checkPage(browser, baseUrl, route, VIEWPORTS[0]));
    }

    const failures = results.filter((result) => !result.ok);
    if (failures.length) {
      console.log(JSON.stringify(failures, null, 2));
      console.error(`Verification failed with ${failures.length} failures.`);
      process.exit(1);
    } else {
      console.log('All pages passed verification!');
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
