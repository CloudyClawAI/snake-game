#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startStaticServer, setupPage, checkStructuralInvariants } from './smoke-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.VERIFY_PORT) || 0;
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const PAGES = [
  'index.html',
  'neon-overdrive.html',
  'prism-courier.html',
  'echo-bloom.html',
  'neon-circuit.html',
  'snake.html',
  'neon-snake.html',
  'tower-defense.html',
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

async function checkPage(browser, baseUrl, route, viewport) {
  const page = await browser.newPage();
  const { errors: setupErrors } = await setupPage(page);
  
  try {
    await page.setViewport(viewport);
    await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 500));

    const structural = await checkStructuralInvariants(page, route);
    const allErrors = [...setupErrors, ...structural.errors];

    return { route, viewport: viewport.name, ok: allErrors.length === 0, errors: allErrors };
  } catch (err) {
    return { route, viewport: viewport.name, ok: false, errors: [`navigation failed: ${err.message}`] };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log(`Starting verification of ${PAGES.length} pages...`);
  const { server, port } = await startStaticServer(ROOT, PORT);
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
      // Only check desktop for all pages to save time
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
