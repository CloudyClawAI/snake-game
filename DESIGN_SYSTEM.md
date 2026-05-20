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
