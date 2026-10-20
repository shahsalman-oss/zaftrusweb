(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* scroll progress bar */
  const bar = document.createElement('div'); bar.id = 'zf-progress'; document.body.append(bar);
  const onScroll = () => { const h = document.documentElement; const m = h.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? Math.min(1, scrollY / m) : 0})`; };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* cursor glow */
  let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
  if (fine && !reduce) {
    const g = document.createElement('div'); g.id = 'zf-glow'; document.body.prepend(g);
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; g.classList.add('on'); });
    document.addEventListener('pointerleave', () => g.classList.remove('on'));
    (function loop() { gx += (mx - gx) * .12; gy += (my - gy) * .12; g.style.transform = `translate3d(${gx}px,${gy}px,0)`; requestAnimationFrame(loop); })();
  }

  /* spotlight + lift on cards */
  document.querySelectorAll('.area,.zf-cells>*,.zf-three>div,.nm>div,.zf-person,.zf-flow>div,.calc').forEach(el => {
    el.classList.add('zf-spot');
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* button ripple */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn'); if (!b || reduce) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement('span');
    s.className = 'rip'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.append(s); setTimeout(() => s.remove(), 700);
  });

  /* hero particle field: flows toward the right, parts around the cursor, bursts on click */
  const cv = document.getElementById('zf-flow'); if (!cv) return;
  const ctx = cv.getContext('2d'); let W, H, dpr, P = [], pt = { x: -999, y: -999, on: false }, ripples = [];
  const N = () => Math.round(Math.min(220, Math.max(70, W * H / 5200)));
  const mk = (x) => ({ x: x ?? Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, r: 1 + Math.random() * 1.8, hue: Math.random() < .35 ? 1 : 0 });
  function size() { const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); P = Array.from({ length: N() }, () => mk()); }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); pt.x = e.clientX - r.left; pt.y = e.clientY - r.top; pt.on = pt.x > -60 && pt.x < W + 60 && pt.y > -60 && pt.y < H + 60; });
  addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (x < 0 || y < 0 || x > W || y > H) return; ripples.push({ x, y, t: 0 }); P.forEach(p => { const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1; if (d < 260) { const f = (1 - d / 260) * 9; p.vx += dx / d * f; p.vy += dy / d * f; } }); });
  let vis = true; new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
  const draw = (t) => {
    requestAnimationFrame(draw); if (!vis) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      const a = Math.sin(p.y * .012 + t * .0006) * .5 + Math.cos(p.x * .008 - t * .0004) * .5;
      p.vx += (1.1 - p.vx) * .02; p.vy += (a * .9 - p.vy) * .02;
      if (pt.on && !reduce) { const dx = p.x - pt.x, dy = p.y - pt.y, d = Math.hypot(dx, dy) || 1; if (d < 170) { const f = (1 - d / 170) * .9; p.vx += dx / d * f; p.vy += dy / d * f; } }
      p.x += p.vx * (reduce ? 0 : 1); p.y += p.vy * (reduce ? 0 : 1);
      if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H; } if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10; if (p.x < -40) p.x = W + 10;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
      if (d2 < 7500) { ctx.strokeStyle = `rgba(42,169,230,${(1 - d2 / 7500) * .28})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    if (pt.on) for (const p of P) { const dx = p.x - pt.x, dy = p.y - pt.y, d = Math.hypot(dx, dy); if (d < 220) { ctx.strokeStyle = `rgba(63,217,201,${(1 - d / 220) * .5})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pt.x, pt.y); ctx.stroke(); } }
    for (const p of P) { ctx.fillStyle = p.hue ? 'rgba(63,217,201,.95)' : 'rgba(92,200,245,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
    ripples = ripples.filter(r => (r.t += 1) < 50); for (const r of ripples) { ctx.strokeStyle = `rgba(42,169,230,${1 - r.t / 50})`; ctx.beginPath(); ctx.arc(r.x, r.y, r.t * 5, 0, 6.283); ctx.stroke(); }
  };
  requestAnimationFrame(draw);
})();
