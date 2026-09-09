import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { setupInspector } from './inspect.js';

const BG = 0x04050a;

// ------------------------------------------------------------ mini orbit --
// Deliberately not three.js's OrbitControls addon: this page has exactly
// one external dependency (three.js core) so it keeps working the same way
// whether it's opened from GitHub Pages or from a Claude Artifact preview,
// with no addon-path/version-skew surface to break.
class MiniOrbit {
  constructor(camera, dom, target) {
    this.camera = camera;
    this.dom = dom;
    this.target = target.clone();
    const off = camera.position.clone().sub(this.target);
    this.radius = Math.max(off.length(), 1e-3);
    this.targetRadius = this.radius;
    this.theta = Math.atan2(off.x, off.z);
    this.phi = THREE.MathUtils.clamp(Math.acos(off.y / this.radius), 0.02, Math.PI - 0.02);
    this.minRadius = 1;
    this.maxRadius = 1e7;
    this.rotSpeed = 0.006;
    this.autoRotate = false;
    this.autoRotateSpeed = 0.12;
    this._pointers = new Map();
    this._pinchStart = null;
    this._bind();
  }

  _bind() {
    const dom = this.dom;
    dom.style.touchAction = 'none';
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    dom.addEventListener('pointerdown', (e) => {
      dom.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey });
      if (this._pointers.size === 2) {
        const pts = [...this._pointers.values()];
        this._pinchStart = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), radius: this.radius };
      }
    });

    dom.addEventListener('pointerup', (e) => { this._pointers.delete(e.pointerId); this._pinchStart = null; });
    dom.addEventListener('pointercancel', (e) => { this._pointers.delete(e.pointerId); this._pinchStart = null; });

    dom.addEventListener('pointermove', (e) => {
      const p = this._pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;

      if (this._pointers.size === 2) {
        const pts = [...this._pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (this._pinchStart && this._pinchStart.dist > 1e-3) {
          this.targetRadius = THREE.MathUtils.clamp(
            this._pinchStart.radius * (this._pinchStart.dist / Math.max(dist, 1e-3)),
            this.minRadius, this.maxRadius);
        }
        return;
      }

      const panning = p.button === 2 || p.shift;
      if (panning) {
        const scale = this.radius * 0.0013;
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        const right = new THREE.Vector3().crossVectors(dir, this.camera.up).normalize();
        const up = new THREE.Vector3().crossVectors(right, dir).normalize();
        this.target.addScaledVector(right, -dx * scale);
        this.target.addScaledVector(up, dy * scale);
      } else {
        this.theta -= dx * this.rotSpeed;
        this.phi = THREE.MathUtils.clamp(this.phi - dy * this.rotSpeed, 0.02, Math.PI - 0.02);
      }
    });

    // Zoom is proportional to the wheel delta (normalized across pixel/line/
    // page delta modes), capped per event, and eased toward a target radius
    // in update() -- a fixed x1.08 per event was far too fast on devices
    // that fire many wheel events per gesture.
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 0.02 : e.deltaMode === 2 ? 0.2 : 0.0005;
      const step = THREE.MathUtils.clamp(e.deltaY * k, -0.2, 0.2);
      this.targetRadius = THREE.MathUtils.clamp(this.targetRadius * Math.exp(step),
        this.minRadius, this.maxRadius);
    }, { passive: false });
  }

  setPose(radius, theta, phi, target) {
    this.radius = radius; this.targetRadius = radius; this.theta = theta; this.phi = phi;
    if (target) this.target.copy(target);
  }

  update(dt) {
    if (this.autoRotate) this.theta += this.autoRotateSpeed * dt;
    this.radius += (this.targetRadius - this.radius) * Math.min(1, dt * 7);
    const sp = Math.sin(this.phi);
    const x = this.target.x + this.radius * sp * Math.sin(this.theta);
    const y = this.target.y + this.radius * Math.cos(this.phi);
    const z = this.target.z + this.radius * sp * Math.cos(this.theta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}

// ------------------------------------------------------------- shaders --
// uTelescope: 0 = base view (all selected galaxies, mass-based size/tint),
// 1 = LSST, 2 = WISE, 3 = SPHEREx -- in telescope modes a galaxy is only
// drawn if ITS OWN real synthetic magnitude in that survey's band clears
// that survey's own real 5-sigma depth (same numbers as
// make_multitelescope_view.py's SURVEYS dict), and its on-screen size comes
// from its real flux relative to that depth, not from stellar mass.
const VERT = `
attribute float aSize;
attribute float aTile;
attribute vec3 aColor;
attribute float aMagLSST;
attribute float aMagWISE;
attribute float aMagSPX;
attribute float aRedshift;
varying vec3 vColor;
varying float vTile;
varying float vVisible;
uniform float uPixelRatio;
uniform float uSizeScale;
uniform highp float uTelescope;
uniform float uDepthLSST;
uniform float uDepthWISE;
uniform float uDepthSPX;
uniform float uZMax;
void main() {
  vColor = aColor;
  vTile = aTile;
  float sizeFactor = aSize;
  float visible = aRedshift <= uZMax ? 1.0 : 0.0;
  if (visible > 0.5 && uTelescope > 0.5) {
    float mag, depth;
    if (uTelescope < 1.5) { mag = aMagLSST; depth = uDepthLSST; }
    else if (uTelescope < 2.5) { mag = aMagWISE; depth = uDepthWISE; }
    else { mag = aMagSPX; depth = uDepthSPX; }
    if (mag >= depth) {
      visible = 0.0;
    } else {
      float fluxRel = clamp(pow(10.0, -0.4 * (mag - depth)), 0.05, 1.0e6);
      // Never draw a survey detection larger than the galaxy's own base
      // sprite. The flux-based size is anchored at each survey's depth, and
      // LSST's i<26.4 is ~7 mag deeper than WISE/SPHEREx, so without this
      // cap its bright end balloons and (with additive blending) the LSST
      // view glows brighter than "all galaxies" despite drawing fewer of
      // them. The cap is the same rule for every survey, so the relative
      // look of LSST vs WISE vs SPHEREx is unchanged -- WISE and SPHEREx
      // sit under it almost everywhere anyway.
      sizeFactor = min(0.22 * pow(fluxRel, 0.32), aSize);
    }
  }
  vVisible = visible;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float persp = uSizeScale * uPixelRatio / max(-mvPosition.z, 0.05);
  gl_PointSize = clamp(sizeFactor * persp, 1.0, 220.0);
  // A culled galaxy can NOT be hidden with gl_PointSize = 0.0: WebGL clamps
  // point size to the implementation's minimum (usually 1 px), so it still
  // rasterizes as a 1-px dot -- which is exactly what showed up as "WISE
  // detections at z=5.5" and "objects beyond the max-redshift cut" (no such
  // galaxy passes either cut in the data). Park it outside the clip volume
  // instead, so it is never rasterized; the fragment shader also discards
  // on vVisible as a second guard.
  gl_Position = visible > 0.5 ? projectionMatrix * mvPosition : vec4(0.0, 0.0, 2.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uAtlas;
uniform float uAtlasGrid;
uniform float uBrightness;
uniform highp float uTelescope;
varying vec3 vColor;
varying float vTile;
varying float vVisible;
void main() {
  if (vVisible < 0.5) discard;
  float grid = uAtlasGrid;
  float col = mod(vTile, grid);
  float row = floor(vTile / grid + 0.0001);
  vec2 uv = (vec2(col, row) + gl_PointCoord) / grid;
  float intensity = texture2D(uAtlas, uv).r;
  if (intensity < 0.015) discard;
  // WISE measures mid-IR flux, not an optical color -- give it its own
  // warm monochrome palette instead of the SPHEREx-color blue/red tint
  // used for the other views, so "this is a different kind of measurement"
  // reads visually, not just as a different galaxy count.
  vec3 tint = (uTelescope > 1.5 && uTelescope < 2.5) ? vec3(1.0, 0.62, 0.22) : vColor;
  gl_FragColor = vec4(tint * intensity * uBrightness, 1.0);
}`;

// ---------------------------------------------------------- data loading --
// Two ways this page runs: (1) GitHub Pages, fetching data/*.bin next to
// this file, or (2) a self-contained single-file preview (e.g. a Claude
// Artifact) with the same buffers embedded as base64 in
// window.__WEBVIZ_DATA__. Both paths feed the exact same renderer below.
function b64ToBuf(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
}

async function loadData() {
  if (window.__WEBVIZ_DATA__) {
    const d = window.__WEBVIZ_DATA__;
    return {
      manifest: d.manifest,
      rings: d.rings,
      pos: new Float32Array(b64ToBuf(d.pos_b64)),
      col: new Float32Array(b64ToBuf(d.col_b64)),
      size: new Float32Array(b64ToBuf(d.size_b64)),
      tileF32: Float32Array.from(new Uint8Array(b64ToBuf(d.tile_b64))),
      magLSST: new Float32Array(b64ToBuf(d.mag_lsst_b64)),
      magWISE: new Float32Array(b64ToBuf(d.mag_wise_b64)),
      magSPX: new Float32Array(b64ToBuf(d.mag_spx_b64)),
      redshift: new Float32Array(b64ToBuf(d.redshift_b64)),
      atlasUrl: d.atlas_data_uri,
    };
  }
  // 'no-cache' forces a revalidation round-trip instead of trusting a
  // possibly-stale local/CDN-edge copy -- these files change together
  // (e.g. manifest.json gained a "telescopes" key alongside app.js
  // starting to require it), so a stale manifest.json paired with a fresh
  // app.js would otherwise throw deep in main() and abort EVERY view, not
  // just the new one, before anything ever renders.
  async function fetchOrThrow(url, as) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    return as === 'json' ? r.json() : r.arrayBuffer();
  }
  const [manifest, rings] = await Promise.all([
    fetchOrThrow('data/manifest.json', 'json'),
    fetchOrThrow('data/rings.json', 'json'),
  ]);
  const [posBuf, colBuf, sizeBuf, tileBuf, magLSSTBuf, magWISEBuf, magSPXBuf, redshiftBuf] = await Promise.all([
    fetchOrThrow('data/pos.bin'),
    fetchOrThrow('data/col.bin'),
    fetchOrThrow('data/size.bin'),
    fetchOrThrow('data/tile.bin'),
    fetchOrThrow('data/mag_lsst.bin'),
    fetchOrThrow('data/mag_wise.bin'),
    fetchOrThrow('data/mag_spx.bin'),
    fetchOrThrow('data/redshift.bin'),
  ]);
  return {
    manifest, rings,
    pos: new Float32Array(posBuf),
    col: new Float32Array(colBuf),
    size: new Float32Array(sizeBuf),
    tileF32: Float32Array.from(new Uint8Array(tileBuf)),
    magLSST: new Float32Array(magLSSTBuf),
    magWISE: new Float32Array(magWISEBuf),
    magSPX: new Float32Array(magSPXBuf),
    redshift: new Float32Array(redshiftBuf),
    atlasUrl: 'data/atlas.png',
  };
}

