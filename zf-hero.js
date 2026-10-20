/* Zaftrus image heroes: parallax photo, cursor spotlight, and a dot field that parts around the pointer.
   Physics mirrors the homepage field in zf-ui.js. Markup: <div class="zfh" data-zfh="plant" data-flow="right"> ... */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.zfh').forEach(init);

  function init(root) {
    const host = root.parentElement;
    const cv = root.querySelector('.zfh__fx');
    const box = root.querySelector('.zfh__img');
    const pan = root.querySelector('.zfh__pan');
    const ctx = cv.getContext('2d');
    const flow = root.dataset.flow || 'right';
    // base drift per mode: [vx, vy, waveAmp, density, linkOpacity]
    const M = {
      right: [1.1, 0, .9, 5200, .28],
      rapid: [1.7, 0, 1.2, 5600, .22],
      up:    [.12, -.6, .35, 5600, .26],
      drift: [.3, -.1, .3, 8200, .2]
    }[flow] || [1.1, 0, .9, 5200, .28];

    let W = 0, H = 0, dpr = 1, P = [], ripples = [], vis = true;
    let cx = -9999, cy = -9999, onHost = false;      // pointer, client coords
    let sx = -999, sy = -999;                          // smoothed spotlight (box-local)
    let nx = 0, ny = 0, tnx = 0, tny = 0;              // parallax (-1..1)

    const mk = (x) => ({ x: x ?? Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, r: 1 + Math.random() * 1.8, hue: Math.random() < .35 ? 1 : 0 });
    const count = () => Math.round(Math.min(170, Math.max(50, W * H / M[3])));
    function size() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = Array.from({ length: count() }, () => mk());
    }
    size();
    new ResizeObserver(size).observe(host);
    new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(host);

    addEventListener('pointermove', e => { cx = e.clientX; cy = e.clientY; });
    document.addEventListener('pointerleave', () => { cx = cy = -9999; });
    addEventListener('pointerdown', e => {
      const r = host.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > W || y > H || reduce) return;
      ripples.push({ x, y, t: 0 });
      P.forEach(p => { const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1; if (d < 260) { const f = (1 - d / 260) * 9; p.vx += dx / d * f; p.vy += dy / d * f; } });
    });

    const link = `rgba(42,169,230,`;
    function frame(t) {
      requestAnimationFrame(frame);
      if (!vis) return;
      const r = host.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      onHost = px > -60 && px < W + 60 && py > -60 && py < H + 60;

      /* spotlight + parallax on the photo */
      if (!reduce) {
        const b = box.getBoundingClientRect();
        const tx = onHost ? cx - b.left : -999, ty = onHost ? cy - b.top : -999;
        if (sx < -900 || tx < -900) { sx = tx; sy = ty; } else { sx += (tx - sx) * .16; sy += (ty - sy) * .16; }
        root.style.setProperty('--mx', sx.toFixed(1) + 'px'); root.style.setProperty('--my', sy.toFixed(1) + 'px');
        tnx = onHost ? Math.max(-1, Math.min(1, (px / W - .5) * 2)) : 0;
        tny = onHost ? Math.max(-1, Math.min(1, (py / H - .5) * 2)) : 0;
        nx += (tnx - nx) * .06; ny += (tny - ny) * .06;
        const sp = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
        pan.style.transform = `translate3d(${(-nx * 18).toFixed(2)}px,${(-ny * 12 + sp * 70).toFixed(2)}px,0) scale(${(1 + sp * .05).toFixed(4)})`;
      }

      /* dots */
      ctx.clearRect(0, 0, W, H);
      const on = onHost && !reduce;
      for (const p of P) {
        const a = Math.sin(p.y * .012 + t * .0006) * .5 + Math.cos(p.x * .008 - t * .0004) * .5;
        p.vx += (M[0] + (M[0] < .5 ? a * M[2] : 0) - p.vx) * .02;
        p.vy += (M[1] + a * M[2] - p.vy) * .02;
        if (on) { const dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy) || 1; if (d < 170) { const f = (1 - d / 170) * .9; p.vx += dx / d * f; p.vy += dy / d * f; } }
        if (!reduce) { p.x += p.vx; p.y += p.vy; }
        if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H; }
        if (p.x < -40) p.x = W + 10;
        if (p.y < -10) { p.y = H + 10; if (flow === 'up' || flow === 'drift') p.x = Math.random() * W; }
        if (p.y > H + 10) p.y = -10;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 7500) { ctx.strokeStyle = link + ((1 - d2 / 7500) * M[4]) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      if (on) for (const p of P) { const dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy); if (d < 220) { ctx.strokeStyle = `rgba(63,217,201,${(1 - d / 220) * .5})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(px, py); ctx.stroke(); } }
      for (const p of P) { ctx.fillStyle = p.hue ? 'rgba(63,217,201,.95)' : 'rgba(92,200,245,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
      ripples = ripples.filter(q => (q.t += 1) < 50);
      for (const q of ripples) { ctx.strokeStyle = `rgba(42,169,230,${1 - q.t / 50})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.t * 5, 0, 6.283); ctx.stroke(); }
    }
    requestAnimationFrame(frame);
  }
})();
