// ============================================================
// SVG RENDERER
// ============================================================

export class SVGRenderer {
  constructor({ container, width = 600, height = 600 }) {
    this.width = width;
    this.height = height;
    this.ns = 'http://www.w3.org/2000/svg';

    // SVG root
    this.svg = document.createElementNS(this.ns, 'svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.style.overflow = 'visible';

    // Defs (gradienti, filtri)
    this.defs = document.createElementNS(this.ns, 'defs');
    this.svg.appendChild(this.defs);

    // Layer principale
    this.layer = document.createElementNS(this.ns, 'g');
    this.svg.appendChild(this.layer);

    if (container) container.appendChild(this.svg);
    this._paths = new Map();
  }

  /** Aggiunge/aggiorna un path per id */
  setPath(id, d, style = {}) {
    let el = this._paths.get(id);
    if (!el) {
      el = document.createElementNS(this.ns, 'path');
      el.setAttribute('id', id);
      this.layer.appendChild(el);
      this._paths.set(id, el);
    }
    el.setAttribute('d', d);
    Object.assign(el.style, style);
    return el;
  }

  /** Aggiunge un gradiente e ritorna il suo id */
  addGradient({ id, type = 'radial', stops = [], cx=0.5, cy=0.5, r=0.5, x1=0, y1=0, x2=1, y2=0 }) {
    const existing = this.defs.querySelector(`#${id}`);
    if (existing) existing.remove();

    const grad = document.createElementNS(this.ns, type === 'radial' ? 'radialGradient' : 'linearGradient');
    grad.setAttribute('id', id);
    grad.setAttribute('gradientUnits', 'objectBoundingBox');
    if (type === 'radial') {
      grad.setAttribute('cx', cx); grad.setAttribute('cy', cy); grad.setAttribute('r', r);
    } else {
      grad.setAttribute('x1', x1); grad.setAttribute('y1', y1);
      grad.setAttribute('x2', x2); grad.setAttribute('y2', y2);
    }
    stops.forEach(({ offset, color, opacity = 1 }) => {
      const s = document.createElementNS(this.ns, 'stop');
      s.setAttribute('offset', offset);
      s.setAttribute('stop-color', color);
      s.setAttribute('stop-opacity', opacity);
      grad.appendChild(s);
    });
    this.defs.appendChild(grad);
    return id;
  }

  /** Aggiunge filtro gooey (blur+contrast per metaball effect) */
  addGooeyFilter(id = 'gooey', blur = 10, contrast = 18, cutoff = 7) {
    const filter = document.createElementNS(this.ns, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-50%'); filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%'); filter.setAttribute('height', '200%');

    const fBlur = document.createElementNS(this.ns, 'feGaussianBlur');
    fBlur.setAttribute('in', 'SourceGraphic');
    fBlur.setAttribute('stdDeviation', blur);
    fBlur.setAttribute('result', 'blur');

    const fMatrix = document.createElementNS(this.ns, 'feColorMatrix');
    fMatrix.setAttribute('in', 'blur');
    fMatrix.setAttribute('mode', 'matrix');
    fMatrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} -${cutoff}`);

    filter.appendChild(fBlur);
    filter.appendChild(fMatrix);
    this.defs.appendChild(filter);
    return id;
  }

  /** Pulisce il layer */
  clear() {
    this._paths.forEach(el => el.remove());
    this._paths.clear();
  }

  /** Ritorna la stringa SVG completa */
  serialize() {
    const clone = this.svg.cloneNode(true);
    clone.setAttribute('xmlns', this.ns);
    return new XMLSerializer().serializeToString(clone);
  }

  resize(w, h) {
    this.width = w; this.height = h;
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.svg.setAttribute('width', w);
    this.svg.setAttribute('height', h);
  }
}