// ---------------------------------------------------------------- main --
async function main() {
  const statusEl = document.getElementById('loading');
  const canvas = document.getElementById('c');

  const { manifest, rings, pos, col, size, tileF32, magLSST, magWISE, magSPX, redshift, atlasUrl } = await loadData();

  // Fallback in case a stale cached manifest.json without a "telescopes"
  // key ever slips past the no-cache fetch above -- these are the same
  // real depths build_data.py writes, so this only matters as a safety
  // net, never as the normal path.
  manifest.telescopes = manifest.telescopes || {
    LSST: { depth: 26.4, pix_scale: 0.2, psf_fwhm: 0.67, spec_line: '0.20″/pix · PSF 0.67″ · i < 26.4 AB (10-yr coadd)' },
    WISE: { depth: 19.6, pix_scale: 2.75, psf_fwhm: 6.1, spec_line: '2.75″/pix · PSF 6.1″ · W1 < 19.6 AB (5σ, AllWISE)' },
    SPHEREx: { depth: 19.5, pix_scale: 6.2, psf_fwhm: 4.7, spec_line: '6.2″/pix · PSF 4.7″ · ~1.2 µm < 19.5 AB (5σ all-sky)' },
  };

  const n = pos.length / 3;
  for (const [name, arr, stride] of [['aColor', col, 3], ['aSize', size, 1], ['aTile', tileF32, 1],
      ['aMagLSST', magLSST, 1], ['aMagWISE', magWISE, 1], ['aMagSPX', magSPX, 1],
      ['aRedshift', redshift, 1]]) {
    if (arr.length !== n * stride) {
      throw new Error(`${name} has ${arr.length} values, expected ${n * stride} (n=${n}) -- ` +
        'a data file is stale or corrupt; try a hard refresh (Ctrl/Cmd+Shift+R)');
    }
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);

  const distMax = manifest.dist_max_mpc;
  const zDefault = Math.min(manifest.zmax_default_view ?? 2.5, manifest.zmax);

  // comoving distance at a redshift, by linear interpolation in the dense
  // z -> D_C table build_data.py writes for this cosmology (falls back to
  // the dataset's max distance if an older manifest has no table).
  function distAtZ(zv) {
    const T = manifest.dc_table;
    if (!T) return distMax;
    const zs = T.z, ds = T.mpc;
    if (zv <= zs[0]) return ds[0];
    if (zv >= zs[zs.length - 1]) return ds[ds.length - 1];
    let lo = 0, hi = zs.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (zs[mid] <= zv) lo = mid; else hi = mid; }
    const t = (zv - zs[lo]) / (zs[hi] - zs[lo]);
    return ds[lo] + t * (ds[hi] - ds[lo]);
  }

  // The camera frames the CURRENTLY SHOWN depth (the max-redshift cut), not
  // the whole 8000+ Mpc dataset -- otherwise the default z<0.2 view would be
  // a small smudge near the origin of a mostly empty wedge.
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.5, distMax * 3.2);
  function framePose(d) {
    return { target: new THREE.Vector3(0, 0, d * 0.42), position: new THREE.Vector3(d * 0.32, d * 0.22, -d * 0.18) };
  }
  const pose0 = framePose(distAtZ(zDefault));
  camera.position.copy(pose0.position);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new MiniOrbit(camera, renderer.domElement, pose0.target);

  // -------------------------------------------------------------- points
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aTile', new THREE.BufferAttribute(tileF32, 1));
  geo.setAttribute('aMagLSST', new THREE.BufferAttribute(magLSST, 1));
  geo.setAttribute('aMagWISE', new THREE.BufferAttribute(magWISE, 1));
  geo.setAttribute('aMagSPX', new THREE.BufferAttribute(magSPX, 1));
  geo.setAttribute('aRedshift', new THREE.BufferAttribute(redshift, 1));

  const atlasTex = new THREE.TextureLoader().load(atlasUrl);
  atlasTex.generateMipmaps = false;
  atlasTex.minFilter = THREE.LinearFilter;
  atlasTex.magFilter = THREE.LinearFilter;
  atlasTex.wrapS = THREE.ClampToEdgeWrapping;
  atlasTex.wrapT = THREE.ClampToEdgeWrapping;
  atlasTex.colorSpace = THREE.NoColorSpace;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAtlas: { value: atlasTex },
      uAtlasGrid: { value: manifest.atlas_grid[0] },
      uPixelRatio: { value: renderer.getPixelRatio() },
      // world units here are Mpc (hundreds), not the ~1-10 unit scale most
      // three.js point-cloud demos assume -- gl_PointSize = uSizeScale *
      // aSize / distance, so this needs to be ~1e3-1e4, not O(100), or
      // every point renders sub-pixel and the whole page reads as empty.
      uSizeScale: { value: 3500.0 },
      uBrightness: { value: 1.5 },
      uTelescope: { value: 0.0 },
      uDepthLSST: { value: manifest.telescopes.LSST.depth },
      uDepthWISE: { value: manifest.telescopes.WISE.depth },
      uDepthSPX: { value: manifest.telescopes.SPHEREx.depth },
      uZMax: { value: zDefault },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  scene.add(points);

  // ---------------------------------------------------------------- rings
  // The wedge frame follows the max-redshift cut: rings at round redshifts
  // are shown only inside the cut, a brighter ring marks the cut itself, and
  // the 4 corner sightlines run from the observer exactly to the cut -- so
  // the frame never suggests galaxies beyond what is actually drawn.
  const ringGroup = new THREE.Group();
  const ringMat = new THREE.LineBasicMaterial({ color: 0x63d2c9, transparent: true, opacity: 0.75 });
  // a footprint outline may be several closed loops (e.g. a band with a hole);
  // older rings.json files carry a single `loop`
  const loopsOf = (ring) => ring.loops || [ring.loop];
  const ringMeshes = rings.rings.map((ring) => {
    const group = new THREE.Group();
    for (const loop of loopsOf(ring)) {
      const pts = loop.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
    }
    ringGroup.add(group);
    return { mesh: group, mpc: ring.mpc };
  });
  // unit-direction versions of the footprint boundary + corners, scaled live
  const r0 = rings.rings[0];
  const unitLoops = loopsOf(r0).map((loop) => loop.map((p) => [p[0] / r0.mpc, p[1] / r0.mpc, p[2] / r0.mpc]));
  const unitCorners = rings.sightlines_far.map((c) => [c[0] / distMax, c[1] / distMax, c[2] / distMax]);

  const cutGeos = unitLoops.map((ul) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ul.length * 3), 3));
    ringGroup.add(new THREE.LineLoop(g,
      new THREE.LineBasicMaterial({ color: 0x63d2c9, transparent: true, opacity: 0.75 })));
    return g;
  });

  const slGeo = new THREE.BufferGeometry();
  slGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(unitCorners.length * 2 * 3), 3));
  ringGroup.add(new THREE.LineSegments(slGeo,
    new THREE.LineBasicMaterial({ color: 0x63d2c9, transparent: true, opacity: 0.75 })));
  ringGroup.visible = document.getElementById('rings-chk').checked;
  scene.add(ringGroup);

  function setFrameDistance(d) {
    for (const r of ringMeshes) r.mesh.visible = r.mpc <= d * 1.001;
    unitLoops.forEach((ul, k) => {
      const cp = cutGeos[k].attributes.position.array;
      ul.forEach((u, i) => { cp[3 * i] = u[0] * d; cp[3 * i + 1] = u[1] * d; cp[3 * i + 2] = u[2] * d; });
      cutGeos[k].attributes.position.needsUpdate = true;
      cutGeos[k].computeBoundingSphere();
    });
    const sp = slGeo.attributes.position.array;
    unitCorners.forEach((u, i) => {
      sp[6 * i] = 0; sp[6 * i + 1] = 0; sp[6 * i + 2] = 0;
      sp[6 * i + 3] = u[0] * d; sp[6 * i + 4] = u[1] * d; sp[6 * i + 5] = u[2] * d;
    });
    slGeo.attributes.position.needsUpdate = true;
    slGeo.computeBoundingSphere();
  }

  // ----------------------------------------------------------- Milky Way
  // Observer marker: a small constant-pixel-size reticle sprite (thin ring,
  // four ticks, center dot) instead of a world-space solid -- a solid mesh
  // sized in Mpc either vanishes or blocks the view depending on zoom.
  function makeReticleTexture() {
    const s = 64, cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const g = cv.getContext('2d');
    g.strokeStyle = 'rgba(217, 196, 103, 0.95)';
    g.lineWidth = 2;
    g.beginPath(); g.arc(s / 2, s / 2, 13, 0, Math.PI * 2); g.stroke();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      g.beginPath(); g.moveTo(s / 2 + dx * 17, s / 2 + dy * 17); g.lineTo(s / 2 + dx * 27, s / 2 + dy * 27); g.stroke();
    }
    g.fillStyle = 'rgba(255, 255, 255, 0.95)';
    g.beginPath(); g.arc(s / 2, s / 2, 2.2, 0, Math.PI * 2); g.fill();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const mwMarker = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeReticleTexture(), sizeAttenuation: false, transparent: true, depthTest: false, depthWrite: false,
  }));
  mwMarker.scale.set(0.05, 0.05, 1);
  mwMarker.renderOrder = 10;
  scene.add(mwMarker);
  const mwLabel = document.getElementById('mw-label');

  // ------------------------------------------------------------------ UI
  document.getElementById('n-total').textContent = manifest.n.toLocaleString();
  document.getElementById('m-min').textContent = Math.log10(manifest.mass_min).toFixed(1);
  document.getElementById('gen-date').textContent = manifest.generated;
  const patches = manifest.patches || [manifest.patch ?? 6];
  const patchText = (patches.length > 1 ? 'es ' : ' ') + patches.join(' + ');
  for (const el of document.querySelectorAll('.patch-list')) el.textContent = patchText;
  if (manifest.area_deg2) {
    for (const el of document.querySelectorAll('.area-deg2')) el.textContent = Math.round(manifest.area_deg2);
  }
  // "About this view" placeholders, filled from the manifest so they track
  // whatever patches / caps the data was last built with.
  const shortCount = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n < 1e7 ? 1 : 0).replace(/\.0$/, "")}M` : `${Math.round(n / 1e3)}K`);
  const fillAll = (sel, text) => { for (const el of document.querySelectorAll(sel)) el.textContent = text; };
  if (manifest.shell_width_mpc) fillAll('.shell-mpc', Math.round(manifest.shell_width_mpc));
  if (manifest.shell_cap) fillAll('.shell-cap', manifest.shell_cap.toLocaleString());
  if (manifest.n_total) fillAll('.n-total-short', shortCount(manifest.n_total));
  fillAll('.n-drawn-short', shortCount(manifest.n));

  // "reset view" re-frames whatever depth is currently shown, so it stays
  // useful after the max-redshift slider has moved.
  document.getElementById('reset-btn').addEventListener('click', () => {
    const p = framePose(distAtZ(currentZMax));
    const off = p.position.clone().sub(p.target);
    controls.setPose(off.length(), Math.atan2(off.x, off.z),
      Math.acos(THREE.MathUtils.clamp(off.y / off.length(), -1, 1)), p.target);
  });
  // "observer view" puts the camera at the Milky Way (the origin) looking
  // straight down the wedge axis, i.e. an observer's view of this patch of
  // sky. The orbit target is the centre of the current redshift cut, so
  // dragging swings the sightline around the sky and scrolling flies out
  // along the sightline into the wedge. The camera sits a hair behind the
  // origin so the reticle still projects (a point exactly at the camera
  // position cannot) and shows up at the centre of the screen.
  // The axis is the local +Z, i.e. the mean line of sight of the drawn
  // galaxies (build_data.py rotates the frame so). Averaging the 4 corner
  // directions instead is wrong once the footprint is a ring segment: the
  // corners all sit on the gap side, so the sky centre drifts off-screen.
  const wedgeAxis = new THREE.Vector3(0, 0, 1);
  document.getElementById('observer-btn').addEventListener('click', () => {
    const d = distAtZ(currentZMax);
    const target = wedgeAxis.clone().multiplyScalar(d);
    const radius = d + Math.max(2, d * 0.002);
    const off = wedgeAxis.clone().multiplyScalar(-radius);
    controls.setPose(radius, Math.atan2(off.x, off.z),
      Math.acos(THREE.MathUtils.clamp(off.y / radius, -1, 1)), target);
  });
  document.getElementById('rotate-chk').addEventListener('change', (e) => {
    controls.autoRotate = e.target.checked;
  });
  document.getElementById('brightness').addEventListener('input', (e) => {
    material.uniforms.uBrightness.value = parseFloat(e.target.value);
  });
  document.getElementById('pointsize').addEventListener('input', (e) => {
    material.uniforms.uSizeScale.value = parseFloat(e.target.value);
  });
  document.getElementById('rings-chk').addEventListener('change', (e) => {
    ringGroup.visible = e.target.checked;
  });

  // ---------------------------------------- telescope switch + depth slider
  // Both filters are combined (a galaxy must pass z<=uZMax AND, in a
  // telescope mode, that survey's own depth -- see the shader), so the
  // live "N visible" count and telescope spec line are recomputed together
  // whenever either control changes, by one pass over the typed arrays
  // already in memory (cheap even at n~400k).
  const TELESCOPE_IDS = { all: 0, LSST: 1, WISE: 2, SPHEREx: 3 };
  let currentTelescope = 'all';
  let currentZMax = material.uniforms.uZMax.value;

  function countVisible() {
    const mag = currentTelescope === 'all' ? null
      : currentTelescope === 'LSST' ? magLSST
      : currentTelescope === 'WISE' ? magWISE : magSPX;
    const depth = currentTelescope === 'all' ? 0 : manifest.telescopes[currentTelescope].depth;
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (redshift[i] > currentZMax) continue;
      if (mag && mag[i] >= depth) continue;
      count++;
    }
    return count;
  }

  const nCountEl = document.getElementById('n-count');
  const zRangeEl = document.getElementById('z-range');
  const dRangeEl = document.getElementById('d-range');
  const specEl = document.getElementById('telescope-spec');
  function refreshStats() {
    const visible = countVisible();
    const cutDist = distAtZ(currentZMax);
    setFrameDistance(cutDist);
    nCountEl.textContent = visible.toLocaleString();
    zRangeEl.textContent = currentZMax.toFixed(2);
    dRangeEl.textContent = `${manifest.dist_min_mpc.toFixed(0)} – ${cutDist.toFixed(0)} Mpc`;
    if (currentTelescope === 'all') {
      specEl.textContent = `${visible.toLocaleString()} galaxies in view · size/tint by stellar mass & SPHEREx color`;
    } else {
      const spec = manifest.telescopes[currentTelescope];
      specEl.textContent = `${spec.spec_line} · ${visible.toLocaleString()} of the galaxies in view clear this real depth`;
    }
  }

  function setTelescope(name) {
    currentTelescope = name;
    material.uniforms.uTelescope.value = TELESCOPE_IDS[name];
    for (const btn of document.querySelectorAll('#telescope-switch button')) {
      btn.classList.toggle('active', btn.dataset.scope === name);
    }
    refreshStats();
  }
  for (const btn of document.querySelectorAll('#telescope-switch button')) {
    btn.addEventListener('click', () => setTelescope(btn.dataset.scope));
  }

  // Slider is an integer 0-1000 mapped through a cube so most of the drag
  // range covers the astronomically "local" structure (z<~1) that a linear
  // 0-5.5 slider would squeeze into its first tenth, while still reaching
  // the mock's full z=5.5 depth at the far end.
  const zmaxSlider = document.getElementById('zmax-slider');
  zmaxSlider.max = 1000;
  zmaxSlider.value = Math.round(1000 * Math.cbrt(currentZMax / manifest.zmax));
  zmaxSlider.addEventListener('input', (e) => {
    const frac = parseFloat(e.target.value) / 1000;
    currentZMax = manifest.zmax * frac ** 3;
    material.uniforms.uZMax.value = currentZMax;
    refreshStats();
  });

  setTelescope('all');

  const infoBtn = document.getElementById('info-btn');
  const infoPanel = document.getElementById('info-panel');
  infoBtn.addEventListener('click', () => infoPanel.classList.toggle('hidden'));

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });

  // ------------------------------------------------------- coordinate labels
  const hud = document.getElementById('hud');
  function makeLabel(text, cls) {
    const el = document.createElement('div');
    el.className = `coord-label ${cls}`;
    el.textContent = text;
    el.style.display = 'none';
    hud.appendChild(el);
    return el;
  }
  // ring labels sit on their ring (hidden with it past the cut); RA/Dec
  // corner labels ride the sightline ends, i.e. the cut ring's corners.
  const coordLabels = [
    ...rings.rings.map((r, i) => ({
      pos: new THREE.Vector3(...loopsOf(r)[0][0]),
      shownIf: () => ringMeshes[i].mesh.visible,
      el: makeLabel(`z = ${r.z}  ·  ${r.mpc.toFixed(0)} Mpc`, 'coord-label--z'),
    })),
    ...(rings.corners || []).map((c) => ({
      pos: new THREE.Vector3(),
      unit: new THREE.Vector3(...c.pos).divideScalar(distMax),
      shownIf: () => true,
      el: makeLabel(`RA ${c.ra.toFixed(1)}°, Dec ${c.dec.toFixed(1)}°`, 'coord-label--radec'),
    })),
  ];
  let labelsOn = false;
  document.getElementById('labels-chk').addEventListener('change', (e) => {
    labelsOn = e.target.checked;
    if (!labelsOn) for (const { el } of coordLabels) el.style.display = 'none';
  });

  // ------------------------------------------------------------ inspector
  // Click a SPHEREx-detectable galaxy -> detail panel (inspect.js). A click
  // is a pointerdown/up pair that barely moved, so orbit drags never pick.
  const inspector = await setupInspector(THREE, {
    renderer, camera, geo, mainMaterial: material, manifest, hud, distAtZ, tileF32, colArr: col,
  });
  if (inspector) {
    document.getElementById('pick-hint').classList.remove('hidden');
    // Count against the LIVE SPHEREx depth (manifest), not the baked
    // details.json figure: the shards were cut at an older, slightly deeper
    // limit and simply carry a few unpickable extra records.
    let nPick = 0;
    for (let i = 0; i < n; i++) if (magSPX[i] < manifest.telescopes.SPHEREx.depth) nPick++;
    document.getElementById('n-pickable').textContent = nPick.toLocaleString();
    const dom = renderer.domElement;
    let down = null;
    dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, b: e.button, shift: e.shiftKey, t: performance.now() }; });
    dom.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const ok = down.b === 0 && !down.shift && moved < 4 && performance.now() - down.t < 600;
      down = null;
      if (!ok) return;
      const idx = inspector.pickAt(e.clientX, e.clientY);
      if (idx >= 0) inspector.select(idx);
    });
    dom.addEventListener('pointermove', (e) => { if (!down && e.pointerType !== 'touch') inspector.hover(e.clientX, e.clientY); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') inspector.close(); });
  }

  statusEl.classList.add('hidden');

  // --------------------------------------------------------------- loop
  const projVec = new THREE.Vector3();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    controls.update(dt);

    projVec.copy(mwMarker.position).project(camera);
    if (projVec.z < 1) {
      mwLabel.style.left = `${(projVec.x * 0.5 + 0.5) * window.innerWidth}px`;
      mwLabel.style.top = `${(-projVec.y * 0.5 + 0.5) * window.innerHeight - 18}px`;
      mwLabel.classList.remove('hidden');
    } else {
      mwLabel.classList.add('hidden');
    }

    if (labelsOn) {
      const cutDist = distAtZ(currentZMax);
      for (const { pos, unit, shownIf, el } of coordLabels) {
        if (unit) pos.copy(unit).multiplyScalar(cutDist);
        projVec.copy(pos).project(camera);
        if (projVec.z < 1 && shownIf()) {
          el.style.left = `${(projVec.x * 0.5 + 0.5) * window.innerWidth}px`;
          el.style.top = `${(-projVec.y * 0.5 + 0.5) * window.innerHeight}px`;
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      }
    }

    if (inspector) inspector.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main().catch((err) => {
  console.error(err);
  const el = document.getElementById('loading');
  el.style.color = '#ff6b6b';
  el.style.maxWidth = '640px';
  el.textContent = 'Failed to load: ' + err.message +
    ' — try a hard refresh (Ctrl/Cmd+Shift+R). If opened as a local file:// URL, ' +
    'this needs an actual server instead (e.g. `python3 -m http.server`).';
});
