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
    { key: 'neon-snake',     label: 'Neon Snake',     href: 'neon-snake.html'    },
    { key: 'pong',           label: 'Pong',           href: 'pong.html'          },
    { key: 'snake',          label: 'Snake',          href: 'snake.html'         },
    { key: 'tetris',         label: 'Tetris',         href: 'tetris.html'        },
    { key: 'tictactoe',      label: 'Tic-Tac-Toe',   href: 'tic-tac-toe.html'   },
    { key: 'tower-defense',  label: 'Tower Defense',  href: 'tower-defense.html' },
    { key: 'neon-overdrive', label: 'Neon Overdrive', href: 'neon-overdrive.html' },
    { key: 'neon-circuit',   label: 'Neon Circuit',   href: 'neon-circuit.html'   },
    { key: 'bubble-shooter', label: 'Bubble Shooter', href: 'bubble-shooter.html' },
    { key: 'gem-crush',      label: 'Gem Crush',      href: 'gem-crush.html'     },
    { key: 'space-invaders', label: 'Space Invaders', href: 'space-invaders.html' },
    { key: 'asteroids',      label: 'Asteroids',      href: 'asteroids.html'     },
    { key: 'frogger',        label: 'Frogger',        href: 'frogger.html'        },
    { key: 'pacman',         label: 'Pac-Man',        href: 'pacman.html'         },
    { key: 'stack-tower',    label: 'Stack Tower',    href: 'stack-tower.html'    },
    { key: 'pinball',        label: 'Pinball',        href: 'pinball.html'        },
    { key: 'color-flood',      label: 'Color Flood',     href: 'color-flood.html'     },
    { key: 'sky-jumper',       label: 'Sky Jumper',      href: 'sky-jumper.html'      },
    { key: 'missile-command',  label: 'Missile Command', href: 'missile-command.html' },
    { key: '2048',             label: '2048',            href: '2048.html'            },
    { key: 'minesweeper',      label: 'Minesweeper',     href: 'minesweeper.html'     },
    { key: 'connect-four',     label: 'Connect Four',    href: 'connect-four.html'    },
    { key: 'memory-match',     label: 'Memory Match',    href: 'memory-match.html'    },
    { key: 'word-search',      label: 'Word Search',     href: 'word-search.html'     },
    { key: 'whack-a-mole',     label: 'Whack-a-Mole',    href: 'whack-a-mole.html'    },
    { key: 'typing-speed',     label: 'Typing Speed',    href: 'typing-speed.html'    },
    { key: 'sudoku',           label: 'Sudoku',          href: 'sudoku.html'          },
    { key: 'connect-four-online', label: 'Connect Four Online', href: 'connect-four-online.html' },
    { key: 'galaga',           label: 'Galaga',          href: 'galaga.html'          },
    { key: 'simon-says',       label: 'Simon Says',      href: 'simon-says.html'      },
    { key: 'neon-dash',        label: 'Neon Dash',       href: 'neon-dash.html'       },
    { key: 'prism-courier',    label: 'Prism Courier',   href: 'prism-courier.html'   },
    { key: 'echo-bloom',       label: 'Echo Bloom',      href: 'echo-bloom.html'      }
  ];

  function getActiveGames() {
    if (typeof GAMES !== 'undefined') {
      return GAMES.map(g => ({ key: g.key, label: g.title, href: g.href }));
    }
    return ALL_GAMES;
  }

  function getAllBest() {
    const result = {};
    for (const g of getActiveGames()) result[g.key] = getBest(g.key);
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

  function render(containerId, gameKey) {
    renderWidget(gameKey, containerId);
  }

  /**
   * Renders the hub summary table (best score per game) inside `containerId`.
   */
  function renderHubSummary(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const games = getActiveGames();
    const rows = games.map(g => {
      const best = getBest(g.key);
      const label = best ? `Best ${best.toLocaleString()}` : 'No score yet';
      return `<a class="lb-hub-row${best ? ' lb-hub-played' : ''}" href="${g.href}" aria-label="Play ${g.label}. ${label}.">` +
        `<span class="lb-hub-name">${g.label}</span>` +
        `<span class="lb-hub-score">${best ? best.toLocaleString() : '—'}</span>` +
        `</a>`;
    }).join('');
    el.innerHTML = rows || '<p class="lb-empty">Play a game to set scores!</p>';
  }

  return { saveScore, getScores, getBest, getAllBest, getActiveGames, render, renderWidget, renderHubSummary, ALL_GAMES };
})();

