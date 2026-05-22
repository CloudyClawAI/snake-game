/*
 * CloudyClaw shared game shell helpers.
 *
 * Plain global script by design: games must keep working from direct file opens
 * and GitHub Pages without a build step.
 */
(function () {
  function byId(id) {
    return typeof id === 'string' ? document.getElementById(id) : id;
  }

  function setText(el, value) {
    if (el) el.textContent = String(value);
  }

  function createGameShell(options) {
    if (!options || !options.key) {
      throw new Error('CloudyClawGameShell.create requires a game key.');
    }

    const bestKey = options.bestScoreKey || `${options.key}-hi`;
    const bestEl = byId(options.bestEl);
    const overlay = byId(options.overlay);
    const overlayTitle = byId(options.overlayTitle);
    const overlayBody = byId(options.overlayBody);
    const primaryButton = byId(options.primaryButton);
    const leaderboardTargetId = options.leaderboardTargetId;

    function getBest() {
      return Number(localStorage.getItem(bestKey)) || 0;
    }

    function setBest(score) {
      const value = Math.max(getBest(), Number(score) || 0);
      localStorage.setItem(bestKey, String(value));
      setText(bestEl, value);
      return value;
    }

    function showOverlay(config) {
      if (!overlay) return;
      setText(overlayTitle, config && config.title ? config.title : '');
      setText(overlayBody, config && config.body ? config.body : '');
      if (primaryButton && config && config.buttonText) {
        primaryButton.textContent = config.buttonText;
      }
      overlay.classList.remove('hidden');
    }

    function hideOverlay() {
      if (overlay) overlay.classList.add('hidden');
    }

    function renderLeaderboard() {
      if (leaderboardTargetId && typeof Leaderboard !== 'undefined') {
        Leaderboard.renderWidget(options.key, leaderboardTargetId);
      }
    }

    function saveScore(score) {
      if (typeof Leaderboard !== 'undefined') {
        Leaderboard.saveScore(options.key, score);
      }
      renderLeaderboard();
    }

    setText(bestEl, getBest());

    return {
      key: options.key,
      getBest,
      setBest,
      showOverlay,
      hideOverlay,
      renderLeaderboard,
      saveScore,
    };
  }

  const KEY_DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  function normalizedKey(event) {
    return event.key && event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }

  function createDirectionalInput(options) {
    const canvas = byId(options.canvas);
    const controls = options.controls || {};
    const onDirection = options.onDirection;
    const canMove = options.canMove || function () { return true; };
    const target = options.target || document;
    let touchStart = null;

    function emit(direction, source) {
      if (!direction || !canMove(direction, source)) return false;
      onDirection(direction, source);
      return true;
    }

    function onKeydown(event) {
      const direction = KEY_DIRECTIONS[event.key] || KEY_DIRECTIONS[normalizedKey(event)];
      if (!direction) return;
      if (emit(direction, 'keyboard') && /^Arrow/.test(event.key)) {
        event.preventDefault();
      }
    }

    function onTouchStart(event) {
      if (!event.touches || event.touches.length === 0) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      event.preventDefault();
    }

    function onTouchEnd(event) {
      if (!touchStart || !event.changedTouches || event.changedTouches.length === 0) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      const direction = Math.abs(dx) > Math.abs(dy)
        ? { x: dx > 0 ? 1 : -1, y: 0 }
        : { x: 0, y: dy > 0 ? 1 : -1 };
      emit(direction, 'swipe');
      event.preventDefault();
    }

    function bindButton(id, direction) {
      const el = byId(id);
      if (!el) return null;
      const handler = function (event) {
        event.preventDefault();
        emit(direction, 'touch-control');
      };
      el.addEventListener('pointerdown', handler);
      return { el, handler };
    }

    target.addEventListener('keydown', onKeydown);
    if (canvas) {
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    const buttonBindings = [
      bindButton(controls.up, { x: 0, y: -1 }),
      bindButton(controls.down, { x: 0, y: 1 }),
      bindButton(controls.left, { x: -1, y: 0 }),
      bindButton(controls.right, { x: 1, y: 0 }),
    ].filter(Boolean);

    return {
      destroy() {
        target.removeEventListener('keydown', onKeydown);
        if (canvas) {
          canvas.removeEventListener('touchstart', onTouchStart);
          canvas.removeEventListener('touchend', onTouchEnd);
        }
        buttonBindings.forEach(({ el, handler }) => {
          el.removeEventListener('pointerdown', handler);
        });
      },
    };
  }

  window.CloudyClawGameShell = {
    create: createGameShell,
    createDirectionalInput,
  };
}());
