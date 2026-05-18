/**
 * CloudyClaw Games — Cloud Leaderboard (Supabase sync layer)
 *
 * Drop-in companion to leaderboard.js. Syncs scores to Supabase in the
 * background while keeping localStorage as the offline source-of-truth.
 *
 * ACTIVATION (one-time setup):
 *   1. Create a free project at https://supabase.com
 *   2. Run the schema in supabase/schema.sql (or paste into Supabase SQL editor)
 *   3. Replace SUPABASE_URL and SUPABASE_ANON_KEY below with your project values
 *   4. Add <script src="leaderboard-cloud.js"></script> to any game page
 *      AFTER leaderboard.js — it wraps Leaderboard.saveScore automatically.
 *
 * Schema (supabase SQL editor):
 *   create table if not exists scores (
 *     id         uuid primary key default gen_random_uuid(),
 *     game       text not null,
 *     player_id  uuid not null,
 *     score      integer not null,
 *     meta       jsonb,
 *     created_at timestamptz default now()
 *   );
 *   create index on scores (game, score desc);
 *   -- Public read, anonymous insert (Row Level Security):
 *   alter table scores enable row level security;
 *   create policy "public read"   on scores for select using (true);
 *   create policy "anon insert"   on scores for insert with check (true);
 */

const CloudLeaderboard = (() => {
  // ── Configuration ───────────────────────────────────────────
  // Replace these with your Supabase project values to activate.
  const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
  const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

  const CONFIGURED = !SUPABASE_URL.includes('YOUR_PROJECT');
  const ENDPOINT   = SUPABASE_URL + '/rest/v1/scores';
  const HEADERS    = {
    'Content-Type':  'application/json',
    'apikey':         SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Prefer':        'return=minimal',
  };

  // ── Anonymous player identity ────────────────────────────────
  const PLAYER_KEY = 'cc_player_id';
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

  // ── Submit a score ───────────────────────────────────────────
  async function submit(game, score, meta) {
    if (!CONFIGURED) return;
    const n = Number(score);
    if (!isFinite(n) || n <= 0) return;
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ game, player_id: getPlayerId(), score: n, meta: meta || null }),
      });
    } catch (_) {
      // Offline or network error — silently drop; localStorage already saved it.
    }
  }

  // ── Fetch global top scores for a game ───────────────────────
  async function getGlobalTop(game, limit = 10) {
    if (!CONFIGURED) return [];
    try {
      const url = `${ENDPOINT}?game=eq.${encodeURIComponent(game)}&order=score.desc&limit=${limit}&select=score,player_id,created_at`;
      const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY } });
      if (!res.ok) return [];
      return await res.json();
    } catch (_) {
      return [];
    }
  }

  // ── Auto-wrap Leaderboard.saveScore ──────────────────────────
  // When this script is loaded after leaderboard.js, it silently intercepts
  // every saveScore call and mirrors it to Supabase.
  if (typeof Leaderboard !== 'undefined') {
    const _orig = Leaderboard.saveScore.bind(Leaderboard);
    Leaderboard.saveScore = function (gameKey, score, meta) {
      const result = _orig(gameKey, score);
      submit(gameKey, score, meta);
      return result;
    };
  }

  return { submit, getGlobalTop, getPlayerId, configured: CONFIGURED };
})();
