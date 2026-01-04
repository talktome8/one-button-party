import { MiniGame, PlayerState, GAME_CONFIG, PatternType } from '../types';
import { particles } from '../particles';

// Round pattern configuration - expanded for variety
export interface RoundPattern {
  name: string;
  speed: number;         // Base speed multiplier (0.5 = slow, 1.5 = fast)
  direction: 'left' | 'right' | 'oscillate';  // Starting direction or oscillating
  targetOffset: number;  // -0.3 to 0.3 offset from center
  perfectWidth: number;  // Perfect zone width (smaller = harder)
  color: string;         // Theme color for this pattern
  twist: PatternTwist | null;  // Optional twist mechanic
  patternType: PatternType; // The interaction pattern type
  description: string;   // Player-facing description of what to expect
}

// Twist types with explicit timing info
export type PatternTwist = 
  | { type: 'delayedLock'; delay: number; description: string }
  | { type: 'invisibleMarker'; revealDistance: number; description: string }
  | { type: 'reverseOnLock'; description: string };

// Pattern library - diverse set of interaction patterns for replayability
export function getPatternLibrary(): RoundPattern[] {
  return [
    // CLASSIC PATTERNS (sweep)
    {
      name: '🎯 Classic Center',
      speed: 0.7,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.04,
      color: '#4ecdc4',
      twist: null,
      patternType: 'sweep',
      description: 'Hit the center target!',
    },
    {
      name: '⬅️ Left Target',
      speed: 0.75,
      direction: 'right',
      targetOffset: -0.25,
      perfectWidth: 0.04,
      color: '#ff6b6b',
      twist: null,
      patternType: 'sweep',
      description: 'Target is on the LEFT side!',
    },
    {
      name: '➡️ Right Target',
      speed: 0.75,
      direction: 'left',
      targetOffset: 0.25,
      perfectWidth: 0.04,
      color: '#95e1d3',
      twist: null,
      patternType: 'sweep',
      description: 'Target is on the RIGHT side!',
    },
    {
      name: '🐢 Slow & Steady',
      speed: 0.45,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.03,
      color: '#74b9ff',
      twist: null,
      patternType: 'sweep',
      description: 'Slow marker, tiny target zone!',
    },
    {
      name: '⚡ Speed Run',
      speed: 1.2,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.06,
      color: '#ff9f43',
      twist: null,
      patternType: 'sweep',
      description: 'Fast marker - react quickly!',
    },
    
    // OSCILLATE PATTERNS (bouncing)
    {
      name: '🔄 Bounce Mode',
      speed: 0.65,
      direction: 'oscillate',
      targetOffset: 0,
      perfectWidth: 0.045,
      color: '#a29bfe',
      twist: null,
      patternType: 'oscillate',
      description: 'Marker bounces back and forth!',
    },
    {
      name: '🏓 Ping Pong',
      speed: 0.9,
      direction: 'oscillate',
      targetOffset: 0.15,
      perfectWidth: 0.04,
      color: '#fd79a8',
      twist: null,
      patternType: 'oscillate',
      description: 'Fast bouncing, offset target!',
    },
    
    // SHRINK PATTERNS
    {
      name: '📉 Shrinking Zone',
      speed: 0.6,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.08,  // Starts large
      color: '#00b894',
      twist: null,
      patternType: 'shrink',
      description: 'Target shrinks over time - lock early!',
    },
    {
      name: '💫 Vanishing Point',
      speed: 0.55,
      direction: 'oscillate',
      targetOffset: 0,
      perfectWidth: 0.1,  // Very large start
      color: '#e17055',
      twist: null,
      patternType: 'shrink',
      description: 'Target shrinks fast! Don\'t wait too long!',
    },
    
    // PULSE PATTERNS
    {
      name: '💓 Pulse Beat',
      speed: 0.65,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.05,
      color: '#e056fd',
      twist: null,
      patternType: 'pulse',
      description: 'Target appears and disappears rhythmically!',
    },
    {
      name: '👁️ Blink Zone',
      speed: 0.8,
      direction: 'oscillate',
      targetOffset: -0.1,
      perfectWidth: 0.045,
      color: '#00cec9',
      twist: null,
      patternType: 'pulse',
      description: 'Fast blink - time your lock carefully!',
    },
    
    // DELAYED REVEAL PATTERNS
    {
      name: '❓ Mystery Target',
      speed: 0.5,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.05,
      color: '#fdcb6e',
      twist: null,
      patternType: 'delayed-reveal',
      description: 'Target position revealed after 2.5 seconds!',
    },
    {
      name: '🔮 Late Reveal',
      speed: 0.6,
      direction: 'oscillate',
      targetOffset: 0.2,
      perfectWidth: 0.045,
      color: '#6c5ce7',
      twist: null,
      patternType: 'delayed-reveal',
      description: 'Where will the target appear?',
    },
    
    // MULTI-ZONE PATTERNS
    {
      name: '🎪 Triple Threat',
      speed: 0.55,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.035,
      color: '#f39c12',
      twist: null,
      patternType: 'multi-zone',
      description: 'Three targets - center is worth most!',
    },
    {
      name: '🎰 Pick Your Zone',
      speed: 0.7,
      direction: 'oscillate',
      targetOffset: 0,
      perfectWidth: 0.04,
      color: '#2ecc71',
      twist: null,
      patternType: 'multi-zone',
      description: 'Multiple scoring zones available!',
    },
    
    // TWIST PATTERNS (with explicit delay mechanics)
    {
      name: '⏰ Delayed Lock (200ms)',
      speed: 0.65,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.055,
      color: '#e056fd',
      twist: {
        type: 'delayedLock',
        delay: 0.2,
        description: 'Lock has 200ms delay - marker keeps moving!'
      },
      patternType: 'sweep',
      description: 'Press EARLY! Lock takes 200ms to activate.',
    },
    {
      name: '⏱️ Long Delay (350ms)',
      speed: 0.55,
      direction: 'oscillate',
      targetOffset: 0.1,
      perfectWidth: 0.06,
      color: '#9b59b6',
      twist: {
        type: 'delayedLock',
        delay: 0.35,
        description: 'Lock has 350ms delay - predict the position!'
      },
      patternType: 'sweep',
      description: 'Press VERY EARLY! 350ms delay before lock.',
    },
    {
      name: '👻 Ghost Marker',
      speed: 0.6,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.055,
      color: '#636e72',
      twist: {
        type: 'invisibleMarker',
        revealDistance: 0.15,
        description: 'Marker only visible near target zone!'
      },
      patternType: 'sweep',
      description: 'Marker is hidden until close to target!',
    },
    {
      name: '🔀 Reverse Lock',
      speed: 0.65,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.055,
      color: '#00b894',
      twist: {
        type: 'reverseOnLock',
        description: 'Direction reverses when you press!'
      },
      patternType: 'sweep',
      description: 'Marker reverses direction when you press!',
    },
  ];
}

