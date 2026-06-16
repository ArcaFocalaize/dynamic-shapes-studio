// ============================================================
// EXPORT CSS — keyframes animazione, clip-path, border-radius trick
// ============================================================

/**
 * Genera una @keyframes CSS da una sequenza di SVG path strings
 * Utile per animare clip-path o d attribute via CSS puro
 */
export function generateCSSKeyframes({ name = 'blobAnim', paths = [], property = 'clip-path' }) {
  if (!paths.length) return '';

  const steps = paths.map((path, i) => {
    const pct = Math.round((i / (paths.length - 1)) * 100);
    if (property === 'clip-path') {
      return `  ${pct}% { clip-path: path('${path}'); }`;
    } else if (property === 'd') {
      return `  ${pct}% { d: path('${path}'); }`;
    }
    return '';
  });

  return `@keyframes ${name} {\n${steps.join('\n')}\n}`;
}

/**
 * Genera CSS per un elemento blob con border-radius animato
 * Tecnica semplice, compatibilissima, nessun SVG richiesto
 */
export function generateBorderRadiusBlob({ name = 'blobBR', steps = 4, seed = 1 } = {}) {
  const randomBR = (s) => {
    const rng = (n) => {
      let x = Math.sin(n * s + 1) * 10000;
      return Math.floor((x - Math.floor(x)) * 40) + 30;
    };
    return `${rng(1)}% ${rng(2)}% ${rng(3)}% ${rng(4)}% / ${rng(5)}% ${rng(6)}% ${rng(7)}% ${rng(8)}%`;
  };

  const frames = Array.from({ length: steps + 1 }, (_, i) => {
    const pct = Math.round((i / steps) * 100);
    const br = i === steps ? randomBR(0) : randomBR(i + 1);
    return `  ${pct}% { border-radius: ${br}; }`;
  });

  const keyframes = `@keyframes ${name} {\n${frames.join('\n')}\n}`;
  const usage = `.blob-${name} {\n  animation: ${name} 8s ease-in-out infinite alternate;\n  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;\n}`;

  return { keyframes, usage, full: keyframes + '\n\n' + usage };
}

/**
 * Genera un file CSS completo e lo scarica
 */
export function downloadCSS(cssString, filename = 'blob-animation.css') {
  const blob = new Blob([cssString], { type: 'text/css' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Genera CSS Variables per uso in design system
 */
export function generateCSSVariables(config) {
  const lines = Object.entries(config).map(([k, v]) =>
    `  --ds-${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`
  );
  return `:root {\n${lines.join('\n')}\n}`;
}