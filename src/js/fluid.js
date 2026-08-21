/* =====================================================================
   WEBARTISTA · LAYER 2 — WEBGL FLUID SIMULATION (compact Navier-Stokes)
   ---------------------------------------------------------------------
   Ping-pong FBOs: advection -> divergence -> pressure -> gradient subtract.
   Pointer motion injects velocity + brand-blue dye splats; click = burst.
   Self-contained raw WebGL (no external fluid library).
   Target canvas: #fluid-canvas
   ===================================================================== */
(function () {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas) {
    console.warn('#fluid-canvas not found');
    return;
  }
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not available for fluid layer');
    return;
  }

  // extensions for float textures
  const halfFloatExt = gl.getExtension('OES_texture_half_float');
  gl.getExtension('OES_texture_half_float_linear');
  gl.getExtension('OES_texture_float');
  gl.getExtension('OES_texture_float_linear');
  const HALF_FLOAT = halfFloatExt ? halfFloatExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
  const texType = halfFloatExt ? HALF_FLOAT : gl.UNSIGNED_BYTE;

  // ---------- config ----------
  const SIM_SCALE = 0.5; // sim resolution multiplier
  const DYE_SCALE = 1.0; // dye resolution multiplier
  const DENSITY_DISSIPATION = 0.965;
  const VELOCITY_DISSIPATION = 0.985;
  const PRESSURE_ITER = 20;
  const SPLAT_RADIUS = 0.0022;
  const SPLAT_FORCE = 5200;

  // ---------- shader helpers ----------
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s), src);
    return s;
  }
  function program(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(p, 0, 'aPosition'); // force aPosition -> location 0
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    // cache uniforms
    p.uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      p.uniforms[name] = gl.getUniformLocation(p, name);
    }
    return p;
  }

  const baseVert = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;
  const clearFrag = `
    precision mediump float; precision mediump sampler2D;
    varying vec2 vUv; uniform sampler2D uTexture; uniform float value;
    void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }
  `;
  const splatFrag = `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main(){
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p,p)/radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `;
  const advectionFrag = `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main(){
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = dissipation * texture2D(uSource, coord);
      gl_FragColor.a = 1.0;
    }
  `;
  const divergenceFrag = `
    precision mediump float; precision mediump sampler2D;
    varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uVelocity;
    void main(){
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;
  const pressureFrag = `
    precision mediump float; precision mediump sampler2D;
    varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main(){
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float div = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - div) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `;
  const gradientFrag = `
    precision mediump float; precision mediump sampler2D;
    varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main(){
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;
  const displayFrag = `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main(){
      vec3 c = texture2D(uTexture, vUv).rgb;
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `;

  // ---------- programs ----------
  const clearProg = program(baseVert, clearFrag);
  const splatProg = program(baseVert, splatFrag);
  const advectionProg = program(baseVert, advectionFrag);
  const divergenceProg = program(baseVert, divergenceFrag);
  const pressureProg = program(baseVert, pressureFrag);
  const gradientProg = program(baseVert, gradientFrag);
  const displayProg = program(baseVert, displayFrag);

  // ---------- fullscreen quad ----------
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const idx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

  function blit(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  // ---------- FBO helpers ----------
  function createFBO(w, h, internal, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      tex,
      fbo,
      width: w,
      height: h,
      texelX: 1 / w,
      texelY: 1 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return id;
      },
    };
  }
  function createDoubleFBO(w, h, internal, format, type, param) {
    let fbo1 = createFBO(w, h, internal, format, type, param);
    let fbo2 = createFBO(w, h, internal, format, type, param);
    return {
      width: w,
      height: h,
      texelX: 1 / w,
      texelY: 1 / h,
      get read() {
        return fbo1;
      },
      set read(v) {
        fbo1 = v;
      },
      get write() {
        return fbo2;
      },
      set write(v) {
        fbo2 = v;
      },
      swap() {
        const t = fbo1;
        fbo1 = fbo2;
        fbo2 = t;
      },
    };
  }

  let velocity, density, divergence, pressure;
  let simW, simH, dyeW, dyeH;

  function initFBOs() {
    simW = Math.round(gl.drawingBufferWidth * SIM_SCALE) || 256;
    simH = Math.round(gl.drawingBufferHeight * SIM_SCALE) || 256;
    dyeW = Math.round(gl.drawingBufferWidth * DYE_SCALE) || 512;
    dyeH = Math.round(gl.drawingBufferHeight * DYE_SCALE) || 512;
    const rgba = gl.RGBA;
    const filtering = halfFloatExt ? gl.LINEAR : gl.NEAREST;
    velocity = createDoubleFBO(simW, simH, rgba, rgba, texType, filtering);
    density = createDoubleFBO(dyeW, dyeH, rgba, rgba, texType, filtering);
    divergence = createFBO(simW, simH, rgba, rgba, texType, gl.NEAREST);
    pressure = createDoubleFBO(simW, simH, rgba, rgba, texType, gl.NEAREST);
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    initFBOs();
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- splat ----------
  function splat(x, y, dx, dy, color) {
    gl.viewport(0, 0, simW, simH);
    gl.useProgram(splatProg);
    gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProg.uniforms.point, x, y);
    gl.uniform3f(splatProg.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProg.uniforms.radius, SPLAT_RADIUS);
    blit(velocity.write);
    velocity.swap();

    gl.viewport(0, 0, dyeW, dyeH);
    gl.uniform1i(splatProg.uniforms.uTarget, density.read.attach(0));
    gl.uniform3f(splatProg.uniforms.color, color.r, color.g, color.b);
    blit(density.write);
    density.swap();
  }

  // ---------- pointer ----------
  const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, down: false };
  function updatePointer(clientX, clientY) {
    const x = clientX / window.innerWidth;
    const y = 1.0 - clientY / window.innerHeight;
    pointer.dx = (x - pointer.x) * SPLAT_FORCE;
    pointer.dy = (y - pointer.y) * SPLAT_FORCE;
    pointer.x = x;
    pointer.y = y;
    pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0;
  }
  window.addEventListener('pointermove', (e) => updatePointer(e.clientX, e.clientY));
  window.addEventListener('pointerdown', (e) => {
    pointer.down = true;
    updatePointer(e.clientX, e.clientY);
    burst(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', () => {
    pointer.down = false;
  });

  // brand-tuned palette (deep blue + muted slate)
  const PALETTE = [
    { r: 0.2, g: 0.34, b: 0.58 }, // #345793 deep blue (scaled)
    { r: 0.14, g: 0.22, b: 0.4 }, // darker navy
    { r: 0.28, g: 0.34, b: 0.44 }, // #475569 slate
    { r: 0.3, g: 0.45, b: 0.72 }, // brighter blue highlight
  ];
  function pick() {
    return PALETTE[(Math.random() * PALETTE.length) | 0];
  }

  // click burst — emit multiple dye splats
  function burst(clientX, clientY) {
    const x = clientX / window.innerWidth;
    const y = 1.0 - clientY / window.innerHeight;
    for (let i = 0; i < 6; i++) {
      const c = pick();
      const angle = Math.random() * Math.PI * 2;
      const speed = 900 + Math.random() * 1400;
      splat(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, {
        r: c.r * 2.2,
        g: c.g * 2.2,
        b: c.b * 2.4,
      });
    }
  }

  // ---------- pipeline step ----------
  function step(dt) {
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, simW, simH);

    // advect velocity
    gl.useProgram(advectionProg);
    gl.uniform2f(advectionProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProg.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(advectionProg.uniforms.dt, dt);
    gl.uniform1f(advectionProg.uniforms.dissipation, VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    // advect density (dye)
    gl.viewport(0, 0, dyeW, dyeH);
    gl.useProgram(advectionProg);
    gl.uniform2f(advectionProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProg.uniforms.uSource, density.read.attach(1));
    gl.uniform1f(advectionProg.uniforms.dt, dt);
    gl.uniform1f(advectionProg.uniforms.dissipation, DENSITY_DISSIPATION);
    blit(density.write);
    density.swap();

    gl.viewport(0, 0, simW, simH);

    // divergence
    gl.useProgram(divergenceProg);
    gl.uniform2f(divergenceProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    // clear pressure
    gl.useProgram(clearProg);
    gl.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProg.uniforms.value, 0.8);
    blit(pressure.write);
    pressure.swap();

    // pressure solve (Jacobi)
    gl.useProgram(pressureProg);
    gl.uniform2f(pressureProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
    for (let i = 0; i < PRESSURE_ITER; i++) {
      gl.uniform1i(pressureProg.uniforms.uDivergence, divergence.attach(0));
      gl.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // gradient subtract
    gl.useProgram(gradientProg);
    gl.uniform2f(gradientProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(gradientProg.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradientProg.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();
  }

  // ---------- render dye to screen ----------
  function render() {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(displayProg);
    gl.uniform1i(displayProg.uniforms.uTexture, density.read.attach(0));
    blit(null);
  }

  // ---------- ambient auto-splats so it never looks dead ----------
  let ambientT = 0;
  function ambient(dt) {
    ambientT -= dt;
    if (ambientT <= 0) {
      ambientT = 1.4 + Math.random() * 1.6;
      const c = pick();
      const x = Math.random();
      const y = Math.random();
      const ang = Math.random() * Math.PI * 2;
      const s = 500 + Math.random() * 700;
      splat(x, y, Math.cos(ang) * s, Math.sin(ang) * s, {
        r: c.r * 1.3,
        g: c.g * 1.3,
        b: c.b * 1.5,
      });
    }
  }

  // ---------- main loop ----------
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.0166);
    last = now;

    if (pointer.moved) {
      pointer.moved = false;
      const c = pick();
      splat(pointer.x, pointer.y, pointer.dx, pointer.dy, {
        r: c.r * 1.8,
        g: c.g * 1.8,
        b: c.b * 2.0,
      });
    }
    ambient(dt);
    step(dt);
    render();
    requestAnimationFrame(loop);
  }

  // seed a few splats on load
  for (let i = 0; i < 5; i++) {
    const c = pick();
    splat(Math.random(), Math.random(), (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, {
      r: c.r * 1.4,
      g: c.g * 1.4,
      b: c.b * 1.6,
    });
  }
  requestAnimationFrame(loop);
})();
