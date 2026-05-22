/* CloudyClaw Games — Service Worker (offline-first hub) */
const CACHE = 'cloudyclaw-v2';

const PRECACHE = [
  '/',
  '/index.html',
  '/design-system.css',
  '/leaderboard.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/neon-overdrive.html',
  '/prism-courier.html',
  '/echo-bloom.html',
  '/neon-circuit.html',
  '/snake.html',
  '/neon-snake.html',
  '/tower-defense.html',
  '/maze.html',
  '/pacman.html',
  '/tetris.html',
  '/pong.html',
  '/flappy-bird.html',
  '/tic-tac-toe.html',
  '/2048.html',
  '/minesweeper.html',
  '/connect-four.html',
  '/memory-match.html',
  '/word-search.html',
  '/whack-a-mole.html',
  '/asteroids.html',
  '/bubble-shooter.html',
  '/gem-crush.html',
  '/space-invaders.html',
  '/missile-command.html',
  '/breakout.html',
  '/typing-speed.html',
  '/sudoku.html',
  '/connect-four-online.html',
  '/frogger.html',
  '/galaga.html',
  '/simon-says.html',
  '/stack-tower.html',
  '/neon-dash.html',
  '/color-flood.html',
  '/pinball.html',
  '/sky-jumper.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});
