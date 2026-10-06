/* ═════════════════════════════════════════════════════════
   NONONICK / orb.js — the NonoNick Orb
   Canvas 2D renderer with real 3D point projection:
   fibonacci sphere field + great-circle wire rings +
   rim/specular light + orbiting satellites + soft reflection.
   No WebGL required (graceful static fallback if 2D context
   is unavailable). Pointer-, scroll- and section-reactive.
   ═════════════════════════════════════════════════════════ */
(function (win, doc) {
  'use strict';
  var NN = win.NN; if (!NN) return;
  var $ = NN.$, clamp = NN.clamp, lerp = NN.lerp;

  var PAL = [[63, 224, 255], [60, 107, 255], [139, 92, 246], [234, 238, 247]];

  function Orb(canvas, opts) {
    var o = (opts = opts || {});
    this.cv = canvas;
    this.ctx = canvas.getContext ? canvas.getContext('2d') : null;
    this.points = o.points || 300;
    this.rings  = o.rings || 5;
    this.dprCap = o.dprCap || 1.6;
    this.energy = 0;
    this.visible = true;
    this.scroll = 0;
    this.tint = 0;           /* 0 cyan · 1 violet — driven by active section */
    this.rx = 0; this.ry = 0; this.trx = 0; this.tryy = 0;
    this.t = Math.random() * 1000;
    this.pulses = [];
    this.ok = !!this.ctx;
    this.build();
    this.resize();
    var self = this;
    NN.inView(canvas, function (v) { self.visible = v; });
    win.addEventListener('resize', function () { self.resize(); }, { passive: true });
    if (!this.ok) { canvas.style.opacity = '.35'; canvas.insertAdjacentHTML('afterend',
      '<div class="orb-fallback"></div>'); }
  }

  Orb.prototype.build = function () {
    /* fibonacci-sphere distribution → even, non-clustering depth field */
    var n = this.points, pts = [], g = Math.PI * (3 - Math.sqrt(5)), i, y, r, th;
    for (i = 0; i < n; i++) {
      y = 1 - (i / (n - 1)) * 2;
      r = Math.sqrt(Math.max(0, 1 - y * y));
      th = g * i;
      pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r,
                 c: PAL[i % PAL.length], s: 0.55 + Math.random() * 0.9, ph: Math.random() * 6.283 });
    }
    this.pts = pts;
    /* great circles: each defined by a tilt + spin, sampled in 3D */
    var rings = [], m;
    for (m = 0; m < this.rings; m++) {
      rings.push({ tilt: (m / this.rings) * Math.PI, spin: Math.random() * 6.283,
                   speed: (0.05 + Math.random() * 0.12) * (m % 2 ? -1 : 1),
                   alpha: 0.1 + (m % 3) * 0.07, c: PAL[m % 3] });
    }
    this.ringDefs = rings;
    this.sats = [
      { r: 1.28, tilt: 0.4, sp: 0.5, c: PAL[0] },
      { r: 1.45, tilt: -0.9, sp: -0.34, c: PAL[2] },
      { r: 1.12, tilt: 1.2, sp: 0.24, c: PAL[3] }
    ];
  };

  Orb.prototype.resize = function () {
    if (!this.ok) return;
    var rect = this.cv.getBoundingClientRect();
    var dpr = clamp(win.devicePixelRatio || 1, 1, this.dprCap);
    this.w = Math.max(120, rect.width); this.h = Math.max(120, rect.height || rect.width);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.R = Math.min(this.w, this.h) * 0.30;
    this.cx = this.w / 2; this.cy = this.h / 2;
  };

  Orb.prototype.rotate = function (p, rx, ry) {
    var cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
    var x = p.x * cosY - p.z * sinY, z = p.x * sinY + p.z * cosY;
    var y = p.y * cosX - z * sinX; z = p.y * sinX + z * cosX;
    return { x: x, y: y, z: z };
  };

  Orb.prototype.project = function (v, R) {
    var persp = 2.7, s = persp / (persp - v.z);
    return { sx: this.cx + v.x * R * s, sy: this.cy + v.y * R * s, s: s, z: v.z };
  };

  Orb.prototype.pulse = function () { this.pulses.push({ r: 0, a: 0.5 }); this.energy = 1; };

  Orb.prototype.frame = function (dt) {
    if (!this.ok || !this.visible) return;
    var c = this.ctx, t = (this.t += dt * 0.001);
    var ease = NN.reduce() ? 1 : 0.075;
    this.tryy = NN.pointer.nx * 0.55; this.trx = NN.pointer.ny * 0.42 - this.scroll * 0.5;
    this.ry = lerp(this.ry, this.tryy, ease);
    this.rx = lerp(this.rx, this.trx, ease);
    var ry = this.ry + t * 0.09, rx = this.rx + Math.sin(t * 0.22) * 0.1;
    var R = this.R * (1 + Math.sin(t * 0.5) * 0.012 + this.energy * 0.03);
    var bob = Math.sin(t * 0.62) * R * 0.045 - this.scroll * R * 0.28;

    c.clearRect(0, 0, this.w, this.h);
    c.save(); c.translate(0, bob);

    var tint = this.tint, cr = lerp(63, 139, tint), cg = lerp(224, 92, tint), cb = lerp(255, 246, tint);

    /* 1 · ambient halo */
    var g = c.createRadialGradient(this.cx, this.cy, R * 0.2, this.cx, this.cy, R * 2.4);
    g.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',.16)');
    g.addColorStop(.35, 'rgba(60,107,255,.08)');
    g.addColorStop(1, 'rgba(4,5,10,0)');
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = g; c.beginPath(); c.arc(this.cx, this.cy, R * 2.4, 0, 6.2832); c.fill();

    /* 2 · glass body */
    c.globalCompositeOperation = 'source-over';
    var body = c.createRadialGradient(this.cx - R * .34, this.cy - R * .4, R * .05, this.cx, this.cy, R);
    body.addColorStop(0, 'rgba(226,244,255,.30)');
    body.addColorStop(.28, 'rgba(70,120,190,.16)');
    body.addColorStop(.66, 'rgba(16,22,40,.42)');
    body.addColorStop(1, 'rgba(4,6,14,.72)');
    c.fillStyle = body; c.beginPath(); c.arc(this.cx, this.cy, R, 0, 6.2832); c.fill();

    c.globalCompositeOperation = 'lighter';

    /* 3 · wire great circles */
    var i, j, ring, v, pr, a;
    for (i = 0; i < this.ringDefs.length; i++) {
      ring = this.ringDefs[i];
      c.beginPath();
      for (j = 0; j <= 72; j++) {
        var ang = (j / 72) * 6.2832;
        v = { x: Math.cos(ang), y: 0, z: Math.sin(ang) };
        var ty = v.y * Math.cos(ring.tilt) - v.z * Math.sin(ring.tilt);
        var tz = v.y * Math.sin(ring.tilt) + v.z * Math.cos(ring.tilt);
        v.y = ty; v.z = tz;
        v = this.rotate(v, rx, ry + ring.spin + t * ring.speed);
        pr = this.project(v, R);
        j === 0 ? c.moveTo(pr.sx, pr.sy) : c.lineTo(pr.sx, pr.sy);
      }
      c.strokeStyle = 'rgba(' + ring.c[0] + ',' + ring.c[1] + ',' + ring.c[2] + ',' + (ring.alpha + this.energy * .12) + ')';
      c.lineWidth = 1; c.stroke();
    }

    /* 4 · point field */
    for (i = 0; i < this.pts.length; i++) {
      var p = this.pts[i];
      v = this.rotate(p, rx, ry);
      pr = this.project(v, R);
      a = clamp((v.z + 1) / 2, 0, 1);
      a = 0.1 + a * a * 0.85;
      var tw = 0.72 + Math.sin(t * 1.6 + p.ph) * 0.28;
      var sz = p.s * (0.5 + pr.s * 0.55) * tw;
      c.fillStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + (a * 0.85).toFixed(3) + ')';
      c.beginPath(); c.arc(pr.sx, pr.sy, sz, 0, 6.2832); c.fill();
      if (i % 7 === 0) {
        c.fillStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + (a * 0.1).toFixed(3) + ')';
        c.beginPath(); c.arc(pr.sx, pr.sy, sz * 5, 0, 6.2832); c.fill();
      }
    }

    /* 5 · satellites with trails */
    for (i = 0; i < this.sats.length; i++) {
      var s = this.sats[i];
      for (j = 8; j >= 0; j--) {
        var ang2 = t * s.sp - j * 0.055;
        v = { x: Math.cos(ang2) * s.r, y: 0, z: Math.sin(ang2) * s.r };
        var ty2 = v.y * Math.cos(s.tilt) - v.z * Math.sin(s.tilt);
        var tz2 = v.y * Math.sin(s.tilt) + v.z * Math.cos(s.tilt);
        v.y = ty2; v.z = tz2;
        v = this.rotate(v, rx, ry);
        pr = this.project(v, R);
        c.fillStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + ((1 - j / 9) * 0.5 * (v.z + 1.4)).toFixed(3) + ')';
        c.beginPath(); c.arc(pr.sx, pr.sy, (1 - j / 9) * 2.6 + .4, 0, 6.2832); c.fill();
      }
    }

    /* 6 · rim light + specular */
    c.globalCompositeOperation = 'lighter';
    var rim = c.createLinearGradient(this.cx - R, this.cy - R, this.cx + R, this.cy + R);
    rim.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',.85)');
    rim.addColorStop(.5, 'rgba(60,107,255,.06)');
    rim.addColorStop(1, 'rgba(139,92,246,.6)');
    c.strokeStyle = rim; c.lineWidth = 1.4;
    c.beginPath(); c.arc(this.cx, this.cy, R, 0, 6.2832); c.stroke();
    c.lineWidth = 3.2; c.strokeStyle = 'rgba(255,255,255,.5)';
    c.beginPath(); c.arc(this.cx, this.cy, R * 0.985, -2.5, -1.5); c.stroke();

    /* 7 · click pulses */
    for (i = this.pulses.length - 1; i >= 0; i--) {
      var pu = this.pulses[i];
      pu.r += dt * 0.00042 * R * 2.6; pu.a -= dt * 0.0007;
      if (pu.a <= 0) { this.pulses.splice(i, 1); continue; }
      c.strokeStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + pu.a.toFixed(3) + ')';
      c.lineWidth = 1; c.beginPath(); c.arc(this.cx, this.cy, R + pu.r, 0, 6.2832); c.stroke();
    }
    this.energy = Math.max(0, this.energy - dt * 0.0016);

    c.restore();

    /* 8 · floor reflection */
    c.globalCompositeOperation = 'lighter';
    var rf = c.createRadialGradient(this.cx, this.cy + R * 1.62 + bob * .2, 2, this.cx, this.cy + R * 1.62, R * 1.25);
    rf.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',.13)');
    rf.addColorStop(1, 'rgba(4,5,10,0)');
    c.save(); c.translate(0, 0); c.scale(1, .22);
    c.fillStyle = rf; c.beginPath(); c.arc(this.cx, (this.cy + R * 1.62) / .22, R * 1.25, 0, 6.2832); c.fill();
    c.restore();
  };

  /* ── boot ── */
  NN.boot(function () {
    var cv = doc.getElementById('heroOrb');
    if (!cv) return;
    var orb = new Orb(cv, { points: win.innerWidth < 760 ? 190 : 300, rings: 5 });
    if (NN.reduce()) { orb.frame(16); orb.visible = false; }
    else {
      NN.ticker.add(function (dt) { orb.frame(dt); });
      /* scroll reaction: normalized progress through the hero */
      win.__onScroll = function (y) {
        var h = win.innerHeight || 1;
        orb.scroll = clamp(y / (h * 1.25), 0, 1);
        var wrap = doc.getElementById('heroOrbWrap');
        if (wrap) wrap.style.transform = 'translate(-50%,-50%) scale(' + (1 - orb.scroll * .12).toFixed(3) + ')';
      };
      /* tap the orb → energy pulse */
      doc.addEventListener('pointerdown', function (e) {
        var r = cv.getBoundingClientRect();
        if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) orb.pulse();
      });
    }
    /* section reactivity: orb tints violet inside system/why, cools elsewhere */
    NN.init.track(function (id) {
      var map = { system: 1, why: .8, work: .35, services: 0, contact: .95, engine: .2, performance: .2, process: .5, about: .6, intro: 0, top: 0 };
      orb.tint = map[id] != null ? map[id] : 0;
    });
    NN.orb = orb;
  });
})(window, document);