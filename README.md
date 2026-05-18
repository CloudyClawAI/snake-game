# CloudyClaw Games

> **Free browser games — no downloads, no installs, just play.**

A growing collection of polished HTML5 games built with vanilla JavaScript and CSS. Every game is a single self-contained file and runs directly in any modern browser.

**[▶ Open the Game Hub](https://cloudyclawai.github.io/snake-game/)**

---

## Games

| Game | Play | Description |
|------|------|-------------|
| 🐍 Snake | [Play](https://cloudyclawai.github.io/snake-game/snake.html) | Classic Snake with particle effects, golden bonus food, and progressive difficulty |
| ✨ Neon Snake Rush | [Play](https://cloudyclawai.github.io/snake-game/neon-snake.html) | Turbocharged Snake with combo multipliers, ghost orb & overdrive powerups, neon glow visuals |
| ⚔️ Tower Defense | [Play](https://cloudyclawai.github.io/snake-game/tower-defense.html) | 4 tower types, 5 enemy types, 15 waves, upgrade trees, special abilities, combo multiplier |
| 🟡 Maze Muncher | [Play](https://cloudyclawai.github.io/snake-game/maze.html) | Pac-Man-style maze with 4 ghosts, power pellets, multiple levels, and mobile touch controls |
| 🧱 Tetris | [Play](https://cloudyclawai.github.io/snake-game/tetris.html) | All 7 tetrominoes, SRS wall kicks, hold piece, ghost preview, level progression |
| 🏓 Pong | [Play](https://cloudyclawai.github.io/snake-game/pong.html) | Two-player Pong with physics-based bouncing — W/S vs Arrow keys, first to 7 wins |
| 🐦 Cloudy Bird | [Play](https://cloudyclawai.github.io/snake-game/flappy-bird.html) | Flappy Bird-style side-scroller — tap or press Space to flap, dodge the pipes |
| ❌ Tic-Tac-Toe | [Play](https://cloudyclawai.github.io/snake-game/tic-tac-toe.html) | Classic 3×3 Tic-Tac-Toe for two players with animated win highlights |

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
