-- CloudyClaw Games — Supabase Leaderboard Schema
-- Run this once in your Supabase SQL editor (https://app.supabase.com → SQL editor)

-- 1. Scores table
create table if not exists scores (
  id         uuid        primary key default gen_random_uuid(),
  game       text        not null,
  player_id  uuid        not null,
  nickname   text        not null default 'Anonymous',
  score      integer     not null check (score > 0),
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- 2. Indexes for fast lookups
create index if not exists scores_game_score_idx on scores (game, score desc);
create index if not exists scores_player_idx     on scores (player_id);
create index if not exists scores_created_idx    on scores (created_at desc);

-- 3. Row-level security (public read, anonymous insert, no deletes/updates)
alter table scores enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "public read"  on scores;
drop policy if exists "anon insert"  on scores;

create policy "public read"
  on scores for select
  using (true);

create policy "anon insert"
  on scores for insert
  with check (
    score > 0
    and length(game) > 0
    and length(nickname) <= 24
  );

-- 4. Optional: deduplicated view (one row per player per game — best score)
create or replace view scores_best as
  select distinct on (game, player_id)
    id, game, player_id, nickname, score, created_at
  from scores
  order by game, player_id, score desc;

-- 5. Optional: global top-10 per game (materialised for performance)
--    Uncomment to use; refresh with: refresh materialized view leaderboard_top10;
-- create materialized view if not exists leaderboard_top10 as
--   select
--     game,
--     nickname,
--     player_id,
--     score,
--     rank() over (partition by game order by score desc) as rank,
--     created_at
--   from scores_best
--   where rank() over (partition by game order by score desc) <= 10;

-- Done! Credentials are already set in leaderboard-cloud.js.
-- Scores will sync automatically once the schema is applied.
