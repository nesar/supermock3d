// Click-to-inspect: GPU ID-pass picking of SPHEREx-detectable galaxies, lazy
// per-shard detail loading (docs/data/details/*.bin, built by
// money_plot/webviz/build_details.py) and the right-hand detail panel with a
// three-telescope "closer look", SED + photometry, SFH and halo MAH charts.
//
// Only galaxies that clear the SPHEREx 5-sigma depth carry details (~99k of
// the ~803k drawn), so the pick pass renders ONLY those -- in every view a
// click snaps to the nearest inspectable galaxy under the cursor.

const PICK_VERT = `
attribute float aIndex;
attribute float aSize;
attribute float aMagLSST;
attribute float aMagWISE;
attribute float aMagSPX;
attribute float aRedshift;
varying vec3 vId;
varying float vVisible;
uniform float uPixelRatio;
uniform float uSizeScale;
uniform highp float uTelescope;
uniform float uDepthLSST;
uniform float uDepthWISE;
uniform float uDepthSPX;
uniform float uZMax;
uniform float uMinPx;
void main() {
  float sizeFactor = aSize;
  // inspectable = drawn under the current cut AND SPHEREx-detectable
  float visible = (aRedshift <= uZMax && aMagSPX < uDepthSPX) ? 1.0 : 0.0;
  if (visible > 0.5 && uTelescope > 0.5) {
    float mag, depth;
    if (uTelescope < 1.5) { mag = aMagLSST; depth = uDepthLSST; }
    else if (uTelescope < 2.5) { mag = aMagWISE; depth = uDepthWISE; }
    else { mag = aMagSPX; depth = uDepthSPX; }
    if (mag >= depth) visible = 0.0;
    else sizeFactor = 0.22 * pow(clamp(pow(10.0, -0.4 * (mag - depth)), 0.05, 1.0e6), 0.32);
  }
  vVisible = visible;
  float id = aIndex + 1.0;
  vId = vec3(floor(id / 65536.0), floor(mod(id, 65536.0) / 256.0), mod(id, 256.0)) / 255.0;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float persp = uSizeScale * uPixelRatio / max(-mvPosition.z, 0.05);
  gl_PointSize = clamp(max(sizeFactor * persp * 0.6, uMinPx), 1.0, 220.0);
  gl_Position = visible > 0.5 ? projectionMatrix * mvPosition : vec4(0.0, 0.0, 2.0, 1.0);
}`;

const PICK_FRAG = `
precision highp float;
varying vec3 vId;
varying float vVisible;
void main() {
  if (vVisible < 0.5) discard;
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  gl_FragColor = vec4(vId, 1.0);
}`;

// flat LCDM (H0 = 67.77, Om = 0.307115) cosmic age at redshift z, Gyr
const H0 = 67.77, OM = 0.307115, OL = 1 - OM;
function ageAtZ(z) {
  const tH = 977.8 / H0;
  return tH * 2 / (3 * Math.sqrt(OL)) * Math.asinh(Math.sqrt(OL / OM) / Math.pow(1 + z, 1.5));
}

const fmt = {
  deg: (v) => `${v.toFixed(4)}°`,
  z: (v) => v.toFixed(4),
  logm: (v) => Number.isFinite(v) ? `10<sup>${v.toFixed(2)}</sup>` : '—',
  gyr: (v) => Number.isFinite(v) ? `${v.toFixed(2)} Gyr` : '—',
  mag: (v) => Number.isFinite(v) && v < 90 ? v.toFixed(2) : '—',
  int: (v) => v.toLocaleString(),
};

