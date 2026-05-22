/**
 * Centralized game metadata for CloudyClaw Games.
 */
const GAMES = [
  {
    key: 'neon-overdrive',
    title: 'Neon Overdrive',
    icon: '⚡',
    description: 'High-speed 3D tunnel runner. Dodge neon obstacles in a procedurally generated tunnel. How long can you survive the overdrive?',
    tags: ['3D Arcade', 'High Speed', 'Infinite'],
    categories: ['Arcade', 'Featured'],
    href: 'neon-overdrive.html'
  },
  {
    key: 'prism-courier',
    title: 'Prism Courier',
    icon: '🔷',
    description: 'Pilot a light-skiff through a shifting stained-glass city. Collect fading prisms, deliver to matching towers, and protect your combo.',
    tags: ['Route Action', 'Combos', 'Touch'],
    categories: ['Arcade', 'Featured'],
    href: 'prism-courier.html'
  },
  {
    key: 'echo-bloom',
    title: 'Echo Bloom',
    icon: '🌸',
    description: 'Memorize echo tones, plant matching seeds on a hex garden, and trigger luminous bloom chains for high-score runs.',
    tags: ['Rhythm Puzzle', 'Memory', 'Web Audio'],
    categories: ['Puzzle', 'Featured'],
    href: 'echo-bloom.html'
  },
  {
    key: 'neon-circuit',
    title: 'Neon Circuit',
    icon: '🏎️',
    description: 'High-octane 3D arcade racer! Drift through a neon-lit floating circuit with elevation changes, engine roars, and a pulse-pounding beat.',
    tags: ['3D Racing', 'Lap Time', 'WebGL'],
    categories: ['Arcade', 'Featured'],
    href: 'neon-circuit.html'
  },
  {
    key: 'snake',
    title: 'Snake',
    icon: '🐍',
    description: 'Classic snake with particle effects, golden bonus food, progressive difficulty, and full mobile swipe support.',
    tags: ['Arcade', 'High Score', 'Touch'],
    categories: ['Classic', 'Arcade'],
    href: 'snake.html'
  },
  {
    key: 'neon-snake',
    title: 'Neon Snake Rush',
    icon: '✨',
    description: 'Turbocharged snake with combo multipliers, ghost orb and overdrive powerups, and neon glow visuals.',
    tags: ['Arcade', 'Combos', 'Powerups'],
    categories: ['Arcade'],
    href: 'neon-snake.html'
  },
  {
    key: 'tower-defense',
    title: 'Tower Defense',
    icon: '⚔️',
    description: '4 tower types, 5 enemy types, 15 waves, upgrade trees, special abilities, combo multiplier, and particle effects.',
    tags: ['Strategy', 'Waves', 'Upgrades'],
    categories: ['Strategy'],
    href: 'tower-defense.html'
  },
  {
    key: 'pacman',
    title: 'Pac-Man',
    icon: '🍒',
    description: 'The ultimate arcade classic! Guide Pac-Man through the maze, eat dots and fruit, and avoid Blinky, Pinky, Inky, and Clyde.',
    tags: ['Arcade', 'Classic', 'Fruit', 'Touch'],
    categories: ['Arcade', 'Classic'],
    href: 'pacman.html'
  },
  {
    key: 'tetris',
    title: 'Tetris',
    icon: '🧱',
    description: 'Classic Tetris with all 7 tetrominoes, hold piece, ghost piece preview, level progression, and touch controls.',
    tags: ['Puzzle', 'Classic', 'Touch'],
    categories: ['Puzzle', 'Classic'],
    href: 'tetris.html'
  },
  {
    key: 'pong',
    title: 'Pong',
    icon: '🏓',
    description: 'Classic Pong with physics-based paddle bouncing. Touch-draggable paddles on mobile. First to 7 wins!',
    tags: ['2 Player', 'Classic', 'Touch'],
    categories: ['Classic', 'Multiplayer'],
    href: 'pong.html'
  },
  {
    key: 'flappy',
    title: 'Cloudy Bird',
    icon: '🐦',
    description: 'Flappy Bird-style side-scroller: tap or press Space to flap, dodge the pipes, and beat your high score.',
    tags: ['Arcade', 'One-Button', 'Touch'],
    categories: ['Arcade'],
    href: 'flappy-bird.html'
  },
  {
    key: 'tictactoe',
    title: 'Tic-Tac-Toe',
    icon: '❌',
    description: 'Classic 3×3 Tic-Tac-Toe for two players. Tap any cell to play. Winning cells animate on victory.',
    tags: ['2 Player', 'Puzzle', 'Classic'],
    categories: ['Puzzle', 'Classic', 'Multiplayer'],
    href: 'tic-tac-toe.html'
  },
  {
    key: '2048',
    title: '2048',
    icon: '🔢',
    description: 'Classic sliding tile puzzle. Combine matching tiles to reach 2048. Arrow keys, WASD, or swipe to slide. Tracks your best score.',
    tags: ['Puzzle', 'High Score', 'Touch'],
    categories: ['Puzzle'],
    href: '2048.html'
  },
  {
    key: 'minesweeper',
    title: 'Minesweeper',
    icon: '💣',
    description: 'Classic Minesweeper with Easy, Medium, and Hard modes. First click is always safe. Auto-reveal empty areas, flag mines to win.',
    tags: ['Puzzle', 'Classic', 'Best Time'],
    categories: ['Puzzle', 'Classic'],
    href: 'minesweeper.html'
  },
  {
    key: 'connect-four',
    title: 'Connect Four',
    icon: '🔴',
    description: 'Drop discs to connect four in a row. Play against a minimax AI with alpha-beta pruning (depth 5) or a friend in local 2-player mode.',
    tags: ['vs AI', '2 Player', 'Strategy'],
    categories: ['Strategy', 'Multiplayer'],
    href: 'connect-four.html'
  },
  {
    key: 'memory-match',
    title: 'Memory Match',
    icon: '🃏',
    description: 'Flip cards to find matching emoji pairs. Three difficulty levels, move counter, timer, and best-score tracking per difficulty.',
    tags: ['Puzzle', 'High Score', '3 Difficulties'],
    categories: ['Puzzle'],
    href: 'memory-match.html'
  },
  {
    key: 'word-search',
    title: 'Word Search',
    icon: '🔍',
    description: 'Classic 12×12 word search with 6 themed categories, all 8 directions, click-and-drag selection, and best-time tracking per category.',
    tags: ['Puzzle', 'Words', 'Best Time'],
    categories: ['Puzzle'],
    href: 'word-search.html'
  },
  {
    key: 'whack-a-mole',
    title: 'Whack-a-Mole',
    icon: '🔨',
    description: '60-second reflex challenge: whack regular moles for +10 or rare golden moles for +50. Speed ramps up over time. Beat your high score!',
    tags: ['Arcade', 'Reflex', 'High Score'],
    categories: ['Arcade'],
    href: 'whack-a-mole.html'
  },
  {
    key: 'asteroids',
    title: 'Asteroids',
    icon: '🚀',
    description: 'Classic vector-style Asteroids: rotate, thrust, and blast rocks into pieces. Hyperspace jump, particle explosions, waves, and mobile controls.',
    tags: ['Arcade', 'Action', 'Touch'],
    categories: ['Arcade', 'Classic'],
    href: 'asteroids.html'
  },
  {
    key: 'bubble-shooter',
    title: 'Bubble Shooter',
    icon: '🫧',
    description: 'Bust-a-Move style bubble shooter: aim and fire to match 3+ same-color bubbles. Combo scoring, trajectory preview, and touch support.',
    tags: ['Puzzle', 'High Score', 'Touch'],
    categories: ['Puzzle'],
    href: 'bubble-shooter.html'
  },
  {
    key: 'gem-crush',
    title: 'Gem Crush',
    icon: '💎',
    description: 'Polished Match-3 puzzle: swap adjacent gems to create matches of 3 or more. Combo multipliers, particle effects, and time-pressure gameplay.',
    tags: ['Puzzle', 'Match-3', 'Touch'],
    categories: ['Puzzle'],
    href: 'gem-crush.html'
  },
  {
    key: 'space-invaders',
    title: 'Space Invaders',
    icon: '👾',
    description: 'Classic arcade: 5×11 alien grid, 3 invader types, destructible bunkers, mystery UFO, wave progression, and mobile fire controls.',
    tags: ['Arcade', 'Shooter', 'High Score'],
    categories: ['Arcade', 'Classic'],
    href: 'space-invaders.html'
  },
  {
    key: 'missile-command',
    title: 'Missile Command',
    icon: '🚀',
    description: 'Defend your cities from a rain of incoming missiles. Manage limited ammo across 3 bases, intercept MIRVs, and survive escalating waves.',
    tags: ['Arcade', 'Defense', 'High Score', 'Touch'],
    categories: ['Arcade', 'Classic'],
    href: 'missile-command.html'
  },
  {
    key: 'breakout',
    title: 'Breakout',
    icon: '🏓',
    description: 'Arkanoid-style brick breaker with powerups (wide paddle, extra ball, slow, laser), multi-hit bricks, level progression, and touch support.',
    tags: ['Arcade', 'Powerups', 'Touch'],
    categories: ['Arcade', 'Classic'],
    href: 'breakout.html'
  },
  {
    key: 'typing-speed',
    title: 'Typing Speed Test',
    icon: '⌨️',
    description: 'Measure your WPM and accuracy. 15 difficulty levels, 100+ word lists, 30/60/120s modes, real-time per-character feedback.',
    tags: ['Skill', 'WPM', 'Accuracy'],
    categories: ['Skill'],
    href: 'typing-speed.html'
  },
  {
    key: 'sudoku',
    title: 'Sudoku',
    icon: '🔢',
    description: 'Full 9×9 Sudoku with generated puzzles, 3 difficulties, pencil notes mode, conflict highlighting, hints, and best-time tracking.',
    tags: ['Puzzle', 'Logic', 'Best Time'],
    categories: ['Puzzle'],
    href: 'sudoku.html'
  },
  {
    key: 'connect-four-online',
    title: 'Connect Four Online',
    icon: '🌐',
    description: 'Play Connect Four against a friend anywhere in the world. Create a room, share the link, and battle in real-time over a P2P connection.',
    tags: ['Online Multiplayer', 'P2P', 'Strategy'],
    categories: ['Strategy', 'Multiplayer'],
    href: 'connect-four-online.html'
  },
  {
    key: 'frogger',
    title: 'Frogger',
    icon: '🐸',
    description: 'Guide your frog across five lanes of traffic and a rushing river to reach home. 5 lives, level progression, time-bonus scoring, and mobile touch controls.',
    tags: ['Arcade', 'Classic', 'Touch'],
    categories: ['Arcade', 'Classic'],
    href: 'frogger.html'
  },
  {
    key: 'galaga',
    title: 'Galaga',
    icon: '🛸',
    description: 'Arcade shooter: enemy formations, dive-bombing insects, and the Boss Galaga tractor beam. Recapture your ship for double firepower!',
    tags: ['Arcade', 'Shooter', 'High Score', 'Touch'],
    categories: ['Arcade', 'Classic'],
    href: 'galaga.html'
  },
  {
    key: 'simon-says',
    title: 'Simon Says',
    icon: '🧠',
    description: 'Test your memory and reflexes in this classic electronic game. Repeat the sequence of lights and tones. Speed ramps up as you progress!',
    tags: ['Memory', 'Reflex', 'High Score', 'Touch'],
    categories: ['Puzzle'],
    href: 'simon-says.html'
  },
  {
    key: 'stack-tower',
    title: 'Stack Tower',
    icon: '🏗️',
    description: 'Precision stacking challenge: drop blocks to build the tallest tower. Perfect drops keep your width; misses shrink it. How high can you go?',
    tags: ['Arcade', 'Precision', 'High Score'],
    categories: ['Arcade'],
    href: 'stack-tower.html'
  },
  {
    key: 'neon-dash',
    title: 'Neon Dash',
    icon: '🟦',
    description: 'Geometry Dash-style auto-runner: jump, double-jump, and flip gravity to survive a procedurally generated neon course. Speed increases every 200m!',
    tags: ['Arcade', 'Runner', 'High Score'],
    categories: ['Arcade'],
    href: 'neon-dash.html'
  },
  {
    key: 'color-flood',
    title: 'Color Flood',
    icon: '🎨',
    description: 'Classic Flood-It puzzle: start from the top-left and flood the entire board with a single color in limited moves. Features 3 difficulty sizes and ripple animations.',
    tags: ['Puzzle', 'Strategy', 'High Score'],
    categories: ['Puzzle'],
    href: 'color-flood.html'
  },
  {
    key: 'pinball',
    title: 'Pinball',
    icon: '🎱',
    description: 'Classic arcade Pinball with realistic physics, bumpers, ramps, and multiball. Pull the plunger and keep the ball in play!',
    tags: ['Arcade', 'Physics', 'High Score'],
    categories: ['Arcade'],
    href: 'pinball.html'
  },
  {
    key: 'sky-jumper',
    title: 'Sky Jumper',
    icon: '☁️',
    description: 'Endless vertical platformer: bounce on platforms, collect power-ups, and avoid monsters as you climb to the edge of space.',
    tags: ['Arcade', 'High Score', 'Touch'],
    categories: ['Arcade'],
    href: 'sky-jumper.html'
  }
];
