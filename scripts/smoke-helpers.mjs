import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
};

export function startStaticServer(root, port = 0, basePath = '') {
  const base = basePath.replace(/\/$/, '') || '';
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = req.url.split('?')[0];
        if (base && !urlPath.startsWith(base)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        if (base) urlPath = urlPath.slice(base.length) || '/';
        urlPath = urlPath === '/' ? '/index.html' : urlPath;
        const filePath = normalize(join(root, decodeURIComponent(urlPath)));
        if (!filePath.startsWith(root)) throw new Error('Path escapes root');
        const data = await readFile(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port, basePath: base });
    });
  });
}

export async function setupPage(page) {
  const errors = [];
  
  await page.evaluateOnNewDocument(() => {
    window.CC_SUPABASE_URL = 'https://mock.supabase.co';
    window.CC_SUPABASE_KEY = 'mock-key';
    // Mock leaderboard if needed
    window.CC_LEADERBOARD_CONFIG = { enabled: true, mock: true };
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

  return { errors };
}

export async function checkStructuralInvariants(page, route) {
  return await page.evaluate((route) => {
    const hasDesignSystem = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .some((link) => /design-system\.css(?:$|\?)/.test(link.getAttribute('href') || ''));
    
    const results = {
      hasDesignSystem,
      errors: []
    };

    if (!hasDesignSystem) results.errors.push('missing design-system.css');

    if (route === 'index.html') {
      const gameCards = document.querySelectorAll('.card');
      results.gameCardsCount = gameCards.length;
      if (gameCards.length === 0) results.errors.push('no game cards rendered');
    } else {
      const hasHubLink = !!document.querySelector('a[href="index.html"], a[href="./index.html"]');
      results.hasHubLink = hasHubLink;
      if (!hasHubLink) results.errors.push('missing hub/back link');

      const visibleCanvases = [...document.querySelectorAll('canvas')].filter((canvas) => {
        const rect = canvas.getBoundingClientRect();
        const style = getComputedStyle(canvas);
        return rect.width > 20 && rect.height > 20 && style.display !== 'none' && style.visibility !== 'hidden';
      }).length;
      results.visibleCanvases = visibleCanvases;

      const hasBoardGrid = !!document.querySelector('.board-grid') || !!document.querySelector('.game-grid') || !!document.querySelector('.sudoku-grid');
      results.hasBoardGrid = hasBoardGrid;
    }

    return results;
  }, route);
}

export async function simulateInput(page, selector, keyOrAction) {
  if (typeof keyOrAction === 'string') {
    await page.keyboard.press(keyOrAction);
  } else if (typeof keyOrAction === 'function') {
    await keyOrAction(page);
  }
}

export async function checkWebGL(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { ok: false, error: 'No canvas found' };
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) return { ok: false, error: 'WebGL context not found' };
    return { ok: true };
  });
}