export async function setupInspector(THREE, ctx) {
  const { renderer, camera, geo, mainMaterial, manifest, hud, distAtZ, tileF32, colArr } = ctx;

  // ------------------------------------------------------------ details.json
  let details;
  try {
    const r = await fetch('data/details.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    details = await r.json();
  } catch (err) {
    console.warn('inspector disabled: data/details.json not available', err);
    return null;
  }
  const layout = details.layout;
  const NS = details.scalars.length;
  const S = Object.fromEntries(details.scalars.map((k, i) => [k, i]));
  const shardCache = new Map();

  function shardFor(idx) {
    const b = details.bounds;
    if (idx < b[0] || idx >= b[b.length - 1]) return -1;
    let lo = 0, hi = b.length - 2;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (b[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo;
  }

  async function loadShard(k) {
    if (shardCache.has(k)) return shardCache.get(k);
    const p = (async () => {
      const meta = details.shards[k];
      const r = await fetch(`data/details/${meta.file}`);
      if (!r.ok) throw new Error(`${meta.file}: HTTP ${r.status}`);
      const buf = await r.arrayBuffer();
      const n = meta.n;
      const views = {};
      let off = 0;
      for (const f of layout) {
        const count = n * f.width;
        if (f.dtype === 'int32') views[f.name] = new Int32Array(buf, off, count), off += count * 4;
        else if (f.dtype === 'float32') views[f.name] = new Float32Array(buf, off, count), off += count * 4;
        else views[f.name] = new Uint16Array(buf, off, count), off += count * 2;
      }
      return { n, views };
    })();
    shardCache.set(k, p);
    return p;
  }

  function dequant(view, row, width, key) {
    const q = details.quant[key];
    const out = new Float64Array(width);
    for (let i = 0; i < width; i++) {
      const v = view[row * width + i];
      out[i] = v === 0 ? NaN : q.lo + (v - 1) / 65534 * (q.hi - q.lo);
    }
    return out;
  }

  async function fetchRecord(idx) {
    const k = shardFor(idx);
    if (k < 0) return null;
    const sh = await loadShard(k);
    const ids = sh.views.index;
    let lo = 0, hi = sh.n - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (ids[mid] === idx) {
        const row = mid;
        const w = Object.fromEntries(layout.map((f) => [f.name, f.width]));
        const sc = sh.views.scalars.subarray(row * NS, (row + 1) * NS);
        return {
          idx,
          scalars: Object.fromEntries(details.scalars.map((kk, i) => [kk, sc[i]])),
          mah: dequant(sh.views.mah, row, w.mah, 'mah'),
          mahHost: dequant(sh.views.mah_host, row, w.mah_host, 'mah_host'),
          sfh: dequant(sh.views.sfh, row, w.sfh, 'sfh'),
          phot: dequant(sh.views.phot, row, w.phot, 'phot'),
          sed: dequant(sh.views.sed, row, w.sed, 'sed'),
        };
      }
      if (ids[mid] < idx) lo = mid + 1; else hi = mid - 1;
    }
    return null;
  }

  // shared bandpasses (float32 [nf][npts][2]) -- fetched once, lazily
  let filtersPromise = null;
  function loadFilters() {
    if (!filtersPromise) {
      filtersPromise = fetch(`data/details/${details.filters.file}`).then((r) => r.arrayBuffer()).then((buf) => {
        const f = new Float32Array(buf), np = details.filters.n_pts;
        return details.filters.names.map((name, i) => ({
          name, wl: f.subarray(i * np * 2, (i + 1) * np * 2).filter((_, j) => j % 2 === 0),
          tr: f.subarray(i * np * 2, (i + 1) * np * 2).filter((_, j) => j % 2 === 1),
        }));
      }).catch((e) => { console.warn('filters.bin unavailable', e); return []; });
    }
    return filtersPromise;
  }

  // ------------------------------------------------------------- pick pass
  const n = geo.attributes.position.count;
  const idxAttr = new Float32Array(n);
  for (let i = 0; i < n; i++) idxAttr[i] = i;
  geo.setAttribute('aIndex', new THREE.BufferAttribute(idxAttr, 1));

  const mu = mainMaterial.uniforms;
  const pickMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: mu.uPixelRatio, uSizeScale: mu.uSizeScale, uTelescope: mu.uTelescope,
      uDepthLSST: mu.uDepthLSST, uDepthWISE: mu.uDepthWISE, uDepthSPX: mu.uDepthSPX, uZMax: mu.uZMax,
      uMinPx: { value: 9.0 },
    },
    vertexShader: PICK_VERT, fragmentShader: PICK_FRAG,
    blending: THREE.NoBlending, depthTest: true, depthWrite: true,
  });
  const pickScene = new THREE.Scene();
  pickScene.add(new THREE.Points(geo, pickMaterial));
  const WIN = 32;
  const pickTarget = new THREE.WebGLRenderTarget(WIN, WIN, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, stencilBuffer: false,
  });
  const pixels = new Uint8Array(WIN * WIN * 4);

  // Render only a WIN x WIN device-pixel window centred on (cx, cy) CSS px,
  // read it back, return the inspectable galaxy nearest the centre (or -1).
  function pickAt(cx, cy) {
    const pr = renderer.getPixelRatio();
    const fullW = renderer.domElement.width, fullH = renderer.domElement.height;
    const x0 = Math.round(cx * pr - WIN / 2), y0 = Math.round(cy * pr - WIN / 2);
    camera.setViewOffset(fullW, fullH, x0, y0, WIN, WIN);
    const oldTarget = renderer.getRenderTarget();
    const oldClear = renderer.getClearColor(new THREE.Color()), oldAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(pickTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(pickScene, camera);
    renderer.readRenderTargetPixels(pickTarget, 0, 0, WIN, WIN, pixels);
    renderer.setRenderTarget(oldTarget);
    renderer.setClearColor(oldClear, oldAlpha);
    camera.clearViewOffset();
    let best = -1, bestD = Infinity;
    for (let y = 0; y < WIN; y++) {
      for (let x = 0; x < WIN; x++) {
        const o = (y * WIN + x) * 4;
        if (pixels[o + 3] === 0) continue;
        const id = pixels[o] * 65536 + pixels[o + 1] * 256 + pixels[o + 2];
        if (id === 0) continue;
        const d = (x - WIN / 2) ** 2 + (WIN - 1 - y - WIN / 2) ** 2;   // readback is bottom-up
        if (d < bestD) { bestD = d; best = id - 1; }
      }
    }
    return best;
  }

  // --------------------------------------------------------------- panel UI
  const panel = document.getElementById('detail-panel');
  const hoverRing = document.getElementById('hover-ring');
  const selRing = document.getElementById('select-ring');
  const posAttr = geo.attributes.position.array;
  let selected = -1, hovered = -1;
  const projVec = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  function placeRing(el, idx) {
    if (idx < 0) { el.classList.add('hidden'); return; }
    tmp.set(posAttr[3 * idx], posAttr[3 * idx + 1], posAttr[3 * idx + 2]);
    projVec.copy(tmp).project(camera);
    if (projVec.z >= 1) { el.classList.add('hidden'); return; }
    el.style.left = `${(projVec.x * 0.5 + 0.5) * window.innerWidth}px`;
    el.style.top = `${(-projVec.y * 0.5 + 0.5) * window.innerHeight}px`;
    el.classList.remove('hidden');
  }

  function update() {
    placeRing(hoverRing, hovered === selected ? -1 : hovered);
    placeRing(selRing, selected);
  }

  let lastHover = 0;
  function hover(cx, cy) {
    const now = performance.now();
    if (now - lastHover < 40) return;
    lastHover = now;
    hovered = pickAt(cx, cy);
    renderer.domElement.style.cursor = hovered >= 0 ? 'pointer' : '';
  }

  function close() {
    selected = -1;
    panel.classList.add('hidden');
    update();
  }
  panel.querySelector('.close-btn').addEventListener('click', close);

  async function select(idx) {
    if (idx < 0) return;
    selected = idx;
    document.getElementById('info-panel').classList.add('hidden');
    panel.classList.remove('hidden');
    panel.querySelector('.detail-title').textContent = `galaxy #${idx.toLocaleString()}`;
    panel.querySelector('.detail-body').innerHTML = '<div class="detail-loading">loading catalog record…</div>';
    try {
      const [rec, filters] = await Promise.all([fetchRecord(idx), loadFilters()]);
      if (selected !== idx) return;                       // superseded by a later click
      if (!rec) { panel.querySelector('.detail-body').textContent = 'no detail record for this galaxy'; return; }
      renderPanel(rec, filters);
    } catch (err) {
      console.error(err);
      panel.querySelector('.detail-body').textContent = `failed to load details: ${err.message}`;
    }
  }

  // ---------------------------------------------------------- panel content
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  function renderPanel(rec, filters) {
    const s = rec.scalars;
    const body = panel.querySelector('.detail-body');
    body.innerHTML = '';
    const z = s.redshift;
    const dC = distAtZ(z);
    const dA = dC / (1 + z);
    const isCentral = s.central > 0.5;
    const tObs = ageAtZ(z);

    // ---- scalars
    const grid = el('dl', 'detail-grid');
    const row = (k, v, title) => {
      const dt = el('dt'); dt.innerHTML = k; if (title) dt.title = title;
      const dd = el('dd'); dd.innerHTML = v;
      grid.append(dt, dd);
    };
    row('RA / Dec', `${fmt.deg(s.ra)}  ${fmt.deg(s.dec)}`);
    row('redshift', `${fmt.z(z)}  (${dC.toFixed(0)} Mpc comoving)`, 'observed redshift incl. peculiar velocity');
    row('lookback', `${(ageAtZ(0) - tObs).toFixed(2)} Gyr  ·  age ${tObs.toFixed(2)} Gyr`);
    row('M<sub>★</sub>', `${fmt.logm(s.log_mstar)} M<sub>☉</sub>`, 'stellar mass at the observed epoch (catalog stellar_mass)');
    row('M<sub>halo</sub>', `${fmt.logm(s.log_mhalo_now)} h<sup>−1</sup> M<sub>☉</sub>  (peak ${fmt.logm(s.log_mpeak)})`, 'core halo mass, last MAH step / peak');
    row('role', isCentral ? 'central' : `satellite${Number.isFinite(s.age_infall) ? ` · infall at ${s.age_infall.toFixed(2)} Gyr` : ''}`);
    row('t<sub>50</sub> / t<sub>25</sub>', `${fmt.gyr(s.age_t50)} / ${fmt.gyr(s.age_t25)}`, 'cosmic age when the halo reached 50% / 25% of its peak mass');
    row('L<sub>bol</sub>', Number.isFinite(s.log_lbol) ? `${fmt.logm(s.log_lbol)} L<sub>☉</sub>` : '—');
    row('M<sub>r</sub>, M<sub>W1</sub>', `${fmt.mag(s.Mabs_r)}, ${fmt.mag(s.Mabs_W1)}  (absolute, AB)`);
    const iLSST = details.phot_names.indexOf('LSST_i'), iW1 = details.phot_names.indexOf('WISE_W1');
    const i12 = 22, i40 = 80;
    row('m<sub>AB</sub>', `i ${fmt.mag(rec.phot[iLSST])} · W1 ${fmt.mag(rec.phot[iW1])} · SPHEREx 1.2 µm ${fmt.mag(rec.phot[i12])} · 4.0 µm ${fmt.mag(rec.phot[i40])}`, 'apparent AB magnitudes');
    row('v<sub>x,y,z</sub>', `${s.vx.toFixed(0)}, ${s.vy.toFixed(0)}, ${s.vz.toFixed(0)} km s<sup>−1</sup>`, 'peculiar velocity in the simulation box frame');
    body.append(grid);

    // ---- closer look: three telescopes
    body.append(sectionTitle('closer look', 'illustrative Sérsic model of this galaxy at each survey\'s pixel scale + PSF'));
    body.append(closerLook(rec));

    // ---- charts
    body.append(sectionTitle('spectral energy distribution', 'observed frame; points = synthetic photometry from the catalog'));
    body.append(sedChart(rec, filters));
    body.append(sectionTitle('star-formation history', 'dM★/dt vs cosmic age; the marker is this galaxy\'s observed epoch'));
    body.append(historyChart(details.sfh_age_gyr, [{ y: rec.sfh, color: '#63d2c9', label: 'dM_{★}/dt' }],
      'dM_{★}/dt  [M_{☉} yr^{−1}]', tObs));
    body.append(sectionTitle('halo mass accretion history', 'core halo mass (and its host halo, for satellites) vs cosmic age'));
    const series = [{ y: rec.mah, color: '#63d2c9', label: 'own halo' }];
    if (!isCentral) series.push({ y: rec.mahHost, color: '#b39dff', label: 'host halo' });
    body.append(historyChart(details.mah_age_gyr, series, 'M_{halo}  [h^{−1} M_{☉}]', tObs));
    body.append(el('p', 'detail-foot',
      'Position, redshift, masses, histories, SED and photometry are the catalog\'s own values. ' +
      'Morphology, size and orientation are procedural (the mock stores none), so the closer-look ' +
      'stamps show how a galaxy of this mass and color would look, not this galaxy\'s true shape.'));
  }

  function sectionTitle(t, sub) {
    const h = el('div', 'detail-sec');
    h.append(el('h3', null, t));
    if (sub) h.append(el('span', null, sub));
    return h;
  }

  // ------------------------------------------------------------ closer look
  // Sérsic n=1 (disk) or n=4 (spheroid) with the same axis ratio / PA bin as
  // the galaxy's atlas tile, semi-major half-light radius from the van der
  // Wel+2014 size-mass relation (with its redshift evolution), rendered at
  // high resolution, convolved with the survey PSF and box-binned to the
  // survey pixel scale. Same 62" field (10 SPHEREx pixels) for all three.
  function closerLook(rec) {
    const s = rec.scalars;
    const wrap = el('div', 'closer-row');
    const tile = tileF32[rec.idx];
    const spiral = tile >= 8;
    const qBin = Math.floor((tile % 8) / 4), paBin = tile % 4;
    const q = qBin === 1 ? 0.85 : 0.45;
    const pa = paBin * 45 + 20;
    const logM = Number.isFinite(s.log_mstar) ? s.log_mstar : 10;
    const z = s.redshift;
    // Semi-major half-light radius from the van der Wel+2014 (3D-HST+CANDELS)
    // size-mass relation, R_e = A (M*/5e10)^alpha, z=0.25 bin normalisation
    // (late: log A = 0.86, alpha = 0.25; early: log A = 0.60, alpha = 0.75)
    // with their redshift evolution (1+z)^-0.75 (late) / (1+z)^-1.48 (early).
    const mRel = Math.pow(10, logM) / 5e10;
    const reKpc = spiral
      ? 7.24 * Math.pow(mRel, 0.25) * Math.pow((1 + z) / 1.25, -0.75)
      : 3.98 * Math.pow(mRel, 0.75) * Math.pow((1 + z) / 1.25, -1.48);
    const dAkpc = distAtZ(z) / (1 + z) * 1000;
    const reArcsec = reKpc / dAkpc * 206265;
    const FOV = 10 * manifest.telescopes.SPHEREx.pix_scale; // 62": a 10x10 SPHEREx pixel grid
    const cr = colArr;
    const tint = [cr[3 * rec.idx], cr[3 * rec.idx + 1], cr[3 * rec.idx + 2]];

    // Linear-flux Sersic model on a 256-px grid (0.24"/px). Everything below
    // is done in Float32 arrays -- no canvas filters or drawImage rescaling,
    // which (a) faded alpha at the canvas edges under blur so the survey tint
    // showed through as a coloured frame, and (b) sub-sampled a 25x downscale
    // so an unresolved galaxy could fall between samples and vanish.
    const HR = 256, scaleHR = FOV / HR;
    const nS = spiral ? 1 : 4;
    const bn = 1.9992 * nS - 0.3271;
    const cosP = Math.cos(pa * Math.PI / 180), sinP = Math.sin(pa * Math.PI / 180);
    const rePx = Math.max(reArcsec / scaleHR, 0.3);
    const model = new Float32Array(HR * HR);
    for (let y = 0; y < HR; y++) {
      for (let x = 0; x < HR; x++) {
        const dx = x - HR / 2 + 0.5, dy = y - HR / 2 + 0.5;
        const u = dx * cosP + dy * sinP, v = (-dx * sinP + dy * cosP) / q;
        const r = Math.hypot(u, v) / rePx;
        model[y * HR + x] = Math.exp(-bn * (Math.pow(r + 1e-4, 1 / nS) - 1));
      }
    }

    // separable gaussian blur, sigma in HR px
    function blur(src, sigma) {
      const rad = Math.max(1, Math.ceil(3 * sigma));
      const k = new Float32Array(2 * rad + 1);
      let ks = 0;
      for (let i = -rad; i <= rad; i++) { k[i + rad] = Math.exp(-0.5 * i * i / (sigma * sigma)); ks += k[i + rad]; }
      for (let i = 0; i < k.length; i++) k[i] /= ks;
      const tmp = new Float32Array(HR * HR), out = new Float32Array(HR * HR);
      for (let y = 0; y < HR; y++) for (let x = 0; x < HR; x++) {
        let a = 0;
        for (let i = -rad; i <= rad; i++) { const xx = x + i; if (xx >= 0 && xx < HR) a += src[y * HR + xx] * k[i + rad]; }
        tmp[y * HR + x] = a;
      }
      for (let y = 0; y < HR; y++) for (let x = 0; x < HR; x++) {
        let a = 0;
        for (let i = -rad; i <= rad; i++) { const yy = y + i; if (yy >= 0 && yy < HR) a += tmp[yy * HR + x] * k[i + rad]; }
        out[y * HR + x] = a;
      }
      return out;
    }
    // exact box binning of the HR image onto an npix x npix survey grid
    function bin(src, npix) {
      const out = new Float32Array(npix * npix);
      const f = HR / npix;
      for (let j = 0; j < npix; j++) {
        const y0 = Math.floor(j * f), y1 = Math.floor((j + 1) * f);
        for (let i = 0; i < npix; i++) {
          const x0 = Math.floor(i * f), x1 = Math.floor((i + 1) * f);
          let a = 0;
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) a += src[y * HR + x];
          out[j * npix + i] = a;
        }
      }
      return out;
    }

    const surveys = [
      ['LSST', manifest.telescopes.LSST, tint],
      ['WISE', manifest.telescopes.WISE, [1.0, 0.62, 0.22]],
      ['SPHEREx', manifest.telescopes.SPHEREx, tint],
    ];
    const STRETCH = 30;                                    // asinh display stretch (peak -> 1)
    for (const [name, t, col] of surveys) {
      const cell = el('div', 'closer-cell');
      const OUT = 240;
      const cv = document.createElement('canvas');
      cv.width = cv.height = OUT;
      const g = cv.getContext('2d');
      const sigmaHR = (t.psf_fwhm / 2.355) / scaleHR;
      const npix = Math.max(2, Math.min(HR, Math.round(FOV / t.pix_scale)));
      const img = bin(blur(model, sigmaHR), npix);
      let mx = 0;
      for (let i = 0; i < img.length; i++) if (img[i] > mx) mx = img[i];
      const cmax = Math.max(...col);
      const tr = col[0] / cmax, tg = col[1] / cmax, tb = col[2] / cmax;
      const small = document.createElement('canvas');
      small.width = small.height = npix;
      const sg = small.getContext('2d');
      const sd = sg.createImageData(npix, npix);
      const norm = Math.asinh(STRETCH);
      for (let i = 0; i < img.length; i++) {
        const v = 245 * Math.asinh(img[i] / mx * STRETCH) / norm;
        sd.data[4 * i] = Math.min(255, v * tr);
        sd.data[4 * i + 1] = Math.min(255, v * tg);
        sd.data[4 * i + 2] = Math.min(255, v * tb);
        sd.data[4 * i + 3] = 255;
      }
      sg.putImageData(sd, 0, 0);
      g.fillStyle = '#000';
      g.fillRect(0, 0, OUT, OUT);
      g.imageSmoothingEnabled = npix > OUT;               // downscale LSST smoothly, upscale coarse grids blocky
      g.drawImage(small, 0, 0, OUT, OUT);
      // pixel grid for the coarse surveys
      if (npix <= 24) {
        g.strokeStyle = 'rgba(255,255,255,0.10)';
        g.lineWidth = 1;
        for (let i = 1; i < npix; i++) {
          const p = Math.round(i * OUT / npix) + 0.5;
          g.beginPath(); g.moveTo(p, 0); g.lineTo(p, OUT); g.stroke();
          g.beginPath(); g.moveTo(0, p); g.lineTo(OUT, p); g.stroke();
        }
      }
      // 10" scale bar
      const barPx = 10 / FOV * OUT;
      g.strokeStyle = 'rgba(255,255,255,0.7)';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(10, OUT - 12); g.lineTo(10 + barPx, OUT - 12); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.font = '18px system-ui, sans-serif';
      g.fillText('10″', 10, OUT - 18);
      cell.append(cv);
      cell.append(el('b', null, name));
      cell.append(el('span', null, `${t.pix_scale}″/px · PSF ${t.psf_fwhm}″`));
      wrap.append(cell);
    }
    const cap = el('div', 'closer-cap');
    cap.innerHTML = `${spiral ? 'disk (Sérsic n = 1)' : 'spheroid (Sérsic n = 4)'} · b/a = ${q} · R<sub>e</sub> ≈ ${reKpc.toFixed(1)} kpc = ${reArcsec.toFixed(2)}″ (van der Wel+14 size–mass relation) · ${Math.round(FOV)}″ field`;
    const outer = el('div');
    outer.append(wrap, cap);
    return outer;
  }

  // ------------------------------------------------------------- charts
  // Plain-canvas line charts (no chart library: the CDN allow-list only
  // covers three.js here). 2px lines, hairline grid, hover crosshair.
  const INK = '#eef0f4', DIM = '#9aa0b4', GRID = '#1c2030', SURF = '#0b0e19';

  function makeCanvas(h) {
    const wrap = el('div', 'chart-wrap');
    const cv = document.createElement('canvas');
    const tip = el('div', 'chart-tip hidden');
    wrap.append(cv, tip);
    wrap.style.height = `${h}px`;
    return { wrap, cv, tip };
  }

  function niceTicksLog(lo, hi) {
    const t = [];
    for (let e = Math.ceil(lo); e <= Math.floor(hi); e++) t.push(e);
    if (t.length > 7) return t.filter((v) => v % 2 === 0);
    return t;
  }

  function drawFrame(g, W, H, pad, xr, yr, xLabel, yLabel, xlog, ylogTicks) {
    g.fillStyle = SURF; g.fillRect(0, 0, W, H);
    g.strokeStyle = GRID; g.lineWidth = 1;
    g.font = '10px "IBM Plex Mono", monospace';
    g.fillStyle = DIM; g.textBaseline = 'middle';
    const px = (x) => pad.l + (x - xr[0]) / (xr[1] - xr[0]) * (W - pad.l - pad.r);
    const py = (y) => H - pad.b - (y - yr[0]) / (yr[1] - yr[0]) * (H - pad.t - pad.b);
    // y ticks (log10 exponents)
    g.textAlign = 'right';
    for (const e of ylogTicks) {
      const y = py(e);
      g.beginPath(); g.moveTo(pad.l, y + 0.5); g.lineTo(W - pad.r, y + 0.5); g.stroke();
      g.fillText(e === 0 ? '1' : `10${sup(e)}`, pad.l - 6, y);
    }
    // x ticks
    g.textAlign = 'center'; g.textBaseline = 'top';
    const xt = xlog ? niceTicksLog(xr[0] - 1, xr[1]).flatMap((e) => [e, e + Math.log10(3)]).filter((v) => v >= xr[0] && v <= xr[1])
      : linTicks(xr[0], xr[1]);
    for (const x of xt) {
      const X = px(x);
      g.beginPath(); g.moveTo(X + 0.5, pad.t); g.lineTo(X + 0.5, H - pad.b); g.stroke();
      const lab = xlog ? fmtLogTick(x) : String(Math.round(x));
      g.fillText(lab, X, H - pad.b + 4);
    }
    g.fillStyle = DIM; g.textBaseline = 'middle';
    richText(g, xLabel, (pad.l + W - pad.r) / 2, H - 13, 'center');
    g.save(); g.translate(11, (pad.t + H - pad.b) / 2); g.rotate(-Math.PI / 2);
    richText(g, yLabel, 0, 0, 'center'); g.restore();
    return { px, py };
  }

  // Minimal TeX-ish markup for canvas text: a_{sub}, a^{sup}. Sub/superscripts
  // are drawn at 75% size and shifted; returns the drawn width.
  const richTokens = (str) => {
    const out = []; const re = /([_^])\{([^}]*)\}/g; let last = 0, m;
    while ((m = re.exec(str))) {
      if (m.index > last) out.push({ t: str.slice(last, m.index), k: 0 });
      out.push({ t: m[2], k: m[1] === '_' ? 1 : 2 }); last = re.lastIndex;
    }
    if (last < str.length) out.push({ t: str.slice(last), k: 0 });
    return out;
  };
  function richText(g, str, x, y, align = 'left') {
    const toks = richTokens(str);
    const base = g.font, small = base.replace(/(\d+(?:\.\d+)?)px/, (_, n) => `${(parseFloat(n) * 0.75).toFixed(1)}px`);
    const px = parseFloat(base) || 10;
    const widths = toks.map((tk) => { g.font = tk.k ? small : base; return g.measureText(tk.t).width; });
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    g.textAlign = 'left';
    toks.forEach((tk, i) => {
      g.font = tk.k ? small : base;
      const dy = tk.k === 1 ? px * 0.28 : tk.k === 2 ? -px * 0.38 : 0;
      g.fillText(tk.t, cx, y + dy); cx += widths[i];
    });
    g.font = base;
    return total;
  }
  const richHTML = (str) => str.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>').replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
  const sup = (e) => String(e).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  function fmtLogTick(x) {
    const v = Math.pow(10, x);
    return v >= 1 ? (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toPrecision(2)) : v.toPrecision(1).replace(/\.?0+$/, '');
  }
  function linTicks(lo, hi) {
    const span = hi - lo, step = span > 10 ? 2 : 1;
    const t = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) t.push(v);
    return t;
  }

  function legend(g, items, x, y) {
    g.font = '10px "IBM Plex Mono", monospace'; g.textAlign = 'left'; g.textBaseline = 'middle';
    let cx = x;
    for (const it of items) {
      g.strokeStyle = it.color; g.lineWidth = it.dot ? 0 : 2;
      if (it.dot) { g.fillStyle = it.color; g.beginPath(); g.arc(cx + 5, y, 3.5, 0, Math.PI * 2); g.fill(); }
      else { g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + 12, y); g.stroke(); }
      g.fillStyle = INK;
      cx += 17 + richText(g, it.label, cx + 17, y) + 14;
    }
  }

  function setupCanvas(cv, wrap) {
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    const W = wrap.clientWidth || 360, H = wrap.clientHeight;
    cv.width = W * pr; cv.height = H * pr;
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    const g = cv.getContext('2d');
    g.scale(pr, pr);
    return { g, W, H };
  }

  // SED: log f_nu [Jy] vs log lambda_obs [um], with photometry points and
  // the SPHEREx / LSST / WISE bandpass comb along the bottom.
  function sedChart(rec, filters) {
    const { wrap, cv, tip } = makeCanvas(230);
    const grid = details.sed_grid;
    const N = grid.n;
    const lx = new Float64Array(N);
    for (let i = 0; i < N; i++) lx[i] = Math.log10(grid.lo_um) + i / (N - 1) * (Math.log10(grid.hi_um) - Math.log10(grid.lo_um));
    const y = rec.sed;
    // photometry -> log f_nu Jy: f = 10^(-0.4 (m - 8.9))
    const pts = details.phot_names.map((nm, i) => {
      const m = rec.phot[i];
      return { nm, x: Math.log10(details.phot_wl_um[i]), y: Number.isFinite(m) ? -0.4 * (m - 8.9) : NaN,
        set: nm.split('_')[0] };
    }).filter((p) => Number.isFinite(p.y));
    const setColor = { SPHEREx: '#d9c467', LSST: '#ef476f', WISE: '#f0a35e', '2MASS': '#8fb8ff' };
    const xr = [Math.log10(0.3), Math.log10(30)];
    let yv = [];
    for (let i = 0; i < N; i++) if (lx[i] >= xr[0] && lx[i] <= xr[1] && Number.isFinite(y[i])) yv.push(y[i]);
    for (const p of pts) yv.push(p.y);
    if (!yv.length) yv = [-6, -3];
    const yMax = Math.max(...yv), yMin = Math.max(Math.min(...yv), yMax - 5);
    const yr = [Math.floor(yMin - 0.3), Math.ceil(yMax + 0.4)];
    const pad = { l: 44, t: 26, r: 10, b: 46 };

    const draw = (hoverX) => {
      const { g, W, H } = setupCanvas(cv, wrap);
      const { px, py } = drawFrame(g, W, H, pad, xr, yr, 'observed wavelength  [µm]', 'f_{ν}  [Jy]', true, niceTicksLog(yr[0], yr[1]));
      // bandpass comb
      const combY0 = H - pad.b - 2, combH = 14;
      for (const f of filters) {
        const set = f.name.split('_')[0];
        g.strokeStyle = setColor[set] || DIM; g.globalAlpha = set === 'SPHEREx' ? 0.55 : 0.8; g.lineWidth = 1;
        g.beginPath();
        for (let i = 0; i < f.wl.length; i++) {
          const X = px(Math.log10(f.wl[i])), Y = combY0 - f.tr[i] * combH;
          if (X < pad.l || X > W - pad.r) continue;
          i === 0 ? g.moveTo(X, Y) : g.lineTo(X, Y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      // SED line
      g.strokeStyle = '#63d2c9'; g.lineWidth = 2; g.lineJoin = 'round';
      g.beginPath();
      let pen = false;
      for (let i = 0; i < N; i++) {
        if (lx[i] < xr[0] || lx[i] > xr[1] || !Number.isFinite(y[i])) { pen = false; continue; }
        const X = px(lx[i]), Y = Math.max(pad.t, Math.min(H - pad.b, py(y[i])));
        pen ? g.lineTo(X, Y) : g.moveTo(X, Y); pen = true;
      }
      g.stroke();
      // photometry points (2px surface ring)
      for (const p of pts) {
        if (p.x < xr[0] || p.x > xr[1] || p.y < yr[0] || p.y > yr[1]) continue;
        const X = px(p.x), Y = py(p.y);
        g.fillStyle = SURF; g.beginPath(); g.arc(X, Y, p.set === 'SPHEREx' ? 4 : 5.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = setColor[p.set]; g.beginPath(); g.arc(X, Y, p.set === 'SPHEREx' ? 2.5 : 4, 0, Math.PI * 2); g.fill();
      }
      legend(g, [{ color: '#63d2c9', label: 'model SED' }, { color: setColor.SPHEREx, label: 'SPHEREx ×102', dot: true },
        { color: setColor.LSST, label: 'LSST', dot: true }, { color: setColor.WISE, label: 'WISE', dot: true }], pad.l, 12);
      if (hoverX !== undefined) {
        const lxv = xr[0] + (hoverX - pad.l) / (W - pad.l - pad.r) * (xr[1] - xr[0]);
        if (lxv >= xr[0] && lxv <= xr[1]) {
          const i = Math.round((lxv - lx[0]) / (lx[1] - lx[0]));
          const X = px(lx[i]);
          g.strokeStyle = DIM; g.lineWidth = 1;
          g.beginPath(); g.moveTo(X + 0.5, pad.t); g.lineTo(X + 0.5, H - pad.b); g.stroke();
          const fnu = Math.pow(10, y[i]);
          const mag = 8.9 - 2.5 * y[i];
          tip.innerHTML = `λ = ${Math.pow(10, lx[i]).toPrecision(3)} µm · f<sub>ν</sub> = ${fnuStr(fnu)} · ${mag.toFixed(2)} AB`;
          tip.style.left = `${Math.min(X + 8, W - 190)}px`; tip.style.top = `${pad.t + 14}px`;
          tip.classList.remove('hidden');
          return;
        }
      }
      tip.classList.add('hidden');
    };
    attachHover(cv, wrap, draw);
    return wrap;
  }
  const fnuStr = (f) => f >= 1e-3 ? `${(f * 1e3).toPrecision(3)} mJy` : `${(f * 1e6).toPrecision(3)} µJy`;

  // SFR(t) or M_halo(t) vs cosmic age, log y
  function historyChart(ages, series, yLabel, tObs) {
    const { wrap, cv, tip } = makeCanvas(190);
    const xr = [0, 14];
    let yv = [];
    for (const s of series) for (let i = 0; i < ages.length; i++) if (Number.isFinite(s.y[i])) yv.push(s.y[i]);
    if (!yv.length) yv = [0, 1];
    const yMax = Math.max(...yv);
    const yMin = Math.max(Math.min(...yv), yMax - 4);
    const yr = [Math.floor(yMin - 0.2), Math.ceil(yMax + 0.3)];
    const pad = { l: 44, t: 24, r: 10, b: 32 };
    const draw = (hoverX) => {
      const { g, W, H } = setupCanvas(cv, wrap);
      const { px, py } = drawFrame(g, W, H, pad, xr, yr, 'cosmic age  [Gyr]', yLabel, false, niceTicksLog(yr[0], yr[1]));
      // observed epoch
      const X0 = px(tObs);
      g.strokeStyle = '#d9c467'; g.lineWidth = 1; g.globalAlpha = 0.9;
      g.beginPath(); g.moveTo(X0 + 0.5, pad.t); g.lineTo(X0 + 0.5, H - pad.b); g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = DIM; g.font = '10px "IBM Plex Mono", monospace'; g.textAlign = X0 > W * 0.6 ? 'right' : 'left'; g.textBaseline = 'top';
      g.fillText('observed', X0 + (X0 > W * 0.6 ? -4 : 4), pad.t + 2);
      for (const s of series) {
        g.strokeStyle = s.color; g.lineWidth = 2; g.lineJoin = 'round';
        g.beginPath(); let pen = false;
        for (let i = 0; i < ages.length; i++) {
          if (!Number.isFinite(s.y[i])) { pen = false; continue; }
          const X = px(ages[i]), Y = Math.max(pad.t, Math.min(H - pad.b, py(s.y[i])));
          pen ? g.lineTo(X, Y) : g.moveTo(X, Y); pen = true;
        }
        g.stroke();
      }
      if (series.length > 1) legend(g, series.map((s) => ({ color: s.color, label: s.label })), pad.l, 11);
      if (hoverX !== undefined) {
        const t = xr[0] + (hoverX - pad.l) / (W - pad.l - pad.r) * (xr[1] - xr[0]);
        if (t >= xr[0] && t <= xr[1]) {
          let i = 0; for (let k = 1; k < ages.length; k++) if (Math.abs(ages[k] - t) < Math.abs(ages[i] - t)) i = k;
          const X = px(ages[i]);
          g.strokeStyle = DIM; g.lineWidth = 1;
          g.beginPath(); g.moveTo(X + 0.5, pad.t); g.lineTo(X + 0.5, H - pad.b); g.stroke();
          const zAt = ages === details.mah_age_gyr ? details.mah_redshift[i] : details.sfh_redshift[i];
          const parts = series.map((s) => `${series.length > 1 ? richHTML(s.label) + ' ' : ''}${Number.isFinite(s.y[i]) ? `10<sup>${s.y[i].toFixed(2)}</sup>` : '—'}`);
          tip.innerHTML = `t = ${ages[i].toFixed(2)} Gyr (z ≈ ${zAt.toFixed(2)}) · ${parts.join(' · ')}`;
          tip.style.left = `${Math.min(X + 8, W - 210)}px`; tip.style.top = `${pad.t + 14}px`;
          tip.classList.remove('hidden');
          return;
        }
      }
      tip.classList.add('hidden');
    };
    attachHover(cv, wrap, draw);
    return wrap;
  }

  function attachHover(cv, wrap, draw) {
    // first draw once the element is in the DOM and has a width
    requestAnimationFrame(() => draw());
    cv.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      draw(e.clientX - r.left);
    });
    cv.addEventListener('pointerleave', () => draw());
    new ResizeObserver(() => draw()).observe(wrap);
  }

  return {
    pickAt, select, hover, close, update,
    get selected() { return selected; },
    nPickable: details.n_pickable,
  };
}
