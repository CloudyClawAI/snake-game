/**
 * CloudyClaw Games — Cloud Leaderboard (Supabase sync layer)
 *
 * Drop-in companion to leaderboard.js. Syncs scores to Supabase in the
 * background while keeping localStorage as the offline source-of-truth.
 *
 * Schema: run supabase/schema.sql once in the Supabase SQL editor.
 * Supabase publishable keys (sb_publishable_…) are safe to commit —
 * Row Level Security controls what the key can do.
 */

const CloudLeaderboard = (() => {
  // ── Configuration ───────────────────────────────────────────
  // Runtime overrides: set window.CC_SUPABASE_URL / CC_SUPABASE_KEY before
  // this script loads to swap credentials without editing this file.
  const SUPABASE_URL = window.CC_SUPABASE_URL || 'https://ordbezlcybkcmiocomfz.supabase.co';
  const SUPABASE_KEY = window.CC_SUPABASE_KEY || 'sb_publishable_R7kp2MczyF3h9ReA2Qei0g_1w0Me7Sq';

  const CONFIGURED = !SUPABASE_URL.includes('YOUR_PROJECT');
  const ENDPOINT   = SUPABASE_URL + '/rest/v1/scores';
  const REACTIONS_ENDPOINT = SUPABASE_URL + '/rest/v1/game_reactions';
  const PLAYS_ENDPOINT = SUPABASE_URL + '/rest/v1/game_plays';
  const HEADERS    = {
    'Content-Type':  'application/json',
    'apikey':         SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Prefer':        'return=minimal',
  };
  const READ_HEADERS = {
    'apikey':        SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
  };
  const ENGAGEMENT_CONFIGURED = window.CC_ENABLE_GAME_ENGAGEMENT_CLOUD === true;

  // ── Anonymous player identity ────────────────────────────────
  const PLAYER_KEY    = 'cc_player_id';
  const NICKNAME_KEY  = 'cc_player_nick';
  const DEFAULT_NICKS = ['AcePlayer', 'StarGamer', 'PixelHero', 'NeonWolf',
                          'CyberAce', 'VoidRunner', 'LaserPilot', 'GridMaster'];

  function getPlayerId() {
    let id = localStorage.getItem(PLAYER_KEY);
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      localStorage.setItem(PLAYER_KEY, id);
    }
    return id;
  }

  function getNickname() {
    let nick = localStorage.getItem(NICKNAME_KEY);
    if (!nick) {
      nick = DEFAULT_NICKS[Math.floor(Math.random() * DEFAULT_NICKS.length)] +
             Math.floor(Math.random() * 9000 + 1000);
      localStorage.setItem(NICKNAME_KEY, nick);
    }
    return nick;
  }

  function setNickname(nick) {
    const clean = String(nick).trim().slice(0, 24).replace(/[^a-zA-Z0-9_\- ]/g, '');
    if (clean) localStorage.setItem(NICKNAME_KEY, clean);
    return clean || getNickname();
  }

  // ── Submit a score ───────────────────────────────────────────
  async function submit(game, score, meta) {
    if (!CONFIGURED) return;
    const n = Number(score);
    if (!isFinite(n) || n <= 0) return;
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          game,
          player_id: getPlayerId(),
          nickname:  getNickname(),
          score:     n,
          meta:      meta || null,
        }),
      });
    } catch (_) {
      // Offline or network error — silently drop; localStorage already saved it.
    }
  }

  // ── Fetch global top scores for a game ───────────────────────
  async function getGlobalTop(game, limit = 10) {
    if (!CONFIGURED) return [];
    try {
      const url = `${ENDPOINT}?game=eq.${encodeURIComponent(game)}` +
                  `&order=score.desc&limit=${limit}` +
                  `&select=score,nickname,player_id,created_at`;
      const res = await fetch(url, { headers: READ_HEADERS });
      if (!res.ok) return [];
      return await res.json();
    } catch (_) {
      return [];
    }
  }

  // ── Fetch all-time best score per game (hub summary) ─────────
  async function getGlobalHubSummary() {
    if (!CONFIGURED) return {};
    try {
      // Use Supabase RPC or aggregate: group by game, pick max score.
      const url = `${ENDPOINT}?select=game,score&order=game.asc,score.desc`;
      const res = await fetch(url, { headers: READ_HEADERS });
      if (!res.ok) return {};
      const rows = await res.json();
      const best = {};
      for (const row of rows) {
        if (!best[row.game] || row.score > best[row.game]) {
          best[row.game] = row.score;
        }
      }
      return best;
    } catch (_) {
      return {};
    }
  }

  async function getGlobalBestDetails(gameKeys = []) {
    if (!CONFIGURED) return {};
    try {
      const gameFilter = gameKeys.length
        ? `&game=in.(${gameKeys.map(encodeURIComponent).join(',')})`
        : '';
      const url = `${ENDPOINT}?select=game,score,nickname,player_id&order=game.asc,score.desc${gameFilter}`;
      const res = await fetch(url, { headers: READ_HEADERS });
      if (!res.ok) return {};
      const rows = await res.json();
      const best = {};
      for (const row of rows) {
        if (!best[row.game] || row.score > best[row.game].score) {
          best[row.game] = {
            score: Number(row.score) || 0,
            nickname: row.nickname || ('Player ' + String(row.player_id || '').slice(0, 6)),
          };
        }
      }
      return best;
    } catch (_) {
      return {};
    }
  }

  async function submitReaction(game, reaction) {
    if (!CONFIGURED || !ENGAGEMENT_CONFIGURED) return;
    try {
      await fetch(REACTIONS_ENDPOINT, {
        method: 'POST',
        headers: { ...HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          game,
          player_id: getPlayerId(),
          reaction: reaction || null,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // Optional table may not exist yet; localStorage remains authoritative for this player.
    }
  }

  async function submitPlay(game) {
    if (!CONFIGURED || !ENGAGEMENT_CONFIGURED) return;
    try {
      await fetch(PLAYS_ENDPOINT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          game,
          player_id: getPlayerId(),
          nickname: getNickname(),
        }),
      });
    } catch (_) {
      // Optional table may not exist yet; local play count already advanced.
    }
  }

  async function getEngagementSummary(gameKeys = []) {
    if (!CONFIGURED || !ENGAGEMENT_CONFIGURED) return {};
    const result = {};
    gameKeys.forEach((game) => { result[game] = { likes: 0, dislikes: 0, plays: 0 }; });

    try {
      const gameFilter = gameKeys.length
        ? `&game=in.(${gameKeys.map(encodeURIComponent).join(',')})`
        : '';
      const reactionsUrl = `${REACTIONS_ENDPOINT}?select=game,reaction${gameFilter}`;
      const reactionsRes = await fetch(reactionsUrl, { headers: READ_HEADERS });
      if (reactionsRes.ok) {
        const rows = await reactionsRes.json();
        for (const row of rows) {
          if (!result[row.game]) result[row.game] = { likes: 0, dislikes: 0, plays: 0 };
          if (row.reaction === 'like') result[row.game].likes += 1;
          if (row.reaction === 'dislike') result[row.game].dislikes += 1;
        }
      }
    } catch (_) {}

    try {
      const gameFilter = gameKeys.length
        ? `&game=in.(${gameKeys.map(encodeURIComponent).join(',')})`
        : '';
      const playsUrl = `${PLAYS_ENDPOINT}?select=game${gameFilter}`;
      const playsRes = await fetch(playsUrl, { headers: READ_HEADERS });
      if (playsRes.ok) {
        const rows = await playsRes.json();
        for (const row of rows) {
          if (!result[row.game]) result[row.game] = { likes: 0, dislikes: 0, plays: 0 };
          result[row.game].plays += 1;
        }
      }
    } catch (_) {}

    return result;
  }

  // ── Render global leaderboard widget ─────────────────────────
  // Populates `containerId` with a ranked list of global top scores.
  // Shows a "loading…" state while fetching.
  async function renderGlobalWidget(gameKey, containerId, limit = 10) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!CONFIGURED) {
      el.innerHTML = '<p class="lb-cloud-off">🌐 Global leaderboard not configured.</p>';
      return;
    }

    el.innerHTML = '<p class="lb-loading">Loading global scores…</p>';
    const rows = await getGlobalTop(gameKey, limit);

    if (!rows.length) {
      el.innerHTML = '<p class="lb-empty">No global scores yet — be the first!</p>';
      return;
    }

    const myId  = getPlayerId();
    const myNick = getNickname();
    const medals = ['🥇', '🥈', '🥉'];

    el.innerHTML = '<ol class="lb-list lb-global-list">' +
      rows.map((r, i) => {
        const isMe = r.player_id === myId;
        const nick = r.nickname || ('Player ' + r.player_id.slice(0, 6));
        const medal = medals[i] || `${i + 1}.`;
        return `<li class="lb-row${i === 0 ? ' lb-gold' : ''}${isMe ? ' lb-me' : ''}">` +
               `<span class="lb-rank">${medal}</span>` +
               `<span class="lb-nick">${escHtml(nick)}${isMe ? ' (you)' : ''}</span>` +
               `<span class="lb-score">${Number(r.score).toLocaleString()}</span>` +
               `</li>`;
      }).join('') +
      '</ol>';
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Nickname prompt UI ───────────────────────────────────────
  // Renders a small inline form in `containerId` to set/change nickname.
  function renderNicknameForm(containerId) {
    if (!CONFIGURED) return;
    const el = document.getElementById(containerId);
    if (!el) return;
    const current = getNickname();
    el.innerHTML =
      `<div class="lb-nick-form">` +
      `<span class="lb-nick-label">Your name: </span>` +
      `<input id="cc-nick-input" type="text" maxlength="24" value="${escHtml(current)}" ` +
      `placeholder="Enter nickname">` +
      `<button id="cc-nick-save">Save</button>` +
      `</div>`;
    const saveBtn = document.getElementById('cc-nick-save');
    const nickInput = document.getElementById('cc-nick-input');
    if (!saveBtn || !nickInput) return;
    saveBtn.addEventListener('click', () => {
      const saved = setNickname(nickInput.value);
      nickInput.value = saved;
    });
  }

  // ── Auto-wrap Leaderboard.saveScore ──────────────────────────
  // When loaded after leaderboard.js, silently intercepts every saveScore
  // call and mirrors it to Supabase.
  if (typeof Leaderboard !== 'undefined') {
    const _orig = Leaderboard.saveScore.bind(Leaderboard);
    Leaderboard.saveScore = function (gameKey, score, meta) {
      const result = _orig(gameKey, score);
      submit(gameKey, score, meta);
      return result;
    };
  }

  return {
    submit,
    getGlobalTop,
    getGlobalHubSummary,
    getGlobalBestDetails,
    getEngagementSummary,
    submitReaction,
    submitPlay,
    renderGlobalWidget,
    renderNicknameForm,
    getPlayerId,
    getNickname,
    setNickname,
    configured: CONFIGURED,
  };
})();
