// Player configuration
export interface PlayerConfig {
  id: number;
  name: string;
  color: string;
  keyboardKey: string;
  gamepadIndex?: number;
}

// Player state during a game
export interface PlayerState {
  config: PlayerConfig;
  roundScore: number;
  totalScore: number;
  isActive: boolean;
  // Fail-soft tracking (hidden)
  consecutiveLowScores: number;  // Rounds with score < 50
  assistLevel: number;           // 0 = none, 1-3 = subtle assist
}

// Solo training mode stats
export interface SoloTrainingStats {
  leftHandHits: number;
  rightHandHits: number;
  leftHandReactionTimes: number[];
  rightHandReactionTimes: number[];
  leftHandAccuracy: number;
  rightHandAccuracy: number;
  roundsCompleted: number;
}

// Mini-game interface - all mini-games must implement this
export interface MiniGame {
  name: string;
  instructions: string;
  
  init(players: PlayerState[]): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(playerId: number): void;
  isComplete(): boolean;
  getScores(): Map<number, number>;
  cleanup(): void;
}

// Game mode
export type GameMode = 
  | 'party'         // 2-4 players competitive
  | 'solo-training'; // Solo with left/right hand tracking

// Game phase
export type GamePhase = 
  | 'title'
  | 'mode-select'
  | 'player-select'
  | 'solo-setup'
  | 'countdown'
  | 'playing'
  | 'round-results'
  | 'solo-results'
  | 'final-results';

// Input action
export interface InputAction {
  playerId: number;
  timestamp: number;
  hand?: 'left' | 'right'; // For solo training mode
}

// Pattern types for varied gameplay
export type PatternType = 
  | 'sweep'         // Classic left-to-right or right-to-left
  | 'oscillate'     // Bouncing back and forth
  | 'shrink'        // Target shrinks over time
  | 'pulse'         // Target appears/disappears rhythmically
  | 'delayed-reveal' // Target position hidden initially
  | 'multi-zone';   // Multiple valid target zones

// Game constants
export const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  ROUND_DURATION: 12, // seconds (tighter rounds)
  TOTAL_ROUNDS: 7,    // 7 rounds for 5-7 min session
  SOLO_ROUNDS: 10,    // More rounds for solo practice
  COUNTDOWN_DURATION: 2, // seconds (snappier)
  RESULTS_DISPLAY_TIME: 2, // seconds (snappier)
  
  // Player colors
  PLAYER_COLORS: [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#ffe66d', // Yellow
    '#95e1d3', // Mint
  ],
  
  // Hand colors for solo mode
  HAND_COLORS: {
    left: '#ff6b6b',  // Red for left hand
    right: '#4ecdc4', // Teal for right hand
  },
  
  // Keyboard mappings - multiplayer
  KEYBOARD_KEYS: [
    'KeyA',        // A - Player 1 (keyboard-only mode)
    'Enter',       // Enter - Player 2 (keyboard-only mode)
    'Shift',       // Right Shift - Player 3
    'Backspace',   // Backspace - Player 4
  ],
  
  // Alternative keyboard mappings (spread apart for same-keyboard play)
  ALT_KEYBOARD_KEYS: {
    P1: ['Space', 'KeyA'],     // P1: Space or A (left side)
    P2: ['Enter', 'Numpad0'],  // P2: Enter or Numpad0 (right side)
  },
  
  // Solo training keys (far apart for left/right hand)
  SOLO_KEYS: {
    leftHand: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'Space'], // Left side of keyboard
    rightHand: ['Enter', 'Numpad0', 'NumpadEnter', 'ArrowRight', 'Slash'], // Right side
  },
};
