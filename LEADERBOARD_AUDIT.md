# Leaderboard & Persistence Audit

Authoritative catalog: `games.js` (35 hub-visible games).
Shared modules: `leaderboard.js` (local top-5, higher-is-better), `leaderboard-cloud.js` (optional Supabase sync).

## Score semantics legend

| Semantics | Meaning |
|-----------|---------|
| **higher** | Higher numeric score is better; uses `Leaderboard` desc sort |
| **lower-time** | Lower elapsed seconds is better; custom `localStorage` only |
| **session** | Tracks in-session counters, not a traditional high score |
| **mode-specific** | Best tracked per difficulty/category locally |
| **none** | No competitive persistence |

## Per-game audit

| Key | Game | Semantics | Storage key(s) | Submit timing | Hub best | Cloud | Notes |
|-----|------|-----------|----------------|---------------|----------|-------|-------|
| neon-overdrive | Neon Overdrive | higher | `lb_v1_neon-overdrive` | Run end | Yes | Yes | Survival distance score |
| prism-courier | Prism Courier | higher | `lb_v1_*` + `prism-courier-best` | Run end | Yes | Yes | Migrated to shared module |
| echo-bloom | Echo Bloom | higher | `lb_v1_*` + `echo-bloom-best` | Run end | Yes | Yes | Migrated to shared module |
| neon-circuit | Neon Circuit | higher | `lb_v1_neon-circuit` | Race finish | Yes | Yes | Lap-time derived score |
| snake | Snake | higher | `lb_v1_snake` | Game over | Yes | Yes | |
| neon-snake | Neon Snake Rush | higher | `lb_v1_neon-snake` | Game over | Yes | Yes | |
| tower-defense | Tower Defense | higher | `lb_v1_tower-defense` | Wave end / game over | Yes | Yes | |
| pacman | Pac-Man | higher | `lb_v1_pacman` | Life lost / level | Yes | Yes | |
| tetris | Tetris | higher | `lb_v1_tetris` | Game over | Yes | Yes | |
| pong | Pong | higher | `lb_v1_pong` | Match win (first to 7) | Yes | Yes | Saves winning score only |
| flappy | Cloudy Bird | higher | `lb_v1_flappy` | Collision / game over | Yes | Yes | |
| tictactoe | Tic-Tac-Toe | session | `lb_v1_tictactoe` | Per round win | Yes* | Yes | *Hub shows session win count, not competitive |
| 2048 | 2048 | higher | `lb_v1_2048` | Game over | Yes | Yes | Migrated from `2048_best` |
| minesweeper | Minesweeper | lower-time | `ms_best_{easy,medium,hard}` | Win only | No | No | Per-difficulty best seconds |
| connect-four | Connect Four | none | `cf_scores` | N/A | No | No | Local match win tally vs AI/friend |
| memory-match | Memory Match | mode-specific | `mm_bests` | Win per difficulty | No | No | Best moves + time per diff |
| word-search | Word Search | lower-time | `cc_ws_best_{category}` | Puzzle complete | No | No | Per-category best seconds |
| whack-a-mole | Whack-a-Mole | higher | `lb_v1_whack-a-mole` | 60s timer end | Yes | Yes | Migrated from `cc_wam_hs` |
| asteroids | Asteroids | higher | `lb_v1_asteroids` | Life lost | Yes | Yes | Meta: wave |
| bubble-shooter | Bubble Shooter | higher | `lb_v1_bubble-shooter` | Game over | Yes | Yes | |
| gem-crush | Gem Crush | higher | `lb_v1_gem-crush` | Game over | Yes | Yes | Timed/moves modes |
| space-invaders | Space Invaders | higher | `lb_v1_space-invaders` | Life lost | Yes | Yes | Meta: wave |
| missile-command | Missile Command | higher | `lb_v1_missile-command` | Game over | Yes | Yes | |
| breakout | Breakout | higher | `lb_v1_breakout` | Life lost | Yes | Yes | |
| typing-speed | Typing Speed | higher (WPM) | `cc_typing_best` | Test end | No | No | WPM not in shared top-5 list |
| sudoku | Sudoku | lower-time | `cc_sudoku_best_{diff}` | Puzzle solved | No | No | Per-difficulty best seconds |
| connect-four-online | Connect Four Online | none | — | N/A | No | No | Online P2P; no local competitive board |
| frogger | Frogger | higher | `lb_v1_frogger` | Life lost | Yes | Yes | Meta: level |
| galaga | Galaga | higher | `lb_v1_galaga` | Life lost | Yes | Yes | Meta: stage |
| simon-says | Simon Says | higher | `lb_v1_simon-says` | Game over | Yes | Yes | Sequence length as score |
| stack-tower | Stack Tower | higher | `lb_v1_stack-tower` | Miss / game over | Yes | Yes | Tower height |
| neon-dash | Neon Dash | higher | `lb_v1_neon-dash` | Death | Yes | Yes | Best distance |
| color-flood | Color Flood | higher | `lb_v1_color-flood` | Board cleared (win) | Yes | Yes | Cumulative run score; loss not submitted |
| pinball | Pinball | higher | `lb_v1_pinball` | Ball lost | Yes | Yes | |
| sky-jumper | Sky Jumper | higher | `lb_v1_sky-jumper` | Fall / game over | Yes | Yes | |

## Cloud-disabled behavior

When `CC_SUPABASE_URL` contains `YOUR_PROJECT` (or is unset to the placeholder), `CloudLeaderboard.configured` is `false`:

- Hub global panel (`#lb-global-panel`) stays hidden; no fetch calls.
- `renderGlobalWidget` shows a single offline message if invoked.
- `renderNicknameForm` is a no-op (no DOM, no listeners).
- `Leaderboard.saveScore` still works locally; cloud `submit` returns immediately.
- No console errors from failed Supabase requests on hub or game pages.

Override at runtime: set `window.CC_SUPABASE_URL` / `window.CC_SUPABASE_KEY` before loading `leaderboard-cloud.js`.

## Hub summary display

`Leaderboard.renderHubSummary` shows each game's **best local score** from `lb_v1_{key}` when integrated. Games with custom-only storage show `—` until migrated or by design (time-based / mode-specific / none).

## Verification

```bash
node scripts/verify-leaderboard.mjs
```

Checks cloud-disabled hub load, local score persistence sample, and audit file presence.

## Escalations (product / CTO)

- **Tic-Tac-Toe**: Session win counter on shared leaderboard is not a traditional high score; consider removing hub widget or redesigning semantics.
- **Typing Speed**: High WPM uses isolated storage; hub card never reflects bests without migration or inverted semantics.
- **Lower-time games** (Minesweeper, Word Search, Sudoku): Need `Leaderboard` asc-mode or separate hub fields if hub should show bests.
