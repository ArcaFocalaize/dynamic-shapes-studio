// ============================================================
// CONTROLS UI — Pannello parametri per uso programmatico
// Usato da index.html ma anche importabile in qualsiasi progetto
// ============================================================

/**
 * Definizione di tutti i parametri configurabili del tool
 */
export const PARAM_DEFS = [
  // ── Forma ─────────────────────────────────────────────────
  {
    group: 'Forma',
    key: 'shapeType',
    label: 'Tipo di forma',
    type: 'select',
    options: ['blob', 'polygon', 'star', 'cluster', 'metaball'],
    default: 'blob',
  },
  {
    group: 'Forma',
    key: 'numPoints',
    label: 'Punti / Lati',
    type: 'range',
    min: 3, max: 32, step: 1,
    default: 12,
  },
  {
    group: 'Forma',
    key: 'radius',
    label: 'Raggio base (px)',
    type: 'range',
    min: 20, max: 280, step: 1,
    default: 130,
  },
  {
    group: 'Forma',
    key: 'tension',
    label: 'Tensione curva',
    type: 'range',
    min: 0, max: 1, step: 0.01,
    default: 0.4,
  },
  // ── Noise ─────────────────────────────────────────────────
  {
    group: 'Noise',
    key: 'noiseStrength',
    label: 'Intensità deformazione',
    type: 'range',
    min: 0, max: 150, step: 1,
    default: 45,
  },
  {
    group: 'Noise',
    key: 'noiseScale',
    label: 'Scala noise',
    type: 'range',
    min: 0.1, max: 3, step: 0.01,
    default: 0.8,
  },
  {
    group: 'Noise',
    key: 'seed',
    label: 'Seed',
    type: 'range',
    min: 0, max: 1, step: 0.001,
    default: 0.42,
  },
  // ── Animazione ─────────────────────────────────────────────
  {
    group: 'Animazione',
    key: 'speed',
    label: 'Velocità',
    type: 'range',
    min: 0, max: 0.02, step: 0.0001,
    default: 0.003,
  },
  {
    group: 'Animazione',
    key: 'animated',
    label: 'Animato',
    type: 'checkbox',
    default: true,
  },
  // ── Cluster ────────────────────────────────────────────────
  {
    group: 'Cluster',
    key: 'clusterCount',
    label: 'Numero elementi',
    type: 'range',
    min: 2, max: 12, step: 1,
    default: 5,
  },
  {
    group: 'Cluster',
    key: 'spreadRadius',
    label: 'Dispersione',
    type: 'range',
    min: 20, max: 250, step: 1,
    default: 110,
  },
  {
    group: 'Cluster',
    key: 'repulsion',
    label: 'Repulsione fisica',
    type: 'range',
    min: 0, max: 2, step: 0.01,
    default: 0.4,
  },
  {
    group: 'Cluster',
    key: 'attraction',
    label: 'Attrazione centro',
    type: 'range',
    min: 0, max: 0.1, step: 0.001,
    default: 0.015,
  },
  // ── Aspetto ────────────────────────────────────────────────
  {
    group: 'Aspetto',
    key: 'fill',
    label: 'Riempimento',
    type: 'color',
    default: '#6c63ff',
  },
  {
    group: 'Aspetto',
    key: 'fillMode',
    label: 'Modalità fill',
    type: 'select',
    options: ['solid', 'gradient-radial', 'gradient-linear', 'none'],
    default: 'solid',
  },
  {
    group: 'Aspetto',
    key: 'fillColor2',
    label: 'Colore gradiente 2',
    type: 'color',
    default: '#ff6584',
  },
  {
    group: 'Aspetto',
    key: 'stroke',
    label: 'Bordo (stroke)',
    type: 'color',
    default: '#ffffff',
  },
  {
    group: 'Aspetto',
    key: 'strokeWidth',
    label: 'Spessore bordo',
    type: 'range',
    min: 0, max: 10, step: 0.5,
    default: 0,
  },
  {
    group: 'Aspetto',
    key: 'opacity',
    label: 'Opacità',
    type: 'range',
    min: 0, max: 1, step: 0.01,
    default: 1,
  },
  {
    group: 'Aspetto',
    key: 'blur',
    label: 'Blur (px)',
    type: 'range',
    min: 0, max: 40, step: 1,
    default: 0,
  },
  {
    group: 'Aspetto',
    key: 'gooeyEffect',
    label: 'Effetto Gooey',
    type: 'checkbox',
    default: false,
  },
  // ── Canvas ─────────────────────────────────────────────────
  {
    group: 'Canvas',
    key: 'width',
    label: 'Larghezza (px)',
    type: 'range',
    min: 100, max: 1200, step: 10,
    default: 600,
  },
  {
    group: 'Canvas',
    key: 'height',
    label: 'Altezza (px)',
    type: 'range',
    min: 100, max: 1200, step: 10,
    default: 600,
  },
  {
    group: 'Canvas',
    key: 'background',
    label: 'Sfondo',
    type: 'color',
    default: '#1a1a2e',
  },
  {
    group: 'Canvas',
    key: 'renderer',
    label: 'Renderer',
    type: 'select',
    options: ['svg', 'canvas', 'webgl'],
    default: 'svg',
  },
];

