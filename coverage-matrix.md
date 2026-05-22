# Smoke Harness Coverage Matrix

This matrix maps games to the automated checks performed by the platform smoke harness.

| Category | Game | Load | Structural | Console/Page Errors | Specialized Check |
|----------|------|------|------------|---------------------|-------------------|
| Hub | `index.html` | ✅ | ✅ | ✅ | Game cards count |
| Online Multiplayer | `connect-four-online.html` | ✅ | ✅ | ✅ | Lobby presence |
| 3D/WebGL | `neon-circuit.html` | ✅ | ✅ | ✅ | WebGL context |
| 3D/WebGL | `neon-overdrive.html` | ✅ | ✅ | ✅ | Canvas presence |
| 3D/WebGL | `prism-courier.html` | ✅ | ✅ | ✅ | - |
| 3D/WebGL | `echo-bloom.html` | ✅ | ✅ | ✅ | - |
| Canvas Arcade | `snake.html` | ✅ | ✅ | ✅ | Input simulation |
| Canvas Arcade | `pacman.html` | ✅ | ✅ | ✅ | Canvas presence |
| Canvas Arcade | `asteroids.html` | ✅ | ✅ | ✅ | - |
| Puzzle Board | `sudoku.html` | ✅ | ✅ | ✅ | Grid presence |
| Puzzle Board | `2048.html` | ✅ | ✅ | ✅ | Board presence |
| Puzzle Board | `minesweeper.html` | ✅ | ✅ | ✅ | - |

## Check Definitions

- **Load**: Page navigates and reaches `networkidle0`.
- **Structural**: Presence of `design-system.css` and hub/back links (where applicable).
- **Console/Page Errors**: No `pageerror` or high-severity `console.error` during load.
- **Specialized Check**: Game-specific invariant checks (e.g., WebGL context, specific DOM elements).
