/* Hero 3D model: AEGIS NEXA pod wireframe — rotates with time, cursor and scroll */
(() => {
  const stage = document.querySelector('.hero__stage'); if (!stage) return;
  const cv = document.createElement('canvas'); cv.id = 'zf-pod'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block';
  stage.appendChild(cv);
  const ctx = cv.getContext('2d'); const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, dpr, mx = 0, my = 0, tx = 0, ty = 0, on = true;
  const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  new IntersectionObserver(es => on = es[0].isIntersecting).observe(stage);

  /* geometry (pod ≈ 300 x 120 x 130 units) */
  const L = [], add = (a, b, k) => L.push([a, b, k]);
  const hx = 150, hy = 60, hz = 65;
  const C = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([x, y, z]) => [x * hx, y * hy, z * hz]);
  [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a, b]) => add(C[a], C[b], 0));
  /* cartridges: two cylinders along x */
  const cyl = (z, x0, x1, r, k) => {
    const N = 20, rings = 7;
    for (let i = 0; i <= rings; i++) { const x = x0 + (x1 - x0) * i / rings; for (let j = 0; j < N; j++) { const a = j / N * 6.2832, b = (j + 1) / N * 6.2832; add([x, Math.cos(a) * r, z + Math.sin(a) * r], [x, Math.cos(b) * r, z + Math.sin(b) * r], k); } }
    for (let j = 0; j < N; j += 2) { const a = j / N * 6.2832; add([x0, Math.cos(a) * r, z + Math.sin(a) * r], [x1, Math.cos(a) * r, z + Math.sin(a) * r], k); }
  };
  cyl(-30, -100, -8, 24, 1); cyl(30, 8, 100, 24, 2);
  /* central electrochemical stack */
  for (let i = 0; i < 6; i++) { const x = -4 + i * 1.6, r = 38; for (let j = 0; j < 4; j++) { const a = j * 1.5708 + .785, b = a + 1.5708; add([x, Math.cos(a) * r, Math.sin(a) * r], [x, Math.cos(b) * r, Math.sin(b) * r], 0); } }
  /* inlet / outlet */
  add([-hx, 0, 0], [-hx - 36, 0, 0], 2); add([hx, 0, 0], [hx + 36, 0, 0], 2);
  /* flow particles */
  const P = Array.from({ length: 46 }, (_, i) => ({ t: Math.random(), s: .12 + Math.random() * .18, z: i % 2 ? 30 : -30, a: Math.random() * 6.28, r: Math.random() * 14 }));
  const rot = (p, yaw, pit) => { let [x, y, z] = p; const cy = Math.cos(yaw), sy = Math.sin(yaw); [x, z] = [x * cy + z * sy, -x * sy + z * cy]; const cp = Math.cos(pit), sp = Math.sin(pit); [y, z] = [y * cp - z * sp, y * sp + z * cp]; return [x, y, z]; };
  const proj = (p, S) => { const f = 620, d = f / (f + p[2] + 260); return [W * .5 + p[0] * S * d, H * .5 + p[1] * S * d, d]; };
  let t0 = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame); if (!on) return;
    const t = (now - t0) / 1000;
    tx += (mx - tx) * .05; ty += (my - ty) * .05;
    const sc = scrollY / innerHeight;
    const yaw = (reduce ? .6 : t * .22) + sc * 1.6 + tx * .9, pit = .38 + ty * .5 - sc * .25;
    const S = Math.min(W / 400, H / 230) * (1 - Math.min(sc, 1) * .18);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = Math.max(0, 1 - sc * .9);
    ctx.lineCap = 'round';
    /* soft glow disc */
    const g = ctx.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, Math.min(W, H) * .5); g.addColorStop(0, 'rgba(42,169,230,.16)'); g.addColorStop(1, 'rgba(42,169,230,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const [a, b, k] of L) {
      const A = proj(rot(a, yaw, pit), S), B = proj(rot(b, yaw, pit), S), dd = (A[2] + B[2]) / 2;
      ctx.strokeStyle = k === 1 ? '#2aa9e6' : k === 2 ? '#3fd9c9' : '#eaf0f6';
      ctx.globalAlpha = Math.max(0, 1 - sc * .9) * (k ? .55 : .5) * Math.min(1, dd * 1.1);
      ctx.lineWidth = k ? 1 : 1.3; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    }
    ctx.shadowColor = '#3fd9c9'; ctx.shadowBlur = 10; ctx.fillStyle = '#9ff3ea';
    for (const p of P) {
      p.t = (p.t + p.s * .006) % 1; const x = -hx - 36 + p.t * (2 * hx + 72);
      const q = proj(rot([x, Math.cos(p.a + t) * p.r * .6, p.z + Math.sin(p.a + t) * p.r * .6], yaw, pit), S);
      ctx.globalAlpha = Math.max(0, 1 - sc * .9) * .9; ctx.beginPath(); ctx.arc(q[0], q[1], 1.7 * q[2] + .4, 0, 6.2832); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  })(t0);
})();
