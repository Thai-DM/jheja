/**
 * Celestial Universe & Particle Engine
 * Starfield, Shooting Stars, Organic Fireflies, 3D Falling Petals & Heart Constellation
 * Target: 60 FPS, Canvas 2D with sub-pixel rendering and high-DPI scaling
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.stars = [];
    this.shootingStars = [];
    this.fireflies = [];
    this.petals = [];
    this.heartParticles = [];

    this.mode = 'mystery'; // 'mystery' | 'magic' | 'gift' | 'letter' | 'climax'
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.lastTime = performance.now();
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate Stars (3 depth layers for parallax)
    const starCount = Math.floor((this.width * this.height) / 3800);
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.8 + 0.2, // 0.2 (slow) to 1.0 (fast)
        color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#fed7e2' : '#fef3c7')
      });
    }

    // Prepare Fireflies (will be activated in Scene 2)
    const fireflyCount = Math.min(35, Math.floor(this.width / 25));
    this.fireflies = [];
    for (let i = 0; i < fireflyCount; i++) {
      this.fireflies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.4,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Prepare Petals
    const petalCount = Math.min(28, Math.floor(this.width / 32));
    this.petals = [];
    for (let i = 0; i < petalCount; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Build parametric heart points for Scene 5
    this.buildHeartPoints();

    // Start Animation Loop
    requestAnimationFrame((t) => this.render(t));

    // Schedule shooting stars occasionally
    setInterval(() => {
      if (Math.random() > 0.4 && this.shootingStars.length < 3) {
        this.addShootingStar();
      }
    }, 3200);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.buildHeartPoints();
  }

  setMode(newMode) {
    this.mode = newMode;
  }

  createPetal(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20,
      size: Math.random() * 12 + 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.2 + 0.8, // gentle falling speed
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vRotX: (Math.random() - 0.5) * 0.04,
      vRotY: (Math.random() - 0.5) * 0.04,
      vRotZ: (Math.random() - 0.5) * 0.03,
      color: Math.random() > 0.5 ? '#f472b6' : (Math.random() > 0.5 ? '#fbcfe8' : '#ec4899'),
      opacity: Math.random() * 0.4 + 0.5
    };
  }

  addShootingStar() {
    const startX = Math.random() * this.width * 0.9;
    const startY = Math.random() * this.height * 0.4;
    const length = Math.random() * 120 + 80;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2; // ~45 deg
    const speed = Math.random() * 10 + 8;

    this.shootingStars.push({
      x: startX,
      y: startY,
      len: length,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1.0,
      decay: Math.random() * 0.025 + 0.015
    });
  }

  buildHeartPoints() {
    this.heartParticles = [];
    const count = 70;
    const centerX = this.width / 2;
    // Position heart nicely centered or slightly elevated
    const centerY = this.height * 0.45;
    const scale = Math.min(this.width, this.height) * 0.013;

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      // Parametric Heart Formula
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      this.heartParticles.push({
        targetX: centerX + hx * scale,
        targetY: centerY + hy * scale,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.5 + 0.5,
        t: t
      });
    }
  }

  render(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Clear frame with soft celestial gradient
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Starfield
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (!this.isReducedMotion) {
        s.twinklePhase += s.twinkleSpeed;
        // In climax mode, stars swirl slightly
        if (this.mode === 'climax') {
          s.x += Math.sin(currentTime * 0.001 + s.y) * 0.4;
          s.y += Math.cos(currentTime * 0.001 + s.x) * 0.2;
        }
      }
      const alpha = Math.max(0.1, Math.min(1, s.alpha + Math.sin(s.twinklePhase) * 0.3));

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fill();

      // Soft glow on brighter stars
      if (s.radius > 1.2) {
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = s.color;
        this.ctx.globalAlpha = alpha * 0.25;
        this.ctx.fill();
      }
    }

    // 2. Draw Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.alpha -= ss.decay;

      if (ss.alpha <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = ss.x - ss.vx * 3.5;
      const tailY = ss.y - ss.vy * 3.5;

      const grad = this.ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
      grad.addColorStop(0.3, `rgba(254, 215, 226, ${ss.alpha * 0.7})`);
      grad.addColorStop(1, `rgba(251, 191, 36, 0)`);

      this.ctx.beginPath();
      this.ctx.moveTo(ss.x, ss.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2.2;
      this.ctx.stroke();

      // Bright head point
      this.ctx.beginPath();
      this.ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = ss.alpha;
      this.ctx.fill();
    }

    // 3. Draw Fireflies (Active from Scene 2 onwards)
    if (this.mode !== 'mystery') {
      for (let i = 0; i < this.fireflies.length; i++) {
        const ff = this.fireflies[i];
        if (!this.isReducedMotion) {
          ff.x += ff.vx + Math.sin(currentTime * 0.002 + i) * 0.4;
          ff.y += ff.vy + Math.cos(currentTime * 0.002 + i) * 0.4;
          ff.pulsePhase += ff.pulseSpeed;

          // Wrap boundaries
          if (ff.x < 0) ff.x = this.width;
          if (ff.x > this.width) ff.x = 0;
          if (ff.y < 0) ff.y = this.height;
          if (ff.y > this.height) ff.y = 0;
        }

        const alpha = Math.max(0.1, ff.baseAlpha + Math.sin(ff.pulsePhase) * 0.4);

        // Core dot
        this.ctx.beginPath();
        this.ctx.arc(ff.x, ff.y, ff.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fef08a';
        this.ctx.globalAlpha = alpha;
        this.ctx.fill();

        // Warm radial halo
        const haloGrad = this.ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.radius * 4.5);
        haloGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha * 0.6})`);
        haloGrad.addColorStop(0.5, `rgba(251, 207, 232, ${alpha * 0.25})`);
        haloGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

        this.ctx.beginPath();
        this.ctx.arc(ff.x, ff.y, ff.radius * 4.5, 0, Math.PI * 2);
        this.ctx.fillStyle = haloGrad;
        this.ctx.globalAlpha = 1;
        this.ctx.fill();
      }
    }

    // 4. Draw Floating Rose Petals (Scene 2, 3, 4, 5)
    if (this.mode !== 'mystery') {
      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];
        if (!this.isReducedMotion) {
          if (this.mode === 'climax') {
            // In climax mode, petals float UPWARD against gravity towards the sky!
            p.y -= p.vy * 1.5;
            p.x += Math.sin(currentTime * 0.002 + i) * 1.8;
            if (p.y < -30) {
              p.y = this.height + 20;
              p.x = Math.random() * this.width;
            }
          } else {
            // Normal gentle falling
            p.y += p.vy;
            p.x += Math.sin(currentTime * 0.0015 + i) * 1.2;
            if (p.y > this.height + 30) {
              this.petals[i] = this.createPetal(false);
            }
          }
          p.rotX += p.vRotX;
          p.rotY += p.vRotY;
          p.rotZ += p.vRotZ;
        }

        // Draw 3D projected petal polygon
        this.draw3DPetal(p);
      }
    }

    // 5. Scene 5: Converging Constellation Heart
    if (this.mode === 'climax') {
      this.drawHeartConstellation(currentTime);
    }

    this.ctx.globalAlpha = 1.0;
    requestAnimationFrame((t) => this.render(t));
  }

  draw3DPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotZ);

    const scaleX = Math.cos(p.rotY);
    const scaleY = Math.cos(p.rotX);
    this.ctx.scale(scaleX, scaleY);

    this.ctx.beginPath();
    // Beautiful curved teardrop petal shape
    this.ctx.moveTo(0, -p.size);
    this.ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.7, p.size * 0.9, p.size * 0.4, 0, p.size);
    this.ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.4, -p.size * 0.8, -p.size * 0.7, 0, -p.size);

    this.ctx.fillStyle = p.color;
    this.ctx.globalAlpha = p.opacity;
    this.ctx.fill();

    // Subtle petal vein highlight
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 0.8;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size * 0.8);
    this.ctx.quadraticCurveTo(p.size * 0.2, 0, 0, p.size * 0.8);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawHeartConstellation(currentTime) {
    // Interpolate points smoothly towards the target heart outline
    const lerpSpeed = 0.045;
    for (let i = 0; i < this.heartParticles.length; i++) {
      const hp = this.heartParticles[i];
      hp.x += (hp.targetX - hp.x) * lerpSpeed;
      hp.y += (hp.targetY - hp.y) * lerpSpeed;

      // Small breathing flutter
      const pulse = Math.sin(currentTime * 0.003 + hp.t * 2) * 2;
      const drawX = hp.x + Math.cos(hp.t) * pulse;
      const drawY = hp.y + Math.sin(hp.t) * pulse;

      // Draw starlight node
      this.ctx.beginPath();
      this.ctx.arc(drawX, drawY, hp.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fed7e2';
      this.ctx.globalAlpha = hp.alpha;
      this.ctx.fill();

      // Connect neighbor points with shimmering constellation lines
      if (i > 0) {
        const prev = this.heartParticles[i - 1];
        this.ctx.beginPath();
        this.ctx.moveTo(drawX, drawY);
        this.ctx.lineTo(prev.x, prev.y);
        this.ctx.strokeStyle = 'rgba(251, 207, 232, 0.45)';
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();
      }
    }

    // Connect last node to first
    if (this.heartParticles.length > 1) {
      const first = this.heartParticles[0];
      const last = this.heartParticles[this.heartParticles.length - 1];
      this.ctx.beginPath();
      this.ctx.moveTo(last.x, last.y);
      this.ctx.lineTo(first.x, first.y);
      this.ctx.strokeStyle = 'rgba(251, 207, 232, 0.45)';
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    }
  }
}

// Particle Engine Singleton
window.particleEngine = new ParticleEngine('universe-canvas');
