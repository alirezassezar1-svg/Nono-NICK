/* ═════════════════════════════════════════════════════════
   NONONICK / utils.js — DOM helpers, ticker, reveals,
   scramble, magnetic, tilt, parallax, counters, tracking
   Zero dependencies. ES5-safe patterns, modern APIs guarded.
   ═════════════════════════════════════════════════════════ */
(function (win, doc) {
  'use strict';

  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var mqR = win.matchMedia('(prefers-reduced-motion: reduce)');
  var mqF = win.matchMedia('(pointer: fine)');
  var reduce = function () { return mqR.matches; };
  var fine   = function () { return mqF.matches; };

  /* ── central RAF ticker (single loop for every animation) ── */
  var tasks = [], running = false, last = 0;
  function frame(t) {
    if (!running) return;
    var dt = Math.min(48, t - last) || 16; last = t;
    for (var i = tasks.length - 1; i >= 0; i--) {
      try { tasks[i](dt, t); } catch (e) { tasks.splice(i, 1); }
    }
    win.requestAnimationFrame(frame);
  }
  function start() { if (running || !tasks.length) return; running = true; last = performance.now(); win.requestAnimationFrame(frame); }
  function stop()  { running = false; }
  var ticker = {
    add: function (fn) { if (tasks.indexOf(fn) < 0) tasks.push(fn); start(); },
    remove: function (fn) { var i = tasks.indexOf(fn); if (i > -1) tasks.splice(i, 1); if (!tasks.length) stop(); },
    size: function () { return tasks.length; }
  };
  doc.addEventListener('visibilitychange', function () { doc.hidden ? stop() : start(); });

  /* ── scramble-decode ── */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*<>[]{}=+%';
  function scramble(el, text) {
    var final = text != null ? text : (el.dataset.text || el.textContent).trim();
    el.dataset.text = final;
    if (reduce()) { el.textContent = final; return; }
    if (el.__sc) win.cancelAnimationFrame(el.__sc);
    var len = final.length, dur = 460 + len * 16, t0 = performance.now();
    function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), reveal = Math.floor(p * len * 1.12), out = '', i, ch;
      for (i = 0; i < len; i++) {
        ch = final.charAt(i);
        out += (ch === ' ') ? ' ' : (i < reveal ? ch : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0));
      }
      el.textContent = out;
      if (p < 1) el.__sc = win.requestAnimationFrame(step);
      else { el.textContent = final; el.__sc = 0; }
    }
    el.__sc = win.requestAnimationFrame(step);
  }

  /* ── reveal observer ── */
  function initReveal() {
    var els = $$('[data-reveal],[data-scramble],[data-count],[data-gauge],.mod,.principle,.vis');
    if (!('IntersectionObserver' in win)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    if (reduce()) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      $$('[data-count]').forEach(function (e) { finishCount(e); });
      return;
    }
    var io = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        if (el.hasAttribute('data-scramble')) scramble(el);
        $$('[data-scramble]', el).forEach(function (s, i) { setTimeout(function () { scramble(s); }, i * 90); });
        if (el.hasAttribute('data-count')) count(el);
        o.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ── counters ── */
  function finishCount(el) {
    var to = parseFloat(el.dataset.count || '0'), dec = parseInt(el.dataset.dec || '0', 10);
    el.textContent = to.toFixed(dec) + (el.dataset.suffix || '');
  }
  function count(el) {
    var to = parseFloat(el.dataset.count || '0'), dec = parseInt(el.dataset.dec || '0', 10),
        suf = el.dataset.suffix || '', dur = 1100 + Math.random() * 500, t0 = performance.now();
    function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (p < 1) win.requestAnimationFrame(step);
    }
    win.requestAnimationFrame(step);
  }

  /* ── magnetic elements ── */
  function initMagnetic() {
    if (!fine() || reduce()) return;
    $$('[data-magnetic]').forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-magnetic')) || 0.26,
          tx = 0, ty = 0, cx = 0, cy = 0, on = false;
      function loop() {
        cx = lerp(cx, tx, 0.16); cy = lerp(cy, ty, 0.16);
        el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
        if (!on && Math.abs(cx) + Math.abs(cy) < 0.2) { el.style.transform = ''; ticker.remove(loop); }
      }
      el.addEventListener('pointerenter', function (e) {
        on = true; var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * k; ty = (e.clientY - (r.top + r.height / 2)) * k;
        ticker.add(loop);
      });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * k; ty = (e.clientY - (r.top + r.height / 2)) * k;
      });
      el.addEventListener('pointerleave', function () { on = false; tx = 0; ty = 0; });
    });
  }

  /* ── 3D tilt ── */
  function initTilt() {
    if (!fine() || reduce()) return;
    $$('[data-tilt]').forEach(function (el) {
      var p = el.parentElement; if (p) p.style.perspective = '1100px';
      var rx = 0, ry = 0, trx = 0, tryy = 0, on = false;
      function loop() {
        rx = lerp(rx, trx, 0.1); ry = lerp(ry, tryy, 0.1);
        el.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(0)';
        if (!on && Math.abs(rx) + Math.abs(ry) < 0.05) { el.style.transform = ''; ticker.remove(loop); }
      }
      el.addEventListener('pointerenter', function () { on = true; ticker.add(loop); });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tryy = ((e.clientX - r.left) / r.width - 0.5) * 11;
        trx = -((e.clientY - r.top) / r.height - 0.5) * 11;
      });
      el.addEventListener('pointerleave', function () { on = false; trx = tryy = 0; });
    });
  }

  /* ── scroll parallax + pointer depth ── */
  var scrollY = win.pageYOffset || 0, vh = win.innerHeight;
  function initScrollCache() {
    var tick = false;
    win.addEventListener('scroll', function () {
      scrollY = win.pageYOffset || doc.documentElement.scrollTop || 0;
      if (!tick) { tick = true; win.requestAnimationFrame(function () { tick = false; if (win.__onScroll) win.__onScroll(scrollY); }); }
    }, { passive: true });
    win.addEventListener('resize', function () { vh = win.innerHeight; }, { passive: true });
  }
  function initParallax() {
    if (reduce()) return;
    var els = $$('[data-parallax]').map(function (el) {
      return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0.06, top: 0, h: 0 };
    });
    if (!els.length) return;
    function measure() {
      els.forEach(function (o) {
        var r = o.el.getBoundingClientRect();
        o.top = r.top + scrollY; o.h = r.height;
      });
    }
    measure();
    win.addEventListener('resize', measure, { passive: true });
    setTimeout(measure, 900);
    function loop() {
      els.forEach(function (o) {
        var center = o.top + o.h / 2 - scrollY, d = (vh / 2 - center) * o.k;
        if (Math.abs(d) > 0.4 && center > -o.h && center < vh * 2) {
          o.el.style.setProperty('--py', d.toFixed(2) + 'px');
          if (!o.el.style.transform || o.el.style.transform.indexOf('translate3d') === 0)
            o.el.style.transform = 'translate3d(0,' + d.toFixed(2) + 'px,0)';
        }
      });
    }
    ticker.add(loop);
  }
  var pointer = { x: 0, y: 0, nx: 0, ny: 0 };
  function initPointer() {
    win.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX; pointer.y = e.clientY;
      pointer.nx = (e.clientX / win.innerWidth) * 2 - 1;
      pointer.ny = (e.clientY / win.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ── custom cursor ── */
  function initCursor() {
    var cur = $('#.cursor') || $('.cursor');
    if (!cur || !fine() || reduce()) { if (cur) cur.style.display = 'none'; return; }
    var ring = $('.cursor__ring', cur), dot = $('.cursor__dot', cur),
        rx = pointer.x, ry = pointer.y, dx = pointer.x, dy = pointer.y;
    doc.addEventListener('pointerover', function (e) {
      var hot = e.target.closest('a,button,input,select,textarea,[data-magnetic],.svc__head,.chip');
      cur.classList.toggle('is-hot', !!hot);
    });
    doc.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    doc.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    ticker.add(function loop() {
      rx = lerp(rx, pointer.x, 0.14); ry = lerp(ry, pointer.y, 0.14);
      dx = lerp(dx, pointer.x, 0.5);  dy = lerp(dy, pointer.y, 0.5);
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
    });
  }

  /* ── section tracking ── */
  function initTrack(cb) {
    var secs = $$('[data-track]');
    if (!secs.length) return;
    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (en) {
        if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
      });
      if (best) {
        doc.body.setAttribute('data-section', best.target.id);
        if (cb) cb(best.target.id, best.intersectionRatio);
      }
    }, { rootMargin: '-42% 0px -42% 0px', threshold: [0, 0.2, 0.6, 1] });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ── smooth anchor (respects reduced motion) ── */
  function initAnchors() {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var t = doc.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var nav = ($('#nav') || {}).offsetHeight || 64;
      var y = t.getBoundingClientRect().top + (win.pageYOffset || 0) - (id === '#top' ? 0 : nav + 12);
      win.scrollTo({ top: Math.max(0, y), behavior: reduce() ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
      doc.dispatchEvent(new CustomEvent('nn:navigate'));
    });
  }

  /* ── in-view helper for canvases ── */
  function inView(el, cb, margin) {
    if (!('IntersectionObserver' in win)) { cb(true); return; }
    var io = new IntersectionObserver(function (es) { cb(es[0].isIntersecting); },
      { rootMargin: margin || '120px' });
    io.observe(el);
    return io;
  }

  win.NN = {
    $: $, $$: $$, clamp: clamp, lerp: lerp, ticker: ticker, reduce: reduce, fine: fine,
    scramble: scramble, count: count, pointer: pointer, scroll: function () { return scrollY; },
    vh: function () { return vh; }, inView: inView,
    boot: function (fn) { doc.readyState !== 'loading' ? fn() : doc.addEventListener('DOMContentLoaded', fn); },
    init: { reveal: initReveal, magnetic: initMagnetic, tilt: initTilt, parallax: initParallax,
            cursor: initCursor, track: initTrack, anchors: initAnchors, scrollCache: initScrollCache,
            pointer: initPointer }
  };

  /* boot the shared layer immediately */
  (function shared() {
    initScrollCache(); initPointer();
    win.NN.boot(function () {
      initReveal(); initAnchors(); initMagnetic(); initTilt(); initParallax(); initCursor();
    });
  })();
})(window, document);