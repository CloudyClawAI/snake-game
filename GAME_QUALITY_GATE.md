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
| Neon Overdrive | neon-overdrive.html | ✅ | ✅ | ✅ | N/A | ✅ | High-speed 3D tunnel runner |
| Pac-Man | pacman.html | ✅ | ✅ | ✅ | ✅ | ✅ | Authentic AI; fruit bonuses; cloud LB |
| Maze Muncher | maze.html | ✅ | ✅ | ✅ | ✅ | ✅ | Fixed movement bug (SYM-18) |
| Snake | snake.html | ✅ | ✅ | ✅ | N/A | ✅ | |
| Tetris | tetris.html | ✅ | ✅ | ✅ | N/A | ✅ | |
| Tower Defense | tower-defense.html | ✅ | ✅ | ✅ | ✅ | — | |
| Flappy Bird | flappy-bird.html | ✅ | ✅ | ✅ | N/A | — | |
| Pong | pong.html | ✅ | ✅ | ✅ | ✅ | — | |
| Neon Snake Rush | neon-snake.html | ✅ | ✅ | ✅ | N/A | — | |
| Tic-Tac-Toe | tic-tac-toe.html | ✅ | ✅ | ✅ | ✅ | — | |
| 2048 | 2048.html | ✅ | ✅ | ✅ | ✅ | ✅ | Swipe gestures; keep-going after 2048 |
| Minesweeper | minesweeper.html | ✅ | ✅ | ✅ | ✅ | ✅ | 3 difficulties; first click safe |
| Connect Four | connect-four.html | ✅ | ✅ | ✅ | ✅ | ✅ | Minimax AI depth-5; 2P local mode |
| Memory Match | memory-match.html | ✅ | ✅ | ✅ | ✅ | ✅ | 3 difficulties; 3D flip animation |
| Space Invaders | space-invaders.html | ✅ | ✅ | ✅ | ✅ | ✅ | Destructible bunkers; UFO; waves |
| Breakout | breakout.html | ✅ | ✅ | ✅ | ✅ | ✅ | 4 powerups; 6 level patterns |
| Typing Speed Test | typing-speed.html | ✅ | ✅ | ✅ | N/A | ✅ | 15 difficulty tiers; 30/60/120s modes |
| Sudoku | sudoku.html | ✅ | ✅ | N/A | ✅ | ✅ | Generated puzzles; pencil notes; hints |
| Word Search | word-search.html | ✅ | ✅ | N/A | ✅ | ✅ | 6 categories; 8 directions; drag select |
| Whack-a-Mole | whack-a-mole.html | ✅ | ✅ | ✅ | N/A | ✅ | 60s timer; golden moles; speed ramp |
| Asteroids | asteroids.html | ✅ | ✅ | ✅ | N/A | ✅ | Hyperspace; particles; mobile buttons |
| Bubble Shooter | bubble-shooter.html | ✅ | ✅ | ✅ | N/A | ✅ | Hex grid; combos; trajectory preview |
| Frogger | frogger.html | ✅ | ✅ | ✅ | ✅ | ✅ | Traffic + river; 5 homes; time bonus; level progression |
| Stack Tower | stack-tower.html | ✅ | ✅ | ✅ | N/A | ✅ | Isometric 3D; perfect combo system; sky transition |
| Missile Command | missile-command.html | ✅ | ✅ | ✅ | N/A | ✅ | 6 cities; 3 bases; MIRVs; wave bonuses |

|| Color Flood | color-flood.html | ✅ | ✅ | ✅ | ✅ | ✅ | 3 board sizes; ripple animation; keyboard support |
|| Sky Jumper | sky-jumper.html | ✅ | ✅ | ✅ | N/A | ✅ | Doodle Jump clone; power-ups; enemies; shooting |

_Touch column "—" means no on-screen controls present; keyboard-only game._

Status key: ✅ pass · ❌ fail · ⚠️ partial · — not applicable
