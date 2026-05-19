# CloudyClaw Games

> **Free browser games — no downloads, no installs, just play.**

A growing collection of polished HTML5 games built with vanilla JavaScript and CSS. Every game is a single self-contained file and runs directly in any modern browser.

**[▶ Open the Game Hub](https://cloudyclawai.github.io/snake-game/)**

---

## Games

| Game | Play | Description |
|------|------|-------------|
| ⚡ Neon Overdrive | [Play](https://cloudyclawai.github.io/snake-game/neon-overdrive.html) | High-speed 3D tunnel runner with procedural obstacles and neon visuals |
| 🐍 Snake | [Play](https://cloudyclawai.github.io/snake-game/snake.html) | Classic Snake with particle effects, golden bonus food, and progressive difficulty |
| ✨ Neon Snake Rush | [Play](https://cloudyclawai.github.io/snake-game/neon-snake.html) | Turbocharged Snake with combo multipliers, ghost orb & overdrive powerups, neon glow visuals |
| ⚔️ Tower Defense | [Play](https://cloudyclawai.github.io/snake-game/tower-defense.html) | 4 tower types, 5 enemy types, 15 waves, upgrade trees, special abilities, combo multiplier |
| 🟡 Maze Muncher | [Play](https://cloudyclawai.github.io/snake-game/maze.html) | Pac-Man-style maze with 4 ghosts, power pellets, multiple levels, and mobile touch controls |
| 🧱 Tetris | [Play](https://cloudyclawai.github.io/snake-game/tetris.html) | All 7 tetrominoes, SRS wall kicks, hold piece, ghost preview, level progression |
| 🏓 Pong | [Play](https://cloudyclawai.github.io/snake-game/pong.html) | Two-player Pong with physics-based bouncing — W/S vs Arrow keys, first to 7 wins |
| 🐦 Cloudy Bird | [Play](https://cloudyclawai.github.io/snake-game/flappy-bird.html) | Flappy Bird-style side-scroller — tap or press Space to flap, dodge the pipes |
| ❌ Tic-Tac-Toe | [Play](https://cloudyclawai.github.io/snake-game/tic-tac-toe.html) | Classic 3×3 Tic-Tac-Toe for two players with animated win highlights |
| 🔢 2048 | [Play](https://cloudyclawai.github.io/snake-game/2048.html) | Classic sliding tile puzzle. Combine matching tiles to reach 2048 |
| 💣 Minesweeper | [Play](https://cloudyclawai.github.io/snake-game/minesweeper.html) | Classic Minesweeper with 3 difficulties and auto-reveal |
| 🔴 Connect Four | [Play](https://cloudyclawai.github.io/snake-game/connect-four.html) | Drop discs to connect four against AI or a local friend |
| 🌐 Connect Four Online | [Play](https://cloudyclawai.github.io/snake-game/connect-four-online.html) | Play Connect Four against a friend anywhere via P2P multiplayer |
| 🃏 Memory Match | [Play](https://cloudyclawai.github.io/snake-game/memory-match.html) | Flip cards to find matching emoji pairs with 3 difficulties |
| 👾 Space Invaders | [Play](https://cloudyclawai.github.io/snake-game/space-invaders.html) | Classic arcade shooter with destructible bunkers and waves |
| 🏓 Breakout | [Play](https://cloudyclawai.github.io/snake-game/breakout.html) | Arkanoid-style brick breaker with powerups and level progression |
| ⌨️ Typing Speed | [Play](https://cloudyclawai.github.io/snake-game/typing-speed.html) | Measure your WPM and accuracy with 15 difficulty levels |
| 🔢 Sudoku | [Play](https://cloudyclawai.github.io/snake-game/sudoku.html) | Full 9×9 Sudoku with generated puzzles and pencil notes |
| 🔍 Word Search | [Play](https://cloudyclawai.github.io/snake-game/word-search.html) | Classic themed word search with 8 directions and drag select |
| 🔨 Whack-a-Mole | [Play](https://cloudyclawai.github.io/snake-game/whack-a-mole.html) | 60-second reflex challenge with regular and golden moles |
| 🚀 Asteroids | [Play](https://cloudyclawai.github.io/snake-game/asteroids.html) | Classic vector-style Asteroids with hyperspace and particles |
| 🫧 Bubble Shooter | [Play](https://cloudyclawai.github.io/snake-game/bubble-shooter.html) | Aim and fire to match 3+ bubbles with trajectory preview |

---

## Tech Stack

- **Vanilla HTML5 / CSS3 / JavaScript** — zero dependencies, zero build steps
- **Canvas 2D API** — all game rendering
- **localStorage** — persistent high scores
- **Web Share API** — native share-your-score on mobile (clipboard fallback on desktop)
- **GitHub Pages** — hosting at `cloudyclawai.github.io/snake-game/`

---

## How to Play Locally

Clone the repo and open any file in a browser:

```bash
git clone https://github.com/CloudyClawAI/snake-game.git
cd snake-game
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

No build step, no server required. Every game is a self-contained HTML file.

---

## How to Contribute

Contributions are welcome! To add a new game or improve an existing one:

1. **Fork** the repository and create a feature branch.
2. **Build your game** as a single self-contained `<game-name>.html` file (no external dependencies).
3. Check it against the [game quality gate](GAME_QUALITY_GATE.md) — all items must pass.
4. **Add a card** for it in `index.html` (follow the existing card structure).
5. **Add an entry** to the Games table in this README.
6. Open a **pull request** with a short description and a screenshot or GIF.

### Quality bar

Every game should have:
- Responsive layout that works on mobile
- Touch/swipe controls (where applicable)
- A clear game-over screen with a restart button
- A "Share your score" button after game over
- SEO meta tags (`<title>`, `<meta name="description">`, OG tags, canonical URL)

See [`GAME_QUALITY_GATE.md`](GAME_QUALITY_GATE.md) for the full checklist.

---

## License

MIT — do whatever you like, attribution appreciated.
