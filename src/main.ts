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
  
  console.log('🎉 One Button Party started!');
  console.log('');
  console.log('=== MULTIPLAYER CONTROLS ===');
  console.log('  Player 1: A or SPACE (left side)');
  console.log('  Player 2: ENTER or Numpad 0 (right side)');
  console.log('  Player 3: Right SHIFT');
  console.log('  Player 4: BACKSPACE');
  console.log('');
  console.log('  Gamepads: A/Cross button (auto-assigned)');
  console.log('');
  console.log('=== HOW TO PLAY ===');
  console.log('  1. Press any key on the title screen');
  console.log('  2. Choose Party Mode or Solo Training');
  console.log('  3. In Party Mode: each player presses their button to join');
  console.log('  4. Press again when ready to start (need 2+ players)');
  console.log('');
  console.log('=== GAME GOAL ===');
  console.log('  Lock your marker inside the target zone!');
  console.log('  Perfect timing = 100 points!');
});
