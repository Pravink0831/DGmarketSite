/* =====================================================================
   WEBARTISTA · LAYER 1 — THREE.JS TOPOGRAPHIC WAVE GRID
   ---------------------------------------------------------------------
   Vertex-displaced wireframe plane + floating particle field.
   Ripples continuously and reacts to the mouse pointer.
   Three.js is imported as an ES module (bundled, version-pinned) rather
   than read from a global CDN script.
   Target canvas: #bg-canvas
   ===================================================================== */
import * as THREE from 'three';

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) {
    console.warn('#bg-canvas not found');
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03060f, 0.11);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.4, 6.2);
  camera.lookAt(0, -0.4, 0);

  // ---- Topographic wireframe plane ----
  const SIZE = 18;
  const SEG = 120;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color(0x345793) }, // deep blue
    uColorB: { value: new THREE.Color(0x64748b) }, // muted slate
  };

  const vertexShader = `
    uniform float uTime;
    uniform vec2  uMouse;
    varying float vElevation;
    varying vec2  vUv;
    // cheap pseudo-noise
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
      vec2 u=f*f*(3.-2.*f);
      return mix(a,b,u.x)+ (c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
    }
    void main(){
      vUv = uv;
      vec3 pos = position;
      float t = uTime * 0.6;
      float wave =
          sin(pos.x * 0.6 + t) * 0.35
        + cos(pos.z * 0.5 - t * 0.8) * 0.35
        + noise(pos.xz * 0.5 + t * 0.15) * 0.9;
      // mouse ripple — distance from projected mouse point on plane
      vec2 m = uMouse * (${(SIZE * 0.5).toFixed(1)});
      float d = distance(pos.xz, m);
      float ripple = sin(d * 1.6 - uTime * 2.5) * exp(-d * 0.35) * 0.9;
      float elevation = wave + ripple;
      pos.y += elevation;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vElevation;
    varying vec2  vUv;
    void main(){
      float mixv = smoothstep(-0.8, 1.2, vElevation);
      vec3 col = mix(uColorB, uColorA, mixv);
      // brighten crests
      col += vec3(0.35,0.45,0.7) * smoothstep(0.6, 1.4, vElevation);
      // fade edges radially
      float edge = smoothstep(0.5, 0.05, distance(vUv, vec2(0.5)));
      float alpha = 0.20 + edge * 0.7;
      gl_FragColor = vec4(col, alpha);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -1.6;
  scene.add(mesh);

  // ---- Floating particle field ----
  const pCount = 900;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 22;
    pPos[i * 3 + 1] = Math.random() * 8;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x6d8fd1,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // ---- Interaction ----
  const mouse = new THREE.Vector2(0, 0);
  const targetMouse = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  // ---- Resize ----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---- Loop ----
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    mouse.lerp(targetMouse, 0.06);
    uniforms.uMouse.value.set(mouse.x, mouse.y);

    // subtle parallax camera drift
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (2.4 + mouse.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, -0.6, 0);

    points.rotation.y = t * 0.02;
    points.position.y = Math.sin(t * 0.3) * 0.2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
