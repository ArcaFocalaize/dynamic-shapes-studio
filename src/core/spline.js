// ============================================================
// SPLINE — Catmull-Rom → SVG Path / Canvas Path
// ============================================================

/**
 * Converte array di punti [{x,y}] in SVG path string smooth (Catmull-Rom)
 * @param {Array<{x:number,y:number}>} pts
 * @param {number} tension 0..1 (0=lineare, 1=massima curva)
 * @param {boolean} closed
 * @returns {string} SVG path d string
 */
export function pointsToSVGPath(pts, tension = 0.5, closed = true) {
  if (pts.length < 3) return '';
  const points = closed ? [...pts, pts[0], pts[1]] : pts;
  let d = `M ${pts[0].x},${pts[0].y}`;

  for (let i = 0; i < (closed ? pts.length : pts.length - 1); i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  if (closed) d += ' Z';
  return d;
}

/**
 * Disegna una spline smooth su un CanvasRenderingContext2D
 */
export function drawSplineOnCanvas(ctx, pts, tension = 0.5, closed = true) {
  if (pts.length < 3) return;
  const points = closed ? [...pts, pts[0], pts[1]] : pts;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 0; i < (closed ? pts.length : pts.length - 1); i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  if (closed) ctx.closePath();
}