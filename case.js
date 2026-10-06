/* ═════════════════════════════════════════════════════════
   NONONICK / case.js — cinematic case-study renderer
   Reads ?id=…, composes the file from js/data.js
   ═════════════════════════════════════════════════════════ */
(function (win, doc) {
  'use strict';
  var NN = win.NN, DATA = (win.NN_DATA || {}).projects || [];
  if (!NN || !DATA.length) return;
  var $ = NN.$, esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };

  var COVERS = {
    ai: '<div class="vis vis--ai"><div class="vis__mesh"></div>' +
        '<svg class="vis__svg" viewBox="0 0 480 480" fill="none"><circle cx="240" cy="240" r="188" stroke="rgba(148,178,222,.14)"/>' +
        '<circle cx="240" cy="240" r="150" stroke="rgba(63,224,255,.32)"/><circle cx="240" cy="240" r="108" stroke="rgba(139,92,246,.3)" stroke-dasharray="3 9"/>' +
        '<g class="spin"><ellipse cx="240" cy="240" rx="188" ry="62" stroke="rgba(63,224,255,.26)"/><circle cx="428" cy="240" r="4.5" fill="#3FE0FF"/></g>' +
        '<path class="draw" d="M74 316 L142 262 L196 296 L262 190 L318 232 L404 148" stroke="rgba(234,238,247,.55)" stroke-width="1.4"/></svg>' +
        '<div class="vis__nodes"><i></i><i></i><i></i><i></i><i></i></div><span class="vis__scan"></span></div>',
    biz: '<div class="vis vis--biz"><div class="vis__mesh"></div><div class="vis__dash">' +
        '<span class="d-card d-card--nav"><i></i><i></i><i></i></span>' +
        '<span class="d-card d-card--wide"><i class="d-line" style="--w:72%"></i><i class="d-line" style="--w:46%"></i><b class="d-kpi">+184%</b></span>' +
        '<span class="d-card"><i class="d-ring"></i></span><span class="d-card d-card--bars">' +
        '<i style="--h:42%"></i><i style="--h:68%"></i><i style="--h:30%"></i><i style="--h:86%"></i><i style="--h:54%"></i></span>' +
        '<span class="d-card d-card--rows"><i></i><i></i><i></i><i></i></span></div><span class="vis__scan"></span></div>',
    lux: '<div class="vis vis--lux"><div class="vis__metal"></div><div class="vis__plate">' +
        '<span class="vis__plate-frame"></span><span class="vis__plate-glyph">N</span><span class="vis__plate-rule"></span>' +
        '<span class="vis__plate-txt mono">PRIVATE VIEWING · COLLECTION 07</span></div><span class="vis__orbit"></span><span class="vis__scan"></span></div>',
    perf: '<div class="vis vis--perf"><div class="vis__mesh vis__mesh--tight"></div>' +
        '<svg class="vis__svg" viewBox="0 0 480 480" fill="none"><path class="draw" d="M40 380 C120 380 130 190 200 190 S280 300 340 210 S420 90 452 96" stroke="rgba(57,230,168,.55)" stroke-width="1.6"/>' +
        '<path class="draw draw--2" d="M40 420 C140 420 160 300 240 296 S330 350 400 268 S444 210 452 206" stroke="rgba(63,224,255,.4)" stroke-width="1.2"/>' +
        '<g class="gauge"><circle cx="240" cy="240" r="132" stroke="rgba(148,178,222,.12)"/>' +
        '<circle cx="240" cy="240" r="132" stroke="rgba(57,230,168,.7)" stroke-dasharray="829" stroke-dashoffset="120" transform="rotate(-90 240 240)"/></g>' +
        '<text x="240" y="248" text-anchor="middle" class="vis__svgnum">99.99</text></svg><span class="vis__scan"></span></div>'
  };
  var COVER_KEY = { 'nononick-ai': 'ai', 'digital-business': 'biz', 'luxury-studio': 'lux', 'performance-engine': 'perf' };

  function notFound() {
    return '<div class="case__404"><p class="eyebrow">FILE NOT FOUND</p>' +
      '<h1 class="t-xl">SELECT A CASE FILE.</h1><ul>' + DATA.map(function (p) {
        return '<li><a href="?id=' + p.id + '">' + esc(p.num) + ' · ' + esc(p.title) + '</a></li>';
      }).join('') + '</ul><p class="lead" style="margin-top:2rem"><a href="index.html" style="color:var(--cyan)">← RETURN TO STUDIO</a></p></div>';
  }

  function render(p) {
    var next = DATA[(DATA.indexOf(p) + 1) % DATA.length];
    var html = '' +
    '<section class="case__hero">' +
      '<span class="case__num" aria-hidden="true">' + esc(p.num) + '</span>' +
      '<div class="wrap">' +
        '<div class="case__cat">' + p.cat.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') +
          '<span class="mono" style="border:0;padding:0;color:var(--ink-3)">' + esc(p.year) + '</span></div>' +
        '<h1 class="case__title" data-scramble>' + esc(p.title) + '</h1>' +
        '<p class="lead lead--lg">' + esc(p.summary) + '</p>' +
        '<dl class="case__meta">' +
          '<div><dt>CLIENT</dt><dd>' + esc(p.client) + '</dd></div>' +
          '<div><dt>ROLE</dt><dd>' + esc(p.role) + '</dd></div>' +
          '<div><dt>DURATION</dt><dd>' + esc(p.duration) + '</dd></div>' +
          '<div><dt>YEAR</dt><dd>' + esc(p.year) + '</dd></div>' +
          '<div><dt>STATUS</dt><dd><span class="live"><i></i>' + (p.continues.indexOf('Continuous') === 0 ? 'LIVE · MANAGED' : 'DELIVERED · MANAGED') + '</span></dd></div>' +
        '</dl>' +
      '</div>' +
    '</section>' +

    '<div class="wrap"><div style="margin-top:clamp(24px,4vw,48px)">' + (COVERS[COVER_KEY[p.id]] || COVERS.biz) + '</div></div>' +

    '<section class="case__body"><div class="wrap">' +
      '<div class="case__cols"><p class="case__label">01 / CONTEXT</p><div class="case__block">' +
        '<h3>THE SITUATION</h3><p>' + esc(p.lede) + '</p>' +
        '<ul class="case__list">' + p.challenge.map(function (c, i) {
          return '<li><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + esc(c) + '</span></li>'; }).join('') + '</ul>' +
      '</div></div>' +

      '<div class="case__cols" style="margin-top:clamp(30px,5vw,60px)"><p class="case__label">02 / ARCHITECTURE</p>' +
        '<div class="case__block">' + p.approach.map(function (a) {
          return '<h3>' + esc(a[0]) + '</h3><p>' + esc(a[1]) + '</p>'; }).join('') + '</div></div>' +

      '<div class="case__metrics">' + p.metrics.map(function (m) {
        return '<div class="metric"><b>' + esc(m.v) + '</b><i>' + esc(m.l) + '</i></div>'; }).join('') + '</div>' +

      '<div class="case__cols"><p class="case__label">03 / OUTCOME</p><div class="case__block">' +
        '<h3>WHAT CHANGED</h3><p>' + esc(p.outcome) + '</p></div></div>' +

      '<div class="case__cols"><p class="case__label">04 / COMPOSITION</p><div class="case__block">' +
        '<h3>MODULES &amp; STACK</h3>' +
        '<ul class="svc__deliv" style="margin-bottom:1.4rem">' + p.modules.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
        '<ul class="svc__deliv">' + p.stack.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '</div></div>' +

      '<div class="case__cols"><p class="case__label">05 / AFTERWARDS</p><div class="case__block">' +
        '<h3>WHAT CONTINUES</h3><p>' + esc(p.continues) + '</p>' +
        '<a class="btn btn--primary" href="index.html#contact" data-magnetic="0.24">START A PROJECT LIKE THIS<span class="btn__ico">↗</span></a>' +
      '</div></div>' +
    '</div></section>' +

    '<div class="wrap"><div class="case__next">' +
      '<div><p class="mono">NEXT CASE FILE</p><a href="?id=' + esc(next.id) + '">' + esc(next.num) + ' · ' + esc(next.title) + '</a></div>' +
      '<a class="arrowlink" href="index.html#work">ALL WORK<svg viewBox="0 0 24 12"><path d="M0 6h21M16 1l5 5-5 5"/></svg></a>' +
    '</div></div>';

    doc.getElementById('caseRoot').innerHTML = html;
    doc.title = p.title + ' — NONONICK Case Study';
    var canon = doc.querySelector('link[rel=canonical]');
    if (canon) canon.href = 'https://nononick.com/case-study.html?id=' + p.id;
    $$('[data-scramble]').forEach(function (el) { NN.scramble(el); });
    $$('.vis').forEach(function (v) { v.classList.add('in'); });
    NN.init.magnetic(); NN.init.reveal();
    win.scrollTo({ top: 0, behavior: 'auto' });
  }

  NN.boot(function () {
    var id = new URLSearchParams(win.location.search).get('id');
    var p = DATA.filter(function (x) { return x.id === id; })[0];
    if (!p) { doc.getElementById('caseRoot').innerHTML = notFound(); return; }
    render(p);
    /* delegated navigation between case files */
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="?id="]'); if (!a) return;
      e.preventDefault();
      var nid = a.getAttribute('href').replace('?id=', '');
      win.history.pushState({}, '', '?id=' + nid);
      var np = DATA.filter(function (x) { return x.id === nid; })[0];
      if (np) render(np);
    });
  });
})(window, document);