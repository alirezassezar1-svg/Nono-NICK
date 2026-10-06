/* ═════════════════════════════════════════════════════════
   NONONICK / main.js — navigation, services interaction,
   work visuals, orb dock, contact transmission
   ═════════════════════════════════════════════════════════ */
(function (win, doc) {
  'use strict';
  var NN = win.NN; if (!NN) return;
  var $ = NN.$, $$ = NN.$$, clamp = NN.clamp;

  /* ─────────── NAV: compact on scroll, hide going down ─────────── */
  function nav() {
    var el = doc.getElementById('nav'), bar = $('.nav__bar', el), last = win.pageYOffset || 0, ticking = false;
    var prog = doc.getElementById('progress');
    function upd(y) {
      var h = doc.documentElement.scrollHeight - win.innerHeight;
      if (prog) prog.style.width = clamp(h > 0 ? (y / h) * 100 : 0, 0, 100).toFixed(2) + '%';
      el.classList.toggle('is-stuck', y > 40);
      var dir = y > last ? 1 : -1;
      if (!doc.body.classList.contains('menu-open'))
        el.classList.toggle('is-hidden', y > 320 && dir === 1);
      last = y;
    }
    win.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; win.requestAnimationFrame(function () { ticking = false; upd(win.pageYOffset); }); }
    }, { passive: true });
    upd(win.pageYOffset);
    /* rail fill */
    var railFill = doc.getElementById('railFill');
    if (railFill) win.addEventListener('scroll', function () {
      var h = doc.documentElement.scrollHeight - win.innerHeight;
      railFill.style.width = clamp(h > 0 ? (win.pageYOffset / h) * 100 : 0, 0, 100) + '%';
    }, { passive: true });
  }

  /* ─────────── NAV: active link + hero rail ─────────── */
  function tracking() {
    var groups = {
      top: 'top', intro: 'top', services: 'services', system: 'system', work: 'work',
      why: 'work', performance: 'system', process: 'system', about: 'about', contact: 'contact'
    };
    NN.init.track(function (id) {
      var key = groups[id] || id;
      $$('[data-navlink]').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-navlink') === key); });
      $$('[data-rail]').forEach(function (a) {
        var want = a.getAttribute('data-rail');
        a.classList.toggle('is-active', want === id || (want === 'top' && (id === 'top' || id === 'intro')));
      });
      doc.dispatchEvent(new CustomEvent('nn:section', { detail: { id: id, key: key } }));
    });
  }

  /* ─────────── FULLSCREEN MENU ─────────── */
  function menu() {
    var b = doc.getElementById('burger'), m = doc.getElementById('menu');
    if (!b || !m) return;
    function set(open) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      m.classList.toggle('is-open', open);
      m.setAttribute('aria-hidden', open ? 'false' : 'true');
      doc.body.classList.toggle('menu-open', open);
      doc.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) { var f = $('a', m); if (f) f.focus({ preventScroll: true }); }
    }
    b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
    $$('[data-menulink]', m).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    doc.addEventListener('nn:navigate', function () { set(false); });
  }

  /* ─────────── HUD CLOCK ─────────── */
  function clock() {
    var el = doc.getElementById('hudClock'); if (!el) return;
    function t() {
      var d = new Date();
      el.textContent = 'TEHRAN ' + d.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Tehran' });
    }
    t(); setInterval(t, 1000);
  }

  /* ─────────── 02 · FLOATING FIELD DEPTH ─────────── */
  function field() {
    var f = doc.getElementById('field'); if (!f || NN.reduce() || !NN.fine()) return;
    var chips = $$('.chip', f).map(function (c) { return { el: c, d: parseFloat(c.dataset.depth) || 16 }; });
    var cx = 0, cy = 0;
    NN.ticker.add(function loop() {
      var r = f.getBoundingClientRect();
      if (r.bottom < -80 || r.top > win.innerHeight + 80) return;
      var tx = clamp((NN.pointer.x - (r.left + r.width / 2)) / r.width, -1, 1);
      var ty = clamp((NN.pointer.y - (r.top + r.height / 2)) / r.height, -1, 1);
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      chips.forEach(function (o, i) {
        var k = o.d / 34;
        var float = Math.sin(performance.now() * 0.0006 + i) * (o.d * 0.16);
        o.el.style.transform = 'translate3d(' + (-cx * o.d).toFixed(2) + 'px,' + (-cy * o.d * 0.7 + float).toFixed(2) + 'px,0)';
        o.el.style.zIndex = String(10 + Math.round(k * 10));
      });
    });
  }

  /* ─────────── 03 · SERVICES ─────────── */
  var AREAS = {
    '01': '"a a a b b b" "a a a c c d" "e e f f f d" "e e f f f d"',
    '02': '"a a b b c c" "a a d d e e" "f f f f f f" "f f f f f f"',
    '03': '"a a a a a a" "b b c c c c" "b b d d e e" "f f f f f f"',
    '04': '"a a b b b b" "c c d d d d" "c c e e e e" "f f f f f f"',
    '05': '"a a a b b b" "c c d d e e" "c c d d f f" "g g g g g g"'.replace(/g/g, 'e'),
    '06': '"a a b b c c" "a a d d d d" "e e e e f f" "a a e e f f"'.replace(/a a b b c c/, 'b b c c a a'),
    '07': '"a a a a a a" "b b b c c c" "d d e e e e" "d d d f f f"',
    '08': '"a a b b c c" "a a b b d d" "e e e e f f" "a a e e f f"',
    '09': '"a a a b b b" "a a a c c c" "d d e e f f" "d d e e f f"',
    '10': '"a a a a b b" "c c d d d d" "c c e e f f" "a a e e f f"'
  };
  function services() {
    var root = doc.querySelector('[data-svc]'); if (!root) return;
    var rows = $$('.svc__row', root),
        stage = doc.getElementById('stage'),
        mock = doc.getElementById('stageMock'),
        els = {
          num: doc.getElementById('stageNum'), name: doc.getElementById('stageName'),
          out: doc.getElementById('stageOut'), cyc: doc.getElementById('stageCycle'),
          lay: doc.getElementById('stageLayer'), st: doc.getElementById('stageStatus')
        };
    function setStage(row) {
      if (!row || !stage) return;
      var k = row.dataset.row;
      stage.style.setProperty('--h', row.dataset.hue || 190);
      stage.setAttribute('data-vis', k);
      if (mock && AREAS[k]) mock.style.gridTemplateAreas = AREAS[k];
      if (els.num) els.num.textContent = k;
      if (els.name) NN.scramble(els.name, $('.svc__title', row).textContent.trim());
      if (els.out) els.out.textContent = row.dataset.out || '—';
      if (els.cyc) els.cyc.textContent = row.dataset.cycle || '—';
      if (els.lay) els.lay.textContent = row.dataset.layer || '—';
      if (els.st) els.st.textContent = row.dataset.status || 'ACTIVE';
    }
    function open(row) {
      rows.forEach(function (r) {
        var on = r === row;
        r.classList.toggle('is-open', on);
        var b = $('.svc__head', r);
        if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      setStage(row);
    }
    rows.forEach(function (r) {
      var btn = $('.svc__head', r);
      if (!btn) return;
      btn.addEventListener('click', function () { r.classList.contains('is-open') ? open(null) || setStage(r) : open(r); });
      btn.addEventListener('focus', function () { setStage(r); });
      r.addEventListener('pointerenter', function () {
        if (!NN.fine()) return;
        rows.forEach(function (x) { x.classList.toggle('is-hot', x === r); });
        setStage(r);
      });
      r.addEventListener('pointerleave', function () {
        rows.forEach(function (x) { x.classList.remove('is-hot'); });
      });
    });
    open(rows[0]);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { rows.forEach(function (r) { r.classList.remove('is-open'); $('.svc__head', r).setAttribute('aria-expanded', 'false'); }); }
    });
  }

  /* ─────────── 05 · WORK VISUALS ─────────── */
  function work() {
    $$('.vis').forEach(function (v) { NN.inView(v, function (ins) { if (ins) v.classList.add('in'); }); });
    /* touch: tap the card to reveal the CTA state before navigating */
    if (!NN.fine()) {
      $$('[data-work]').forEach(function (w) {
        w.addEventListener('touchstart', function () { w.classList.add('is-tapped'); }, { passive: true });
      });
    }
  }

  /* ─────────── 14 · ORB DOCK ─────────── */
  function dock() {
    var wrap = doc.getElementById('dock'), btn = doc.getElementById('dorbs'),
        label = doc.getElementById('dockLabel'), items = $$('[data-dockitem]', wrap || doc);
    if (!btn || !wrap) return;
    var LABELS = { top: 'SYSTEM READY', intro: 'WHAT WE BUILD', services: 'MODULES OPEN', system: 'PIPELINE LIVE',
      work: 'CASE STUDIES', why: 'DOCTRINE', performance: 'ENGINE ROOM', process: 'SEQUENCE', about: 'THE STUDIO', contact: 'OPEN A BRIEF' };
    function set(open) {
      wrap.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var f = $('a', wrap); if (f) f.focus({ preventScroll: true }); }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!wrap.classList.contains('is-open')); });
    doc.addEventListener('click', function (e) { if (!wrap.contains(e.target)) set(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) { set(false); btn.focus(); }
    });
    items.forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    /* keyboard roving inside the menu */
    wrap.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var list = items, i = list.indexOf(doc.activeElement);
      if (i < 0) return; e.preventDefault();
      var n = (i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
      list[n].focus();
    });
    doc.addEventListener('nn:section', function (ev) {
      var id = ev.detail.id;
      if (label) NN.scramble(label, LABELS[id] || 'SYSTEM READY');
      var body = $('.dorbs__body', btn);
      if (body) {
        var hue = { top: 190, intro: 190, services: 210, system: 268, work: 176, why: 258,
          performance: 158, process: 200, about: 224, contact: 186 }[id] || 190;
        body.style.filter = 'hue-rotate(' + (hue - 190) + 'deg)';
        body.style.animationDuration = (id === 'system' ? 4.5 : id === 'contact' ? 9 : 7) + 's';
      }
      /* shrink the dock over the hero so it never competes with the main orb */
      wrap.style.opacity = id === 'top' ? '.62' : '1';
    });
  }

  /* ─────────── 12 · CONTACT TRANSMISSION ─────────── */
  function brief() {
    var form = doc.getElementById('brief'); if (!form) return;
    var ok = doc.getElementById('briefOk'), okLog = doc.getElementById('okLog'), okRef = doc.getElementById('okRef'),
        again = doc.getElementById('briefAgain');
    var rules = [
      ['name', function (v) { return v.trim().length >= 2; }, 'PLEASE ENTER YOUR NAME'],
      ['brand', function (v) { return v.trim().length >= 2; }, 'BUSINESS OR BRAND REQUIRED'],
      ['email', function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); }, 'VALID EMAIL REQUIRED'],
      ['type', function (v) { return !!v; }, 'SELECT A PROJECT TYPE'],
      ['budget', function (v) { return !!v; }, 'SELECT A BUDGET RANGE'],
      ['message', function (v) { return v.trim().length >= 12; }, 'TELL US A LITTLE MORE']
    ];
    function fieldOf(name) { return form.elements[name]; }
    function validate(name) {
      var r = rules.filter(function (x) { return x[0] === name; })[0]; if (!r) return true;
      var el = fieldOf(name), wrap = el.closest('.f'), good = r[1](el.value || '');
      wrap.classList.toggle('is-bad', !good);
      var err = $('[data-err]', wrap); if (err) err.textContent = good ? '' : r[2];
      el.setAttribute('aria-invalid', good ? 'false' : 'true');
      return good;
    }
    rules.forEach(function (r) {
      var el = fieldOf(r[0]); if (!el) return;
      el.addEventListener('blur', function () { validate(r[0]); });
      el.addEventListener('input', function () { if (el.closest('.f').classList.contains('is-bad')) validate(r[0]); });
      el.addEventListener('change', function () { validate(r[0]); });
    });

    function typeLines(lines, done) {
      if (NN.reduce()) { okLog.innerHTML = lines.join('<br>'); done && done(); return; }
      var i = 0;
      (function next() {
        if (i >= lines.length) { done && done(); return; }
        okLog.innerHTML = lines.slice(0, i + 1).join('<br>');
        i++; setTimeout(next, 420);
      })();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = rules.map(function (r) { return validate(r[0]) ? null : r[0]; }).filter(Boolean);
      if (bad.length) {
        var el = fieldOf(bad[0]);
        el.focus({ preventScroll: false });
        el.scrollIntoView({ block: 'center', behavior: NN.reduce() ? 'auto' : 'smooth' });
        return;
      }
      var btn = $('button[type=submit]', form), span = $('span', btn), old = span.textContent;
      span.textContent = 'TRANSMITTING…'; btn.disabled = true;
      setTimeout(function () {
        form.classList.add('is-sent');
        ok.setAttribute('aria-hidden', 'false');
        okRef.textContent = '#NN-' + String(Math.floor(1000 + Math.random() * 8999));
        typeLines([
          '&gt; payload validated ................. <b>OK</b>',
          '&gt; anti-spam check ..................... <b>PASS</b>',
          '&gt; brief queued for review ............ <b>OK</b>',
          '&gt; NONONICK SYSTEM INITIALIZED'
        ]);
        var h = $('h3', ok); if (h) NN.scramble(h, 'PROJECT RECEIVED.');
        span.textContent = old; btn.disabled = false;
        ok.scrollIntoView({ block: 'center', behavior: NN.reduce() ? 'auto' : 'smooth' });
      }, 780);
    });

    if (again) again.addEventListener('click', function () {
      form.classList.remove('is-sent');
      ok.setAttribute('aria-hidden', 'true');
      form.reset();
      $$('.f', form).forEach(function (f) { f.classList.remove('is-bad'); });
      okLog.textContent = '';
      fieldOf('name').focus();
    });
  }

  /* ─────────── boot ─────────── */
  NN.boot(function () {
    nav(); tracking(); menu(); clock(); field(); services(); work(); dock(); brief();
  });
})(window, document);