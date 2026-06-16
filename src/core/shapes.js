// ============================================================
// SHAPES GENERATOR — Blob, Polygon, Star, Metaball field, Cluster
// ============================================================
import { createNoise } from './noise.js';
import { pointsToSVGPath } from './spline.js';

/**
 * Genera un blob organico come array di punti polari perturbati da noise
 */
export function generateBlob({
  cx = 200, cy = 200,
  radius = 100,
  numPoints = 12,
  noiseScale = 0.8,
  noiseStrength = 40,
  timeOffset = 0,
  seed = 0.5,
  tension = 0.4,
  closed = true,
} = {}) {
  const { noise2D } = createNoise(seed);
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const nx = Math.cos(angle) * noiseScale + timeOffset;
    const ny = Math.sin(angle) * noiseScale + timeOffset;
    const noiseVal = noise2D(nx, ny); // [-1, 1]
    const r = radius + noiseVal * noiseStrength;
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  return { points, path: pointsToSVGPath(points, tension, closed) };
}

/**
 * Genera un poligono regolare
 */
export function generatePolygon({ cx=200, cy=200, radius=100, sides=6, rotation=0 } = {}) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + rotation;
    points.push({ x: cx + Math.cos(angle)*radius, y: cy + Math.sin(angle)*radius });
  }
  return { points, path: pointsToSVGPath(points, 0, true) };
}

/**
 * Genera una stella
 */
export function generateStar({ cx=200, cy=200, outerR=100, innerR=45, points=5, rotation=0 } = {}) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 + rotation - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return { points: pts, path: pointsToSVGPath(pts, 0.2, true) };
}

/**
 * Genera un cluster di N blob (agglomerato)
 */
export function generateCluster({
  cx = 300, cy = 300,
  count = 5,
  spreadRadius = 120,
  blobRadius = 50,
  noiseStrength = 20,
  timeOffset = 0,
  seed = 0.5,
  blobPoints = 8,
} = {}) {
  const { noise2D } = createNoise(seed);
  const shapes = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = spreadRadius * (0.5 + noise2D(i * 0.7 + seed, timeOffset * 0.3) * 0.5);
    const bx = cx + Math.cos(angle) * dist;
    const by = cy + Math.sin(angle) * dist;
    const shape = generateBlob({
      cx: bx, cy: by,
      radius: blobRadius * (0.7 + noise2D(i * 1.3, timeOffset) * 0.3),
      numPoints: blobPoints,
      noiseStrength,
      timeOffset: timeOffset + i * 0.4,
      seed: seed + i * 0.17,
    });
    shapes.push(shape);
  }

  return shapes;
}

/**
 * Genera il campo scalare per metaball (per marching squares)
 */
export function generateMetaballField({ balls, width, height, resolution = 8 }) {
  const cols = Math.ceil(width / resolution);
  const rows = Math.ceil(height / resolution);
  const field = new Float32Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * resolution;
      const py = y * resolution;
      let sum = 0;
      for (const b of balls) {
        const dx = px - b.x, dy = py - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 1) sum += 1000;
        else sum += (b.r * b.r) / d2;
      }
      field[y * cols + x] = sum;
    }
  }

  return { field, cols, rows, resolution };
}

/**
 * Interpolazione lineare blob: stato A → stato B (t: 0..1)
 */
export function interpolateBlob(blobA, blobB, t) {
  const count = Math.min(blobA.points.length, blobB.points.length);
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: blobA.points[i].x + (blobB.points[i].x - blobA.points[i].x) * t,
      y: blobA.points[i].y + (blobB.points[i].y - blobA.points[i].y) * t,
    });
  }
  return { points, path: pointsToSVGPath(points, 0.4, true) };
}

/**
 * Easing functions
 */
export const Easing = {
  linear: t => t,
  easeInOut: t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t,
  easeIn: t => t*t,
  easeOut: t => t*(2-t),
  elastic: t => {
    const c4 = (2*Math.PI)/3;
    return t === 0 ? 0 : t === 1 ? 1
      : Math.pow(2,-10*t) * Math.sin((t*10-0.75)*c4) + 1;
  },
  bounce: t => {
    if(t<1/2.75) return 7.5625*t*t;
    if(t<2/2.75) return 7.5625*(t-=1.5/2.75)*t+0.75;
    if(t<2.5/2.75) return 7.5625*(t-=2.25/2.75)*t+0.9375;
    return 7.5625*(t-=2.625/2.75)*t+0.984375;
  }
};