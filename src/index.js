// ============================================================
// DYNAMIC SHAPES STUDIO — Entry point
// Importa ed esporta tutto per uso come libreria ES module
// ============================================================

// Core
export { createNoise }                     from './core/noise.js';
export { pointsToSVGPath, drawSplineOnCanvas } from './core/spline.js';
export {
  generateBlob, generatePolygon, generateStar,
  generateCluster, generateMetaballField,
  interpolateBlob, Easing,
}                                           from './core/shapes.js';
export { PhysicsBlob, applyRepulsion, applyAttraction } from './core/physics.js';

// Renderers
export { SVGRenderer }    from './renderers/svg.js';
export { CanvasRenderer } from './renderers/canvas.js';
export { WebGLRenderer }  from './renderers/webgl.js';

// Exporters
export { downloadSVG, getSVGString, svgToDataURI, copySVGToClipboard } from './exporters/exportSVG.js';
export { downloadCanvasPNG, svgToPNG, canvasToBlob }                   from './exporters/exportPNG.js';
export { generateCSSKeyframes, generateBorderRadiusBlob, downloadCSS, generateCSSVariables } from './exporters/exportCSS.js';
export { configToJSON, downloadJSON, generateLottieJSON, loadConfigFromJSON, loadConfigFromFile } from './exporters/exportJSON.js';
export { generateReactComponent, generateReactHook, downloadReactComponent } from './exporters/exportReact.js';
export { GIFRecorder }    from './exporters/exportGIF.js';

// ─── Animazione helper ───────────────────────────────────────

/**
 * Loop di animazione con blob noise-driven su SVG o Canvas
 * @returns {function} stop() — chiama per fermare il loop
 */
export function createBlobAnimation(config, onFrame) {
  const {
    cx, cy, radius, numPoints = 12,
    noiseStrength = 40, noiseScale = 0.8,
    speed = 0.003, seed = 0.5, tension = 0.4,
  } = config;

  let time = 0;
  let raf;

  const tick = () => {
    time += speed;
    const { points, path } = generateBlob({
      cx, cy, radius, numPoints,
      noiseStrength, noiseScale,
      timeOffset: time, seed, tension,
    });
    onFrame({ points, path, time });
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/**
 * Animazione cluster con fisica
 * @returns {function} stop()
 */
export function createClusterAnimation(config, onFrame) {
  const {
    cx = 300, cy = 300,
    count = 5,
    spreadRadius = 120,
    blobRadius = 50,
    noiseStrength = 20,
    speed = 0.002,
    seed = 0.5,
    width = 600,
    height = 600,
  } = config;

  const { PhysicsBlob: PB, applyRepulsion: aR, applyAttraction: aA } = {
    PhysicsBlob, applyRepulsion, applyAttraction,
  };

  const blobs = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return new PB({
      x: cx + Math.cos(angle) * spreadRadius * 0.5,
      y: cy + Math.sin(angle) * spreadRadius * 0.5,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: blobRadius,
    });
  });

  let time = 0, raf;