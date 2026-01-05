import { Game } from './game';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // Create and start the game
  const game = new Game(canvas);
  game.start();
  
  // Setup responsive canvas sizing
  function resizeCanvas() {
    const container = document.getElementById('game-container')!;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Account for touch controls on mobile
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const touchControlsHeight = isTouchDevice ? 112 : 0; // 80px button + 32px padding
    const availableHeight = containerHeight - touchControlsHeight;
    
    const targetAspect = 16 / 9;
    const containerAspect = containerWidth / availableHeight;
    
    let displayWidth: number;
    let displayHeight: number;
    
    if (containerAspect > targetAspect) {
      // Container is wider - fit to height
      displayHeight = availableHeight;
      displayWidth = displayHeight * targetAspect;
    } else {
      // Container is taller - fit to width
      displayWidth = containerWidth;
      displayHeight = displayWidth / targetAspect;
    }
    
    // Apply CSS size (display size)
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }
  
  // Initial resize and listen for changes
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
  });
  
  // Setup touch controls
  const touchControls = document.getElementById('touch-controls');
  if (touchControls) {
    const buttons = touchControls.querySelectorAll('.touch-btn');
    buttons.forEach(btn => {
      const playerId = parseInt((btn as HTMLElement).dataset.player || '0', 10);
      
      // Use both touchstart and click for broader compatibility
      const handleTouch = (e: Event) => {
        e.preventDefault();
        game.handleTouchInput(playerId);
      };
      
      btn.addEventListener('touchstart', handleTouch, { passive: false });
      btn.addEventListener('mousedown', handleTouch);
    });
  }
  
  // Prevent default touch behaviors that interfere with game
  document.addEventListener('touchmove', (e) => {
    if ((e.target as HTMLElement).closest('#game-container')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Tap anywhere on canvas as P1 action (for title/simple screens)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    game.handleTouchInput(0);
  }, { passive: false });
  
  canvas.addEventListener('click', () => {
    game.handleTouchInput(0);
  });
  
  console.log('🎉 One Button Party started!');
  console.log('');
  console.log('=== MULTIPLAYER CONTROLS ===');
  console.log('  Player 1: A or SPACE (left side)');
  console.log('  Player 2: L or ENTER (right side)');
  console.log('  Player 3: Left CTRL or Q');
  console.log('  Player 4: Right CTRL or P');
  console.log('');
  console.log('  Gamepads: A/Cross button (auto-assigned)');
  console.log('  Touch: Use on-screen P1-P4 buttons');
  console.log('');
  console.log('=== HOW TO PLAY ===');
  console.log('  1. Press any key/tap on the title screen');
  console.log('  2. Choose Party Mode or Solo Training');
  console.log('  3. In Party Mode: each player presses their button to join');
  console.log('  4. Press again when ready to start (need 1+ players)');
  console.log('');
  console.log('=== GAME GOAL ===');
  console.log('  Lock your marker inside the target zone!');
  console.log('  Perfect timing = 100 points!');
});
