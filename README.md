# CloudyClaw Games

A collection of browser-based games built with vanilla HTML5, CSS, and JavaScript — no dependencies, single files, run in any modern browser.

**[Open Game Hub →](https://cloudyclawai.github.io/snake-game/)**

---

## Games

### 🐍 Snake

**[Play Snake →](https://cloudyclawai.github.io/snake-game/snake.html)**  
Or open `snake.html` locally.

A classic Snake game with particle effects, golden bonus food, progressive difficulty, and mobile touch support.

**Controls**

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| P / Space | Pause / Resume |
| R | Restart |
| Swipe | Move (mobile) |

**Scoring**

- Normal food: 10 × level
- Special food (★): 50 × level
- Level up every 100 points (speed increases)

---

### 🟡 Maze Muncher

**[Play Maze Muncher →](https://cloudyclawai.github.io/snake-game/maze.html)**  
Or open `maze.html` locally.

A Pac-Man-inspired maze game with ghosts, power pellets, multiple levels, lives, and mobile touch support.

**Controls**

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| P / Escape | Pause |
| Swipe / D-pad | Move (mobile) |

**Features**

- **21×22 maze** with dots, power pellets, and a ghost house
- **4 ghost personalities** — direct chase, ambush, flanking, patrol AI
- **Scatter / Chase cycle** — ghosts alternate corner patrol and hunting
- **Power pellets** — turn ghosts blue; eat them for 200→400→800→1600 combo
- **Progressive difficulty** — speed increases each level
- **3 lives** with death animation; persistent high score via localStorage
- **Tunnel wrap** at maze edges

**Scoring**

| Event | Points |
|-------|--------|
| Dot | 10 |
| Power pellet | 50 |
| 1st ghost | 200 |
| 2nd ghost | 400 |
| 3rd ghost | 800 |
| 4th ghost | 1600 |

---

### ⚔️ Tower Defense

**[Play Tower Defense →](https://cloudyclawai.github.io/snake-game/tower-defense.html)**  
Or open `tower-defense.html` locally.

A fully-featured tower defense game with 4 tower types, 5 enemy types, 15 waves, upgrade trees, special abilities, particles, and a combo system.

**Features**

- **4 Tower types** — Arrow (fast single-target), Cannon (AoE splash), Magic (poison DoT + chain), Ice (slows enemies)
- **2 upgrade tiers** per tower with stat boosts and special unlocks (multi-shot, chain lightning, blizzard aura)
- **5 enemy types** — Grunt, Scout (fast), Knight (armored), Ogre (heavy), Boss
- **15 waves** of increasing difficulty; boss enemies appear from wave 5
- **2 special abilities** — 💥 Air Strike (targeted bomb, 120g) and ❄️ Blizzard (freeze all, 80g)
- Kill **combo multiplier** for bonus score
- **Persistent high score** via localStorage
- **2× fast-forward** mode
- Particle effects, health bars, range preview, screen shake

**Tower Quick Reference**

| Tower | Cost | Special |
|-------|------|---------|
| 🏹 Arrow  | 50g  | Fast fire; tier 3 = 3-shot barrage |
| 💣 Cannon | 100g | Splash damage; tier 3 = cluster bomb |
| ✨ Magic  | 75g  | Poison DoT; tier 3 = chain lightning |
| ❄️ Ice    | 75g  | Slow; tier 3 = blizzard AoE pulse |
