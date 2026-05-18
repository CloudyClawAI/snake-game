# Game Quality Gate

All games must pass this checklist before a task is marked **done** or the game is deployed.

## Required checks

### 1. Loads without errors
- Open the game in a browser
- Open DevTools Console (F12)
- Confirm zero red errors on page load and on first interaction

### 2. Core mechanic works
- The primary input method (keyboard, mouse, touch) drives the game object
- The game object visibly responds to input within one frame
- Examples: Pac-Man moves, Tetris piece falls and rotates, snake steers, ball bounces

### 3. Game can be lost
- Trigger the lose condition (collide with wall/enemy, run out of lives, timer expires)
- Confirm a game-over screen or state appears
- Confirm the player can restart from the game-over state

### 4. Game can be won (if applicable)
- Progress to a win state (clear all dots, survive N waves, reach a score threshold)
- Confirm a win screen or next-level transition appears

### 5. Mobile / touch usability (if on-screen controls exist)
- On a touch device or browser mobile emulation, confirm touch buttons respond
- No layout overflow on a 375 px wide viewport

## How to run before marking done

1. Deploy the file (push to `main`; GitHub Pages updates within ~1 min)
2. Open the deployed URL in a browser tab
3. Walk through checks 1–5 above
4. Add a comment to the Paperclip issue: "QA passed — [checks 1-N] verified" or file a new issue for any failure

## Current game status

| Game | File | Loads | Mechanic | Lose | Win | Touch | Notes |
|------|------|-------|----------|------|-----|-------|-------|
| Maze Muncher | maze.html | ✅ | ✅ | ✅ | ✅ | ✅ | Fixed movement bug (SYM-18) |
| Snake | snake.html | ✅ | ✅ | ✅ | N/A | ✅ | |
| Tetris | tetris.html | ✅ | ✅ | ✅ | N/A | ✅ | |
| Tower Defense | tower-defense.html | ✅ | ✅ | ✅ | ✅ | — | |
| Flappy Bird | flappy-bird.html | ✅ | ✅ | ✅ | N/A | — | |
| Pong | pong.html | ✅ | ✅ | ✅ | ✅ | — | |
| Neon Snake | neon-snake.html | ✅ | ✅ | ✅ | N/A | — | |
| Tic-Tac-Toe | tic-tac-toe.html | ✅ | ✅ | ✅ | ✅ | — | |

_Touch column "—" means no on-screen controls present; keyboard-only game._

Status key: ✅ pass · ❌ fail · ⚠️ partial · — not applicable
