// ============================================================
// EXPORT PNG — da Canvas, da SVG, con scala personalizzata
// ============================================================

/**
 * Scarica il contenuto di un <canvas> come PNG
 */
export function downloadCanvasPNG(canvas, filename = 'shape.png', scale = 1) {
  if (scale !== 1) {
    const scaled = document.createElement('canvas');
    scaled.width  = canvas.width  * scale;
    scaled.height = canvas.height * scale;
    const ctx = scaled.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);
    _downloadFromDataURL(scaled.toDataURL('image/png'), filename);
  } else {
    _downloadFromDataURL(canvas.toDataURL('image/png'), filename);
  }
}

/**
 * Converte SVG string in PNG e scarica (via <img> + canvas offscreen)
 */
export function svgToPNG(svgString, { width = 600, height = 600, scale = 2, filename = 'shape.png' } = {}) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width  = width  * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const dataURL = canvas.toDataURL('image/png');
      if (filename) _downloadFromDataURL(dataURL, filename);
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Ritorna un Blob PNG da un canvas
 */
export function canvasToBlob(canvas, quality = 1) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', quality));
}

function _downloadFromDataURL(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}