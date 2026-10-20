(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panels = [...document.querySelectorAll('.fs')];
  if (!panels.length) return;
  const vis = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { vis.add(e.target); e.target.classList.add('is-in'); } else vis.delete(e.target);
  }), { threshold: [0, .25] });
  panels.forEach(p => io.observe(p));
  if (reduce) return;
  let tick = false;
  const upd = () => {
    tick = false;
    const vh = innerHeight;
    vis.forEach(p => {
      const r = p.getBoundingClientRect();
      const t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
      p.querySelector('.fs__media').style.setProperty('--py', (t * -5).toFixed(2) + '%');
    });
  };
  const req = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); req();
})();
