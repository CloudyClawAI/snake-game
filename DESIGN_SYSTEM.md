# CloudyClaw Design System

This document defines the shared UI primitives and HTML contract for the CloudyClaw platform. All games and platform pages should use `design-system.css` and follow these markup patterns to ensure a unified look and feel.

## 1. Global Shell

Every page should include the standard navigation bar.

```html
<nav class="nav-bar">
  <a href="index.html" class="nav-brand">Cloudy<span>Claw</span></a>
  <div class="nav-links">
    <a href="index.html" class="nav-link active">Games</a>
    <a href="#" class="nav-link">Leaderboard</a>
    <a href="#" class="nav-link">Install</a>
  </div>
</nav>
```

## 2. Hub Game Card

Used on the landing page (`index.html`) to display games.

```html
<div class="card">
  <div class="card-icon">⚡</div>
  <h3 class="card-title">Game Title</h3>
  <p class="card-desc">Short description of the game gameplay and features.</p>
  <div class="card-meta">
    <span class="chip">Arcade</span>
    <span class="chip">High Score</span>
  </div>
  <a href="game.html" class="btn btn-primary mt-4">▶ Play</a>
</div>
```

## 3. Game Page Shell

Every game should use the `.game-shell` layout.

```html
<div class="game-shell">
  <main class="game-main">
    <header class="game-header">
      <a href="index.html" class="back-link">← Hub</a>
      <h1 class="game-title">GAME NAME</h1>
      <p class="game-subtitle">Game tagline or brief instructions.</p>
    </header>

    <div class="canvas-container">
      <canvas id="game-canvas"></canvas>
      
      <!-- Standard Overlay for Start/Pause/Game Over -->
      <div id="overlay" class="overlay">
        <h2 class="overlay-title">GAME OVER</h2>
        <div class="overlay-body">
          Final Score: <strong>1234</strong>
        </div>
        <button id="start-btn" class="btn btn-primary btn-lg">▶ Play Again</button>
      </div>
    </div>

    <!-- Optional: Desktop Keyboard Controls Hint -->
    <div class="text-dim text-center mt-4">
      ← → Move | Space Jump | P Pause
    </div>
  </main>

  <aside class="game-sidebar">
    <!-- Stat Tiles / HUD -->
    <div class="stat-grid">
      <div class="stat-tile">
        <span class="stat-label">Score</span>
        <span class="stat-value" id="score">0</span>
      </div>
      <div class="stat-tile">
        <span class="stat-label">Best</span>
        <span class="stat-value" id="best">0</span>
      </div>
    </div>

    <!-- Leaderboard Panel -->
    <div class="lb-panel">
      <h3>Top Scores</h3>
      <div id="lb-container"></div>
    </div>
  </aside>
</div>
```

### Minimum Game Contract

New games must satisfy this checklist before they are added to the hub:

- Include `<meta charset="UTF-8">`, a responsive viewport meta tag, `manifest.json`, `theme-color`, and `design-system.css`.
- Include the standard nav bar and a visible hub link using `href="index.html"` or `href="./index.html"`.
- Use `.game-shell` with a main play area and a sidebar or equivalent score panel. Canvas games should place the primary canvas inside `.canvas-container`.
- Declare one stable leaderboard key that matches the catalog key in `games.js`, local high-score storage, and leaderboard save/render calls.
- Provide start/restart, pause/resume where applicable, and game-over affordances through the shared `.overlay` pattern.
- Preserve direct-file browser play: no build step, module bundler, or network dependency may be required for core gameplay.
- Keep resize behavior deterministic. Canvas backing dimensions should be explicit, while CSS should allow the canvas to fit within the viewport without layout overflow.
- Add touch controls for games that depend on directional or action input. Use `.touch-controls`, `.dpad-grid`, and `.control-btn` when a D-pad is appropriate.
- Pass the relevant smoke verifier and record at least one manual browser check before marking a new shell migration done.

### Optional Helper

Canvas games may include `game-shell.js` after leaderboard scripts when it removes repeated shell logic:

```html
<script src="leaderboard.js"></script>
<script src="leaderboard-cloud.js"></script>
<script src="game-shell.js"></script>
<script>
  const shell = CloudyClawGameShell.create({
    key: 'snake',
    overlay: 'overlay',
    overlayTitle: 'overlay-msg',
    overlayBody: 'overlay-sub',
    primaryButton: 'restart-btn',
    bestEl: 'hi-display',
    leaderboardTargetId: 'lb-widget'
  });
</script>
```

The helper is intentionally tiny and global so direct-file play and GitHub Pages deployment keep working.

## 4. Touch Controls

For mobile-friendly games, use the `.touch-controls` container.

```html
<div class="touch-controls">
  <div class="dpad-grid">
    <div class="control-btn" id="btn-up">↑</div>
    <div class="control-btn" id="btn-left">◀</div>
    <div class="control-btn" id="btn-down">▼</div>
    <div class="control-btn" id="btn-right">▶</div>
  </div>
  <div class="mt-4">
    <div class="control-btn wide" id="btn-action">ACTION</div>
  </div>
</div>
```

## 5. CSS Variables

Always prefer using CSS variables for colors, spacing, and radius.

- `--accent`: Primary brand color (purple)
- `--bg`: Main background
- `--surface`: Card/panel background
- `--text-muted`: Dimmed text
- `--radius-card`: Standard corner radius
- `--sp-md`: Standard spacing (1rem)
