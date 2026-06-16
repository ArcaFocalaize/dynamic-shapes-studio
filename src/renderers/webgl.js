// ============================================================
// WEBGL RENDERER — instanced soft blobs via fragment shader
// Zero dipendenze esterne
// ============================================================

const VERT = `
attribute vec2 a_position;
attribute vec2 a_offset;
attribute float a_scale;
attribute vec3 a_color;
attribute float a_alpha;
uniform vec2 u_resolution;
varying vec2 v_uv;
varying vec3 v_color;
varying float v_alpha;
void main() {
  vec2 pos = a_position * a_scale + a_offset;
  vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
  clip.y *= -1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  v_uv = a_position;
  v_color = a_color;
  v_alpha = a_alpha;
}`;

const FRAG = `
precision mediump float;
varying vec2 v_uv;
varying vec3 v_color;
varying float v_alpha;
void main() {
  float d = length(v_uv);
  float alpha = smoothstep(0.5, 0.35, d) * v_alpha;
  gl_FragColor = vec4(v_color * alpha, alpha);
}`;

export class WebGLRenderer {
  constructor({ container, width = 600, height = 600 }) {
    this.width = width;
    this.height = height;
    this._instances = [];

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    if (container) container.appendChild(this.canvas);

    const gl = this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) throw new Error('WebGL non supportato in questo browser.');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this._program = this._buildProgram(VERT, FRAG);

    // Quad base: 2 triangoli che formano un quadrato [-0.5, 0.5]
    this._quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -0.5, -0.5,
       0.5, -0.5,
      -0.5,  0.5,
       0.5, -0.5,
       0.5,  0.5,
      -0.5,  0.5,
    ]), gl.STATIC_DRAW);

    this._instanceBuffer = gl.createBuffer();
  }

  _buildProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
      }
      return shader;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
    }
    return prog;
  }

  addBlob({ x, y, radius, color = [0.42, 0.39, 1.0], alpha = 0.85 }) {
    this._instances.push({ x, y, radius, color, alpha });
  }

  clearBlobs() {
    this._instances = [];
  }

  render() {
    const gl = this.gl;
    const prog = this._program;
    const instances = this._instances;
    if (!instances.length) return;

    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    // Uniform resolution
    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), this.width, this.height);

    // Attributo posizione quad (statico)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Per ogni blob: upload dati istanza e draw
    // (per semplicità: draw call per istanza — per performance usare ANGLE_instanced_arrays)
    const offLoc   = gl.getAttribLocation(prog, 'a_offset');
    const scaleLoc = gl.getAttribLocation(prog, 'a_scale');
    const colLoc   = gl.getAttribLocation(prog, 'a_color');
    const aLoc     = gl.getAttribLocation(prog, 'a_alpha');

    for (const inst of instances) {
      gl.vertexAttrib2f(offLoc,   inst.x, inst.y);
      gl.vertexAttrib1f(scaleLoc, inst.radius * 2);
      gl.vertexAttrib3f(colLoc,   inst.color[0], inst.color[1], inst.color[2]);
      gl.vertexAttrib1f(aLoc,     inst.alpha);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  resize(w, h) {
    this.width = w; this.height = h;
    this.canvas.width = w; this.canvas.height = h;
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
  }

  toDataURL() {
    this.render();
    return this.canvas.toDataURL('image/png');
  }
}