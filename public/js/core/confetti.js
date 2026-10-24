/**
 * Canvas Particle Confetti Cannon
 */
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(duration = 2500) {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    const colors = ['#facc15', '#38bdf8', '#fb7185', '#22c55e', '#c084fc', '#fb923c'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: this.canvas.width * (0.3 + Math.random() * 0.4),
        y: this.canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (!this.animating) {
      this.animating = true;
      const startTime = performance.now();
      const loop = (now) => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.4; // gravity
          p.rotation += p.vRot;
          p.opacity -= 0.008;

          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0, p.opacity);
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          this.ctx.restore();

          if (p.opacity <= 0 || p.y > this.canvas.height) {
            this.particles.splice(idx, 1);
          }
        });

        if (this.particles.length > 0 && now - startTime < duration) {
          requestAnimationFrame(loop);
        } else {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.particles = [];
          this.animating = false;
        }
      };
      requestAnimationFrame(loop);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfettiCannon;
}
