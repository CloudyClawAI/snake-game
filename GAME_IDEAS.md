# CloudyClaw Game Ideas

Two niche game concepts designed for the current CloudyClaw stack: single-file HTML, CSS, and vanilla JavaScript with Canvas 2D rendering, local high scores, mobile controls, and no build step.

## 1. Prism Courier

Implementation: [`prism-courier.html`](prism-courier.html)

### Pitch

Prism Courier is a one-thumb arcade route-planning game where the player pilots a light-skiff through a stained-glass city that rearranges every few seconds. The goal is to deliver color-coded energy parcels to matching towers before their glow decays, while rotating mirror gates, splitting beams, and chaining perfect deliveries for score multipliers.

### Why It Is Niche

Most delivery games focus on roads or physics. Prism Courier turns delivery into a readable light-routing puzzle with arcade pressure: the player is not just dodging obstacles, they are using the city itself as a temporary optical circuit.

### Core Loop

1. A parcel spawns with a color, destination tower, and decay timer.
2. The player drags or steers the courier through floating lanes.
3. Mirror gates reflect or split the courier trail, creating shortcuts and hazards.
4. Deliveries refill boost energy and increase the combo meter.
5. The city rotates panels after each wave, changing viable paths.

### Controls

- Desktop: `WASD` or arrow keys to steer, `Space` to boost, mouse/touch drag to preview the next route.
- Mobile: thumb drag for direction, double-tap to boost.

### Visual Direction

- Black-glass background with bright cyan, magenta, amber, and lime light paths.
- Canvas bloom simulation via layered translucent strokes.
- Procedural stained-glass cells using Voronoi-like polygons drawn from generated seed points.
- Parcel colors tint the courier trail and destination tower.
- Screen pulse and fragment particles on perfect-timer delivery.

### Addictive Hooks

- Combo ladder: perfect deliveries stack a multiplier, but one expired parcel breaks it.
- Route mastery: the city layout mutates, but panel rules remain learnable.
- Risk choice: boost saves time but makes mirror reflections harder to control.
- Daily seed potential: one shared city seed can support competitive high-score runs.

### Technical Notes

- Use a fixed-step game loop with Canvas 2D.
- Represent lanes and mirror gates as line segments for simple collision and reflection math.
- Generate city panels from deterministic seeded random values so a daily challenge can be added later.
- Store best score and longest combo in `localStorage`.
- Keep all assets procedural: no images required.

### MVP Scope

- One endless mode with escalating parcel timers.
- 12 to 18 generated panels per run.
- Three mirror gate types: reflect, split, and absorb.
- Local high score, restart flow, and score share button.

## 2. Echo Bloom

Implementation: [`echo-bloom.html`](echo-bloom.html)

### Pitch

Echo Bloom is a rhythm-memory gardening game set inside a bioluminescent sound garden. The player listens to short creature calls, plants matching echo seeds on a hex grid, and triggers chain reactions where flowers bloom in the order of the remembered melody.

### Why It Is Niche

It blends Simon-style memory, light puzzle placement, and chain-reaction scoring. The player is not only repeating a sequence; they are arranging the sequence spatially so echoes spread through the garden for bigger blooms.

### Core Loop

1. The garden plays a short melody using four to six distinct echo tones.
2. The player places matching seed types on a compact hex grid.
3. When the round starts, the first seed emits an echo pulse.
4. Correct neighboring seeds bloom and pass the pulse onward.
5. Longer valid chains score higher and unlock rarer hybrid blooms.

### Controls

- Desktop: click a seed type, click a hex cell to plant, press `Enter` to play the chain.
- Mobile: tap seed tray, tap grid cell, tap play.
- Accessibility option: each tone has a matching shape and color so the game is playable without audio.

### Visual Direction

- Deep ink background with luminous flowers, rippling rings, and soft particle pollen.
- Four base seed identities use distinct silhouettes, not color alone.
- Chain pulses travel as expanding circles between hex centers.
- Successful bloom chains create layered petals and brief screen-space glow.
- Failed echoes dim cells gently instead of hard flashing.

### Addictive Hooks

- Short rounds make retries fast.
- Spatial optimization gives better scores than simple sequence recall.
- Hybrid blooms reward clever branching chains.
- Endless difficulty scales by sequence length, tempo, and blocked cells.

### Technical Notes

- Draw the hex grid directly on Canvas 2D using axial coordinates.
- Use Web Audio oscillators for tones, with a muted visual-only fallback if audio is unavailable.
- Maintain a deterministic round state so replay and debugging are simple.
- Store best score, highest round, and discovered hybrid count in `localStorage`.
- Use pointer events for shared mouse/touch input.

### MVP Scope

- Endless mode with increasing melody length.
- Four base seed types and two hybrid bonus patterns.
- Visual tone legend, mute toggle, restart flow, and score share button.
- Responsive layout that preserves grid readability on small screens.

## Recommendation

Build Prism Courier first. It better differentiates CloudyClaw from the existing catalog because the current hub already has memory and puzzle games, while Prism Courier adds a visually flashy route-action game with strong screenshot appeal and procedural replayability.
