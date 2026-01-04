// Particle system for visual effects

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'circle' | 'square' | 'star' | 'ring';
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  fade: boolean;
  shrink: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += p.gravity * deltaTime;
      p.life -= deltaTime;
      p.rotation += p.rotationSpeed * deltaTime;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife;
      const alpha = p.fade ? lifeRatio : 1;
      const size = p.shrink ? p.size * lifeRatio : p.size;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      
      switch (p.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(-size / 2, -size / 2, size, size);
          break;
          
        case 'star':
          this.drawStar(ctx, 0, 0, 5, size, size / 2);
          break;
          
        case 'ring':
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    }
  }
  
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
  
  // Explosion burst effect
  burst(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 100 + Math.random() * 200;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        size: 4 + Math.random() * 8,
        color,
        type: Math.random() > 0.5 ? 'circle' : 'square',
        rotation: 0,
        rotationSpeed: Math.random() * 10 - 5,
        gravity: 200,
        fade: true,
        shrink: true,
      });
    }
  }
  
  // Confetti effect
  confetti(x: number, y: number, colors: string[], count: number = 50): void {
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x: x + Math.random() * 200 - 100,
        y,
        vx: Math.random() * 300 - 150,
        vy: -200 - Math.random() * 300,
        life: 2 + Math.random() * 2,
        maxLife: 4,
        size: 6 + Math.random() * 6,
        color,
        type: 'square',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 15 - 7.5,
        gravity: 400,
        fade: true,
        shrink: false,
      });
    }
  }
  
  // Sparkle effect
  sparkle(x: number, y: number, color: string, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + Math.random() * 40 - 20,
        y: y + Math.random() * 40 - 20,
        vx: Math.random() * 60 - 30,
        vy: Math.random() * 60 - 30,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        size: 3 + Math.random() * 5,
        color,
        type: 'star',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 5,
        gravity: 0,
        fade: true,
        shrink: true,
      });
    }
  }
  
  // Ring expansion effect
  ring(x: number, y: number, color: string): void {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.4,
      maxLife: 0.4,
      size: 10,
      color,
      type: 'ring',
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0,
      fade: true,
      shrink: false,
    });
  }
  
  // Trail effect
  trail(x: number, y: number, color: string): void {
    this.particles.push({
      x,
      y,
      vx: Math.random() * 20 - 10,
      vy: Math.random() * 20 - 10,
      life: 0.2 + Math.random() * 0.2,
      maxLife: 0.4,
      size: 3 + Math.random() * 4,
      color,
      type: 'circle',
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0,
      fade: true,
      shrink: true,
    });
  }
  
  clear(): void {
    this.particles = [];
  }
  
  get count(): number {
    return this.particles.length;
  }
}

// Global particle system instance
export const particles = new ParticleSystem();
