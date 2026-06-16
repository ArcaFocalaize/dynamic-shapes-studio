// ============================================================
// CANVAS 2D RENDERER
// ============================================================
import { drawSplineOnCanvas } from '../core/spline.js';

export class CanvasRenderer {
  constructor({ container, width = 600, height = 600, pixelRatio = window.devicePixelRatio || 1 }) {
    this.width = width;
    this.height = height;
    this.dpr = pixelRatio;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(pixelRatio, pixelRatio);

    if (container) container.appendChild(this.canvas);
  }

  clear(color = 'transparent') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    if (color !== 'transparent') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  drawBlob(points, { fill = '#6c63ff', stroke = 'none', strokeWidth = 0, opacity = 1, tension = 0.4, blur = 0 } = {}) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = opacity;
    if (blur > 0) ctx.filter = `blur(${blur}px)`;
    drawSplineOnCanvas(ctx, points, tension, true);
    if (fill !== 'none') { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke !== 'none' && strokeWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawGradientBlob(points, { colorStops = ['#6c63ff','#ff6584'], opacity = 1, tension = 0.4 } = {}) {
    const ctx = this.ctx;
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const cx = xs.reduce((a,b)=>a+b,0)/xs.length;
    const cy = ys.reduce((a,b)=>a+b,0)/ys.length;
    const maxR = Math.max(...points.map(p => Math.hypot(p.x-cx, p.y-cy)));
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    colorStops.forEach((c, i) => grad.addColorStop(i/(colorStops.length-1), c));
    ctx.save();
    ctx.globalAlpha = opacity;
    drawSplineOnCanvas(ctx, points, tension, true);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  /** Applica effetto gooey via compositing */
  drawGooeyGroup(blobsArray, { fill = '#6c63ff', blur = 12 } = {}) {
    const ctx = this.ctx;
    const offscreen = document.createElement('canvas');
    offscreen.width = this.canvas.width;
    offscreen.height = this.canvas.height;
    const octx = offscreen.getContext('2d');
    octx.scale(this.dpr, this.dpr);

    blobsArray.forEach(pts => {
      drawSplineOnCanvas(octx, pts, 0.4, true);
      octx.fillStyle = fill;
      octx.fill();
    });

    ctx.save();
    ctx.filter = `blur(${blur}px) contrast(18)`;
    ctx.drawImage(offscreen, 0, 0);
    ctx.restore();
  }

  toDataURL(type = 'image/png', quality = 1) {
    return this.canvas.toDataURL(type, quality);
  }

  toBlob(callback, type = 'image/png', quality = 1) {
    this.canvas.toBlob(callback, type, quality);
  }

  resize(w, h) {
    this.width = w; this.height = h;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }
}