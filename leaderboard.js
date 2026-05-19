/**
 * Shared leaderboard module — top-5 high scores per game via localStorage.
 *
 * Usage in a game:
 *   Leaderboard.saveScore('snake', 1200);        // on game-over
 *   Leaderboard.renderWidget('snake', 'lb-div'); // update UI element
 *
 * Usage on hub:
 *   const best = Leaderboard.getAllBest(); // { snake: 1200, tetris: 800, … }
 */
const Leaderboard = (() => {
  const MAX = 5;
  const PREFIX = 'lb_v1_';

  function storageKey(gameKey) {
    return PREFIX + gameKey;
  }

  function getScores(gameKey) {
    try {
      const raw = localStorage.getItem(storageKey(gameKey));
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveScore(gameKey, score) {
    const n = Number(score);
    if (!isFinite(n) || n <= 0) return getScores(gameKey);
    const scores = getScores(gameKey);
    scores.push(n);
    scores.sort((a, b) => b - a);
    const top = scores.slice(0, MAX);
    try {
      localStorage.setItem(storageKey(gameKey), JSON.stringify(top));
    } catch { /* quota exceeded — silently ignore */ }
    return top;
  }

  function getBest(gameKey) {
    const s = getScores(gameKey);
    return s.length ? s[0] : 0;
  }

  const ALL_GAMES = [
    { key: 'flappy',         label: 'Flappy Bird',    href: 'flappy-bird.html'  },
    { key: 'maze',           label: 'Maze Muncher',   href: 'maze.html'          },
    { key: 'neon-snake',     label: 'Neon Snake',     href: 'neon-snake.html'    },
    { key: 'pong',           label: 'Pong',           href: 'pong.html'          },
    { key: 'snake',          label: 'Snake',          href: 'snake.html'         },
    { key: 'tetris',         label: 'Tetris',         href: 'tetris.html'        },
    { key: 'tictactoe',      label: 'Tic-Tac-Toe',   href: 'tic-tac-toe.html'   },
    { key: 'tower-defense',  label: 'Tower Defense',  href: 'tower-defense.html' },
    { key: 'neon-overdrive', label: 'Neon Overdrive', href: 'neon-overdrive.html' },
    { key: 'bubble-shooter', label: 'Bubble Shooter', href: 'bubble-shooter.html' },
    { key: 'space-invaders', label: 'Space Invaders', href: 'space-invaders.html' },
    { key: 'asteroids',      label: 'Asteroids',      href: 'asteroids.html'     },
    { key: 'frogger',        label: 'Frogger',        href: 'frogger.html'        },
    { key: 'pacman',         label: 'Pac-Man',        href: 'pacman.html'         },
    { key: 'stack-tower',    label: 'Stack Tower',    href: 'stack-tower.html'    },
    { key: 'pinball',        label: 'Pinball',        href: 'pinball.html'        },
  ];

  function getAllBest() {
    const result = {};
    for (const g of ALL_GAMES) result[g.key] = getBest(g.key);
    return result;
  }

  /**
   * Renders a compact leaderboard list inside `containerId`.
   * Adds class `lb-no-scores` when empty.
   */
  function renderWidget(gameKey, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const scores = getScores(gameKey);
    if (!scores.length) {
      el.innerHTML = '<p class="lb-empty">No scores yet — be the first!</p>';
      el.classList.add('lb-no-scores');
      return;
    }
    el.classList.remove('lb-no-scores');
    const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    el.innerHTML = '<ol class="lb-list">' +
      scores.map((s, i) =>
        `<li class="lb-row${i === 0 ? ' lb-gold' : ''}">` +
        `<span class="lb-rank">${medals[i]}</span>` +
        `<span class="lb-score">${s.toLocaleString()}</span></li>`
      ).join('') +
      '</ol>';
  }

  /**
   * Renders the hub summary table (best score per game) inside `containerId`.
   */
  function renderHubSummary(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const rows = ALL_GAMES.map(g => {
      const best = getBest(g.key);
      return `<a class="lb-hub-row${best ? ' lb-hub-played' : ''}" href="${g.href}">` +
        `<span class="lb-hub-name">${g.label}</span>` +
        `<span class="lb-hub-score">${best ? best.toLocaleString() : '—'}</span>` +
        `</a>`;
    }).join('');
    el.innerHTML = rows || '<p class="lb-empty">Play a game to set scores!</p>';
  }

  return { saveScore, getScores, getBest, getAllBest, renderWidget, renderHubSummary, ALL_GAMES };
})();
