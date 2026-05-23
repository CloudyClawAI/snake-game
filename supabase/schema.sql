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

-- Game card reactions: one current reaction per anonymous player per game.
create table if not exists game_reactions (
  game       text        not null,
  player_id  uuid        not null,
  reaction   text        check (reaction in ('like', 'dislike') or reaction is null),
  updated_at timestamptz not null default now(),
  primary key (game, player_id)
);

create index if not exists game_reactions_game_idx on game_reactions (game);

alter table game_reactions enable row level security;

drop policy if exists "public read" on game_reactions;
drop policy if exists "anon upsert" on game_reactions;
drop policy if exists "anon update own reaction" on game_reactions;

create policy "public read"
  on game_reactions for select
  using (true);

create policy "anon upsert"
  on game_reactions for insert
  with check (length(game) > 0);

create policy "anon update own reaction"
  on game_reactions for update
  using (true)
  with check (length(game) > 0);

-- Game play events: append-only clicks from hub game cards.
create table if not exists game_plays (
  id         uuid        primary key default gen_random_uuid(),
  game       text        not null,
  player_id  uuid        not null,
  nickname   text        not null default 'Anonymous',
  created_at timestamptz not null default now()
);

create index if not exists game_plays_game_idx on game_plays (game);
create index if not exists game_plays_created_idx on game_plays (created_at desc);

alter table game_plays enable row level security;

drop policy if exists "public read" on game_plays;
drop policy if exists "anon insert" on game_plays;

create policy "public read"
  on game_plays for select
  using (true);

create policy "anon insert"
  on game_plays for insert
  with check (
    length(game) > 0
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