interface MarkerState {
  position: number;      // 0 to 1 (0 = left, 1 = right)
  speed: number;         // Current movement speed
  baseSpeed: number;     // Base speed for this player
  direction: number;     // 1 = right, -1 = left
  locked: boolean;       // Has player locked their position?
  lockPosition: number;  // Where they locked
  speedBoostTimer: number; // Timer for speed boost zones
  isInBoostZone: boolean;
  lockAnimTime: number;  // Animation time since lock
  impactRingSize: number; // Expanding ring on lock
  oscillateTimer: number; // For oscillating mode
  // Twist support
  delayLockTimer: number; // Countdown for delayed lock (twist)
  delayLockDuration: number; // Total delay duration (for display)
  isLocking: boolean;     // Is in delayed lock state
  pressPosition: number;  // Position when button was pressed (for delay visualization)
  // Fail-soft assist
  assistLevel: number;    // Hidden assist level (0-3)
  // Auto-lock penalty (for passive play)
  wasAutoLocked: boolean; // True if player didn't press in time
  // Visibility for invisible marker twist
  isVisible: boolean;
  // For pulse pattern
  pulsePhase: number;
}

// Extended pattern state for special pattern types
interface PatternState {
  // For shrinking target
  shrinkProgress: number;    // 0 to 1, how much target has shrunk
  originalPerfectWidth: number;
  originalGoodWidth: number;
  
  // For pulse pattern
  pulseVisible: boolean;
  pulseTimer: number;
  pulseOnDuration: number;
  pulseOffDuration: number;
  
  // For delayed reveal
  revealTimer: number;
  isRevealed: boolean;
  revealDelay: number;
  
  // For multi-zone
  zones: { position: number; width: number; points: number }[];
}

export class TimingJump implements MiniGame {
  name = '🎯 Timing Jump';
  instructions = 'Lock your marker in the target zone!';
  
  private players: PlayerState[] = [];
  private markers: Map<number, MarkerState> = new Map();
  private targetPosition = 0.5; // Center (can be offset by pattern)
  private perfectZoneWidth = 0.04;  // Tiny perfect zone (4%)
  private goodZoneWidth = 0.12;     // Good zone (12%)
  
  // Current pattern settings
  private pattern: RoundPattern | null = null;
  private patternColor = '#4ecdc4';
  private patternState: PatternState | null = null;
  
  // Speed boost zones (red zones that speed you up) - vary by pattern
  private boostZones: { start: number; end: number }[] = [];
  
  // Slow zones (blue zones)
  private slowZones: { start: number; end: number }[] = [];
  
  private gameTime: number = 0;
  private pulsePhase: number = 0;
  private trackPadding = 120;
  private trackWidth = GAME_CONFIG.CANVAS_WIDTH - 240;
  
  // Urgency escalation
  private urgencyLevel: number = 0; // 0 = normal, 1 = hurry, 2 = critical
  
  // Solo training mode tracking
  private soloHandForRound: 'left' | 'right' | null = null;
  private isSoloMode: boolean = false;
  
  // Solo mode dual markers (left and right hand)
  private soloLeftMarker: MarkerState | null = null;
  private soloRightMarker: MarkerState | null = null;
  private soloLeftTarget: number = 0.5;
  private soloRightTarget: number = 0.5;
  
  init(players: PlayerState[]): void {
    // Default pattern if none provided
    this.initWithPattern(players, {
      name: 'Classic',
      speed: 0.8,
      direction: 'right',
      targetOffset: 0,
      perfectWidth: 0.04,
      color: '#4ecdc4',
      twist: null,
      patternType: 'sweep',
      description: 'Hit the center target!'
    });
  }
  
