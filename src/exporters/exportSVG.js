// ============================================================
// EXPORT SVG — file .svg, stringa inline, data URI
// ============================================================

/**
 * Esporta un SVGElement o stringa SVG come file .svg scaricabile
 */
export function downloadSVG(svgStringOrElement, filename = 'shape.svg') {
  const svgString = typeof svgStringOrElement === 'string'
    ? svgStringOrElement
    : new XMLSerializer().serializeToString(svgStringOrElement);

  const clean = svgString.startsWith('<svg')
    ? svgString
    : `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

  const blob = new Blob([clean], { type: 'image/svg+xml;charset=utf-8' });
  _triggerDownload(URL.createObjectURL(blob), filename);
}

/**
 * Ritorna la stringa SVG ottimizzata (rimuove attributi runtime non necessari)
 */
export function getSVGString(svgElement, { width, height, viewBox } = {}) {
  const clone = svgElement.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  if (width)   clone.setAttribute('width', width);
  if (height)  clone.setAttribute('height', height);
  if (viewBox) clone.setAttribute('viewBox', viewBox);
  return new XMLSerializer().serializeToString(clone);
}

/**
 * Ritorna data URI base64 dell'SVG (per uso come src di <img> o background-image CSS)
 */
export function svgToDataURI(svgString) {
  const encoded = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Copia la stringa SVG negli appunti
 */
export async function copySVGToClipboard(svgString) {
  try {
    await navigator.clipboard.writeText(svgString);
    return true;
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = svgString;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

function _triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
}