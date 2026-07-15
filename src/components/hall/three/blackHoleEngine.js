/**
 * BlackHoleEngine
 * ----------------
 * A self-contained Three.js scene engine that renders a "knowledge black hole"
 * hero area: an event-horizon sphere, a temperature-graded accretion disk
 * (ShaderMaterial glow + GPU-driven particle system on logarithmic-spiral
 * orbits with differential rotation), orbital AI-agent sprites, a faint
 * starfield, mouse parallax and an idle/consuming mode switch.
 *
 * Core-only Three.js (no addons). Designed to run in the browser via an ES
 * module import map that maps `three` -> esm.sh/three@0.169.0.
 *
 * Public API:
 *   const engine = new BlackHoleEngine(container);
 *   engine.start();
 *   engine.setMode('consuming'); // or 'idle'
 *   engine.stop();
 *   engine.destroy();
 */
import * as THREE from 'three';
import { AGENTS } from '../../../data/agents.js';

/* ------------------------------------------------------------------ *
 * Device tiering
 * ------------------------------------------------------------------ */
function detectTier() {
  if (typeof window === 'undefined') return { tier: 'desktop', particles: 4000, stars: 1200 };
  const w = window.innerWidth;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (w < 640 || (coarse && w < 768)) return { tier: 'mobile', particles: 1000, stars: 350 };
  if (w < 1024) return { tier: 'tablet', particles: 2000, stars: 650 };
  return { tier: 'desktop', particles: 4000, stars: 1200 };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ *
 * Canvas textures
 * ------------------------------------------------------------------ */

/** Soft circular sprite used for disk particles + stars (additive friendly). */
function createCircleTexture(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Emoji sprite texture for an AI agent, with a soft colored halo. */
function createEmojiTexture(emoji, color) {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // soft colored halo so the emoji reads against the bright disk
  const halo = ctx.createRadialGradient(
    size / 2, size / 2, 6,
    size / 2, size / 2, size / 2
  );
  halo.addColorStop(0, hexToRgba(color, 0.55));
  halo.addColorStop(0.6, hexToRgba(color, 0.18));
  halo.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // emoji glyph
  ctx.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 4);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function hexToRgba(hex, a) {
  const h = (hex || '#ffffff').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 255;
  const g = parseInt(h.substring(2, 4), 16) || 255;
  const b = parseInt(h.substring(4, 6), 16) || 255;
  return `rgba(${r},${g},${b},${a})`;
}

/* ------------------------------------------------------------------ *
 * Shaders
 * ------------------------------------------------------------------ */

// Accretion-disk glow disc. Color temperature runs hot-white (inner) ->
// orange -> red -> purple-red (outer). Swirls and turns gold in consume mode.
const RING_VERT = /* glsl */ `
  varying vec2 vLocalPos;
  void main() {
    vLocalPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vLocalPos;
  uniform float uInnerR;
  uniform float uOuterR;
  uniform float uTime;
  uniform float uConsume;
  uniform float uOpacity;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 temperature(float t){
    vec3 c0 = vec3(1.00, 0.98, 0.92); // hot white
    vec3 c1 = vec3(1.00, 0.72, 0.32); // orange
    vec3 c2 = vec3(0.95, 0.22, 0.30); // red
    vec3 c3 = vec3(0.42, 0.05, 0.34); // purple-red
    if (t < 0.33) return mix(c0, c1, t / 0.33);
    if (t < 0.66) return mix(c1, c2, (t - 0.33) / 0.33);
    return mix(c2, c3, (t - 0.66) / 0.34);
  }

  void main() {
    float r = length(vLocalPos);
    float t = clamp((r - uInnerR) / (uOuterR - uInnerR), 0.0, 1.0);

    // soft inner/outer falloff so the disc fades rather than hard-clips
    float edge = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.82, 1.0, t));

    float ang = atan(vLocalPos.y, vLocalPos.x);
    // differential swirl: inner bands rotate faster
    float swirl = sin(ang * 3.0 + uTime * 2.0 * (1.4 - t) - t * 9.0) * 0.5 + 0.5;
    float grain = hash(floor(vLocalPos * 10.0));
    float flicker = 0.75 + 0.35 * swirl + 0.1 * grain;

    vec3 col = temperature(t) * flicker;

    // consume mode -> gold
    vec3 gold = vec3(1.0, 0.84, 0.0) * 1.25;
    col = mix(col, gold, uConsume * 0.8);

    float alpha = edge * uOpacity * (0.7 + 0.45 * swirl);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Disk particles. Position is computed entirely on the GPU from per-particle
// orbit attributes -> cheap even at 4000 points. Differential rotation is
// baked into per-particle aSpeed (Keplerian-ish: inner faster).
const POINTS_VERT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uConsume;
  uniform float uInnerR;
  uniform float uOuterR;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  attribute float aRadius;
  attribute float aAngleOffset;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aY;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 temperature(float t){
    vec3 c0 = vec3(1.00, 0.98, 0.92);
    vec3 c1 = vec3(1.00, 0.72, 0.32);
    vec3 c2 = vec3(0.95, 0.22, 0.30);
    vec3 c3 = vec3(0.42, 0.05, 0.34);
    if (t < 0.33) return mix(c0, c1, t / 0.33);
    if (t < 0.66) return mix(c1, c2, (t - 0.33) / 0.33);
    return mix(c2, c3, (t - 0.66) / 0.34);
  }

  void main() {
    // In consume mode particles flow inward toward the inner edge.
    float r = mix(aRadius, uInnerR * 1.12, uConsume);
    float ang = aAngleOffset + aSpeed * uTime;
    vec3 pos = vec3(cos(ang) * r, aY, sin(ang) * r);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float t = clamp((r - uInnerR) / (uOuterR - uInnerR), 0.0, 1.0);
    vec3 col = temperature(t);

    vec3 gold = vec3(1.0, 0.84, 0.0) * 1.25;
    col = mix(col, gold, uConsume * 0.7);
    vColor = col;

    float tw = 0.6 + 0.4 * sin(uTime * 3.0 + aAngleOffset * 5.0);
    vAlpha = tw;

    float size = aSize * uSizeScale * uPixelRatio;
    gl_PointSize = size * (300.0 / max(-mv.z, 0.1));
  }
`;

const POINTS_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uTexture, gl_PointCoord);
    if (tex.a < 0.02) discard;
    gl_FragColor = vec4(vColor, tex.a * vAlpha);
  }
