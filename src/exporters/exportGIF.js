// ============================================================
// EXPORT GIF — cattura frames e genera GIF animata
// Usa gif.js (CDN) oppure frame-by-frame download
// ============================================================

/**
 * Recorder di frame da un canvas per export GIF
 * Usa gif.js se disponibile, altrimenti offre download ZIP di PNG frames
 */
export class GIFRecorder {
  constructor({ canvas, fps = 12, quality = 10, workers = 2 }) {
    this.canvas  = canvas;
    this.fps     = fps;
    this.quality = quality;
    this.workers = workers;
    this.frames  = [];
    this._interval = null;
    this._recording = false;
  }

  /** Avvia la registrazione catturando frames ogni 1000/fps ms */
  start() {
    this.frames = [];
    this._recording = true;
    this._interval = setInterval(() => {
      if (!this._recording) return;
      const imageData = this._captureFrame();
      if (imageData) this.frames.push(imageData);
    }, 1000 / this.fps);
  }

  /** Ferma la registrazione */
  stop() {
    this._recording = false;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    return this.frames.length;
  }

  _captureFrame() {
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width  = this.canvas.width;
      offscreen.height = this.canvas.height;
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(this.canvas, 0, 0);
      return offscreen;
    } catch {
      return null;
    }
  }

  /**
   * Genera GIF usando gif.js (deve essere caricato via CDN)
   * <script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
   */
  exportGIF(filename = 'animation.gif') {
    return new Promise((resolve, reject) => {
      if (typeof GIF === 'undefined') {
        console.warn('gif.js non trovato. Carica: https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js');
        this._exportFramesPNG(filename);
        resolve(null);
        return;
      }

      // eslint-disable-next-line no-undef
      const gif = new GIF({
        workers:  this.workers,
        quality:  this.quality,
        width:    this.canvas.width,
        height:   this.canvas.height,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
      });

      for (const frame of this.frames) {
        gif.addFrame(frame, { delay: Math.round(1000 / this.fps), copy: true });
      }

      gif.on('finished', blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
        resolve(blob);
      });

      gif.on('error', reject);
      gif.render();
    });
  }

  /** Fallback: scarica ogni frame come PNG in zip tramite JSZip (se disponibile) */
  _exportFramesPNG(basename = 'frame') {
    if (typeof JSZip !== 'undefined') {
      // eslint-disable-next-line no-undef
      const zip = new JSZip();
      const folder = zip.folder('frames');
      let pending = this.frames.length;

      this.frames.forEach((canvas, i) => {
        canvas.toBlob(blob => {
          folder.file(`${basename}_${String(i).padStart(4,'0')}.png`, blob);
          pending--;
          if (pending === 0) {
            zip.generateAsync({ type: 'blob' }).then(content => {
              const url = URL.createObjectURL(content);
              const a = document.createElement('a');
              a.href = url; a.download = `${basename}_frames.zip`;
              document.body.appendChild(a); a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
          }
        });
      });
    } else {
      // Scarica solo il primo frame come PNG
      console.warn('JSZip non trovato. Scarico solo il primo frame.');
      if (this.frames[0]) {
        const a = document.createElement('a');
        a.href = this.frames[0].toDataURL('image/png');
        a.download = `${basename}_frame_0.png`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
      }
    }
  }

  get frameCount() { return this.frames.length; }
  get isRecording() { return this._recording; }
}