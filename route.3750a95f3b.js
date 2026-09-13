'use strict';
/* Scroll route: one line that runs down the page gutters and passes *under* each
   English section label. It never overlaps text, so no masking is needed, and the
   moving head is driven by arc length so it can never jump sideways. */
(() => {
  const main = document.querySelector('#main');
  if (!main) return;
  const labelNodes = [...main.querySelectorAll(':scope > section .section-head .eyebrow .en')];
  if (!labelNodes.length) return;

  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    if (attrs) for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  };
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const r1 = v => Math.round(v * 10) / 10;

  const box = document.createElement('div');
  box.id = 'route';
  box.setAttribute('role', 'progressbar');
  box.setAttribute('aria-label', 'התקדמות בין פרקי העמוד');
  box.setAttribute('aria-valuemin', '0');
  box.setAttribute('aria-valuemax', '100');
  box.setAttribute('aria-valuenow', '0');

  const svg = svgEl('svg', {'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none'});
  const defs = svgEl('defs');
  const colours = svgEl('linearGradient', {id: 'route-colours', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: 1});
  defs.append(colours);
  const track = svgEl('path', {class: 'route-track'});
  const fill = svgEl('path', {class: 'route-fill'});
  const dots = svgEl('g');
  const cursor = svgEl('g', {class: 'route-cursor'});
  const halo = svgEl('circle', {class: 'route-halo', r: 12});
  const headDot = svgEl('circle', {class: 'route-head', r: 4.5});
  cursor.append(halo, headDot);
  svg.append(defs, track, fill, dots, cursor);
  box.append(svg);
  main.append(box);

  const chrome = document.querySelector('.site-chrome');

  /* Geometry cache. Everything here is refreshed only when the layout really changes. */
  let boxW = 0, boxH = 0, boxX = 0;
  let mainY = 0, pageH = 0, docH = 0, chromeH = 0, readLine = 0, endY = 0;
  let px = [], cum = null, total = 0;
  let anchors = [], stations = [], darkBands = [];

  let frame = 0, needLayout = true;
  let lastReached = -2, lastDark = null, lastPercent = -1, lastViewBox = '';
  let lastBoxW = -1, lastBoxH = -1, lastMainH = -1, lastInnerW = window.innerWidth;

  /* ---------- path builder (flattened in JS: no getTotalLength / getPointAtLength) ---------- */
  let d = '';
  const moveTo = (x, y) => { px.length = 0; px.push(x, y); d = `M ${r1(x)} ${r1(y)}`; };
  const lineTo = (x, y) => { px.push(x, y); d += ` L ${r1(x)} ${r1(y)}`; };
  const curveTo = (ax, ay, bx, by, x, y) => {
    const n0 = px.length;
    const sx = px[n0 - 2], sy = px[n0 - 1];
    const rough = Math.hypot(ax - sx, ay - sy) + Math.hypot(bx - ax, by - ay) + Math.hypot(x - bx, y - by);
    const steps = clamp(Math.ceil(rough / 14), 6, 32);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      const w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t;
      px.push(w0 * sx + w1 * ax + w2 * bx + w3 * x, w0 * sy + w1 * ay + w2 * by + w3 * y);
    }
    d += ` C ${r1(ax)} ${r1(ay)}, ${r1(bx)} ${r1(by)}, ${r1(x)} ${r1(y)}`;
  };

  function measureBox() {
    const rect = box.getBoundingClientRect();
    boxW = rect.width; boxH = rect.height; boxX = rect.left;
  }

  function layout() {
    /* --- reads --- */
    measureBox();
    if (!boxW || !boxH) { total = 0; return; }
    const mainRect = main.getBoundingClientRect();
    const top = window.scrollY;
    mainY = mainRect.top + top;
    pageH = main.offsetHeight;
    docH = document.documentElement.scrollHeight;
    chromeH = chrome ? chrome.getBoundingClientRect().height : 0;

    const labels = [];
    for (const node of labelNodes) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const section = node.closest('section');
      const heading = node.closest('.section-head')?.querySelector('h2');
      const headingY = heading ? heading.getBoundingClientRect().top + top - mainY : Infinity;
      const bottom = rect.bottom + top - mainY;
      labels.push({
        node,
        left: rect.left - boxX,
        right: rect.right - boxX,
        mid: (rect.left + rect.right) / 2 - boxX,
        shelf: headingY === Infinity ? bottom + 12 : clamp((bottom + headingY) / 2, bottom + 4, bottom + 14),
        dark: section?.dataset.theme === 'dark'
      });
    }

    const sections = [];
    for (const section of main.querySelectorAll(':scope > section')) {
      const rect = section.getBoundingClientRect();
      sections.push({top: rect.top + top - mainY, bottom: rect.bottom + top - mainY, dark: section.dataset.theme === 'dark'});
    }

    /* --- writes --- */
    darkBands = [];
    const stops = [];
    const span = Math.max(1, main.offsetHeight);
    for (const s of sections) {
      const colour = s.dark ? '#A9E4CB' : '#466A5A';
      stops.push(
        svgEl('stop', {offset: clamp(s.top / span, 0, 1), 'stop-color': colour}),
        svgEl('stop', {offset: clamp(s.bottom / span, 0, 1), 'stop-color': colour})
      );
      if (s.dark) darkBands.push(s.top, s.bottom);
    }
    colours.setAttribute('y2', String(span));
    colours.replaceChildren(...stops);

    const mobile = boxW <= 760;
    const edge = mobile ? 10 : 26;
    const L = edge, R = boxW - edge;
    const radius = mobile ? 12 : 22;

    /* Straight runs down the gutters, a straight run under each label, and
       rounded corners in between. The corners never reach further inwards than
       `edge + radius`, which is still outside the text column at every width,
       so no part of the line can ever touch a heading. */
    let side = R, lastY = 0;
    moveTo(side, 0);
    for (let i = 0; i < labels.length; i++) {
      const p = labels[i];
      const nextY = i + 1 < labels.length ? labels[i + 1].shelf : pageH;
      const dest = side === R ? L : R;
      const dir = Math.sign(dest - side) || -1;
      const r = clamp(Math.min((p.shelf - lastY) / 2, (nextY - p.shelf) / 2), 5, radius);
      const midX = clamp(p.mid, Math.min(side + dir * r, dest - dir * r), Math.max(side + dir * r, dest - dir * r));

      lineTo(side, p.shelf - r);
      p.iEnter = px.length - 2;
      curveTo(side, p.shelf - r * 0.45, side + dir * r * 0.45, p.shelf, side + dir * r, p.shelf);
      lineTo(midX, p.shelf);
      p.index = px.length - 2;
      lineTo(dest - dir * r, p.shelf);
      curveTo(dest - dir * r * 0.45, p.shelf, dest, p.shelf + r * 0.45, dest, p.shelf + r);
      p.iLeave = px.length - 2;
      p.stopX = midX;
      p.swingIn = Math.abs(midX - side);
      p.swingOut = Math.abs(dest - midX);
      side = dest;
      lastY = p.shelf + r;
    }
    lineTo(side, Math.max(pageH, lastY + 1));

    cum = new Float64Array(px.length / 2);
    let acc = 0;
    for (let i = 2; i < px.length; i += 2) {
      acc += Math.hypot(px[i] - px[i - 2], px[i + 1] - px[i - 1]);
      cum[i >> 1] = acc;
    }
    total = acc || 1;

    /* The route must finish exactly when the page stops scrolling, not at the
       theoretical bottom of #main that no scroll position can ever reach. */
    readLine = Math.max(chromeH + 44, boxH * 0.42);
    endY = clamp(docH - boxH + readLine - mainY, 0, pageH);

    /* Scrolling is mapped to the line in three beats per label: swing in, label,
       swing out. Each sideways swing is given its own slice of scrolling, so the
       head never has to race across the page inside a single frame, and never
       drifts far from the middle of the screen either. */
    const swingCap = clamp(Math.min(readLine, boxH - readLine) * 0.7, 60, 300);
    for (let i = 0; i < labels.length; i++) {
      const p = labels[i];
      p.wIn = clamp(p.swingIn * 0.3, 50, swingCap);
      p.wOut = clamp(p.swingOut * 0.3, 50, swingCap);
    }
    for (let i = 0; i <= labels.length; i++) {
      const from = i ? labels[i - 1].shelf : 0;
      const to = i < labels.length ? labels[i].shelf : endY;
      const room = Math.max(1, to - from) * 0.7;
      const want = (i ? labels[i - 1].wOut : 0) + (i < labels.length ? labels[i].wIn : 0);
      if (want > room) {
        const k = room / want;
        if (i) labels[i - 1].wOut *= k;
        if (i < labels.length) labels[i].wIn *= k;
      }
    }

    anchors = [{y: 0, d: 0}];
    const addAnchor = (y, dist) => {
      const last = anchors[anchors.length - 1];
      if (y > last.y + 0.5 && dist > last.d + 0.5) anchors.push({y, d: dist});
    };
    for (const p of labels) {
      addAnchor(p.shelf - p.wIn, cum[p.iEnter >> 1]);
      addAnchor(p.shelf, cum[p.index >> 1]);
      addAnchor(p.shelf + p.wOut, cum[p.iLeave >> 1]);
    }
    const tail = anchors[anchors.length - 1];
    if (endY > tail.y + 1) anchors.push({y: endY, d: total}); else tail.d = total;

    track.setAttribute('d', d);
    fill.setAttribute('d', d);
    fill.style.strokeDasharray = `${total} ${total}`;

    /* Keep the head inside the viewport edge on narrow screens. */
    halo.setAttribute('r', mobile ? 9 : 12);
    headDot.setAttribute('r', mobile ? 3.6 : 4.5);

    dots.replaceChildren();
    stations = labels.map(p => {
      const node = svgEl('circle', {
        cx: r1(p.stopX), cy: r1(p.shelf), r: mobile ? 3.4 : 4,
        class: 'route-stop' + (p.dark ? ' on-dark' : '')
      });
      dots.append(node);
      return {node, d: cum[p.index >> 1], label: p.node};
    });

    lastReached = -2; lastDark = null; lastPercent = -1; lastViewBox = '';
    lastBoxW = boxW; lastBoxH = boxH; lastMainH = pageH;
  }

  function distanceAt(y) {
    for (let i = 1; i < anchors.length; i++) {
      const a = anchors[i - 1], b = anchors[i];
      if (y <= b.y || i === anchors.length - 1) {
        const t = b.y > a.y ? clamp((y - a.y) / (b.y - a.y), 0, 1) : 1;
        return a.d + (b.d - a.d) * t;
      }
    }
    return total;
  }

  function pointAt(dist) {
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < dist) lo = mid; else hi = mid;
    }
    const a = cum[lo], b = cum[hi];
    const t = b > a ? clamp((dist - a) / (b - a), 0, 1) : 0;
    const i = lo << 1, j = hi << 1;
    return {x: px[i] + (px[j] - px[i]) * t, y: px[i + 1] + (px[j + 1] - px[i + 1]) * t};
  }

  function isDark(y) {
    for (let i = 0; i < darkBands.length; i += 2) if (y >= darkBands[i] && y < darkBands[i + 1]) return true;
    return false;
  }

  function update() {
    frame = 0;
    if (needLayout) { needLayout = false; layout(); }
    if (!total || !boxW) return;

    const top = window.scrollY;
    const viewBox = `0 ${r1(top - mainY)} ${boxW} ${boxH}`;
    if (viewBox !== lastViewBox) { lastViewBox = viewBox; svg.setAttribute('viewBox', viewBox); }

    let dist = distanceAt(clamp(top + readLine - mainY, 0, endY));
    if (top + boxH >= docH - 2) dist = total;

    fill.style.strokeDashoffset = String(total - dist);

    const tip = pointAt(dist);
    cursor.setAttribute('transform', `translate(${r1(tip.x)} ${r1(tip.y)})`);

    const dark = isDark(tip.y);
    if (dark !== lastDark) { lastDark = dark; cursor.classList.toggle('on-dark', dark); }

    let reached = -1;
    for (let i = 0; i < stations.length; i++) if (dist >= stations[i].d - 0.5) reached = i;
    if (reached !== lastReached) {
      for (let i = 0; i < stations.length; i++) stations[i].node.classList.toggle('reached', i <= reached);
      lastReached = reached;
      box.setAttribute('aria-valuetext', reached < 0 ? 'תחילת העמוד' : stations[reached].label.textContent.trim());
    }
    const percent = Math.round(dist / total * 100);
    if (percent !== lastPercent) { lastPercent = percent; box.setAttribute('aria-valuenow', String(percent)); }
  }

  function schedule(rebuild) {
    if (rebuild) needLayout = true;
    if (!frame) frame = requestAnimationFrame(update);
  }

  addEventListener('scroll', () => schedule(false), {passive: true});
  addEventListener('orientationchange', () => schedule(true));
  addEventListener('pageshow', () => schedule(true));
  addEventListener('load', () => schedule(true), {once: true});
  document.fonts?.ready.then(() => schedule(true));

  /* A mobile address bar changes innerHeight on almost every scroll frame.
     Only a real width change may rebuild the geometry. */
  addEventListener('resize', () => {
    const width = window.innerWidth;
    if (width !== lastInnerW) { lastInnerW = width; schedule(true); } else schedule(false);
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      measureBox();
      const heightMoved = Math.abs(main.offsetHeight - lastMainH) > 1;
      const widthMoved = Math.abs(boxW - lastBoxW) > 0.5;
      if (widthMoved || heightMoved) schedule(true);
      else if (Math.abs(boxH - lastBoxH) > 0.5) { lastBoxH = boxH; lastViewBox = ''; schedule(false); }
    });
    observer.observe(main);
    observer.observe(box);
    if (chrome) observer.observe(chrome);
  }

  /* Late images can move the labels down. */
  main.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) schedule(true);
  }, true);

  schedule(true);
})();
