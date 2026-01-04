import { GamePhase, GameMode, PlayerState, GAME_CONFIG, SoloTrainingStats } from './types';
import { InputManager } from './input';
import { TimingJump, RoundPattern, getPatternLibrary } from './minigames/TimingJump';
import { particles } from './particles';

export class Game {
  private readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private inputManager: InputManager;
  
  private phase: GamePhase = 'title';
  private mode: GameMode = 'party';
  private players: PlayerState[] = [];
  private currentRound: number = 0;
  private roundTimer: number = 0;
  private countdownTimer: number = 0;
  private resultsTimer: number = 0;
  
  private currentGame: TimingJump | null = null;
  private patternLibrary: RoundPattern[] = [];
  private usedPatterns: Set<string> = new Set();
  
  // Player join tracking
  private joinedPlayers: Set<number> = new Set();
  
  // Gamepad status
  private detectedGamepads: Map<number, string> = new Map();
  
  // Solo training
  private soloStats: SoloTrainingStats = {
    leftHandHits: 0,
    rightHandHits: 0,
    leftHandReactionTimes: [],
    rightHandReactionTimes: [],
    leftHandAccuracy: 0,
    rightHandAccuracy: 0,
    roundsCompleted: 0,
  };
  
  // Fail-soft assist tracking per player
  private playerAssists: Map<number, number> = new Map();
  
  // Animation
  private animTime: number = 0;
  private lastTime: number = 0;
  
  // Title screen blink
  private blinkTimer: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    this.inputManager = new InputManager();
    this.inputManager.onInput((action) => this.handleInput(action));
    this.inputManager.onEscape(() => this.handleEscape());
    
