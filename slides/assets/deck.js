// SuperMock slides: renders pages/*.md (order from slides.json) into 1600x900 slides.
// Slide syntax (see README.md):
//   optional front matter  ---\nlayout: figure-right\n---
//   '# Title', markdown body, a line '|||' splits the body into columns,
//   a paragraph starting 'Caption:' becomes a small caption,
//   everything after a line '???' is speaker notes (not shown),
//   $...$ and $$...$$ are rendered with KaTeX,
//   an image URL ending in '#bare' drops the white figure card.
(function () {
  const deck = document.getElementById('deck');
  const counter = document.getElementById('counter');
  const overview = document.getElementById('overview');
  let slides = [];
  let titles = [];
  let cur = 0;

  function fit() {
    const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    deck.style.transform = `scale(${s})`;
  }

  function frontMatter(src) {
    const meta = {};
    const m = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!m) return [meta, src];
    m[1].split('\n').forEach((line) => {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    return [meta, src.slice(m[0].length)];
  }

  // protect math from the markdown parser, render with KaTeX afterwards
  function renderMarkdown(src) {
    const math = [];
    const hold = (tex, display) => {
      math.push({ tex, display });
      return `@@MATH${math.length - 1}@@`;
    };
    src = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => hold(t, true));
    src = src.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_, pre, t) => pre + hold(t, false));
    let html = marked.parse(src, { gfm: true, breaks: false });
    html = html.replace(/@@MATH(\d+)@@/g, (_, i) => {
      const { tex, display } = math[+i];
      try {
        return katex.renderToString(tex, { displayMode: display, throwOnError: false });
      } catch (e) {
        return tex;
      }
    });
    return html;
  }

  function build(src, idx, total) {
    const [meta, body0] = frontMatter(src);
    const [body, notes] = body0.split(/\n\?\?\?\s*\n/);
    const layout = meta.layout || 'text';
    const sec = document.createElement('section');
    sec.className = `slide layout-${layout}`;
    let title = '';
    const lines = body.trim().split('\n');
    if (lines[0] && lines[0].startsWith('# ')) {
      title = lines.shift().slice(2).trim();
    }
    const head = document.createElement('div');
    if (meta.kicker) head.innerHTML += `<div class="kicker">${meta.kicker}</div>`;
    if (title) head.innerHTML += `<h1>${renderMarkdown(title).replace(/^<p>|<\/p>\s*$/g, '')}</h1>`;
    sec.appendChild(head);
    const cols = lines.join('\n').split(/\n\s*\|\|\|\s*\n/);
    const wrap = document.createElement('div');
    wrap.className = 'body';
    cols.forEach((c) => {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = renderMarkdown(c);
      col.querySelectorAll('p').forEach((p) => {
        if (p.textContent.trim().startsWith('Caption:')) {
          p.classList.add('caption');
          p.innerHTML = p.innerHTML.replace(/Caption:\s*/, '');
        }
      });
      col.querySelectorAll('p').forEach((p) => {
        if (p.querySelector('img') && p.textContent.trim() === '') p.classList.add('imgp');
      });
      const imgs = col.querySelectorAll('img');
      const nonImg = [...col.children].filter((el) => !el.querySelector('img') && !el.classList.contains('caption'));
      if (imgs.length && nonImg.length === 0) col.classList.add('figs');
      imgs.forEach((im) => {
        im.loading = 'lazy';
        if (!im.alt) im.alt = 'figure';
        // '![alt](figs/x.png#bare)': no white card (for images with their own background)
        if (im.getAttribute('src').endsWith('#bare')) im.classList.add('bare');
      });
      wrap.appendChild(col);
    });
    if (layout !== 'title' && layout !== 'section') sec.appendChild(wrap);
    else head.appendChild(wrap);
    if (notes) {
      const n = document.createElement('div');
      n.className = 'notes';
      n.innerHTML = renderMarkdown(notes);
      sec.appendChild(n);
    }
    const foot = document.createElement('div');
    foot.className = 'footer';
    foot.innerHTML = `<span>${meta.part || ''}</span><span>${idx + 1} / ${total}</span>`;
    if (layout !== 'title') sec.appendChild(foot);
    return [sec, title || meta.part || `slide ${idx + 1}`];
  }

  // size every image so a column's text + figures fit the slide exactly
  function fitImages(slide) {
    slide.querySelectorAll('.col').forEach((col) => {
      const ps = [...col.querySelectorAll(':scope > p.imgp')];
      if (!ps.length) return;
      const cs = getComputedStyle(col);
      let used = 0;
      [...col.children].forEach((el) => {
        if (el.classList.contains('imgp')) return;
        const st = getComputedStyle(el);
        used += el.offsetHeight + parseFloat(st.marginTop) + parseFloat(st.marginBottom);
      });
      const gaps = 12 * (ps.length - 1);
      const avail = col.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - used - gaps;
      const each = Math.max(120, Math.floor(avail / ps.length));
      ps.forEach((p) => { p.querySelector('img').style.maxHeight = `${each}px`; });
    });
  }

  function fitAll() {
    slides.forEach((s) => {
      const was = s.classList.contains('active');
      s.classList.add('active');
      fitImages(s);
      if (!was) s.classList.remove('active');
    });
  }

  function show(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('active', k === cur));
    counter.textContent = `${cur + 1} / ${slides.length}`;
    if (location.hash !== `#${cur + 1}`) history.replaceState(null, '', `#${cur + 1}`);
    // warm the next slide's images
    const nxt = slides[cur + 1];
    if (nxt) nxt.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; });
  }

  function toggleOverview(force) {
    const open = force !== undefined ? force : overview.classList.contains('hidden');
    overview.classList.toggle('hidden', !open);
    if (open) {
      overview.innerHTML = '';
      titles.forEach((t, k) => {
        const b = document.createElement('button');
        b.innerHTML = `<span>${k + 1}</span>${t}`;
        if (k === cur) b.classList.add('current');
        b.onclick = () => { toggleOverview(false); show(k); };
        overview.appendChild(b);
      });
      const c = overview.querySelector('.current');
      if (c) c.focus();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!overview.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === 'o') toggleOverview(false);
      return;
    }
    if (['ArrowRight', 'PageDown', ' ', 'ArrowDown', 'j'].includes(e.key)) { e.preventDefault(); show(cur + 1); }
    else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'k', 'Backspace'].includes(e.key)) { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'o') toggleOverview(true);
    else if (e.key === 'f') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    }
  });
  let tx = null;
  document.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });
  document.getElementById('prev').onclick = () => show(cur - 1);
  document.getElementById('next').onclick = () => show(cur + 1);
  document.getElementById('grid-btn').onclick = () => toggleOverview();
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== cur) show(n - 1);
  });
  window.addEventListener('beforeprint', () => slides.forEach((s) => s.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; })));

  async function load() {
    fit();
    const v = Date.now();
    const order = await (await fetch(`slides.json?v=${v}`)).json();
    const srcs = await Promise.all(order.slides.map((f) =>
      fetch(`pages/${f}?v=${v}`).then((r) => (r.ok ? r.text() : `# missing: ${f}`))));
    srcs.forEach((s, k) => {
      const [el, t] = build(s, k, srcs.length);
      deck.appendChild(el);
      slides.push(el);
      titles.push(t);
    });
    fitAll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
    document.getElementById('loading').classList.add('hidden');
    const n = parseInt(location.hash.slice(1), 10);
    show(n ? n - 1 : 0);
  }
  load().catch((e) => {
    document.getElementById('loading').textContent = `Could not load slides: ${e.message}`;
  });
})();
