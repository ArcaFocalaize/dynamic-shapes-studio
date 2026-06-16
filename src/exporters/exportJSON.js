// ============================================================
// EXPORT JSON — config, keyframes, preset, Lottie-like
// ============================================================

/**
 * Serializza la configurazione corrente in JSON
 */
export function configToJSON(config) {
  return JSON.stringify(config, null, 2);
}

/**
 * Scarica la config come file .json
 */
export function downloadJSON(config, filename = 'shape-config.json') {
  const blob = new Blob([configToJSON(config)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
}

/**
 * Genera una struttura Lottie-compatible semplificata per un blob animato
 * (subset Lottie: shape layer con path animato)
 */
export function generateLottieJSON({ name = 'Dynamic Shape', width = 400, height = 400, fps = 30, duration = 3, pathFrames = [] }) {
  const totalFrames = fps * duration;

  const keyframes = pathFrames.map((pathStr, i) => ({
    t: Math.round((i / (pathFrames.length - 1)) * totalFrames),
    s: [{ v: [[0,0]], i: [[0,0]], o: [[0,0]], c: true }], // placeholder
    e: [{ v: [[0,0]], i: [[0,0]], o: [[0,0]], c: true }],
    // SVG path raw incluso come custom property per tool che lo supportano
    _svgPath: pathStr,
  }));

  return {
    v: '5.7.6',
    fr: fps,
    ip: 0,
    op: totalFrames,
    w: width,
    h: height,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Shape Layer',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [width/2, height/2, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ip: 0,
      op: totalFrames,
      st: 0,
      shapes: [{
        ty: 'sh',
        nm: 'Path',
        ks: {
          a: 1,
          k: keyframes,
        },
      }],
    }],
    _dynamicShapesStudio: { version: '1.0.0', generated: new Date().toISOString() },
  };
}

/**
 * Carica una config JSON da stringa o file
 */
export function loadConfigFromJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Invalid JSON config:', e);
    return null;
  }
}

export function loadConfigFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(loadConfigFromJSON(e.target.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}