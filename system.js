/* ═════════════════════════════════════════════════════════
   NONONICK / system.js — scroll-driven machinery:
   the NONONICK pipeline, process timeline, engine-room
   dashboard (graph canvas + live log)
   ═════════════════════════════════════════════════════════ */
(function (win, doc) {
  'use strict';
  var NN = win.NN; if (!NN) return;
  var $ = NN.$, $$ = NN.$$, clamp = NN.clamp;

  /* ─────────── 04 · NONONICK SYSTEM PIPELINE ─────────── */
  function pipeline() {
    var pipe = doc.getElementById('sysPipe'), fill = doc.getElementById('sysFill'),
        pulse = doc.getElementById('sysPulse'), nodes = $$('.node', pipe || body()),
        outN = doc.getElementById('sysStageN'), outT = doc.getElementById('sysStageT'),
        outD = doc.getElementById('sysStageD');
    if (!pipe || !nodes.length) return;
    function body() { return doc.body; }

    var active = -1;
    function update() {
      var r = pipe.getBoundingClientRect(), vh = win.innerHeight;
      var p = clamp((vh * 0.72 - r.top) / (r.height - vh * 0.28), 0, 1);
      fill.style.setProperty('--p', p.toFixed(4));
      pulse.style.setProperty('--pp', p.toFixed(4));

      var idx = 0;
      nodes.forEach(function (n, i) {
        var nr = n.getBoundingClientRect();
        if (nr.top < vh * 0.68) idx = i;
        n.classList.toggle('is-active', nr.top < vh * 0.72 && nr.bottom > vh * 0.12);
      });
      pipe.classList.toggle('is-flowing', r.top < vh && r.bottom > 0);

      if (idx !== active) {
        active = idx;
        var n = nodes[idx];
        if (outN) NN.scramble(outN, n.dataset.node);
        if (outT) NN.scramble(outT, n.dataset.title);
        if (outD) outD.textContent = n.dataset.desc;
      }
    }
    if (NN.reduce()) { nodes.forEach(function (n) { n.classList.add('is-active'); }); fill.style.setProperty('--p', 1); return; }
    var queued = false;
    NN.ticker.add(function loop() {
      if (!queued) return;
      queued = false; update();
    });
    win.addEventListener('scroll', function () { queued = true; }, { passive: true });
    win.addEventListener('resize', function () { queued = true; }, { passive: true });
    update();
  }

  /* ─────────── 08 · PROCESS TIMELINE ─────────── */
  function process() {
    var steps = doc.getElementById('steps'), fill = doc.getElementById('stepsFill'),
        pct = doc.getElementById('procPct');
    if (!steps) return;
    var items = $$('.step', steps), vertical = function () { return win.innerWidth <= 1024; };
    function update() {
      var r = steps.getBoundingClientRect(), vh = win.innerHeight;
      var p = clamp((vh * 0.78 - r.top) / (r.height + vh * 0.18), 0, 1);
      if (vertical()) fill.style.height = (p * 100).toFixed(1) + '%';
      else fill.style.width = (p * 100).toFixed(1) + '%';
      if (pct) pct.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
      items.forEach(function (s, i) {
        var trigger = (i + 0.5) / items.length;
        var on = p >= trigger - 0.04;
        if (on !== s.__on) {
          s.__on = on; s.classList.toggle('is-on', on);
          if (on && !NN.reduce()) NN.scramble($('h3', s));
        }
      });
    }
    if (NN.reduce()) { items.forEach(function (s) { s.classList.add('is-on'); }); fill.style.width = '100%'; fill.style.height = '100%'; return; }
    var q = false;
    NN.ticker.add(function () { if (q) { q = false; update(); } });
    win.addEventListener('scroll', function () { q = true; }, { passive: true });
    win.addEventListener('resize', function () { q = true; }, { passive: true });
    update();
  }

  /* ─────────── 07 · ENGINE ROOM GRAPH ─────────── */
  function graph() {
    var cv = doc.getElementById('graphCanvas'); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), dpr = clamp(win.devicePixelRatio || 1, 1, 2), w, h, drawn = false;
    var ours = [58, 62, 55, 64, 61, 59, 66, 63, 60, 57, 62, 59, 56, 61, 58, 64, 60, 57, 59, 62];
    var base = [212, 246, 238, 284, 310, 296, 342, 328, 356, 372, 348, 388, 402, 376, 412, 398, 428, 442, 418, 452];
    function size() {
      var r = cv.getBoundingClientRect();
      w = Math.max(240, r.width); h = Math.max(140, r.height);
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function line(arr, max, col, lw, glow) {
      var pad = 14, iw = w - pad * 2, ih = h - pad * 2 - 10;
      ctx.beginPath();
      arr.forEach(function (v, i) {
        var x = pad + (i / (arr.length - 1)) * iw, y = pad + 10 + ih - (v / max) * ih;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round';
      if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    function render(prog) {
      size();
      ctx.clearRect(0, 0, w, h);
      /* grid */
      ctx.strokeStyle = 'rgba(148,178,222,.09)'; ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var y = 14 + 10 + (h - 34) * (g / 4);
        ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(w - 14, y); ctx.stroke();
      }
      ctx.font = '500 9px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(108,117,145,.9)';
      ['450', '340', '230', '120', '0'].forEach(function (t, i) {
        ctx.fillText(t, 16, 20 + (h - 34) * (i / 4) - 4);
      });
      var max = 470;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, w * prog, h); ctx.clip();
      line(base, max, 'rgba(148,178,222,.34)', 1.2, false);
      line(ours, max, 'rgba(63,224,255,.95)', 1.8, true);
      ctx.restore();
      /* marker on the live point */
      var lx = 14 + (w - 28) * prog, lv = ours[Math.min(ours.length - 1, Math.round(prog * (ours.length - 1)))];
      var ly = 24 + (h - 34) - (lv / max) * (h - 34);
      ctx.fillStyle = 'rgba(63,224,255,1)'; ctx.beginPath(); ctx.arc(lx, ly, 3, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(63,224,255,.16)'; ctx.beginPath(); ctx.arc(lx, ly, 9, 0, 6.283); ctx.fill();
    }
    size(); render(NN.reduce() ? 1 : 0);
    win.addEventListener('resize', function () { render(drawn ? 1 : 0); }, { passive: true });
    NN.inView(cv, function (v) {
      if (!v || drawn) return; drawn = true;
      if (NN.reduce()) { render(1); return; }
      var t0 = performance.now();
      NN.ticker.add(function step(dt, now) {
        var p = clamp((now - t0) / 1500, 0, 1), e = 1 - Math.pow(1 - p, 3);
        render(e);
        if (p >= 1) NN.ticker.remove(step);
      });
    });
  }

  /* ─────────── 07 · LIVE LOG ─────────── */
  function log() {
    var el = doc.getElementById('log'); if (!el) return;
    var lines = [
      '<b>[ok]</b> probe · ahvaz-edge · lcp <u>0.86s</u>',
      '<b>[ok]</b> budget · weight 178kb / 180kb',
      'deploy · rev <u>8f2c1</u> · 318 pops · 1.9s',
      '<b>[ok]</b> cls 0.00 · inp <u>42ms</u> · ttfb 41ms',
      '<s>[watch]</s> third-party removed · chat-widget',
      '<b>[ok]</b> cms release · /services · 4 blocks',
      'backup · daily snapshot · verified',
      '<b>[ok]</b> a11y · axe run · 0 violations',
      '<s>[watch]</s> image avif conversion · 12 files',
      '<b>[ok]</b> ssl renewed · *.nononick.com · 90d',
      'queue · content release · 2 pending',
      '<b>[ok]</b> uptime · 99.98% · 30d rolling'
    ];
    var i = 0;
    function push() {
      var s = doc.createElement('span');
      s.innerHTML = '<u>' + new Date().toLocaleTimeString('en-GB', { hour12: false }) + '</u> ' + lines[i % lines.length];
      el.insertBefore(s, el.firstChild);
      while (el.children.length > 14) el.removeChild(el.lastChild);
      i++;
    }
    for (var k = 0; k < 6; k++) push();
    if (NN.reduce()) return;
    var timer = null;
    NN.inView(el, function (v) {
      if (v && !timer) timer = setInterval(push, 2600);
      else if (!v && timer) { clearInterval(timer); timer = null; }
    });
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden && timer) { clearInterval(timer); timer = null; }
      else if (!doc.hidden && !timer) timer = setInterval(push, 2600);
    });
  }

  /* ─────────── 07 · GAUGE OFFSETS ─────────── */
  function gauges() {
    var vals = [0.9 / 2.5, 0.02, 46 / 200];
    $$('[data-gauge] .g-fg').forEach(function (c, i) {
      var frac = clamp(vals[i], 0.02, 0.98);
      c.style.setProperty('--off', (327 * (1 - frac)).toFixed(1));
      c.style.setProperty('--gd', (i * 0.16) + 's');
    });
  }

  NN.boot(function () { pipeline(); process(); graph(); log(); gauges(); });
})(window, document);