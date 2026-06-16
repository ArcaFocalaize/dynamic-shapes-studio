# ⬡ Dynamic Shapes Studio

Generatore di forme vettoriali dinamiche — blob organici, cluster, metaball, poligoni, stelle — con UI standalone, libreria ES Module e export multi-formato.

---

## Struttura

dynamic-shapes-studio/
├── index.html              ← UI standalone (apri nel browser)
├── package.json
├── src/
│   ├── core/
│   │   ├── noise.js        ← Simplex noise (no deps)
│   │   ├── shapes.js       ← Generatori: blob, polygon, star, cluster, metaball
│   │   ├── spline.js       ← Catmull-Rom → SVG path / Canvas
│   │   └── physics.js      ← Fisica: repulsione, attrazione, bounce
│   ├── renderers/
│   │   ├── svg.js          ← SVGRenderer (DOM SVG + gradienti + filtri)
│   │   ├── canvas.js       ← CanvasRenderer (2D, gooey, gradiente)
│   │   └── webgl.js        ← WebGLRenderer (soft blobs GPU)
│   ├── exporters/
│   │   ├── exportSVG.js    ← SVG string, file, data URI, clipboard
│   │   ├── exportPNG.js    ← PNG da canvas/svg, @2x
│   │   ├── exportCSS.js    ← @keyframes clip-path, border-radius blob
│   │   ├── exportJSON.js   ← Config JSON, Lottie JSON
│   │   ├── exportReact.js  ← Componente JSX/TSX + hook
│   │   └── exportGIF.js    ← Registrazione GIF frame-by-frame
│   ├── ui/
│   │   └── controls.js     ← Pannello controlli parametri
│   └── index.js            ← Entry point libreria
└── README.md

---

## Uso 1 — UI Standalone nel browser

Apri direttamente `index.html` con un server locale (richiesto per ES Modules):

```bash
# Con Node.js (npx, nessuna installazione)
npx serve .

# Oppure
npx live-server

# Oppure con Python
python3 -m http.server 3000
```

Poi vai su `http://localhost:3000` (o porta indicata).

> ⚠️ Non aprire `index.html` con `file://` — i moduli ES non funzionano senza un server HTTP.

---