  initWithPattern(players: PlayerState[], pattern: RoundPattern, playerAssists?: Map<number, number>): void {
    this.players = players;
    this.markers.clear();
    this.gameTime = 0;
    this.pattern = pattern;
    this.patternColor = pattern.color;
    
    // Apply pattern settings
    this.targetPosition = 0.5 + pattern.targetOffset;
    this.targetPosition = Math.max(0.2, Math.min(0.8, this.targetPosition)); // Clamp
    this.perfectZoneWidth = pattern.perfectWidth;
    this.goodZoneWidth = pattern.perfectWidth * 3; // Good zone scales with perfect
    
    // Initialize pattern-specific state
    this.initPatternState(pattern);
    
    // Generate speed zones based on target position and pattern type
    this.generateSpeedZones();
    
    // Initialize marker for each player
    players.forEach((player) => {
      const assistLevel = playerAssists?.get(player.config.id) || 0;
      
      // Fail-soft: slightly slower speed for struggling players (subtle)
      const assistSpeedMult = 1 - (assistLevel * 0.06); // Up to 18% slower at max assist
      const speedVariation = 0.9 + Math.random() * 0.2;
      const baseSpeed = pattern.speed * speedVariation * assistSpeedMult;
      
      // Determine starting direction
      let startDir: number;
      if (pattern.direction === 'left') {
        startDir = -1;
      } else if (pattern.direction === 'right') {
        startDir = 1;
      } else {
        // Oscillate: alternate per player
        startDir = player.config.id % 2 === 0 ? 1 : -1;
      }
      
      // Determine initial visibility
      const isVisible = pattern.twist?.type !== 'invisibleMarker';
      
      this.markers.set(player.config.id, {
        position: Math.random(),
        speed: baseSpeed,
        baseSpeed: baseSpeed,
        direction: startDir,
        locked: false,
        lockPosition: 0,
        speedBoostTimer: 0,
        isInBoostZone: false,
        lockAnimTime: 0,
        impactRingSize: 0,
        oscillateTimer: Math.random() * Math.PI * 2,
        delayLockTimer: 0,
        delayLockDuration: 0,
        isLocking: false,
        pressPosition: 0,
        assistLevel: assistLevel,
        wasAutoLocked: false,
        isVisible: isVisible,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    });
  }
  
  // Initialize solo mode with dual vertical bars
  initSoloMode(pattern: RoundPattern): void {
    this.isSoloMode = true;
    this.players = [{
      config: { id: 0, name: 'Solo', color: '#4ecdc4', keyboardKey: 'any' },
      roundScore: 0,
      totalScore: 0,
      isActive: true,
      consecutiveLowScores: 0,
      assistLevel: 0,
    }];
    this.markers.clear();
    this.gameTime = 0;
    this.pattern = pattern;
    this.patternColor = pattern.color;
    this.soloHandForRound = null;
    
    // Set random target positions for each side
    this.soloLeftTarget = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
    this.soloRightTarget = 0.3 + Math.random() * 0.4;
    
    this.perfectZoneWidth = pattern.perfectWidth;
    this.goodZoneWidth = pattern.perfectWidth * 3;
    
    // Create marker for left hand (moves vertically on left bar)
    const leftSpeed = pattern.speed * (0.9 + Math.random() * 0.2);
    this.soloLeftMarker = {
      position: Math.random(),
      speed: leftSpeed,
      baseSpeed: leftSpeed,
      direction: 1,
      locked: false,
      lockPosition: 0,
      speedBoostTimer: 0,
      isInBoostZone: false,
      lockAnimTime: 0,
      impactRingSize: 0,
      oscillateTimer: 0,
      delayLockTimer: 0,
      delayLockDuration: 0,
      isLocking: false,
      pressPosition: 0,
      assistLevel: 0,
      wasAutoLocked: false,
      isVisible: true,
      pulsePhase: 0,
    };
    
    // Create marker for right hand (moves vertically on right bar)
    const rightSpeed = pattern.speed * (0.9 + Math.random() * 0.2);
    this.soloRightMarker = {
      position: Math.random(),
      speed: rightSpeed,
      baseSpeed: rightSpeed,
      direction: -1, // Opposite direction for variety
      locked: false,
      lockPosition: 0,
      speedBoostTimer: 0,
      isInBoostZone: false,
      lockAnimTime: 0,
      impactRingSize: 0,
      oscillateTimer: 0,
      delayLockTimer: 0,
      delayLockDuration: 0,
      isLocking: false,
      pressPosition: 0,
      assistLevel: 0,
      wasAutoLocked: false,
      isVisible: true,
      pulsePhase: 0,
    };
    
    this.initPatternState(pattern);
  }
  
  private initPatternState(pattern: RoundPattern): void {
    this.patternState = {
      shrinkProgress: 0,
      originalPerfectWidth: this.perfectZoneWidth,
      originalGoodWidth: this.goodZoneWidth,
      pulseVisible: true,
      pulseTimer: 0,
      pulseOnDuration: 1.5,  // Target visible for 1.5s
      pulseOffDuration: 0.5, // Target hidden for 0.5s
      revealTimer: 0,
      isRevealed: pattern.patternType !== 'delayed-reveal',
      revealDelay: 2.5, // Target hidden for first 2.5 seconds
      zones: [],
    };
    
    // Multi-zone pattern: create 2-3 target zones
    if (pattern.patternType === 'multi-zone') {
      this.patternState.zones = [
        { position: 0.25, width: pattern.perfectWidth * 1.5, points: 70 },
        { position: 0.5, width: pattern.perfectWidth, points: 100 },
        { position: 0.75, width: pattern.perfectWidth * 1.5, points: 70 },
      ];
    }
  }
  
  private generateSpeedZones(): void {
    // Clear existing zones
    this.boostZones = [];
    this.slowZones = [];
    
    const target = this.targetPosition;
    
    // Different zone layouts based on pattern type
    if (this.pattern?.patternType === 'multi-zone') {
      // No speed zones for multi-zone - keep it clean
      return;
    }
    
    // Place boost zones away from target (danger zones)
    if (target > 0.3) {
      this.boostZones.push({ start: 0.05, end: 0.15 });
    }
    if (target < 0.7) {
      this.boostZones.push({ start: 0.85, end: 0.95 });
    }
    
    // Place slow zones near target (safe approach zones)
    const slowOffset = 0.15;
    if (target - slowOffset > 0.1) {
      this.slowZones.push({ start: target - slowOffset - 0.07, end: target - slowOffset });
    }
    if (target + slowOffset < 0.9) {
      this.slowZones.push({ start: target + slowOffset, end: target + slowOffset + 0.07 });
    }
  }
  
  update(deltaTime: number): void {
    this.gameTime += deltaTime;
    this.pulsePhase += deltaTime * 3;
    
    // Update pattern-specific state
    this.updatePatternState(deltaTime);
    
    // Solo mode: update both markers independently
    if (this.isSoloMode) {
      this.updateSoloMode(deltaTime);
      return;
    }
    
    this.markers.forEach((marker, playerId) => {
      // Handle delayed lock countdown
      if (marker.isLocking && marker.delayLockTimer > 0) {
        marker.delayLockTimer -= deltaTime;
        if (marker.delayLockTimer <= 0) {
          // Lock completes
          marker.locked = true;
          marker.lockPosition = marker.position;
          marker.lockAnimTime = 0;
          marker.impactRingSize = 1;
          marker.isLocking = false;
          
          // Trigger particle effect
          this.triggerLockParticles(playerId, marker.position);
        }
      }
      
      if (marker.locked) {
        marker.lockAnimTime += deltaTime;
        if (marker.impactRingSize < 80) {
          marker.impactRingSize += deltaTime * 400;
        }
        return;
      }
      
      // Handle invisible marker twist - reveal when close to target
      if (this.pattern?.twist?.type === 'invisibleMarker') {
        const distance = Math.abs(marker.position - this.targetPosition);
        marker.isVisible = distance <= this.pattern.twist.revealDistance;
      }
      
      // Oscillating mode: periodically reverse direction
      if (this.pattern?.direction === 'oscillate') {
        marker.oscillateTimer += deltaTime * 2;
        if (Math.sin(marker.oscillateTimer) > 0.95 && marker.direction === 1) {
          marker.direction = -1;
        } else if (Math.sin(marker.oscillateTimer) < -0.95 && marker.direction === -1) {
          marker.direction = 1;
        }
      }
      
      // Check if in boost zone
      let speedMultiplier = 1;
      marker.isInBoostZone = false;
      
      for (const zone of this.boostZones) {
        if (marker.position >= zone.start && marker.position <= zone.end) {
          speedMultiplier = 2.0; // Double speed in boost zones!
          marker.isInBoostZone = true;
          break;
        }
      }
      
      // Check if in slow zone
      for (const zone of this.slowZones) {
        if (marker.position >= zone.start && marker.position <= zone.end) {
          speedMultiplier = 0.5; // Half speed in slow zones
          break;
        }
      }
      
      // Add some sinusoidal speed variation for unpredictability
      const wobble = 1 + Math.sin(this.gameTime * 4 + playerId * 2) * 0.2;
      
      // Move marker
      marker.speed = marker.baseSpeed * speedMultiplier * wobble;
      marker.position += marker.speed * marker.direction * deltaTime;
      
      // Bounce off edges with slight randomization
      if (marker.position >= 1) {
        marker.position = 1;
        marker.direction = -1;
        marker.baseSpeed = (this.pattern?.speed || 0.8) * (0.85 + Math.random() * 0.3);
      } else if (marker.position <= 0) {
        marker.position = 0;
        marker.direction = 1;
        marker.baseSpeed = (this.pattern?.speed || 0.8) * (0.85 + Math.random() * 0.3);
      }
    });
  }
  
  private updatePatternState(deltaTime: number): void {
    if (!this.patternState || !this.pattern) return;
    
    switch (this.pattern.patternType) {
      case 'shrink':
        // Target shrinks over time (first 8 seconds)
        if (this.gameTime < 8) {
          this.patternState.shrinkProgress = Math.min(1, this.gameTime / 8);
          const shrinkFactor = 1 - (this.patternState.shrinkProgress * 0.6); // Shrink to 40% of original
          this.perfectZoneWidth = this.patternState.originalPerfectWidth * shrinkFactor;
          this.goodZoneWidth = this.patternState.originalGoodWidth * shrinkFactor;
        }
        break;
        
      case 'pulse':
        // Target appears/disappears rhythmically
        this.patternState.pulseTimer += deltaTime;
        const cycleDuration = this.patternState.pulseOnDuration + this.patternState.pulseOffDuration;
        const cyclePosition = this.patternState.pulseTimer % cycleDuration;
        this.patternState.pulseVisible = cyclePosition < this.patternState.pulseOnDuration;
        break;
        
      case 'delayed-reveal':
        // Target position hidden initially
        if (!this.patternState.isRevealed) {
          this.patternState.revealTimer += deltaTime;
          if (this.patternState.revealTimer >= this.patternState.revealDelay) {
            this.patternState.isRevealed = true;
          }
        }
        break;
    }
  }
  
  private updateSoloMode(deltaTime: number): void {
    // Update left marker
    if (this.soloLeftMarker && !this.soloLeftMarker.locked) {
      this.updateSoloMarker(this.soloLeftMarker, deltaTime);
    } else if (this.soloLeftMarker?.locked) {
      this.soloLeftMarker.lockAnimTime += deltaTime;
      if (this.soloLeftMarker.impactRingSize < 80) {
        this.soloLeftMarker.impactRingSize += deltaTime * 400;
      }
    }
    
    // Update right marker
    if (this.soloRightMarker && !this.soloRightMarker.locked) {
      this.updateSoloMarker(this.soloRightMarker, deltaTime);
    } else if (this.soloRightMarker?.locked) {
      this.soloRightMarker.lockAnimTime += deltaTime;
      if (this.soloRightMarker.impactRingSize < 80) {
        this.soloRightMarker.impactRingSize += deltaTime * 400;
      }
    }
  }
  
  private updateSoloMarker(marker: MarkerState, deltaTime: number): void {
    // Add some sinusoidal speed variation
    const wobble = 1 + Math.sin(this.gameTime * 3) * 0.15;
    marker.speed = marker.baseSpeed * wobble;
    marker.position += marker.speed * marker.direction * deltaTime;
    
    // Bounce off edges
    if (marker.position >= 1) {
      marker.position = 1;
      marker.direction = -1;
      marker.baseSpeed *= (0.9 + Math.random() * 0.2);
    } else if (marker.position <= 0) {
      marker.position = 0;
      marker.direction = 1;
      marker.baseSpeed *= (0.9 + Math.random() * 0.2);
    }
  }
  
  private triggerLockParticles(playerId: number, position: number): void {
    const player = this.players.find(p => p.config.id === playerId);
    if (!player) return;
    
    const playerIndex = this.players.findIndex(p => p.config.id === playerId);
    const trackHeight = 80;
    const playerSpacing = (GAME_CONFIG.CANVAS_HEIGHT - 180) / Math.max(this.players.length, 1);
    const startY = 140;
    const y = startY + playerIndex * playerSpacing + trackHeight / 2;
    const markerX = this.trackPadding + this.trackWidth * position;
    const score = this.calculateScore(position);
    
    if (score === 100) {
      particles.burst(markerX, y, '#ffe66d', 25);
    } else if (score >= 70) {
      particles.burst(markerX, y, player.config.color, 15);
    } else {
      particles.sparkle(markerX, y, '#666666', 8);
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Solo mode has its own rendering
    if (this.isSoloMode) {
      this.renderSoloMode(ctx);
      return;
    }
    
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    const trackHeight = 70;
    const trackPadding = 100;
    const trackWidth = CANVAS_WIDTH - trackPadding * 2 - 200; // Leave space for HUD
    const playerSpacing = (CANVAS_HEIGHT - 200) / Math.max(this.players.length, 1);
    const startY = 120;
    
    // Game title with pattern info
    ctx.fillStyle = this.patternColor;
    ctx.font = 'bold 28px Segoe UI';
    ctx.textAlign = 'center';
    
    // Dynamic hint based on pattern
    let hint = this.getPatternHint();
    ctx.fillText(hint, CANVAS_WIDTH / 2, 45);
    
    // Pattern description (what's being tested)
    if (this.pattern?.description) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '16px Segoe UI';
      ctx.fillText(this.pattern.description, CANVAS_WIDTH / 2, 70);
    }
    
    // Twist indicator with explicit timing
    if (this.pattern?.twist) {
      this.renderTwistIndicator(ctx, CANVAS_WIDTH);
    }
    
    // Target indicator line at top (only if revealed for delayed-reveal)
    const showTarget = this.patternState?.isRevealed !== false && 
                       this.patternState?.pulseVisible !== false;
    
    if (showTarget) {
      if (this.pattern?.patternType === 'multi-zone' && this.patternState?.zones) {
        // Draw multiple target zones
        for (const zone of this.patternState.zones) {
          const zoneX = trackPadding + trackWidth * zone.position;
          ctx.strokeStyle = zone.points === 100 ? this.patternColor + '80' : '#95e1d3' + '60';
          ctx.lineWidth = zone.points === 100 ? 2 : 1;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(zoneX, 90);
          ctx.lineTo(zoneX, CANVAS_HEIGHT - 50);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        const targetX = trackPadding + trackWidth * this.targetPosition;
        ctx.strokeStyle = this.patternColor + '80';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(targetX, 90);
        ctx.lineTo(targetX, CANVAS_HEIGHT - 50);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    // Delayed reveal countdown
    if (this.pattern?.patternType === 'delayed-reveal' && !this.patternState?.isRevealed) {
      const remaining = Math.max(0, (this.patternState?.revealDelay || 0) - (this.patternState?.revealTimer || 0));
      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 24px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(`Target reveals in ${remaining.toFixed(1)}s`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    }
    
    // Shrink progress indicator
    if (this.pattern?.patternType === 'shrink' && this.patternState && this.gameTime < 8) {
      const shrinkPercent = Math.round((1 - (this.patternState.shrinkProgress * 0.6)) * 100);
      ctx.fillStyle = '#ff9f43';
      ctx.font = '16px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(`Target size: ${shrinkPercent}%`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    }
    
    // Pulse timing indicator
    if (this.pattern?.patternType === 'pulse' && this.patternState) {
      const cycleDuration = this.patternState.pulseOnDuration + this.patternState.pulseOffDuration;
      const cyclePosition = this.patternState.pulseTimer % cycleDuration;
      const isVisible = this.patternState.pulseVisible;
      
      // Draw pulse rhythm bar
      const barX = CANVAS_WIDTH / 2 - 100;
      const barY = CANVAS_HEIGHT - 85;
      const barWidth = 200;
      const barHeight = 12;
      
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 4);
      ctx.fill();
      
      // Visible phase indicator
      const visibleWidth = (this.patternState.pulseOnDuration / cycleDuration) * barWidth;
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.roundRect(barX, barY, visibleWidth, barHeight, 4);
      ctx.fill();
      
      // Current position marker
      const markerPos = barX + (cyclePosition / cycleDuration) * barWidth;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(markerPos, barY + barHeight / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = isVisible ? '#4ecdc4' : '#ff6b6b';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(isVisible ? '● TARGET VISIBLE' : '○ TARGET HIDDEN', CANVAS_WIDTH / 2, barY - 8);
    }
    
    // Draw each player's track
    this.players.forEach((player, index) => {
      const y = startY + index * playerSpacing;
      const marker = this.markers.get(player.config.id)!;
      
      this.drawPlayerTrack(ctx, player, marker, trackPadding, y, trackWidth, trackHeight);
    });
  }
  
  private renderSoloMode(ctx: CanvasRenderingContext2D): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Title
    ctx.fillStyle = this.patternColor;
    ctx.font = 'bold 32px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SOLO REACTION TEST ⚡', CANVAS_WIDTH / 2, 50);
    
    // Hand labels
    ctx.font = 'bold 24px Segoe UI';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('LEFT HAND', 180, 100);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('RIGHT HAND', CANVAS_WIDTH - 180, 100);
    
    // Dimensions for vertical bars
    const barWidth = 100;
    const barHeight = CANVAS_HEIGHT - 250;
    const leftBarX = 130;
    const rightBarX = CANVAS_WIDTH - 230;
    const barY = 130;
    
    // Draw left vertical bar
    this.drawVerticalBar(ctx, leftBarX, barY, barWidth, barHeight, 
      this.soloLeftTarget, this.soloLeftMarker!, '#ff6b6b', 'A / Q / Left Ctrl');
    
    // Draw right vertical bar
    this.drawVerticalBar(ctx, rightBarX, barY, barWidth, barHeight,
      this.soloRightTarget, this.soloRightMarker!, '#4ecdc4', 'L / P / Right Ctrl');
    
    // Center instructions
    ctx.fillStyle = '#888888';
    ctx.font = '18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Press your key when the marker reaches the target!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    
    // Show which hand to test if specified
    if (this.soloHandForRound === 'left') {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 28px Segoe UI';
      ctx.fillText('◀ TEST LEFT HAND ◀', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    } else if (this.soloHandForRound === 'right') {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 28px Segoe UI';
      ctx.fillText('▶ TEST RIGHT HAND ▶', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    } else {
      // Both hands mode
      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 22px Segoe UI';
      ctx.fillText('Lock BOTH targets for best score!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
    
    // Show scores if locked
    let totalScore = 0;
    let lockedCount = 0;
    
    if (this.soloLeftMarker?.locked) {
      const leftScore = this.calculateSoloScore(this.soloLeftMarker.lockPosition, this.soloLeftTarget);
      totalScore += leftScore;
      lockedCount++;
      ctx.fillStyle = leftScore >= 80 ? '#ffe66d' : leftScore >= 50 ? '#95e1d3' : '#ff6b6b';
      ctx.font = 'bold 36px Segoe UI';
      ctx.fillText(`${leftScore}`, 180, CANVAS_HEIGHT - 130);
    }
    
    if (this.soloRightMarker?.locked) {
      const rightScore = this.calculateSoloScore(this.soloRightMarker.lockPosition, this.soloRightTarget);
      totalScore += rightScore;
      lockedCount++;
      ctx.fillStyle = rightScore >= 80 ? '#ffe66d' : rightScore >= 50 ? '#95e1d3' : '#ff6b6b';
      ctx.font = 'bold 36px Segoe UI';
      ctx.fillText(`${rightScore}`, CANVAS_WIDTH - 180, CANVAS_HEIGHT - 130);
    }
    
    // Average score display when both locked
    if (lockedCount === 2) {
      const avgScore = Math.round(totalScore / 2);
      ctx.fillStyle = avgScore >= 80 ? '#ffe66d' : avgScore >= 50 ? '#95e1d3' : '#ff6b6b';
      ctx.font = 'bold 40px Segoe UI';
      ctx.fillText(`AVG: ${avgScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 130);
    }
  }
  
  private drawVerticalBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    targetPos: number,
    marker: MarkerState,
    color: string,
    keyHint: string
  ): void {
    // Track background
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 15);
    ctx.fill();
    
    // Track border
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 15);
    ctx.stroke();
    
    // Perfect zone (target area)
    const perfectHeight = height * this.perfectZoneWidth;
    const goodHeight = height * this.goodZoneWidth;
    const targetY = y + height * targetPos;
    
    // Good zone (outer)
    ctx.fillStyle = '#95e1d3' + '30';
    ctx.beginPath();
    ctx.roundRect(x + 5, targetY - goodHeight / 2, width - 10, goodHeight, 8);
    ctx.fill();
    
    // Perfect zone (inner)
    ctx.fillStyle = color + '50';
    ctx.beginPath();
    ctx.roundRect(x + 10, targetY - perfectHeight / 2, width - 20, perfectHeight, 6);
    ctx.fill();
    
    // Target line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 15, targetY);
    ctx.lineTo(x + width - 15, targetY);
    ctx.stroke();
    
    // Animated pulsing glow on target
    const glowIntensity = 0.3 + Math.sin(this.pulsePhase * 2) * 0.2;
    ctx.strokeStyle = color + Math.round(glowIntensity * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + 10, targetY);
    ctx.lineTo(x + width - 10, targetY);
    ctx.stroke();
    
    // Draw marker (horizontal bar moving vertically)
    if (marker) {
      const markerY = y + height * marker.position;
      
      if (marker.locked) {
        // Locked marker
        const lockY = y + height * marker.lockPosition;
        
        // Impact ring
        ctx.strokeStyle = color + '60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + width / 2, lockY, marker.impactRingSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Locked marker bar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x + 8, lockY - 8, width - 16, 16, 4);
        ctx.fill();
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x + 8, lockY - 8, width - 16, 16, 4);
        ctx.stroke();
        
        // Lock icon
        ctx.fillStyle = color;
        ctx.font = 'bold 18px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', x + width / 2, lockY + 6);
      } else {
        // Moving marker
        // Glow effect
        const gradient = ctx.createRadialGradient(
          x + width / 2, markerY, 0,
          x + width / 2, markerY, 40
        );
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + width / 2, markerY, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Marker bar
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x + 12, markerY - 6, width - 24, 12, 4);
        ctx.fill();
        
        // Direction indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(marker.direction > 0 ? '▼' : '▲', x + width / 2, markerY + 5);
      }
    }
    
    // Key hint at bottom
    ctx.fillStyle = '#666666';
    ctx.font = '14px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(keyHint, x + width / 2, y + height + 25);
  }
  
  private calculateSoloScore(position: number, target: number): number {
    const distance = Math.abs(position - target);
    
    if (distance <= this.perfectZoneWidth / 2) {
      return 100; // Perfect!
    } else if (distance <= this.goodZoneWidth / 2) {
      // Good - scale from 70 to 90
      const goodProgress = (distance - this.perfectZoneWidth / 2) / (this.goodZoneWidth / 2 - this.perfectZoneWidth / 2);
      return Math.round(90 - goodProgress * 20);
    } else {
      // Miss - scale from 0 to 50 based on how far
      const missDistance = Math.min(1, distance / 0.5);
      return Math.round(50 * (1 - missDistance));
    }
  }
  
  private getPatternHint(): string {
    if (!this.pattern) return '⚡ HIT THE TARGET ⚡';
    
    switch (this.pattern.patternType) {
      case 'shrink':
        return '⚡ TARGET SHRINKING ⚡';
      case 'pulse':
        return '⚡ PULSING TARGET ⚡';
      case 'delayed-reveal':
        return '⚡ HIDDEN TARGET ⚡';
      case 'multi-zone':
        return '⚡ MULTIPLE TARGETS ⚡';
      case 'oscillate':
        return '⚡ BOUNCING MARKER ⚡';
      default:
        const targetHint = this.targetPosition < 0.4 ? 'LEFT' : this.targetPosition > 0.6 ? 'RIGHT' : 'CENTER';
        return `⚡ HIT THE ${targetHint} ⚡`;
    }
  }
  
  private renderTwistIndicator(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
    if (!this.pattern?.twist) return;
    
    const twist = this.pattern.twist;
    let twistText = '';
    let twistDetail = '';
    
    switch (twist.type) {
      case 'delayedLock':
        twistText = `⚠ DELAY: ${(twist.delay * 1000).toFixed(0)}ms`;
        twistDetail = 'Marker keeps moving after press!';
        break;
      case 'invisibleMarker':
        twistText = '👁 LIMITED VISIBILITY';
        twistDetail = `Marker only visible near target`;
        break;
      case 'reverseOnLock':
        twistText = '🔄 REVERSE ON PRESS';
        twistDetail = 'Marker direction flips when you press!';
        break;
    }
    
    // Background for twist info
    ctx.fillStyle = 'rgba(224, 86, 253, 0.15)';
    ctx.beginPath();
    ctx.roundRect(canvasWidth / 2 - 150, 78, 300, 35, 8);
    ctx.fill();
    
    ctx.fillStyle = '#e056fd';
    ctx.font = 'bold 14px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(twistText, canvasWidth / 2, 93);
    
    ctx.fillStyle = '#bb6bd9';
    ctx.font = '11px Segoe UI';
    ctx.fillText(twistDetail, canvasWidth / 2, 107);
  }
  
  private drawPlayerTrack(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    marker: MarkerState,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const targetX = x + width * this.targetPosition;
    const markerX = x + width * (marker.locked ? marker.lockPosition : marker.position);
    const score = marker.locked ? this.calculateScore(marker.lockPosition, player.config.id) : 0;
    
    // Player indicator (large, colored circle with number)
    ctx.fillStyle = player.config.color;
    ctx.beginPath();
    ctx.arc(x - 50, y + height / 2, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.config.id + 1}`, x - 50, y + height / 2 + 10);
    
    // Track background (simple dark bar)
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.fill();
    
    // Speed zones - subtle colored regions
    for (const zone of this.boostZones) {
      const zoneX = x + width * zone.start;
      const zoneWidth = width * (zone.end - zone.start);
      ctx.fillStyle = 'rgba(255, 80, 80, 0.25)';
      ctx.fillRect(zoneX, y, zoneWidth, height);
      // Zone label
      ctx.fillStyle = 'rgba(255, 80, 80, 0.6)';
      ctx.font = '10px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('2x SPEED', zoneX + zoneWidth / 2, y + height - 5);
    }
    for (const zone of this.slowZones) {
      const zoneX = x + width * zone.start;
      const zoneWidth = width * (zone.end - zone.start);
      ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
      ctx.fillRect(zoneX, y, zoneWidth, height);
    }
    
    // Target zone highlighting (respecting pulse visibility)
    const showTarget = this.patternState?.isRevealed !== false && 
                       this.patternState?.pulseVisible !== false;
    
    if (showTarget) {
      if (this.pattern?.patternType === 'multi-zone' && this.patternState?.zones) {
        // Draw multiple zones
        for (const zone of this.patternState.zones) {
          const zoneX = x + width * zone.position;
          const zoneWidth = width * zone.width;
          const isPrimary = zone.points === 100;
          
          // Zone highlight
          ctx.fillStyle = isPrimary ? 'rgba(100, 255, 100, 0.25)' : 'rgba(100, 200, 150, 0.15)';
          ctx.fillRect(zoneX - zoneWidth / 2, y, zoneWidth, height);
          
          // Center line
          ctx.strokeStyle = isPrimary ? this.patternColor : '#95e1d3';
          ctx.lineWidth = isPrimary ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(zoneX, y);
          ctx.lineTo(zoneX, y + height);
          ctx.stroke();
          
          // Points label
          ctx.fillStyle = isPrimary ? '#ffe66d' : '#aaaaaa';
          ctx.font = isPrimary ? 'bold 12px Segoe UI' : '10px Segoe UI';
          ctx.textAlign = 'center';
          ctx.fillText(`${zone.points}pts`, zoneX, y - 5);
        }
      } else {
        // Single target zone
        const perfectWidth = width * this.perfectZoneWidth;
        const goodWidth = width * this.goodZoneWidth;
        
        // Good zone (subtle)
        ctx.fillStyle = 'rgba(100, 255, 100, 0.15)';
        ctx.fillRect(targetX - goodWidth / 2, y, goodWidth, height);
        
        // Perfect zone (brighter, pulsing)
        const pulse = 0.3 + Math.sin(this.pulsePhase * 4) * 0.2;
        const patternRGB = this.hexToRgb(this.patternColor);
        ctx.fillStyle = `rgba(${patternRGB.r}, ${patternRGB.g}, ${patternRGB.b}, ${pulse})`;
        ctx.fillRect(targetX - perfectWidth / 2, y, perfectWidth, height);
        
        // Center line (the target)
        ctx.strokeStyle = this.patternColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(targetX, y);
        ctx.lineTo(targetX, y + height);
        ctx.stroke();
      }
    } else {
      // Target hidden - show "?" indicator
      ctx.fillStyle = 'rgba(255, 230, 109, 0.3)';
      ctx.font = 'bold 32px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('?', x + width / 2, y + height / 2 + 12);
    }
    
    // LOCKED STATE - dramatic feedback
    if (marker.locked) {
      this.renderLockedMarker(ctx, player, marker, x, y, width, height, targetX, markerX, score);
    } else if (marker.isLocking) {
      // LOCKING STATE (delayed lock in progress)
      this.renderLockingMarker(ctx, player, marker, x, y, width, height, markerX);
    } else {
      // MOVING STATE
      this.renderMovingMarker(ctx, player, marker, x, y, width, height, markerX);
    }
  }
  
  private renderLockedMarker(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    marker: MarkerState,
    x: number, y: number, _width: number, height: number,
    targetX: number, markerX: number, score: number
  ): void {
    // Expanding impact ring
    if (marker.impactRingSize > 0 && marker.impactRingSize < 80) {
      const ringAlpha = 1 - marker.impactRingSize / 80;
      ctx.strokeStyle = player.config.color + Math.floor(ringAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(markerX, y + height / 2, marker.impactRingSize, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Distance line from marker to target
    const distance = Math.abs(markerX - targetX);
    if (distance > 2) {
      ctx.strokeStyle = score >= 70 ? '#4ecdc4' : '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(markerX, y + height / 2);
      ctx.lineTo(targetX, y + height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Locked marker (solid, glowing)
    ctx.shadowColor = player.config.color;
    ctx.shadowBlur = 30;
    ctx.fillStyle = player.config.color;
    ctx.beginPath();
    ctx.roundRect(markerX - 12, y + 8, 24, height - 16, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // BIG SCORE DISPLAY
    const isPerfect = score === 100;
    const isGood = score >= 70;
    
    const scoreBgColor = marker.wasAutoLocked ? '#444444' : (isPerfect ? '#ffe66d' : isGood ? '#4ecdc4' : '#555555');
    ctx.fillStyle = scoreBgColor;
    ctx.beginPath();
    ctx.roundRect(markerX - 40, y + height / 2 - 22, 80, 44, 6);
    ctx.fill();
    
    ctx.fillStyle = isPerfect ? '#000000' : '#ffffff';
    ctx.font = 'bold 28px Segoe UI';
    ctx.textAlign = 'center';
    
    if (marker.wasAutoLocked) {
      ctx.fillText('0', markerX, y + height / 2 + 10);
    } else {
      ctx.fillText(isPerfect ? '100!' : `+${score}`, markerX, y + height / 2 + 10);
    }
    
    // Result label
    if (marker.wasAutoLocked) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText('TIMEOUT!', x - 35, y + height / 2 + 35);
    } else if (isPerfect) {
      ctx.fillStyle = '#ffe66d';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText('PERFECT!', x - 35, y + height / 2 + 35);
    } else if (score < 30) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText('MISS', x - 35, y + height / 2 + 35);
    }
    ctx.textAlign = 'center';
  }
  
  private renderLockingMarker(
    ctx: CanvasRenderingContext2D,
    _player: PlayerState,
    marker: MarkerState,
    x: number, y: number, width: number, height: number,
    markerX: number
  ): void {
    // Show where press happened
    const pressX = x + width * marker.pressPosition;
    ctx.strokeStyle = '#e056fd44';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pressX, y);
    ctx.lineTo(pressX, y + height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Delay progress indicator
    const delayProgress = 1 - (marker.delayLockTimer / marker.delayLockDuration);
    
    // Progress bar above marker
    const barWidth = 60;
    const barHeight = 8;
    ctx.fillStyle = '#333333';
    ctx.fillRect(markerX - barWidth / 2, y - 15, barWidth, barHeight);
    ctx.fillStyle = '#e056fd';
    ctx.fillRect(markerX - barWidth / 2, y - 15, barWidth * delayProgress, barHeight);
    
    // Remaining time text
    ctx.fillStyle = '#e056fd';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(`${(marker.delayLockTimer * 1000).toFixed(0)}ms`, markerX, y - 20);
    
    // Pulsing glow on marker
    const lockPulse = Math.sin(this.gameTime * 20) * 0.5 + 0.5;
    ctx.shadowColor = '#e056fd';
    ctx.shadowBlur = 20 * lockPulse;
    
    // Moving marker
    ctx.fillStyle = '#e056fd';
    ctx.beginPath();
    ctx.roundRect(markerX - 10, y + 10, 20, height - 20, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Hourglass icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('⏳', markerX, y + height / 2 + 5);
  }
  
  private renderMovingMarker(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    marker: MarkerState,
    _x: number, y: number, _width: number, height: number,
    markerX: number
  ): void {
    // Urgency border flash when time is low
    if (this.urgencyLevel >= 2) {
      const urgencyPulse = Math.sin(this.gameTime * 12) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(255, 68, 68, ${urgencyPulse * 0.8})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(markerX - 14, y + 6, 28, height - 12, 6);
      ctx.stroke();
    } else if (this.urgencyLevel >= 1) {
      const urgencyPulse = Math.sin(this.gameTime * 6) * 0.3 + 0.3;
      ctx.strokeStyle = `rgba(255, 150, 68, ${urgencyPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(markerX - 12, y + 8, 24, height - 16, 5);
      ctx.stroke();
    }
    
    // Marker visibility (for invisible marker twist)
    if (!marker.isVisible) {
      // Draw ghost/shadow marker
      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.beginPath();
      ctx.roundRect(markerX - 10, y + 10, 20, height - 20, 4);
      ctx.fill();
      
      ctx.fillStyle = '#666666';
      ctx.font = '12px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('?', markerX, y + height / 2 + 4);
      return;
    }
    
    // Marker glow in danger zone
    if (marker.isInBoostZone) {
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 15;
    }
    
    // Moving marker
    ctx.fillStyle = player.config.color;
    ctx.beginPath();
    ctx.roundRect(markerX - 10, y + 10, 20, height - 20, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Direction indicator
    const arrow = marker.direction > 0 ? '→' : '←';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(arrow, markerX, y + height / 2 + 5);
  }
  
  handleInput(playerId: number, hand?: 'left' | 'right'): void {
    // Solo mode: handle left/right hand input
    if (this.isSoloMode) {
      this.handleSoloInput(hand);
      return;
    }
    
    const marker = this.markers.get(playerId);
    const player = this.players.find(p => p.config.id === playerId);
    
    if (marker && !marker.locked && !marker.isLocking && player) {
      // Check for delayed lock twist
      if (this.pattern?.twist?.type === 'delayedLock') {
        // Start delayed lock - marker keeps moving for specified delay
        marker.isLocking = true;
        marker.delayLockTimer = this.pattern.twist.delay;
        marker.delayLockDuration = this.pattern.twist.delay;
        marker.pressPosition = marker.position;
        
        // Visual feedback that lock is pending
        particles.sparkle(
          this.trackPadding + this.trackWidth * marker.position,
          140,
          '#e056fd',
          5
        );
      } else if (this.pattern?.twist?.type === 'reverseOnLock') {
        // Reverse direction then lock
        marker.direction *= -1;
        // Small delay for the reverse effect
        marker.isLocking = true;
        marker.delayLockTimer = 0.15;
        marker.delayLockDuration = 0.15;
        marker.pressPosition = marker.position;
        
        particles.sparkle(
          this.trackPadding + this.trackWidth * marker.position,
          140,
          '#ffe66d',
          8
        );
      } else {
        // Normal instant lock
        marker.locked = true;
        marker.lockPosition = marker.position;
        marker.lockAnimTime = 0;
        marker.impactRingSize = 1;
        
        this.triggerLockParticles(playerId, marker.lockPosition);
      }
    }
  }
  
  private handleSoloInput(hand?: 'left' | 'right'): void {
    const { CANVAS_HEIGHT } = GAME_CONFIG;
    
    // Determine which marker to lock based on the hand
    if (hand === 'left' && this.soloLeftMarker && !this.soloLeftMarker.locked) {
      this.soloLeftMarker.locked = true;
      this.soloLeftMarker.lockPosition = this.soloLeftMarker.position;
      this.soloLeftMarker.lockAnimTime = 0;
      this.soloLeftMarker.impactRingSize = 1;
      
      // Particle effect
      const barY = 130 + (CANVAS_HEIGHT - 250) * this.soloLeftMarker.lockPosition;
      const score = this.calculateSoloScore(this.soloLeftMarker.lockPosition, this.soloLeftTarget);
      if (score >= 80) {
        particles.burst(180, barY, '#ffe66d', 20);
      } else if (score >= 50) {
        particles.burst(180, barY, '#ff6b6b', 12);
      } else {
        particles.sparkle(180, barY, '#666666', 8);
      }
    } else if (hand === 'right' && this.soloRightMarker && !this.soloRightMarker.locked) {
      this.soloRightMarker.locked = true;
      this.soloRightMarker.lockPosition = this.soloRightMarker.position;
      this.soloRightMarker.lockAnimTime = 0;
      this.soloRightMarker.impactRingSize = 1;
      
      // Particle effect
      const barY = 130 + (CANVAS_HEIGHT - 250) * this.soloRightMarker.lockPosition;
      const score = this.calculateSoloScore(this.soloRightMarker.lockPosition, this.soloRightTarget);
      if (score >= 80) {
        particles.burst(GAME_CONFIG.CANVAS_WIDTH - 180, barY, '#ffe66d', 20);
      } else if (score >= 50) {
        particles.burst(GAME_CONFIG.CANVAS_WIDTH - 180, barY, '#4ecdc4', 12);
      } else {
        particles.sparkle(GAME_CONFIG.CANVAS_WIDTH - 180, barY, '#666666', 8);
      }
    }
  }
  
  isComplete(): boolean {
    // Solo mode: both markers must be locked
    if (this.isSoloMode) {
      return (this.soloLeftMarker?.locked ?? false) && (this.soloRightMarker?.locked ?? false);
    }
    
    for (const [, marker] of this.markers) {
      if (!marker.locked) return false;
    }
    return true;
  }
  
  getScores(): Map<number, number> {
    const scores = new Map<number, number>();
    
    // Solo mode: return average of both hands
    if (this.isSoloMode) {
      const leftScore = this.soloLeftMarker?.locked 
        ? this.calculateSoloScore(this.soloLeftMarker.lockPosition, this.soloLeftTarget)
        : 0;
      const rightScore = this.soloRightMarker?.locked
        ? this.calculateSoloScore(this.soloRightMarker.lockPosition, this.soloRightTarget)
        : 0;
      scores.set(0, Math.round((leftScore + rightScore) / 2));
      return scores;
    }
    
    this.markers.forEach((marker, playerId) => {
      // Auto-locked players get 0 points (penalty for passive play)
      if (marker.wasAutoLocked) {
        scores.set(playerId, 0);
      } else {
        const position = marker.locked ? marker.lockPosition : marker.position;
        scores.set(playerId, this.calculateScore(position, playerId));
      }
    });
    
    return scores;
  }
  
  private calculateScore(position: number, playerId?: number): number {
    // Multi-zone scoring
    if (this.pattern?.patternType === 'multi-zone' && this.patternState?.zones) {
      let bestScore = 0;
      for (const zone of this.patternState.zones) {
        const distance = Math.abs(position - zone.position);
        if (distance <= zone.width / 2) {
          // In zone - calculate score based on distance from center
          const normalizedDist = distance / (zone.width / 2);
          const zoneScore = Math.round(zone.points * (1 - normalizedDist * 0.3));
          bestScore = Math.max(bestScore, zoneScore);
        }
      }
      if (bestScore > 0) return bestScore;
      
      // Not in any zone - calculate penalty score based on nearest zone
      let minDist = 1;
      for (const zone of this.patternState.zones) {
        minDist = Math.min(minDist, Math.abs(position - zone.position));
      }
      return Math.max(0, Math.round(50 * (1 - minDist * 2)));
    }
    
    // Standard single-target scoring
    const distance = Math.abs(position - this.targetPosition);
    
    // Fail-soft: slightly wider perfect zone for struggling players
    let effectivePerfectWidth = this.perfectZoneWidth;
    let effectiveGoodWidth = this.goodZoneWidth;
    
    if (playerId !== undefined) {
      const marker = this.markers.get(playerId);
      if (marker && marker.assistLevel > 0) {
        // Up to 20% wider zones at max assist (subtle)
        const widthBonus = 1 + (marker.assistLevel * 0.07);
        effectivePerfectWidth *= widthBonus;
        effectiveGoodWidth *= widthBonus;
      }
    }
    
    // Perfect zone - 100 points
    if (distance <= effectivePerfectWidth / 2) {
      return 100;
    }
    
    // Good zone - 70-99 points
    if (distance <= effectiveGoodWidth / 2) {
      const normalizedDist = (distance - effectivePerfectWidth / 2) / 
                             (effectiveGoodWidth / 2 - effectivePerfectWidth / 2);
      return Math.round(100 - normalizedDist * 30);
    }
    
    // Outside good zone - score drops faster
    const maxDistance = 0.5;
    const normalizedDist = (distance - effectiveGoodWidth / 2) / 
                           (maxDistance - effectiveGoodWidth / 2);
    const score = Math.round(70 * (1 - normalizedDist));
    
    return Math.max(0, score);
  }
  
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }
  
  cleanup(): void {
    this.markers.clear();
    this.players = [];
    this.pattern = null;
    this.patternState = null;
  }
  
  // Called by Game to sync round timer for urgency display
  setRoundTimeRemaining(time: number): void {
    // Escalate urgency: 0 = normal (>5s), 1 = hurry (3-5s), 2 = critical (<3s)
    if (time <= 3) {
      this.urgencyLevel = 2;
    } else if (time <= 5) {
      this.urgencyLevel = 1;
    } else {
      this.urgencyLevel = 0;
    }
  }
  
  // Auto-lock remaining players with penalty (called when time runs out)
  autoLockRemaining(): void {
    this.markers.forEach((marker) => {
      if (!marker.locked && !marker.isLocking) {
        marker.locked = true;
        marker.lockPosition = marker.position;
        marker.wasAutoLocked = true;
        marker.lockAnimTime = 0;
        marker.impactRingSize = 1;
      }
    });
  }
  
  // Get the hand used for this round (solo mode)
  getSoloHand(): 'left' | 'right' | null {
    return this.soloHandForRound;
  }
  
  // Get individual scores for left and right hands (dual-bar solo mode)
  getSoloScores(): { left?: number; right?: number } | null {
    if (!this.isSoloMode) return null;
    
    const result: { left?: number; right?: number } = {};
    
    if (this.soloLeftMarker?.locked) {
      result.left = this.calculateSoloScore(this.soloLeftMarker.lockPosition, this.soloLeftTarget);
    }
    if (this.soloRightMarker?.locked) {
      result.right = this.calculateSoloScore(this.soloRightMarker.lockPosition, this.soloRightTarget);
    }
    
    return result;
  }
}
