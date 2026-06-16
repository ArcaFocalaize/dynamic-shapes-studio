// ============================================================
// PHYSICS — Semplice simulazione per cluster dinamici
// ============================================================

export class PhysicsBlob {
  constructor({ x, y, vx = 0, vy = 0, radius = 60, mass = 1 }) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.radius = radius; this.mass = mass;
    this.ax = 0; this.ay = 0;
  }

  applyForce(fx, fy) {
    this.ax += fx / this.mass;
    this.ay += fy / this.mass;
  }

  update(dt = 0.016) {
    this.vx = (this.vx + this.ax * dt) * 0.98; // damping
    this.vy = (this.vy + this.ay * dt) * 0.98;
    this.x += this.vx;
    this.y += this.vy;
    this.ax = 0; this.ay = 0;
  }

  bounceWalls(w, h) {
    if (this.x < this.radius) { this.x = this.radius; this.vx *= -0.7; }
    if (this.x > w - this.radius) { this.x = w - this.radius; this.vx *= -0.7; }
    if (this.y < this.radius) { this.y = this.radius; this.vy *= -0.7; }
    if (this.y > h - this.radius) { this.y = h - this.radius; this.vy *= -0.7; }
  }
}

/**
 * Applica repulsione tra N blob (evita sovrapposizione)
 */
export function applyRepulsion(blobs, strength = 0.5) {
  for (let i = 0; i < blobs.length; i++) {
    for (let j = i + 1; j < blobs.length; j++) {
      const dx = blobs[j].x - blobs[i].x;
      const dy = blobs[j].y - blobs[i].y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 0.01;
      const minDist = blobs[i].radius + blobs[j].radius;
      if (dist < minDist) {
        const force = (minDist - dist) * strength / dist;
        blobs[i].applyForce(-dx * force, -dy * force);
        blobs[j].applyForce( dx * force,  dy * force);
      }
    }
  }
}

/**
 * Attrazione verso punto centrale
 */
export function applyAttraction(blobs, cx, cy, strength = 0.02) {
  for (const b of blobs) {
    const dx = cx - b.x, dy = cy - b.y;
    b.applyForce(dx * strength, dy * strength);
  }
}