const GameEngagement = (() => {
  const REACTION_PREFIX = 'engage_v1_reaction_';
  const LOCAL_PREFIX = 'engage_v1_counts_';
  const EMPTY = { likes: 0, dislikes: 0, plays: 0 };

  function localKey(gameKey) {
    return LOCAL_PREFIX + gameKey;
  }

  function reactionKey(gameKey) {
    return REACTION_PREFIX + gameKey;
  }

  function readCounts(gameKey) {
    try {
      const raw = localStorage.getItem(localKey(gameKey));
      const parsed = raw ? JSON.parse(raw) : {};
      return normalize(parsed);
    } catch {
      return { ...EMPTY };
    }
  }

  function writeCounts(gameKey, counts) {
    try {
      localStorage.setItem(localKey(gameKey), JSON.stringify(normalize(counts)));
    } catch { /* quota exceeded - keep the session moving */ }
  }

  function normalize(counts) {
    return {
      likes: Math.max(0, Number(counts?.likes) || 0),
      dislikes: Math.max(0, Number(counts?.dislikes) || 0),
      plays: Math.max(0, Number(counts?.plays) || 0),
    };
  }

  function getReaction(gameKey) {
    const value = localStorage.getItem(reactionKey(gameKey));
    return value === 'like' || value === 'dislike' ? value : '';
  }

  function setReaction(gameKey, reaction) {
    if (!gameKey || (reaction !== 'like' && reaction !== 'dislike')) return readCounts(gameKey);
    const previous = getReaction(gameKey);
    const counts = readCounts(gameKey);

    if (previous === reaction) {
      counts[reaction === 'like' ? 'likes' : 'dislikes'] = Math.max(0, counts[reaction === 'like' ? 'likes' : 'dislikes'] - 1);
      localStorage.removeItem(reactionKey(gameKey));
      writeCounts(gameKey, counts);
      syncReaction(gameKey, '');
      return counts;
    }

    if (previous) {
      counts[previous === 'like' ? 'likes' : 'dislikes'] = Math.max(0, counts[previous === 'like' ? 'likes' : 'dislikes'] - 1);
    }
    counts[reaction === 'like' ? 'likes' : 'dislikes'] += 1;
    localStorage.setItem(reactionKey(gameKey), reaction);
    writeCounts(gameKey, counts);
    syncReaction(gameKey, reaction);
    return counts;
  }

  function recordPlay(gameKey) {
    if (!gameKey) return { ...EMPTY };
    const counts = readCounts(gameKey);
    counts.plays += 1;
    writeCounts(gameKey, counts);
    if (typeof CloudLeaderboard !== 'undefined' && CloudLeaderboard.submitPlay) {
      CloudLeaderboard.submitPlay(gameKey);
    }
    return counts;
  }

  function syncReaction(gameKey, reaction) {
    if (typeof CloudLeaderboard !== 'undefined' && CloudLeaderboard.submitReaction) {
      CloudLeaderboard.submitReaction(gameKey, reaction);
    }
  }

  function getSummary(gameKey) {
    return readCounts(gameKey);
  }

  function mergeSummaries(remote = {}) {
    const result = {};
    const keys = new Set([
      ...Leaderboard.getActiveGames().map(g => g.key),
      ...Object.keys(remote || {})
    ]);
    keys.forEach((key) => {
      const local = readCounts(key);
      const cloud = normalize(remote[key] || {});
      result[key] = {
        likes: Math.max(local.likes, cloud.likes),
        dislikes: Math.max(local.dislikes, cloud.dislikes),
        plays: Math.max(local.plays, cloud.plays),
      };
    });
    return result;
  }

  return { getReaction, setReaction, recordPlay, getSummary, mergeSummaries };
})();
