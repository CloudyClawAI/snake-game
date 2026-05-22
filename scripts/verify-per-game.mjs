#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startStaticServer, setupPage, checkStructuralInvariants, checkWebGL } from './smoke-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const SCENARIOS = [
  {
    name: 'Online Multiplayer Shell',
    route: 'connect-four-online.html',
    check: async (page) => {
      const hasLobby = await page.evaluate(() => {
        return !!document.querySelector('#screen-lobby') || !!document.querySelector('.lobby-card') || document.body.innerText.includes('Connect Four Online');
      });
      if (!hasLobby) return ['Multiplayer lobby not found'];
      return [];
    }
  },
  {
    name: '3D/WebGL Game: Neon Circuit',
    route: 'neon-circuit.html',
    check: async (page) => {
      const { ok, error } = await checkWebGL(page);
      if (!ok) return [error];
      return [];
    }
  },
  {
    name: 'Canvas 2D Game: Neon Overdrive',
    route: 'neon-overdrive.html',
    check: async (page) => {
      const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
      if (!hasCanvas) return ['Neon Overdrive canvas not found'];
      return [];
    }
  },
  {
    name: 'Canvas Arcade Game: Snake',
    route: 'snake.html',
    check: async (page) => {
      await page.keyboard.press('ArrowRight');
      await new Promise(r => setTimeout(r, 100));
      return [];
    }
  },
  {
    name: 'Canvas Arcade Game: Pacman',
    route: 'pacman.html',
    check: async (page) => {
      const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
      if (!hasCanvas) return ['Pacman canvas not found'];
      return [];
    }
  },
  {
    name: 'Puzzle Board Game: Sudoku',
    route: 'sudoku.html',
    check: async (page) => {
      const hasGrid = await page.evaluate(() => {
        return !!document.querySelector('.sudoku-grid') || !!document.querySelector('.grid');
      });
      if (!hasGrid) return ['Sudoku grid not found'];
      return [];
    }
  },
  {
    name: 'Puzzle Board Game: 2048',
    route: '2048.html',
    check: async (page) => {
      const hasGrid = await page.evaluate(() => !!document.querySelector('.board-bg') || !!document.querySelector('#board'));
      if (!hasGrid) return ['2048 board not found'];
      return [];
    }
  }
];

async function runScenario(browser, baseUrl, scenario) {
  console.log(`Running scenario: ${scenario.name} (${scenario.route})...`);
  const page = await browser.newPage();
  const { errors: setupErrors } = await setupPage(page);
  
  const results = { name: scenario.name, route: scenario.route, ok: true, errors: [...setupErrors] };

  try {
    await page.goto(`${baseUrl}/${scenario.route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000)); // Wait for game to initialize

    const structural = await checkStructuralInvariants(page, scenario.route);
    results.errors.push(...structural.errors);

    if (scenario.check) {
      const scenarioErrors = await scenario.check(page);
      results.errors.push(...scenarioErrors);
    }

    results.ok = results.errors.length === 0;
  } catch (err) {
    results.ok = false;
    results.errors.push(`Scenario failed: ${err.message}`);
  } finally {
    await page.close();
  }
  return results;
}

async function main() {
  const { server, port } = await startStaticServer(ROOT);
  const baseUrl = `http://127.0.0.1:${port}`;
  
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  try {
    const results = [];
    for (const scenario of SCENARIOS) {
      results.push(await runScenario(browser, baseUrl, scenario));
    }

    const failures = results.filter(r => !r.ok);
    if (failures.length > 0) {
      console.log('\nFailures detected:');
      console.log(JSON.stringify(failures, null, 2));
      process.exit(1);
    } else {
      console.log('\nAll scenarios passed!');
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
