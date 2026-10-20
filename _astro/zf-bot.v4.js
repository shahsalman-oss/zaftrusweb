/* Zaftrus "Queries" assistant — front end. Backend: /.netlify/functions/queries */
(function () {
  'use strict';
  if (window.__zfq) return; window.__zfq = true;


  var EMAIL = 'zaftrus@gmail.com', ENDPOINT = window.ZFQ_ENDPOINT || '/zaftrusweb/.netlify/functions/queries', STORE = 'zfq-history-v1', DEMO_INDEX = '/zaftrusweb/_astro/zf-bot-demo.v1.json';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var BOT_SVG = '<svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    '<radialGradient id="zq-body" cx="36%" cy="30%" r="85%"><stop offset="0" stop-color="#e6fcff"/zaftrusweb/><stop offset=".22" stop-color="#84dbf8"/zaftrusweb/><stop offset=".55" stop-color="#2aa9e6"/zaftrusweb/><stop offset="1" stop-color="#0e4672"/zaftrusweb/></radialGradient>' +
    '<radialGradient id="zq-belly" cx="50%" cy="100%" r="62%"><stop offset="0" stop-color="#3fd9c9" stop-opacity=".8"/zaftrusweb/><stop offset="1" stop-color="#3fd9c9" stop-opacity="0"/zaftrusweb/></radialGradient>' +
    '<linearGradient id="zq-rim" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6f6ff" stop-opacity=".95"/zaftrusweb/><stop offset=".55" stop-color="#b6f6ff" stop-opacity="0"/zaftrusweb/></linearGradient>' +
    '<linearGradient id="zq-visor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1c2b"/zaftrusweb/><stop offset="1" stop-color="#03080d"/zaftrusweb/></linearGradient>' +
    '<linearGradient id="zq-arm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fe3fa"/zaftrusweb/><stop offset="1" stop-color="#1b86c2"/zaftrusweb/></linearGradient>' +
    '<radialGradient id="zq-halo"><stop offset="0" stop-color="#86f6e8" stop-opacity=".55"/zaftrusweb/><stop offset="1" stop-color="#86f6e8" stop-opacity="0"/zaftrusweb/></radialGradient>' +
    '<clipPath id="zq-clip"><path d="M120 32C120 32 46 120 46 172C46 214 79 248 120 248C161 248 194 214 194 172C194 120 120 32 120 32Z"/zaftrusweb/></clipPath>' +
    '</defs>' +
    '<g class="zq-arm-l"><ellipse cx="42" cy="178" rx="11" ry="20" transform="rotate(20 42 178)" fill="url(#zq-arm)"/zaftrusweb/></g>' +
    '<g class="zq-arm-r"><ellipse cx="198" cy="178" rx="11" ry="20" transform="rotate(-20 198 178)" fill="url(#zq-arm)"/zaftrusweb/></g>' +
    '<path d="M120 32C120 32 46 120 46 172C46 214 79 248 120 248C161 248 194 214 194 172C194 120 120 32 120 32Z" fill="url(#zq-body)" stroke="url(#zq-rim)" stroke-width="2.4"/zaftrusweb/>' +
    '<g clip-path="url(#zq-clip)"><rect x="40" y="150" width="160" height="110" fill="url(#zq-belly)"/zaftrusweb/></g>' +
    '<path d="M76 152C77 120 98 86 115 64C103 92 97 122 99 152C94 163 80 164 76 152Z" fill="#fff" opacity=".5"/zaftrusweb/>' +
    '<ellipse cx="84" cy="188" rx="4.5" ry="9" transform="rotate(14 84 188)" fill="#fff" opacity=".32"/zaftrusweb/>' +
    '<rect x="68" y="136" width="104" height="58" rx="29" fill="url(#zq-visor)" stroke="#9ff3ff" stroke-opacity=".38" stroke-width="1.6"/zaftrusweb/>' +
    '<path d="M84 148q36-8 72 0" stroke="#fff" stroke-opacity=".13" stroke-width="3" fill="none" stroke-linecap="round"/zaftrusweb/>' +
    '<g class="zq-eyes"><ellipse cx="101" cy="163" rx="18" ry="21" fill="url(#zq-halo)"/zaftrusweb/><ellipse cx="139" cy="163" rx="18" ry="21" fill="url(#zq-halo)"/zaftrusweb/><ellipse class="zq-eye" cx="101" cy="163" rx="8.5" ry="11.5" fill="#86f6e8"/zaftrusweb/><ellipse class="zq-eye" cx="139" cy="163" rx="8.5" ry="11.5" fill="#86f6e8"/zaftrusweb/>' +
    '<circle cx="98" cy="158" r="2.6" fill="#fff" opacity=".9"/zaftrusweb/><circle cx="136" cy="158" r="2.6" fill="#fff" opacity=".9"/zaftrusweb/></g>' +
    '<path class="zq-mouth" d="M109 183q11 8 22 0" stroke="#86f6e8" stroke-width="3" fill="none" stroke-linecap="round"/zaftrusweb/>' +
    '<circle cx="120" cy="222" r="12.5" fill="#06121c" fill-opacity=".55" stroke="#bff7ff" stroke-opacity=".55"/zaftrusweb/>' +
    '<path d="M114 217h12l-12 10h12" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/zaftrusweb/>' +
    '<g class="zq-orb"><circle cx="120" cy="30" r="17" fill="url(#zq-halo)"/zaftrusweb/><circle cx="120" cy="30" r="5.2" fill="#fff"/zaftrusweb/></g>' +
    '</svg>';

  var QUICK = ['What is AEGIS NEXA?', 'How does AENXIC work?', 'What is JARVIS?', 'I\'m a researcher', 'Partnerships & pilots'];
  var WELCOME = 'Hi! I\'m the Zaftrus assistant. Ask me about AEGIS NEXA, AENXIC, JARVIS, our research, or how to work with us.';

  var stillT, root, els = {}, built = false, isOpen = false, busy = false, opener = null, history = [], flight = null, raf = 0, pt = null;

  /* ------------------------------ text rendering ------------------------------ */
  function esc(s) { return s.replace(/zaftrusweb/&/g, '&amp;').replace(/zaftrusweb/</g, '&lt;').replace(/zaftrusweb/>/g, '&gt;'); }
  function inline(raw) {
    var keep = [], s = esc(raw);
    function hold(h) { keep.push(h); return '\u0000' + (keep.length - 1) + '\u0000'; }
    s = s.replace(/zaftrusweb/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*|mailto:[^\s)]+)\)/g, function (m, t, u) {
      return hold('<a href="' + u + '"' + (/zaftrusweb/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>');
    });
    s = s.replace(/zaftrusweb/`([^`]+)`/zaftrusweb/g, function (m, c) { return hold('<code>' + c + '</code>'); });
    s = s.replace(/zaftrusweb/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/zaftrusweb/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?])/g, function (m, p, u) { return p + hold('<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'); });
    s = s.replace(/zaftrusweb/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, function (m, e) { return hold('<a href="mailto:' + e + '">' + e + '</a>'); });
    s = s.replace(/zaftrusweb/(^|[\s(])(\/(?:technology|aegis-nexa|aenxic|jarvis|research|company|team|ecosystem|contact|events)\/)/g, function (m, p, u) { return p + hold('<a href="' + u + '">' + u + '</a>'); });
    return s.replace(/zaftrusweb/\u0000(\d+)\u0000/g, function (m, i) { return keep[+i]; });
  }
  function render(text) {
    var out = [], list = null, para = [];
    function endPara() { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } }
    function endList() { if (list) { out.push('</' + list + '>'); list = null; } }
    String(text).replace(/zaftrusweb/\r/g, '').split('\n').forEach(function (line) {
      var b = line.match(/zaftrusweb/^\s*(?:[-*•])\s+(.*)$/), n = line.match(/zaftrusweb/^\s*\d+[.)]\s+(.*)$/), h = line.match(/zaftrusweb/^\s*#{1,4}\s+(.*)$/);
      if (b || n) { endPara(); var t = b ? 'ul' : 'ol'; if (list !== t) { endList(); out.push('<' + t + '>'); list = t; } out.push('<li>' + inline((b || n)[1]) + '</li>'); }
      else if (h) { endPara(); endList(); out.push('<p><strong>' + inline(h[1]) + '</strong></p>'); }
      else if (!line.trim()) { endPara(); endList(); }
      else { endList(); para.push(line.trim()); }
    });
    endPara(); endList(); return out.join('');
  }


  /* ------------------------------ built-in test mode ------------------------------
     Used when no AI backend answers: matches the question against the website's own text. */
  var STOP = {}; 'a an the is are was were be been am do does did how what who whom whose which when where why can could would should will shall may might of in on at to for from by with about into as and or but if then than so that this those these it its you your we our us me my i tell give show please more any some there their they them have has had not no yes also very just'.split(' ').forEach(function (w) { STOP[w] = 1; });
  function toks(str) { return (String(str).toLowerCase().match(/zaftrusweb/[a-z0-9]+/g) || []).filter(function (w) { return w.length > 1 && !STOP[w]; }).map(function (w) { return w.length > 3 ? w.replace(/zaftrusweb/(ing|ed|es|s)$/, '') : w; }); }
  var demoData = null, demoLoading = null;
  function loadDemo() {
    if (demoData) return Promise.resolve(demoData);
    if (!demoLoading) demoLoading = fetch(DEMO_INDEX).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (rows) {
      var df = {}; rows.forEach(function (c) { c.th = toks(c.h); c.tt = toks(c.t); c.tp = toks(c.p); var u = {}; c.th.concat(c.tt, c.tp).forEach(function (w) { u[w] = 1; }); for (var w in u) df[w] = (df[w] || 0) + 1; });
      demoData = { rows: rows, df: df }; return demoData;
    });
    return demoLoading;
  }
  function count(arr, w) { var n = 0; for (var i = 0; i < arr.length; i++) if (arr[i] === w) n++; return n; }
  function snippet(c) { return '**' + c.h + '**' + (c.p && c.p !== c.h ? ' (' + c.p + ')' : '') + '\n\n' + c.t + '\n\nMore: ' + c.u; }
  function demoAnswer(q) {
    var t = q.toLowerCase();
    if (/zaftrusweb/^\s*(hi|hello|hey|namaste|salaam|good (morning|afternoon|evening))\b/.test(t) && t.length < 40) return 'Hello! Ask me about AEGIS NEXA, AENXIC, JARVIS, our research, or how to work with us.';
    if (/zaftrusweb/\bthank/.test(t)) return 'You\'re welcome! Anything else you\'d like to know?';
    if (/zaftrusweb/\b(price|pricing|cost|quote|buy|purchase|order|deliver|delivery|lead time|discount|budget|invoice)\b/.test(t)) return 'Pricing, quotes and delivery are handled personally by the team. Please email ' + EMAIL + ' with what you need and they will reply.';
    return loadDemo().then(function (d) {
      var qt = toks(q); if (!qt.length || !d.rows.length) return null;
      var N = d.rows.length, scored = d.rows.map(function (c) {
        var s = 0, hit = 0;
        qt.forEach(function (w) { var idf = Math.log(1 + N / (1 + (d.df[w] || 0))), x = (c.th.indexOf(w) > -1 ? 3 : 0) + (c.tp.indexOf(w) > -1 ? 2 : 0) + Math.min(3, count(c.tt, w)); if (x) hit++; s += idf * x; });
        return { c: c, s: s, cov: hit / qt.length };
      }).sort(function (a, b) { return b.s - a.s; });
      var top = scored[0];
      if (!top || top.s < 3 || top.cov < .34) return null;
      var out = snippet(top.c), second = scored.filter(function (x) { return x.c.u !== top.c.u && x.s >= top.s * .7 && x.cov >= .5; })[0];
      if (second) out += '\n\nAlso relevant: **' + second.c.h + '**: ' + second.c.t.slice(0, 220).replace(/zaftrusweb/\s+\S*$/, '') + '… ' + second.c.u;
      return out;
    });
  }
  function demoOn() {
    var f = $('.zfq__fine', root); if (f && !f.getAttribute('data-demo')) { f.setAttribute('data-demo', '1'); f.innerHTML = 'Showing answers taken from the website text. Anything else: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>'; }
  }
  var NOMATCH = 'I couldn\'t find that in the website text. Try asking about AEGIS NEXA, AENXIC, JARVIS, our research or the team, or email ' + EMAIL + ' and the team will reply personally.';

  /* ------------------------------ build ------------------------------ */
  function build() {
    if (built) return; built = true;
    root = document.createElement('div'); root.className = 'zfq'; root.hidden = true; root.id = 'zfq';
    root.innerHTML =
      '<div class="zfq__veil" data-zfq-close></div>' +
      '<div class="zfq__stage">' +
        '<div class="zfq__botwrap" data-state="idle">' +
          '<div class="zfq__bubble" aria-hidden="true"></div>' +
          '<div class="zfq__fly"><div class="zfq__tilt">' + BOT_SVG + '</div><div class="zfq__shadow"></div></div>' +
        '</div>' +
        '<section class="zfq__panel" role="dialog" aria-modal="true" aria-labelledby="zfq-title" data-lenis-prevent>' +
          '<header class="zfq__head"><div><h2 class="zfq__title" id="zfq-title">Queries</h2><p class="zfq__sub">Ask about Zaftrus, our technology and research</p></div>' +
            '<button type="button" class="zfq__x" aria-label="Close queries" data-zfq-close><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/zaftrusweb/></svg></button></header>' +
          '<div class="zfq__log" role="log" aria-live="polite" aria-relevant="additions" data-lenis-prevent></div>' +
          '<div class="zfq__chips"></div>' +
          '<form class="zfq__form" autocomplete="off"><textarea class="zfq__in" rows="1" maxlength="1200" placeholder="Type your question…" aria-label="Your question"></textarea>' +
            '<button type="submit" class="zfq__send" aria-label="Send"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h12M10 4l5 5-5 5"/zaftrusweb/></svg></button></form>' +
          '<p class="zfq__fine">AI assistant. Answers come from this website and Zaftrus documents. Anything else: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p>' +
        '</section>' +
      '</div>';
    document.body.appendChild(root);
    els = { wrap: $('.zfq__botwrap', root), fly: $('.zfq__fly', root), tilt: $('.zfq__tilt', root), bubble: $('.zfq__bubble', root),
            panel: $('.zfq__panel', root), log: $('.zfq__log', root), chips: $('.zfq__chips', root), form: $('.zfq__form', root), input: $('.zfq__in', root), send: $('.zfq__send', root) };

    root.addEventListener('click', function (e) { if (e.target.closest('[data-zfq-close]')) close(); });
    var stop = function (e) { e.stopPropagation(); };
    $('.zfq__veil', root).addEventListener('wheel', stop, { passive: true });
    $('.zfq__veil', root).addEventListener('touchmove', stop, { passive: true });
    els.form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    els.input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } });
    els.input.addEventListener('input', grow);
    document.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onPointer, { passive: true });
    try { history = JSON.parse(sessionStorage.getItem(STORE) || '[]').filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'; }).slice(-20); } catch (e) { history = []; }
  }

  function grow() { var t = els.input; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }
  function onKey(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab' && els.panel.contains(document.activeElement) || (e.key === 'Tab' && !root.contains(document.activeElement))) {
      var f = [].slice.call(els.panel.querySelectorAll('button,a[href],textarea')).filter(function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!els.panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function onPointer(e) {
    if (!isOpen || e.pointerType === 'touch') return;
    pt = e; if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0; if (!pt || !els.wrap) return;
      var r = els.wrap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .55;
      var nx = Math.max(-1, Math.min(1, (pt.clientX - cx) / (innerWidth * .5))), ny = Math.max(-1, Math.min(1, (pt.clientY - cy) / (innerHeight * .5)));
      els.tilt.style.setProperty('--ry', (nx * 14).toFixed(1) + 'deg');
      els.tilt.style.setProperty('--rx', (-ny * 9).toFixed(1) + 'deg');
      els.wrap.style.setProperty('--ex', (nx * 5.5).toFixed(1)); els.wrap.style.setProperty('--ey', (ny * 4).toFixed(1));
    });
  }
  function state(s) { els.wrap.setAttribute('data-state', s); root.setAttribute('data-state', s); }

  /* ------------------------------ flight (logo <-> centre) ------------------------------ */
  function logoPoint() {
    var m = $('.hdr__brand img, .hdr__brand svg') || $('.hdr__brand') || $('.hdr');
    var r = m.getBoundingClientRect();
    return { x: Math.max(20, Math.min(innerWidth - 20, r.left + r.width / 2)), y: Math.max(24, r.top + r.height / 2), w: Math.max(r.width, 28) };
  }
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* One continuous motion path, sampled finely: a hop out of the logo, a soft landing, and a damped squash-and-settle. */
  function frames(dir, dx, dy, s0, H) {
    var N = 72, out = [], hop = clamp(Math.abs(dy) * .32 + 60, 70, 170);
    for (var i = 0; i <= N; i++) {
      var u = i / N, x, y, sc, sx = 1, sy = 1, rot, op = 1;
      if (dir === 'in') {
        var split = .72;
        if (u <= split) {
          var v = u / split, p = smooth(v);
          x = dx * (1 - p); y = dy * (1 - p) - hop * 4 * v * (1 - v) * (1 - .25 * v);
          sc = s0 + (1 - s0) * Math.pow(smooth(v), .85);
          rot = -26 * Math.pow(1 - p, 1.6) + 9 * Math.sin(Math.PI * 2 * v) * (1 - v);
          op = clamp(u / .05, 0, 1);
        } else {
          var w = (u - split) / (1 - split), amp = Math.exp(-5.4 * w), c = Math.cos(w * Math.PI * 2.6);
          x = 0; y = -20 * amp * Math.sin(w * Math.PI * 1.3); sc = 1; rot = 0;
          sx = 1 + .15 * amp * c; sy = 1 - .15 * amp * c;
        }
      } else {
        var crouch = .2;
        if (u <= crouch) {
          var a = smooth(u / crouch); x = 0; y = 0; sc = 1; rot = 0; sx = 1 + .1 * a; sy = 1 - .14 * a;
        } else {
          var v2 = (u - crouch) / (1 - crouch), p2 = Math.pow(smooth(v2), 1.15);
          x = dx * p2; y = dy * p2 - hop * .9 * 4 * v2 * (1 - v2);
          sc = 1 + (s0 - 1) * easeInOut(v2); sy = 1 + .1 * (1 - smooth(v2 * 3)); sx = 1 - .05 * (1 - smooth(v2 * 3));
          rot = -28 * p2 + 10 * Math.sin(Math.PI * v2) * (1 - v2); op = 1 - smooth((v2 - .78) / .22);
        }
      }
      y += .5 * H * (1 - sy) * sc;   // squash against the floor, not the middle
      out.push({ transform: 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + (sc * sx).toFixed(4) + ',' + (sc * sy).toFixed(4) + ')', opacity: +op.toFixed(3), offset: u });
    }
    return out;
  }
  function fly(dir) {
    var dur = dir === 'in' ? 1500 : 950;
    if (reduce || !els.fly.animate) { els.fly.style.opacity = dir === 'in' ? 1 : 0; return { done: Promise.resolve(), dur: 0 }; }
    var lp = logoPoint(), r = els.wrap.getBoundingClientRect();
    var dx = lp.x - (r.left + r.width / 2), dy = lp.y - (r.top + r.height / 2), s0 = clamp(lp.w / r.width, .07, .3);
    flight = els.fly.animate(frames(dir, dx, dy, s0, r.height), { duration: dur, easing: 'linear', fill: 'both' });
    var done = flight.finished.then(function () { if (dir === 'in') { flight.cancel(); els.fly.style.opacity = 1; } }, function () {});
    return { done: done, dur: dur };
  }

  /* ------------------------------ open / close ------------------------------ */
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function setExpanded(v) { [].forEach.call(document.querySelectorAll('[data-zfq-open]'), function (b) { b.setAttribute('aria-expanded', v ? 'true' : 'false'); }); }

  function typeBubble(text) {
    var b = els.bubble; b.textContent = ''; b.classList.remove('is-off'); b.classList.add('is-on');
    if (reduce) { b.textContent = text; return Promise.resolve(); }
    return new Promise(function (res) { var i = 0; (function step() { b.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(step, 34); else res(); })(); });
  }

  async function open(trigger) {
    if (isOpen) return; isOpen = true; opener = trigger || null;
    var t = document.querySelector('[data-menu-toggle][aria-expanded="true"]'); if (t) t.click();
    build(); setExpanded(true);
    root.hidden = false; root.classList.remove('is-leaving', 'is-chat'); document.documentElement.classList.add('zfq-lock');
    if (window.lenis && window.lenis.stop) try { window.lenis.stop(); } catch (e) {}
    els.fly.style.opacity = reduce ? 1 : 0; state('idle'); els.bubble.className = 'zfq__bubble';
    var hdr = $('.hdr'), wasHidden = hdr && hdr.classList.contains('is-hidden'); if (wasHidden) hdr.classList.remove('is-hidden');
    void root.offsetWidth; root.classList.add('is-open');
    await sleep(reduce ? 50 : (wasHidden ? 480 : 90));
    if (!isOpen) return;
    var f = fly('in');
    stillT = setTimeout(function () { if (isOpen) document.documentElement.classList.add('zfq-still'); }, reduce ? 0 : 560);
    if (!reduce) await sleep(f.dur * .8);            // start greeting at touch-down, not after the settle
    if (!isOpen) return;
    root.classList.add('is-wave');
    var typed = typeBubble('How can I help you?');
    await Promise.all([f.done, typed]); if (!isOpen) return;
    await sleep(reduce ? 200 : 650); if (!isOpen) return;
    root.classList.remove('is-wave'); els.bubble.classList.remove('is-on'); els.bubble.classList.add('is-off');
    seedChat(); root.classList.add('is-chat');
    await sleep(reduce ? 50 : 700); if (isOpen) els.input.focus({ preventScroll: true });
  }

  async function close() {
    if (!isOpen) return; isOpen = false;
    root.classList.add('is-leaving'); els.bubble.classList.remove('is-on'); setExpanded(false); state('idle');
    els.tilt.style.setProperty('--rx', '0deg'); els.tilt.style.setProperty('--ry', '0deg');
    var f = fly('out');
    if (!reduce) await sleep(f.dur * .55);
    clearTimeout(stillT); document.documentElement.classList.remove('zfq-still');   // scenes return as the blur lifts
    root.classList.remove('is-open');                 // blur fades out while the robot is mid-air
    await f.done; await sleep(reduce ? 0 : 380);
    root.hidden = true; root.classList.remove('is-chat', 'is-leaving', 'is-wave');
    document.documentElement.classList.remove('zfq-lock');
    if (window.lenis && window.lenis.start) try { window.lenis.start(); } catch (e) {}
    if (flight) try { flight.cancel(); } catch (e) {}
    if (opener && opener.focus && opener.offsetParent !== null) opener.focus({ preventScroll: true });
    else { var any = document.querySelector('.hdr__q--pill, .hdr__q'); if (any && any.offsetParent !== null) any.focus({ preventScroll: true }); }
  }

  /* ------------------------------ chat ------------------------------ */
  var seeded = false;
  function seedChat() {
    if (seeded) return; seeded = true;
    if (history.length) { history.forEach(function (m) { addMsg(m.role === 'user' ? 'me' : 'bot', m.content, true); }); }
    else { addMsg('bot', WELCOME, true); showChips(); }
  }
  function showChips() {
    els.chips.innerHTML = '';
    QUICK.forEach(function (q) { var b = document.createElement('button'); b.type = 'button'; b.className = 'zfq__chip'; b.textContent = q; b.addEventListener('click', function () { send(q); }); els.chips.appendChild(b); });
  }
  function addMsg(who, text, instant) {
    var d = document.createElement('div'); d.className = 'zfq__m zfq__m--' + who;
    if (who === 'me') d.textContent = text; else d.innerHTML = render(text);
    if (instant) d.style.animation = 'none';
    els.log.appendChild(d); els.log.scrollTop = els.log.scrollHeight; return d;
  }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch (e) {} }
  function submit() { var v = els.input.value.trim(); if (!v) return; els.input.value = ''; grow(); send(v); }

  var ERR = {
    rate_limited: 'You\'re asking quickly. Give me a moment and try again.',
    default: 'I can\'t answer that right now. Please try again shortly, or email the team at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> and they\'ll reply personally.'
  };
  async function send(text) {
    if (busy) return; busy = true; els.send.disabled = true; els.chips.innerHTML = '';
    addMsg('me', text); history.push({ role: 'user', content: text }); save();
    var typing = document.createElement('div'); typing.className = 'zfq__m zfq__m--bot'; typing.innerHTML = '<span class="zfq__typing" aria-label="Thinking"><i></i><i></i><i></i></span>';
    els.log.appendChild(typing); els.log.scrollTop = els.log.scrollHeight; state('thinking');
    var reply = null, errKey = 'default', fallback = false;
    try {
      var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 30000);
      var res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ messages: history.slice(-10), page: location.pathname }) });
      clearTimeout(to);
      var data = await res.json().catch(function () { return null; });
      if (res.ok && data && data.reply) reply = data.reply;
      else if (data && data.error === 'rate_limited') errKey = 'rate_limited';
      else if (!data || data.error === 'not_configured' || res.status === 404 || res.status === 405 || res.status === 501) fallback = true;
    } catch (e) { fallback = !(e && e.name === 'AbortError'); /* no backend reachable (e.g. opened from a plain folder) */ }
    if (!reply && fallback) {
      var local = await demoAnswer(text); await sleep(450);
      reply = local || NOMATCH; demoOn();
    }
    typing.remove();
    if (reply) {
      history.push({ role: 'assistant', content: reply }); save();
      addMsg('bot', reply); state('talking'); setTimeout(function () { if (isOpen && !busy) state('idle'); }, Math.min(3200, 700 + reply.length * 14));
    } else {
      var d = addMsg('bot', ''); d.innerHTML = '<p>' + ERR[errKey] + '</p>'; history.pop(); save(); state('idle');
    }
    busy = false; els.send.disabled = false; if (isOpen) els.input.focus({ preventScroll: true });
  }

  /* ------------------------------ wire the buttons ------------------------------ */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-zfq-open]');
    if (b) { e.preventDefault(); isOpen ? close() : open(b); }
  });
  window.ZaftrusQueries = { open: function () { open(null); }, close: close };

  /* ------------------------------ header self-fit ------------------------------
     If the brand, nav and Queries button would collide (any font width, any screen), switch to the compact layout. */
  function fitHeader() {
    var hdr = $('.hdr'); if (!hdr) return;
    var brand = $('.hdr__brand'), pill = $('.hdr__q--pill'), nav = $('.hdr__nav ul'), cta = $('.hdr__cta');
    if (pill && !pill.getAttribute('aria-label')) pill.setAttribute('aria-label', 'Queries');
    hdr.classList.remove('is-compact'); if (pill) pill.classList.remove('is-icon');
    if (nav && cta && nav.offsetParent !== null) {
      /* items never squeeze: if the row is too wide it just runs off the right edge, so test the Contact button's right edge */
      var over = function () { return cta.getBoundingClientRect().right > document.documentElement.clientWidth - 20 || cta.scrollWidth > cta.clientWidth + 1 || nav.getBoundingClientRect().height > 42; };
      if (over()) hdr.classList.add('is-compact');             // too wide even at full size: use the menu button
    }
    var word = $('.hdr__word');
    if (word && pill && pill.offsetParent !== null) {
      var rg = document.createRange(); rg.selectNodeContents(word);       // true right edge of the "ZAFTRUS" text
      var textRight = Math.max(rg.getBoundingClientRect().right, word.getBoundingClientRect().right), p = pill.getBoundingClientRect();
      if (p.left - textRight < 12) pill.classList.add('is-icon');
    }
    var tg = $('.hdr__toggle');                                          // the row must also stay on-screen
    if (pill && pill.offsetParent !== null && tg && tg.offsetParent !== null && tg.getBoundingClientRect().right > document.documentElement.clientWidth - 14) pill.classList.add('is-icon');
  }
  var fitT; function fitSoon() { clearTimeout(fitT); fitT = setTimeout(fitHeader, 100); }
  fitHeader(); window.addEventListener('resize', fitSoon); window.addEventListener('load', fitHeader);
  if (document.fonts) { if (document.fonts.ready) document.fonts.ready.then(fitHeader); if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitSoon); }

  /* Technology dropdown: Esc closes it (until the pointer leaves or focus moves on) */
  var dd = $('.hdr__dd');
  if (dd) {
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dd.contains(document.activeElement)) { dd.classList.add('is-shut'); var a = dd.querySelector(':scope > a'); if (a) a.focus(); } });
    dd.addEventListener('mouseleave', function () { dd.classList.remove('is-shut'); });
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) dd.classList.remove('is-shut'); });
  }

  /* build the (hidden) assistant early so the first click has nothing to construct */
  (window.requestIdleCallback || function (f) { return setTimeout(f, 1800); })(function () { try { build(); } catch (e) {} });
})();