`;

/* ------------------------------------------------------------------ *
 * Engine
 * ------------------------------------------------------------------ */

export class BlackHoleEngine {
  constructor(container) {
    if (!container) throw new Error('BlackHoleEngine: container is required');
    this.container = container;

    const tier = detectTier();
    this.tier = tier.tier;
    this.particleCount = tier.particles;
    this.starCount = tier.stars;
    this.reducedMotion = prefersReducedMotion();

    // scene constants
    this.EVENT_HORIZON_R = 2.0;
    this.INNER_R = 2.35;
    this.OUTER_R = 9.0;
    this.CAM_BASE = new THREE.Vector3(0, 5.5, 20);

    // runtime state
    this.mode = 'idle';
    this.modeT = 0;          // 0 = idle, 1 = consuming (lerped)
    this.simTime = 0;        // shared simulation clock (advances faster in consume)
    this.lastTime = 0;
    this.running = false;
    this.visible = true;
    this.rafId = null;

    // input
    this.pointer = { x: 0, y: 0 };
    this.targetCam = this.CAM_BASE.clone();

    // disposables
    this._disposables = [];

    this._initThree();
    this._createBlackHole();
    this._createGlowRing();
    this._createAccretionDisk();
    this._createStarfield();
    this._createAgents();
    this._syncUniforms();
    this._placeAgents(0);
    this._bindEvents();

    // render a first frame immediately (covers reduced-motion + paint)
    this._render();
  }

  /* ---------------- setup ---------------- */

  _initThree() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = null; // transparent -> page gradient shows through

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    this.camera.position.copy(this.CAM_BASE);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: this.tier === 'desktop',
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
  }

  _createBlackHole() {
    const geo = new THREE.SphereGeometry(this.EVENT_HORIZON_R, 48, 48);
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const sphere = new THREE.Mesh(geo, mat);
    this.scene.add(sphere);
    this._track(geo, mat);

    // subtle gravitational-lensing rim: a slightly larger transparent sphere
    // with a fresnel-ish dark-red glow so the horizon isn't a flat disc edge.
    const rimGeo = new THREE.SphereGeometry(this.EVENT_HORIZON_R * 1.06, 48, 48);
    const rimMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: { uConsume: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main(){
          vN = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        uniform float uConsume;
        void main(){
          float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.0);
          vec3 base = vec3(0.9, 0.25, 0.35);
          vec3 gold = vec3(1.0, 0.8, 0.2);
          vec3 col = mix(base, gold, uConsume);
          gl_FragColor = vec4(col, f * 0.55);
        }`
    });
    this.rimMat = rimMat;
    const rim = new THREE.Mesh(rimGeo, rimMat);
    this.scene.add(rim);
    this._track(rimGeo, rimMat);
  }

  _createGlowRing() {
    // Flat disc in the XZ plane (RingGeometry is XY -> rotate -PI/2 about X).
    const geo = new THREE.RingGeometry(this.INNER_R, this.OUTER_R + 1.2, 256, 8);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uInnerR: { value: this.INNER_R },
        uOuterR: { value: this.OUTER_R + 1.2 },
        uTime: { value: 0 },
        uConsume: { value: 0 },
        uOpacity: { value: 0.9 }
      },
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG
    });
    this.ringMat = mat;
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);
    this._track(geo, mat);
  }

  _createAccretionDisk() {
    const count = this.particleCount;
    const positions = new Float32Array(count * 3); // dummy; position computed in shader
    const aRadius = new Float32Array(count);
    const aAngleOffset = new Float32Array(count);
    const aSize = new Float32Array(count);
    const aSpeed = new Float32Array(count);
    const aY = new Float32Array(count);

    const arms = 3;
    const spiralTightness = 2.2;
    const baseSpin = 0.55;

    for (let i = 0; i < count; i++) {
      // sqrt distribution -> area-uniform surface density across the disc
      const u = Math.random();
      const r = this.INNER_R + (this.OUTER_R - this.INNER_R) * Math.sqrt(u);

      // logarithmic-spiral arm assignment + jitter
      const armIndex = i % arms;
      const armAngle = (armIndex / arms) * Math.PI * 2 +
        spiralTightness * Math.log(r / this.INNER_R);
      const jitter = (Math.random() - 0.5) * 0.7;
      aAngleOffset[i] = armAngle + jitter;

      aRadius[i] = r;

      // Keplerian-ish differential rotation: inner particles orbit faster.
      aSpeed[i] = baseSpin / Math.pow(r / this.INNER_R, 1.5);

      aSize[i] = 0.6 + Math.random() * 1.6;

      // thin vertical scatter; slightly more at the outer edge for thickness
      const thickness = 0.12 + 0.18 * (r / this.OUTER_R);
      aY[i] = (Math.random() - 0.5) * thickness;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aRadius', new THREE.BufferAttribute(aRadius, 1));
    geo.setAttribute('aAngleOffset', new THREE.BufferAttribute(aAngleOffset, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));
    geo.setAttribute('aY', new THREE.BufferAttribute(aY, 1));

    this.particleTex = createCircleTexture(64);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uConsume: { value: 0 },
        uInnerR: { value: this.INNER_R },
        uOuterR: { value: this.OUTER_R },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uSizeScale: { value: this.tier === 'mobile' ? 0.7 : 1.0 },
        uTexture: { value: this.particleTex }
      },
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG
    });
    this.pointsMat = mat;

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false; // positions are computed in-shader
    this.scene.add(points);
    this._track(geo, mat);
  }

  _createStarfield() {
    const count = this.starCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const inner = 40, outer = 90;
    for (let i = 0; i < count; i++) {
      // random point on a spherical shell
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = inner + Math.random() * (outer - inner);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 1.2 + 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    if (!this._starTex) this._starTex = createCircleTexture(32);
    const mat = new THREE.PointsMaterial({
      size: 0.35,
      sizeAttenuation: true,
      map: this._starTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xbfc6ff,
      opacity: 0.8
    });
    const stars = new THREE.Points(geo, mat);
    stars.frustumCulled = false;
    this.scene.add(stars);
    this._track(geo, mat);
  }

  _createAgents() {
    // 2-3 distinct elliptical orbits (semi-major a, semi-minor b, inclination,
    // longitude of ascending node node, angular speed). All sit outside the
    // accretion disk so the agents read clearly against the dark sky.
    const orbitDefs = [
      { a: 10.5, b: 8.6, inc: 0.18, node: 0.0, speed: 0.22 },
      { a: 13.6, b: 11.1, inc: -0.34, node: 1.1, speed: 0.15 },
      { a: 16.8, b: 14.0, inc: 0.46, node: 2.3, speed: 0.10 }
    ];

    this.agentState = [];
    this.agentTextures = [];
    const agents = Array.isArray(AGENTS) ? AGENTS : [];
    const n = agents.length || 0;

    for (let i = 0; i < n; i++) {
      const ag = agents[i];
      const orbit = orbitDefs[i % orbitDefs.length];

      const tex = createEmojiTexture(ag.emoji, ag.color);
      this.agentTextures.push(tex);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending
      });
      const sprite = new THREE.Sprite(mat);
      const s = 1.7;
      sprite.scale.set(s, s, s);
      this.scene.add(sprite);
      this._track(mat);

      this.agentState.push({
        sprite,
        agent: ag,
        a: orbit.a,
        b: orbit.b,
        inc: orbit.inc,
        node: orbit.node,
        speed: orbit.speed,
        offset: (i / n) * Math.PI * 2 + Math.random() * 0.4
      });
    }
  }

  /* ---------------- events ---------------- */

  _bindEvents() {
    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._tick = this._tick.bind(this);

    this._resizeObs = new ResizeObserver(this._onResize);
    this._resizeObs.observe(this.container);

    window.addEventListener('mousemove', this._onPointerMove, { passive: true });
    window.addEventListener('touchmove', this._onPointerMove, { passive: true });

    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(this._onVisibility, {
        threshold: 0.01
      });
      this._io.observe(this.container);
    }
  }

  _onResize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    if (this.pointsMat) {
      this.pointsMat.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }
    if (this.reducedMotion) this._render();
  }

  _onPointerMove(e) {
    const x = (e.clientX != null ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX)) || 0;
    const y = (e.clientY != null ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY)) || 0;
    this.pointer.x = (x / window.innerWidth) * 2 - 1;
    this.pointer.y = -((y / window.innerHeight) * 2 - 1);
    this.targetCam.set(
      this.CAM_BASE.x + this.pointer.x * 2.6,
      this.CAM_BASE.y + this.pointer.y * 1.8,
      this.CAM_BASE.z
    );
    if (this.reducedMotion) this._render();
  }

  _onVisibility(entries) {
    const entry = entries[0];
    this.visible = entry ? entry.isIntersecting : true;
    if (this.visible) {
      this._ensureLoop();
    } else if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /* ---------------- loop ---------------- */

  _ensureLoop() {
    if (this.reducedMotion) { this._render(); return; }
    if (this.running && this.visible && this.rafId == null) {
      this.lastTime = performance.now() / 1000;
      this.rafId = requestAnimationFrame(this._tick);
    }
  }

  _tick() {
    if (!this.running || !this.visible || this.reducedMotion) {
      this.rafId = null;
      return;
    }
    this._update();
    this._render();
    this.rafId = requestAnimationFrame(this._tick);
  }

  _update() {
    const now = performance.now() / 1000;
    let dt = now - this.lastTime;
    this.lastTime = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.1) dt = 0.1; // clamp after tab switches / stalls

    // ease the idle<->consuming transition
    const target = this.mode === 'consuming' ? 1 : 0;
    this.modeT += (target - this.modeT) * Math.min(1, dt * 3.0);

    // shared sim clock: spins the whole system faster while consuming
    const spinMul = 1 + this.modeT * 2.5;
    this.simTime += dt * spinMul;

    this._syncUniforms();
    this._placeAgents(this.simTime);

    // mouse parallax (eased)
    this.camera.position.x += (this.targetCam.x - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.targetCam.y - this.camera.position.y) * 0.05;
    this.camera.position.z += (this.CAM_BASE.z - this.camera.position.z) * 0.05;
    this.camera.lookAt(0, 0, 0);
  }

  _syncUniforms() {
    if (this.pointsMat) {
      this.pointsMat.uniforms.uTime.value = this.simTime;
      this.pointsMat.uniforms.uConsume.value = this.modeT;
    }
    if (this.ringMat) {
      this.ringMat.uniforms.uTime.value = this.simTime;
      this.ringMat.uniforms.uConsume.value = this.modeT;
    }
    if (this.rimMat) {
      this.rimMat.uniforms.uConsume.value = this.modeT;
    }
  }

  _placeAgents(simTime) {
    if (!this.agentState) return;
    for (let i = 0; i < this.agentState.length; i++) {
      const a = this.agentState[i];
      const ang = a.offset + a.speed * simTime;
      const lx = a.a * Math.cos(ang);
      const lz = a.b * Math.sin(ang);
      // inclination (rotate about X)
      const y1 = -lz * Math.sin(a.inc);
      const z1 = lz * Math.cos(a.inc);
      // ascending node (rotate about Y)
      const x2 = lx * Math.cos(a.node) + z1 * Math.sin(a.node);
      const z2 = -lx * Math.sin(a.node) + z1 * Math.cos(a.node);
      a.sprite.position.set(x2, y1, z2);
    }
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  /* ---------------- public API ---------------- */

  start() {
    this.running = true;
    if (this.reducedMotion) {
      // render a single static frame and do not animate
      this._render();
      return;
    }
    this._ensureLoop();
  }

  stop() {
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setMode(mode) {
    if (mode !== 'idle' && mode !== 'consuming') {
      console.warn(`BlackHoleEngine.setMode: unknown mode "${mode}"`);
      return;
    }
    this.mode = mode;
    if (this.reducedMotion) {
      this.modeT = mode === 'consuming' ? 1 : 0;
      this._syncUniforms();
      this._render();
    }
    // otherwise the transition is driven inside _update()
  }

  destroy() {
    this.stop();

    if (this._io) { this._io.disconnect(); this._io = null; }
    if (this._resizeObs) { this._resizeObs.disconnect(); this._resizeObs = null; }
    window.removeEventListener('mousemove', this._onPointerMove);
    window.removeEventListener('touchmove', this._onPointerMove);

    // dispose tracked geometries / materials
    for (const item of this._disposables) {
      if (item && typeof item.dispose === 'function') item.dispose();
    }
    this._disposables.length = 0;

    // dispose textures
    if (this.particleTex) { this.particleTex.dispose(); this.particleTex = null; }
    if (this._starTex) { this._starTex.dispose(); this._starTex = null; }
    for (const t of this.agentTextures || []) t.dispose();
    this.agentTextures = [];

    // remove canvas
    if (this.renderer) {
      this.renderer.dispose();
      const dom = this.renderer.domElement;
      if (dom && dom.parentNode) dom.parentNode.removeChild(dom);
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.agentState = null;
  }

  /* ---------------- internals ---------------- */

  _track(...resources) {
    for (const r of resources) if (r) this._disposables.push(r);
    return resources[0];
  }
}

export default BlackHoleEngine;
