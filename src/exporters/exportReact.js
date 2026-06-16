// ============================================================
// EXPORT REACT — genera componente JSX/TSX pronto all'uso
// ============================================================

/**
 * Genera un componente React (JSX) da una configurazione blob
 */
export function generateReactComponent(config, options = {}) {
  const {
    componentName = 'DynamicBlob',
    typescript = false,
    animated = true,
    useHook = true,
  } = options;

  const ext = typescript ? 'tsx' : 'jsx';
  const typeAnnotations = typescript ? ': React.FC<Props>' : '';
  const propsType = typescript ? `
interface Props {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  speed?: number;
  noiseStrength?: number;
  numPoints?: number;
  className?: string;
  style?: React.CSSProperties;
}
` : '';

  const hookCode = useHook && animated ? `
function useNoise(seed = 0.5) {
  // Simplex noise inline (minimal)
  const perm = React.useMemo(() => {
    const p = Array.from({length: 256}, (_, i) => i);
    let s = Math.floor(seed * 0xFFFFFFFF);
    for (let i = 255; i > 0; i--) {
      s = Math.imul(s ^ s >>> 15, s | 1);
      s ^= s + Math.imul(s ^ s >>> 7, s | 61);
      const j = ((s ^ s >>> 14) >>> 0) % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    return perm;
  }, [seed]);

  return React.useCallback((x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = x*x*x*(x*(x*6-15)+10);
    const v = y*y*y*(y*(y*6-15)+10);
    const a = perm[X]+Y, b = perm[X+1]+Y;
    const lerp = (a,b,t) => a + t*(b-a);
    const grad = (h,x,y) => { const v=(h&1)?-x:x; return ((h&2)?-y:y)+v; };
    return lerp(
      lerp(grad(perm[a],x,y), grad(perm[b],x-1,y), u),
      lerp(grad(perm[a+1],x,y-1), grad(perm[b+1],x-1,y-1), u), v
    );
  }, [perm]);
}

function useBlobPath({ cx, cy, radius, numPoints, noiseStrength, noiseScale, timeRef, noise2D, tension = 0.4 }) {
  return React.useCallback((t) => {
    const pts = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const nx = Math.cos(angle) * noiseScale + t;
      const ny = Math.sin(angle) * noiseScale + t;
      const n  = noise2D(nx, ny);
      const r  = radius + n * noiseStrength;
      pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }
    // Catmull-Rom → cubic bezier path
    const p = [...pts, pts[0], pts[1]];
    let d = \`M \${pts[0].x.toFixed(2)},\${pts[0].y.toFixed(2)}\`;
    for (let i = 0; i < pts.length; i++) {
      const p0=p[Math.max(i-1,0)], p1=p[i], p2=p[i+1], p3=p[Math.min(i+2,p.length-1)];
      const t_ = tension / 3;
      d += \` C \${(p1.x+(p2.x-p0.x)*t_).toFixed(2)},\${(p1.y+(p2.y-p0.y)*t_).toFixed(2)}\`
        + \` \${(p2.x-(p3.x-p1.x)*t_).toFixed(2)},\${(p2.y-(p3.y-p1.y)*t_).toFixed(2)}\`
        + \` \${p2.x.toFixed(2)},\${p2.y.toFixed(2)}\`;
    }
    return d + ' Z';
  }, [cx, cy, radius, numPoints, noiseStrength, noiseScale, noise2D, tension]);
}
` : '';

  const componentCode = `
${typescript ? "import React from 'react';" : "import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';"}
${propsType}
${hookCode}

const ${componentName}${typeAnnotations} = ({
  width = ${config.width || 400},
  height = ${config.height || 400},
  fill = '${config.fill || '#6c63ff'}',
  stroke = '${config.stroke || 'none'}',
  strokeWidth = ${config.strokeWidth || 0},
  speed = ${config.speed || 0.003},
  noiseStrength = ${config.noiseStrength || 40},
  numPoints = ${config.numPoints || 12},
  className,
  style,
}${typescript ? ': Props' : ''}) => {
  const [path, setPath] = ${typescript ? 'React.useState<string>' : 'useState'}('');
  const timeRef = ${typescript ? 'React.useRef<number>' : 'useRef'}(0);
  const rafRef  = ${typescript ? 'React.useRef<number>' : 'useRef'}(0);
  const noise2D = useNoise(${config.seed || 0.42});
  const getPath = useBlobPath({
    cx: width / 2, cy: height / 2,
    radius: Math.min(width, height) * 0.32,
    numPoints,
    noiseStrength,
    noiseScale: 0.8,
    noise2D,
  });

  ${typescript ? 'React.useEffect' : 'useEffect'}(() => {
    const animate = () => {
      timeRef.current += speed;
      setPath(getPath(timeRef.current));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getPath, speed]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={\`0 0 \${width} \${height}\`}
      className={className}
      style={style}
    >
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default ${componentName};
`;

  return { code: componentCode.trim(), ext, filename: `${componentName}.${ext}` };
}

/**
 * Genera anche un hook standalone riutilizzabile
 */
export function generateReactHook(config, options = {}) {
  const { hookName = 'useDynamicBlob', typescript = false } = options;

  return `
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createNoise } from './noise'; // oppure simplex-noise
import { generateBlob } from './shapes';

export function ${hookName}(options = {}) {
  const {
    cx = 200, cy = 200,
    radius = 100,
    numPoints = 12,
    noiseStrength = 40,
    speed = 0.003,
    seed = ${config.seed || 0.42},
    tension = 0.4,
  } = options;

  const [blobPath, setBlobPath] = useState('');
  const timeRef = useRef(0);
  const rafRef  = useRef${typescript ? '<number>' : ''}(0);

  useEffect(() => {
    const animate = () => {
      timeRef.current += speed;
      const { path } = generateBlob({
        cx, cy, radius, numPoints,
        noiseStrength, timeOffset: timeRef.current,
        seed, tension,
      });
      setBlobPath(path);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cx, cy, radius, numPoints, noiseStrength, speed, seed, tension]);

  return blobPath;
}
`.trim();
}

/**
 * Scarica il file del componente
 */
export function downloadReactComponent(code, filename = 'DynamicBlob.jsx') {
  const blob = new Blob([code], { type: 'text/javascript' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
}