/**
 * Costruisce il valore di default da PARAM_DEFS
 */
export function getDefaultConfig() {
  return Object.fromEntries(PARAM_DEFS.map(p => [p.key, p.default]));
}

/**
 * Genera il markup HTML del pannello controlli
 * e lo inietta in un elemento container.
 * Chiama onChange(key, value, fullConfig) ad ogni modifica.
 */
export function buildControlPanel(container, onChange) {
  const config = getDefaultConfig();

  // Raggruppa per group
  const groups = {};
  for (const def of PARAM_DEFS) {
    if (!groups[def.group]) groups[def.group] = [];
    groups[def.group].push(def);
  }

  container.innerHTML = '';
  container.className = 'dss-panel';

  for (const [groupName, defs] of Object.entries(groups)) {
    const section = document.createElement('details');
    section.open = ['Forma','Aspetto','Animazione'].includes(groupName);
    section.innerHTML = `<summary>${groupName}</summary>`;

    for (const def of defs) {
      const row = document.createElement('div');
      row.className = 'dss-row';

      const labelEl = document.createElement('label');
      labelEl.htmlFor = `dss-${def.key}`;
      labelEl.textContent = def.label;

      let inputEl;

      if (def.type === 'range') {
        inputEl = document.createElement('input');
        inputEl.type = 'range';
        inputEl.id = `dss-${def.key}`;
        inputEl.min = def.min;
        inputEl.max = def.max;
        inputEl.step = def.step;
        inputEl.value = def.default;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'dss-value';
        valueSpan.textContent = def.default;

        inputEl.addEventListener('input', () => {
          const val = parseFloat(inputEl.value);
          valueSpan.textContent = val;
          config[def.key] = val;
          onChange(def.key, val, { ...config });
        });

        row.appendChild(labelEl);
        row.appendChild(inputEl);
        row.appendChild(valueSpan);

      } else if (def.type === 'color') {
        inputEl = document.createElement('input');
        inputEl.type = 'color';
        inputEl.id = `dss-${def.key}`;
        inputEl.value = def.default;

        inputEl.addEventListener('input', () => {
          config[def.key] = inputEl.value;
          onChange(def.key, inputEl.value, { ...config });
        });

        row.appendChild(labelEl);
        row.appendChild(inputEl);

      } else if (def.type === 'checkbox') {
        inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
        inputEl.id = `dss-${def.key}`;
        inputEl.checked = def.default;

        inputEl.addEventListener('change', () => {
          config[def.key] = inputEl.checked;
          onChange(def.key, inputEl.checked, { ...config });
        });

        row.appendChild(labelEl);
        row.appendChild(inputEl);

      } else if (def.type === 'select') {
        inputEl = document.createElement('select');
        inputEl.id = `dss-${def.key}`;
        def.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt; o.textContent = opt;
          if (opt === def.default) o.selected = true;
          inputEl.appendChild(o);
        });

        inputEl.addEventListener('change', () => {
          config[def.key] = inputEl.value;
          onChange(def.key, inputEl.value, { ...config });
        });

        row.appendChild(labelEl);
        row.appendChild(inputEl);
      }

      section.appendChild(row);
    }

    container.appendChild(section);
  }

  /**
   * Permette di aggiornare programmaticamente un controllo
   */
  function setControl(key, value) {
    const el = container.querySelector(`#dss-${key}`);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = value;
    else el.value = value;
    config[key] = value;
    const valueSpan = el.parentElement?.querySelector('.dss-value');
    if (valueSpan) valueSpan.textContent = value;
  }

  return { config, setControl };
}