    this.patternLibrary = getPatternLibrary();
  }
  
  private handleEscape(): void {
    // Navigate back based on current phase
    switch (this.phase) {
      case 'mode-select':
        this.phase = 'title';
        break;
      case 'player-select':
      case 'solo-setup':
        this.phase = 'mode-select';
        this.joinedPlayers.clear();
        break;
      case 'solo-results':
      case 'final-results':
        this.resetGame();
        break;
    }
  }
  
  // Public method for touch input from UI
  handleTouchInput(playerId: number): void {
    this.handleInput({
      playerId,
      timestamp: performance.now(),
    });
  }
  
  start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  private gameLoop = (): void => {
    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    
    this.animTime += deltaTime;
    this.blinkTimer += deltaTime;
    
    this.update(deltaTime);
    this.render();
    this.detectGamepads();
    
    requestAnimationFrame(this.gameLoop);
  };
  
  private detectGamepads(): void {
    const gamepads = navigator.getGamepads();
    this.detectedGamepads.clear();
    
    for (let i = 0; i < 4; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        this.detectedGamepads.set(i, gp.id.substring(0, 30));
      }
    }
  }
  
  private update(deltaTime: number): void {
    particles.update(deltaTime);
    
    switch (this.phase) {
      case 'countdown':
        this.countdownTimer -= deltaTime;
        if (this.countdownTimer <= 0) {
          this.phase = 'playing';
          this.roundTimer = GAME_CONFIG.ROUND_DURATION;
        }
        break;
        
      case 'playing':
        this.roundTimer -= deltaTime;
        this.currentGame?.update(deltaTime);
        this.currentGame?.setRoundTimeRemaining(this.roundTimer);
        
        // Check for round completion
        if (this.currentGame?.isComplete() || this.roundTimer <= 0) {
          if (this.roundTimer <= 0) {
            this.currentGame?.autoLockRemaining();
          }
          this.endRound();
        }
        break;
        
      case 'round-results':
        this.resultsTimer -= deltaTime;
        if (this.resultsTimer <= 0) {
          this.currentRound++;
          const totalRounds = this.mode === 'solo-training' ? GAME_CONFIG.SOLO_ROUNDS : GAME_CONFIG.TOTAL_ROUNDS;
          
          if (this.currentRound >= totalRounds) {
            this.phase = this.mode === 'solo-training' ? 'solo-results' : 'final-results';
          } else {
            // Use appropriate round starter based on mode
            if (this.mode === 'solo-training') {
              this.startSoloRound();
            } else {
              this.startRound();
            }
          }
        }
        break;
        
      case 'solo-results':
      case 'final-results':
        // Wait for input to restart
        break;
    }
  }
  
  private render(): void {
    const { ctx } = this;
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Clear with dark background
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    switch (this.phase) {
      case 'title':
        this.renderTitle(ctx);
        break;
        
      case 'mode-select':
        this.renderModeSelect(ctx);
        break;
        
      case 'player-select':
        this.renderPlayerSelect(ctx);
        break;
        
      case 'solo-setup':
        this.renderSoloSetup(ctx);
        break;
        
      case 'countdown':
        this.renderCountdown(ctx);
        break;
        
      case 'playing':
        this.currentGame?.render(ctx);
        this.renderGameHUD(ctx);
        break;
        
      case 'round-results':
        this.renderRoundResults(ctx);
        break;
        
      case 'solo-results':
        this.renderSoloResults(ctx);
        break;
        
      case 'final-results':
        this.renderFinalResults(ctx);
        break;
    }
    
    // Always render particles on top
    particles.render(ctx);
  }
  
  private renderTitle(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Title
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 72px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 ONE BUTTON PARTY', CANVAS_WIDTH / 2, 180);
    
    // Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Segoe UI';
    ctx.fillText('A timing game for 1-4 players', CANVAS_WIDTH / 2, 230);
    
    // Blinking prompt
    const blink = Math.sin(this.blinkTimer * 3) > 0;
    if (blink) {
      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 32px Segoe UI';
      ctx.fillText('TAP OR PRESS ANY KEY', CANVAS_WIDTH / 2, 350);
    }
    
    // Quick controls overview
    ctx.fillStyle = '#888888';
    ctx.font = '18px Segoe UI';
    ctx.fillText('🎮 Keyboard, Gamepad, or Touch supported', CANVAS_WIDTH / 2, 450);
    
    // Gamepad detection
    if (this.detectedGamepads.size > 0) {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = '16px Segoe UI';
      let y = 500;
      ctx.fillText('✓ Gamepads detected:', CANVAS_WIDTH / 2, y);
      this.detectedGamepads.forEach((name, index) => {
        y += 25;
        ctx.fillStyle = GAME_CONFIG.PLAYER_COLORS[index];
        ctx.fillText(`P${index + 1}: ${name}`, CANVAS_WIDTH / 2, y);
      });
    }
  }
  
  private renderModeSelect(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT MODE', CANVAS_WIDTH / 2, 120);
    
    // Mode options
    const modes = [
      { key: 'P1 / TAP LEFT', label: 'PARTY MODE', desc: '2-4 players compete', icon: '🎉' },
      { key: 'P2 / TAP RIGHT', label: 'SOLO TRAINING', desc: 'Practice your timing', icon: '🎯' },
    ];
    
    modes.forEach((mode, i) => {
      const y = 250 + i * 180;
      const pulse = Math.sin(this.animTime * 2 + i) * 5;
      
      // Box
      ctx.fillStyle = 'rgba(78, 205, 196, 0.1)';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH / 2 - 300, y - 50 + pulse, 600, 140, 16);
      ctx.fill();
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Icon
      ctx.font = '48px Segoe UI';
      ctx.fillText(mode.icon, CANVAS_WIDTH / 2 - 220, y + 25);
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText(mode.label, CANVAS_WIDTH / 2 - 150, y + 10);
      
      // Description
      ctx.fillStyle = '#888888';
      ctx.font = '18px Segoe UI';
      ctx.fillText(mode.desc, CANVAS_WIDTH / 2 - 150, y + 40);
      
      // Key hint
      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 16px Segoe UI';
      ctx.textAlign = 'right';
      ctx.fillText(`Press ${mode.key}`, CANVAS_WIDTH / 2 + 270, y + 10);
    });
    
    ctx.textAlign = 'center';
  }
  
  private renderPlayerSelect(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_COLORS } = GAME_CONFIG;
    
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 JOIN THE GAME!', CANVAS_WIDTH / 2, 80);
    
    // Instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Segoe UI';
    ctx.fillText('Tap your button or press your key to join. Need 2+ players.', CANVAS_WIDTH / 2, 120);
    
    // Player slots
    const slotWidth = 250;
    const slotHeight = 320;
    const startX = (CANVAS_WIDTH - slotWidth * 4 - 40) / 2;
    const y = 180;
    
    for (let i = 0; i < 4; i++) {
      const x = startX + i * (slotWidth + 10);
      const joined = this.joinedPlayers.has(i);
      const color = PLAYER_COLORS[i];
      
      // Slot background
      ctx.fillStyle = joined ? color + '30' : 'rgba(50, 50, 70, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x, y, slotWidth, slotHeight, 16);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = joined ? color : '#444444';
      ctx.lineWidth = joined ? 4 : 2;
      ctx.stroke();
      
      // Player number
      ctx.fillStyle = joined ? color : '#666666';
      ctx.font = 'bold 72px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(`P${i + 1}`, x + slotWidth / 2, y + 90);
      
      // Status
      if (joined) {
        ctx.fillStyle = '#ffe66d';
        ctx.font = 'bold 28px Segoe UI';
        ctx.fillText('✓ READY!', x + slotWidth / 2, y + 140);
        
        // Pulse effect
        const pulse = Math.sin(this.animTime * 4) * 0.3 + 0.7;
        ctx.strokeStyle = color;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x - 5, y - 5, slotWidth + 10, slotHeight + 10, 20);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = '#666666';
        ctx.font = '20px Segoe UI';
        ctx.fillText('Press to join', x + slotWidth / 2, y + 140);
      }
      
      // Control hint
      ctx.fillStyle = '#888888';
      ctx.font = '14px Segoe UI';
      const controls = this.getPlayerControlHint(i);
      ctx.fillText(controls.keyboard, x + slotWidth / 2, y + 200);
      
      // Gamepad indicator
      if (this.detectedGamepads.has(i)) {
        ctx.fillStyle = '#4ecdc4';
        ctx.font = '12px Segoe UI';
        ctx.fillText('🎮 Gamepad ready', x + slotWidth / 2, y + 230);
      } else {
        ctx.fillStyle = '#555555';
        ctx.font = '12px Segoe UI';
        ctx.fillText('🎮 No gamepad', x + slotWidth / 2, y + 230);
      }
      
      // Extra control info
      ctx.fillStyle = '#666666';
      ctx.font = '11px Segoe UI';
      if (i < 2) {
        ctx.fillText('(Keyboard player)', x + slotWidth / 2, y + 260);
      } else {
        ctx.fillText('(Gamepad recommended)', x + slotWidth / 2, y + 260);
      }
    }
    
    // Start hint
    if (this.joinedPlayers.size >= 2) {
      const blink = Math.sin(this.blinkTimer * 4) > 0;
      if (blink) {
        ctx.fillStyle = '#ffe66d';
        ctx.font = 'bold 28px Segoe UI';
        ctx.fillText('ALL JOINED PLAYERS: Press again to START!', CANVAS_WIDTH / 2, 550);
      }
    } else {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '18px Segoe UI';
      ctx.fillText(`Need ${2 - this.joinedPlayers.size} more player(s) to start`, CANVAS_WIDTH / 2, 550);
    }
    
    // Control reference
    ctx.fillStyle = '#555555';
    ctx.font = '14px Segoe UI';
    ctx.fillText('P1: A or SPACE  |  P2: L or ENTER  |  P3: Q or Left CTRL  |  P4: P or Right CTRL', CANVAS_WIDTH / 2, 590);
    ctx.fillText('Gamepads: Press A/Cross button (auto-assigned P1→P4)', CANVAS_WIDTH / 2, 615);
    
    // Back hint
    ctx.fillStyle = '#666666';
    ctx.font = '14px Segoe UI';
    ctx.fillText('ESC to go back', CANVAS_WIDTH / 2, 680);
  }
  
  private getPlayerControlHint(playerId: number): { keyboard: string; gamepad: string } {
    const hints = [
      { keyboard: 'Key: A or SPACE', gamepad: 'Gamepad 1: A/Cross' },
      { keyboard: 'Key: L or ENTER', gamepad: 'Gamepad 2: A/Cross' },
      { keyboard: 'Key: Q or Left CTRL', gamepad: 'Gamepad 3: A/Cross' },
      { keyboard: 'Key: P or Right CTRL', gamepad: 'Gamepad 4: A/Cross' },
    ];
    return hints[playerId];
  }
  
  private renderSoloSetup(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 SOLO TRAINING', CANVAS_WIDTH / 2, 100);
    
    // Explanation
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px Segoe UI';
    ctx.fillText('Two vertical bars - one for each hand!', CANVAS_WIDTH / 2, 160);
    
    // Hand zones visual
    const leftX = CANVAS_WIDTH / 4;
    const rightX = (CANVAS_WIDTH * 3) / 4;
    const y = 320;
    
    // Left hand zone
    ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
    ctx.beginPath();
    ctx.roundRect(leftX - 180, y - 100, 360, 200, 20);
    ctx.fill();
    ctx.strokeStyle = GAME_CONFIG.HAND_COLORS.left;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = GAME_CONFIG.HAND_COLORS.left;
    ctx.font = 'bold 36px Segoe UI';
    ctx.fillText('✋ LEFT HAND', leftX, y - 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Segoe UI';
    ctx.fillText('A / Q / Left CTRL / SPACE', leftX, y + 10);
    ctx.fillText('(Left side of screen)', leftX, y + 40);
    
    // Right hand zone
    ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
    ctx.beginPath();
    ctx.roundRect(rightX - 180, y - 100, 360, 200, 20);
    ctx.fill();
    ctx.strokeStyle = GAME_CONFIG.HAND_COLORS.right;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = GAME_CONFIG.HAND_COLORS.right;
    ctx.font = 'bold 36px Segoe UI';
    ctx.fillText('🤚 RIGHT HAND', rightX, y - 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Segoe UI';
    ctx.fillText('L / P / Right CTRL / ENTER', rightX, y + 10);
    ctx.fillText('(Right side of screen)', rightX, y + 40);
    
    // Goal
    ctx.fillStyle = '#ffe66d';
    ctx.font = '20px Segoe UI';
    ctx.fillText('Goal: Lock BOTH bars when the marker reaches the target!', CANVAS_WIDTH / 2, 480);
    ctx.fillText('Test your reaction time with each hand independently', CANVAS_WIDTH / 2, 510);
    
    // Start prompt
    const blink = Math.sin(this.blinkTimer * 3) > 0;
    if (blink) {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 28px Segoe UI';
      ctx.fillText('Press ANY KEY to start training!', CANVAS_WIDTH / 2, 600);
    }
    
    // Back
    ctx.fillStyle = '#666666';
    ctx.font = '14px Segoe UI';
    ctx.fillText('ESC to go back', CANVAS_WIDTH / 2, 680);
  }
  
  private renderCountdown(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Round info
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 32px Segoe UI';
    ctx.textAlign = 'center';
    
    const totalRounds = this.mode === 'solo-training' ? GAME_CONFIG.SOLO_ROUNDS : GAME_CONFIG.TOTAL_ROUNDS;
    ctx.fillText(`Round ${this.currentRound + 1} of ${totalRounds}`, CANVAS_WIDTH / 2, 150);
    
    // Pattern preview
    if (this.currentGame && this.currentGame['pattern']) {
      const pattern = this.currentGame['pattern'] as RoundPattern;
      
      ctx.fillStyle = pattern.color;
      ctx.font = 'bold 28px Segoe UI';
      ctx.fillText(pattern.name, CANVAS_WIDTH / 2, 220);
      
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '20px Segoe UI';
      ctx.fillText(pattern.description, CANVAS_WIDTH / 2, 260);
      
      // Twist warning if applicable
      if (pattern.twist) {
        ctx.fillStyle = '#e056fd';
        ctx.font = 'bold 18px Segoe UI';
        ctx.fillText(`⚠ ${pattern.twist.description}`, CANVAS_WIDTH / 2, 300);
      }
    }
    
    // Big countdown number
    const count = Math.ceil(this.countdownTimer);
    const scale = 1 + (this.countdownTimer % 1) * 0.3;
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = count <= 1 ? '#ffe66d' : '#ffffff';
    ctx.font = 'bold 200px Segoe UI';
    ctx.fillText(count.toString(), 0, 70);
    ctx.restore();
    
    // Goal reminder
    ctx.fillStyle = '#888888';
    ctx.font = '18px Segoe UI';
    ctx.fillText('🎯 Lock your marker in the target zone!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }
  
  private renderGameHUD(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Right side HUD panel
    const hudX = CANVAS_WIDTH - 180;
    const hudY = 100;
    
    // Background panel
    ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
    ctx.beginPath();
    ctx.roundRect(hudX - 10, hudY - 10, 180, 500, 12);
    ctx.fill();
    
    // Round indicator
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'center';
    const totalRounds = this.mode === 'solo-training' ? GAME_CONFIG.SOLO_ROUNDS : GAME_CONFIG.TOTAL_ROUNDS;
    ctx.fillText(`ROUND ${this.currentRound + 1}/${totalRounds}`, hudX + 80, hudY + 15);
    
    // Timer with urgency coloring
    const timeColor = this.roundTimer <= 3 ? '#ff6b6b' : this.roundTimer <= 5 ? '#ff9f43' : '#ffffff';
    ctx.fillStyle = timeColor;
    ctx.font = 'bold 36px Segoe UI';
    ctx.fillText(`${Math.ceil(this.roundTimer)}`, hudX + 80, hudY + 60);
    
    ctx.fillStyle = '#888888';
    ctx.font = '12px Segoe UI';
    ctx.fillText('seconds left', hudX + 80, hudY + 80);
    
    // Player scores
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillText('TOTAL SCORES', hudX + 80, hudY + 120);
    
    let scoreY = hudY + 150;
    const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    
    sortedPlayers.forEach((player, rank) => {
      const isLeading = rank === 0 && player.totalScore > 0;
      
      ctx.fillStyle = player.config.color;
      ctx.beginPath();
      ctx.arc(hudX + 20, scoreY, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText(`P${player.config.id + 1}`, hudX + 40, scoreY + 5);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = isLeading ? '#ffe66d' : '#ffffff';
      ctx.fillText(`${player.totalScore}`, hudX + 160, scoreY + 5);
      
      if (isLeading) {
        ctx.fillStyle = '#ffe66d';
        ctx.font = '10px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('👑', hudX + 5, scoreY + 4);
      }
      
      scoreY += 35;
    });
    
    ctx.textAlign = 'center';
  }
  
  private renderRoundResults(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('ROUND COMPLETE!', CANVAS_WIDTH / 2, 100);
    
    // Get round scores
    const scores = this.currentGame?.getScores() || new Map();
    const sortedResults = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    
    // Show results
    let y = 200;
    sortedResults.forEach(([playerId, score], rank) => {
      const player = this.players.find(p => p.config.id === playerId);
      if (!player) return;
      
      const isWinner = rank === 0;
      const x = CANVAS_WIDTH / 2;
      
      // Background
      ctx.fillStyle = isWinner ? 'rgba(255, 230, 109, 0.2)' : 'rgba(50, 50, 70, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x - 300, y - 25, 600, 60, 12);
      ctx.fill();
      
      // Player indicator
      ctx.fillStyle = player.config.color;
      ctx.beginPath();
      ctx.arc(x - 250, y + 5, 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Segoe UI';
      ctx.fillText(`${player.config.id + 1}`, x - 250, y + 12);
      
      // Name and score
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Segoe UI';
      ctx.fillText(`Player ${player.config.id + 1}`, x - 200, y + 12);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = isWinner ? '#ffe66d' : '#ffffff';
      ctx.font = 'bold 32px Segoe UI';
      ctx.fillText(`+${score}`, x + 280, y + 15);
      
      if (isWinner && score === 100) {
        ctx.fillStyle = '#ffe66d';
        ctx.font = '18px Segoe UI';
        ctx.fillText('PERFECT!', x + 200, y + 12);
      }
      
      y += 80;
    });
    
    // Total scores update
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888888';
    ctx.font = '18px Segoe UI';
    ctx.fillText('Updated totals:', CANVAS_WIDTH / 2, y + 30);
    
    y += 60;
    const sorted = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    sorted.forEach((player, i) => {
      ctx.fillStyle = i === 0 ? '#ffe66d' : player.config.color;
      ctx.font = i === 0 ? 'bold 24px Segoe UI' : '20px Segoe UI';
      ctx.fillText(`P${player.config.id + 1}: ${player.totalScore}`, CANVAS_WIDTH / 2 - 200 + i * 140, y);
    });
  }
  
  private renderSoloResults(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, HAND_COLORS } = GAME_CONFIG;
    
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 TRAINING COMPLETE!', CANVAS_WIDTH / 2, 100);
    
    // Stats comparison
    const leftAvg = this.soloStats.leftHandReactionTimes.length > 0
      ? this.soloStats.leftHandReactionTimes.reduce((a, b) => a + b, 0) / this.soloStats.leftHandReactionTimes.length
      : 0;
    const rightAvg = this.soloStats.rightHandReactionTimes.length > 0
      ? this.soloStats.rightHandReactionTimes.reduce((a, b) => a + b, 0) / this.soloStats.rightHandReactionTimes.length
      : 0;
    
    // Left hand stats
    ctx.fillStyle = HAND_COLORS.left;
    ctx.font = 'bold 28px Segoe UI';
    ctx.fillText('✋ LEFT HAND', CANVAS_WIDTH / 4, 200);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px Segoe UI';
    ctx.fillText(`Hits: ${this.soloStats.leftHandHits}`, CANVAS_WIDTH / 4, 250);
    ctx.fillText(`Avg Score: ${this.soloStats.leftHandAccuracy.toFixed(0)}`, CANVAS_WIDTH / 4, 290);
    ctx.fillText(`Avg Time: ${leftAvg.toFixed(0)}ms`, CANVAS_WIDTH / 4, 330);
    
    // Right hand stats
    ctx.fillStyle = HAND_COLORS.right;
    ctx.font = 'bold 28px Segoe UI';
    ctx.fillText('🤚 RIGHT HAND', (CANVAS_WIDTH * 3) / 4, 200);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px Segoe UI';
    ctx.fillText(`Hits: ${this.soloStats.rightHandHits}`, (CANVAS_WIDTH * 3) / 4, 250);
    ctx.fillText(`Avg Score: ${this.soloStats.rightHandAccuracy.toFixed(0)}`, (CANVAS_WIDTH * 3) / 4, 290);
    ctx.fillText(`Avg Time: ${rightAvg.toFixed(0)}ms`, (CANVAS_WIDTH * 3) / 4, 330);
    
    // Overall
    const totalScore = this.players[0]?.totalScore || 0;
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 36px Segoe UI';
    ctx.fillText(`Total Score: ${totalScore}`, CANVAS_WIDTH / 2, 450);
    
    // Play again
    const blink = Math.sin(this.blinkTimer * 3) > 0;
    if (blink) {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 24px Segoe UI';
      ctx.fillText('Press any key to play again', CANVAS_WIDTH / 2, 550);
    }
  }
  
  private renderFinalResults(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Sort by total score
    const sorted = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sorted[0];
    
    // Confetti for winner
    if (this.animTime % 0.5 < 0.02) {
      particles.confetti(CANVAS_WIDTH / 2, 100, GAME_CONFIG.PLAYER_COLORS, 30);
    }
    
    // Winner announcement
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 56px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 WINNER! 🏆', CANVAS_WIDTH / 2, 120);
    
    ctx.fillStyle = winner.config.color;
    ctx.font = 'bold 72px Segoe UI';
    ctx.fillText(`PLAYER ${winner.config.id + 1}`, CANVAS_WIDTH / 2, 210);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Segoe UI';
    ctx.fillText(`${winner.totalScore} points`, CANVAS_WIDTH / 2, 260);
    
    // Final standings
    ctx.fillStyle = '#888888';
    ctx.font = '20px Segoe UI';
    ctx.fillText('Final Standings', CANVAS_WIDTH / 2, 340);
    
    let y = 390;
    sorted.forEach((player, rank) => {
      const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '  ';
      
      ctx.fillStyle = player.config.color;
      ctx.font = 'bold 28px Segoe UI';
      ctx.fillText(`${medal} P${player.config.id + 1}: ${player.totalScore}`, CANVAS_WIDTH / 2, y);
      y += 50;
    });
    
    // Play again
    const blink = Math.sin(this.blinkTimer * 3) > 0;
    if (blink) {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 24px Segoe UI';
      ctx.fillText('Press any key to play again', CANVAS_WIDTH / 2, 620);
    }
  }
  
  private handleInput(action: { playerId: number; timestamp: number; hand?: 'left' | 'right' }): void {
    switch (this.phase) {
      case 'title':
        this.phase = 'mode-select';
        break;
        
      case 'mode-select':
        // Left side keys = party mode, right side = solo
        if (action.playerId === 0 || action.hand === 'left') {
          this.mode = 'party';
          this.inputManager.setMode('party');
          this.phase = 'player-select';
          this.joinedPlayers.clear();
        } else {
          this.mode = 'solo-training';
          this.inputManager.setMode('solo-training');
          this.phase = 'solo-setup';
        }
        break;
        
      case 'player-select':
        if (this.joinedPlayers.has(action.playerId)) {
          // Already joined - check if we can start
          if (this.joinedPlayers.size >= 2) {
            this.startGame();
          }
        } else {
          // New player joining
          this.joinedPlayers.add(action.playerId);
          particles.burst(
            200 + action.playerId * 260 + 125,
            340,
            GAME_CONFIG.PLAYER_COLORS[action.playerId],
            20
          );
        }
        break;
        
      case 'solo-setup':
        this.startSoloGame();
        break;
        
      case 'playing':
        if (this.mode === 'solo-training') {
          this.currentGame?.handleInput(0, action.hand);
        } else {
          this.currentGame?.handleInput(action.playerId);
        }
        break;
        
      case 'solo-results':
      case 'final-results':
        this.resetGame();
        break;
    }
  }
  
  private startGame(): void {
    // Create player states
    this.players = [];
    this.joinedPlayers.forEach((playerId) => {
      this.players.push({
        config: {
          id: playerId,
          name: `Player ${playerId + 1}`,
          color: GAME_CONFIG.PLAYER_COLORS[playerId],
          keyboardKey: GAME_CONFIG.KEYBOARD_KEYS[playerId],
        },
        roundScore: 0,
        totalScore: 0,
        isActive: true,
        consecutiveLowScores: 0,
        assistLevel: 0,
      });
      this.playerAssists.set(playerId, 0);
    });
    
    this.currentRound = 0;
    this.usedPatterns.clear();
    this.startRound();
  }
  
  private startSoloGame(): void {
    // Create single player for solo
    this.players = [{
      config: {
        id: 0,
        name: 'Solo Player',
        color: '#4ecdc4',
        keyboardKey: 'any',
      },
      roundScore: 0,
      totalScore: 0,
      isActive: true,
      consecutiveLowScores: 0,
      assistLevel: 0,
    }];
    
    this.soloStats = {
      leftHandHits: 0,
      rightHandHits: 0,
      leftHandReactionTimes: [],
      rightHandReactionTimes: [],
      leftHandAccuracy: 0,
      rightHandAccuracy: 0,
      roundsCompleted: 0,
    };
    
    this.currentRound = 0;
    this.usedPatterns.clear();
    this.startSoloRound();
  }
  
  private startSoloRound(): void {
    // Select pattern for solo round
    const pattern = this.selectPattern();
    
    // Create minigame in solo mode (dual vertical bars)
    this.currentGame = new TimingJump();
    this.currentGame.initSoloMode(pattern);
    
    this.phase = 'countdown';
    this.countdownTimer = GAME_CONFIG.COUNTDOWN_DURATION;
  }
  
  private startRound(): void {
    // Select pattern for this round
    const pattern = this.selectPattern();
    
    // Create and init minigame
    this.currentGame = new TimingJump();
    this.currentGame.initWithPattern(this.players, pattern, this.playerAssists);
    
    this.phase = 'countdown';
    this.countdownTimer = GAME_CONFIG.COUNTDOWN_DURATION;
  }
  
  private selectPattern(): RoundPattern {
    // Try to pick an unused pattern
    const available = this.patternLibrary.filter(p => !this.usedPatterns.has(p.name));
    
    let pattern: RoundPattern;
    if (available.length > 0) {
      pattern = available[Math.floor(Math.random() * available.length)];
    } else {
      // All patterns used, reset and pick any
      this.usedPatterns.clear();
      pattern = this.patternLibrary[Math.floor(Math.random() * this.patternLibrary.length)];
    }
    
    this.usedPatterns.add(pattern.name);
    
    // Adjust difficulty based on round
    const roundDifficulty = 1 + this.currentRound * 0.08;
    return {
      ...pattern,
      speed: pattern.speed * roundDifficulty,
      perfectWidth: pattern.perfectWidth / Math.sqrt(roundDifficulty),
    };
  }
  
  private endRound(): void {
    const scores = this.currentGame?.getScores() || new Map();
    
    // Update player scores and assist tracking
    this.players.forEach((player) => {
      const score = scores.get(player.config.id) || 0;
      player.roundScore = score;
      player.totalScore += score;
      
      // Fail-soft: track struggling players
      if (score < 50) {
        player.consecutiveLowScores++;
        if (player.consecutiveLowScores >= 2) {
          player.assistLevel = Math.min(3, player.assistLevel + 1);
        }
      } else {
        player.consecutiveLowScores = Math.max(0, player.consecutiveLowScores - 1);
        if (score >= 80) {
          player.assistLevel = Math.max(0, player.assistLevel - 1);
        }
      }
      this.playerAssists.set(player.config.id, player.assistLevel);
    });
    
    // Solo stats tracking
    if (this.mode === 'solo-training') {
      // In dual-bar solo mode, we get scores for both hands
      const soloScores = this.currentGame?.getSoloScores?.();
      
      if (soloScores) {
        // Track both hands from dual-bar mode
        if (soloScores.left !== undefined) {
          this.soloStats.leftHandHits++;
          this.soloStats.leftHandAccuracy = 
            (this.soloStats.leftHandAccuracy * (this.soloStats.leftHandHits - 1) + soloScores.left) / 
            this.soloStats.leftHandHits;
        }
        if (soloScores.right !== undefined) {
          this.soloStats.rightHandHits++;
          this.soloStats.rightHandAccuracy = 
            (this.soloStats.rightHandAccuracy * (this.soloStats.rightHandHits - 1) + soloScores.right) / 
            this.soloStats.rightHandHits;
        }
      }
      this.soloStats.roundsCompleted++;
    }
    
    this.phase = 'round-results';
    this.resultsTimer = GAME_CONFIG.RESULTS_DISPLAY_TIME;
    
    // Victory particles for winner
    const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0 && sorted[0][1] >= 70) {
      const winnerId = sorted[0][0];
      particles.confetti(640, 300, [GAME_CONFIG.PLAYER_COLORS[winnerId]], 40);
    }
  }
  
  private resetGame(): void {
    this.phase = 'title';
    this.players = [];
    this.joinedPlayers.clear();
    this.currentGame?.cleanup();
    this.currentGame = null;
    this.currentRound = 0;
    this.usedPatterns.clear();
    this.playerAssists.clear();
  }
}
