import { InputAction } from './types';

type InputCallback = (action: InputAction) => void;
type EscapeCallback = () => void;

export type InputMode = 'party' | 'solo-training';

export class InputManager {
  private callbacks: InputCallback[] = [];
  private escapeCallbacks: EscapeCallback[] = [];
  private keyStates: Map<string, boolean> = new Map();
  private gamepadStates: Map<number, boolean> = new Map();
  private mode: InputMode = 'party';
  private connectedGamepads: Map<number, string> = new Map();
  
  constructor() {
    this.setupKeyboardListeners();
    this.setupGamepadListeners();
    this.pollGamepads();
  }
  
  setMode(mode: InputMode): void {
    this.mode = mode;
  }
  
  getMode(): InputMode {
    return this.mode;
  }
  
  onInput(callback: InputCallback): void {
    this.callbacks.push(callback);
  }
  
  onEscape(callback: EscapeCallback): void {
    this.escapeCallbacks.push(callback);
  }
  
  removeCallback(callback: InputCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
  
  getConnectedGamepads(): Map<number, string> {
    return this.connectedGamepads;
  }
  
  private setupGamepadListeners(): void {
    window.addEventListener('gamepadconnected', (e) => {
      const gp = e.gamepad;
      this.connectedGamepads.set(gp.index, gp.id);
      console.log(`🎮 Gamepad ${gp.index + 1} connected: ${gp.id}`);
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
      const gp = e.gamepad;
      this.connectedGamepads.delete(gp.index);
      console.log(`🎮 Gamepad ${gp.index + 1} disconnected`);
    });
  }
  
  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      // Handle ESC key for navigation
      if (e.key === 'Escape') {
        this.escapeCallbacks.forEach(cb => cb());
        e.preventDefault();
        return;
      }
      
      const key = this.getKeyIdentifier(e);
      
      // Prevent repeat triggers
      if (this.keyStates.get(key)) {
        e.preventDefault();
        return;
      }
      
      this.keyStates.set(key, true);
      
      if (this.mode === 'solo-training') {
        // Solo training mode: detect which hand
        const hand = this.getHandFromKey(e);
        if (hand) {
          this.emitAction(0, hand); // Always player 0 in solo mode
          e.preventDefault();
        }
      } else {
        // Party mode: detect which player
        const playerId = this.getPlayerIdFromKey(e);
        if (playerId !== -1) {
          this.emitAction(playerId);
          e.preventDefault();
        }
      }
    });
    
    window.addEventListener('keyup', (e) => {
      const key = this.getKeyIdentifier(e);
      this.keyStates.set(key, false);
    });
  }
  
  private getKeyIdentifier(e: KeyboardEvent): string {
    if (e.key === 'Shift') {
      return e.location === 2 ? 'RightShift' : 'LeftShift';
    }
    // Use code for letter keys for consistency
    if (e.code.startsWith('Key') || e.code.startsWith('Digit') || e.code.startsWith('Numpad')) {
      return e.code;
    }
    return e.key;
  }
  
  private getHandFromKey(e: KeyboardEvent): 'left' | 'right' | null {
    const code = e.code;
    const key = e.key;
    
    // Left hand keys (left side of keyboard)
    const leftKeys = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 
                      'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'Space', 'ShiftLeft', 'ControlLeft',
                      'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
    
    // Right hand keys (right side of keyboard)
    const rightKeys = ['Enter', 'NumpadEnter', 'Numpad0', 'ArrowRight', 'ArrowLeft', 
                       'ArrowUp', 'ArrowDown', 'Slash', 'Period', 'Comma',
                       'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
                       'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight',
                       'KeyM', 'KeyN', 'KeyH', 'KeyY', 'Digit0', 'Digit9', 'Digit8',
                       'ShiftRight', 'ControlRight', 'Backspace'];
    
    if (leftKeys.includes(code)) return 'left';
    if (rightKeys.includes(code)) return 'right';
    
    // Fallback: check key name
    if (key === 'Shift' && e.location === 1) return 'left';
    if (key === 'Shift' && e.location === 2) return 'right';
    
    return null;
  }
  
  private getPlayerIdFromKey(e: KeyboardEvent): number {
    const code = e.code;
    const key = e.key;
    
    // Player 1: A or SPACE (far left)
    if (code === 'KeyA' || code === 'Space') return 0;
    
    // Player 2: L or ENTER (far right, spread from P1)
    if (code === 'KeyL' || key === 'Enter') return 1;
    
    // Player 3: Left CTRL or Q (left side, different from P1)
    if ((key === 'Control' && e.location === 1) || code === 'KeyQ') return 2;
    
    // Player 4: Right CTRL or P (right side, different from P2)
    if ((key === 'Control' && e.location === 2) || code === 'KeyP') return 3;
    
    return -1;
  }
  
  pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < 4; i++) {
      const gamepad = gamepads[i];
      
      // Handle gamepad disconnect - clear its state
      if (!gamepad) {
        this.gamepadStates.set(i, false);
        continue;
      }
      
      // Check A/Cross button (typically button 0)
      const buttonPressed = gamepad.buttons[0]?.pressed ?? false;
      const wasPressed = this.gamepadStates.get(i) ?? false;
      
      if (buttonPressed && !wasPressed) {
        if (this.mode === 'solo-training') {
          // In solo mode, gamepad 0 = left, gamepad 1+ = right
          const hand = i === 0 ? 'left' : 'right';
          this.emitAction(0, hand);
        } else {
          this.emitAction(i);
        }
      }
      
      this.gamepadStates.set(i, buttonPressed);
    }
    
    requestAnimationFrame(() => this.pollGamepads());
  }
  
  private emitAction(playerId: number, hand?: 'left' | 'right'): void {
    const action: InputAction = {
      playerId,
      timestamp: performance.now(),
      hand,
    };
    
    this.callbacks.forEach(cb => cb(action));
  }
}
