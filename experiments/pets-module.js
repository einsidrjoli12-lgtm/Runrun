// Bobber & Brine dock pets: continuous, snap-free animation.
// Every move is driven by envelopes that start and end at the resting pose, and pose changes
// (lying down, rolling onto the back, stretching) interpolate the body shape itself. No cross-fades.
// Draws at the origin with the ground at y = 0 (about 50 units tall); the caller translates and scales.
const PETS = (() => {
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const env = (k, a = .2) => k < a ? ease(k / a) : k > 1 - a ? ease((1 - k) / a) : 1;
  const win = (k, a, b, edge = .25) => k <= a || k >= b ? 0 : env((k - a) / (b - a), edge); // an envelope over part of a move
  const lerp = (a, b, u) => a + (b - a) * u;
  const lp = (p, q, u) => p.map((v, i) => lerp(v, q[i], u));
  const ACTS = {
    otter: [['groom', 2.4], ['shell', 2.6], ['float', 8], ['float', 8]],
    cat: [['groom', 2.8], ['stretch', 2.4], ['nap', 7]],
    frog: [['ribbit', 1.8], ['tongue', 1.4], ['tongue', 1.4], ['hop', 1.1]],
    gull: [['look', 2.6], ['flap', 1.6], ['squawk', 1.4]],
    nott: [['slowblink', 2.8], ['loaf', 5.5], ['groom', 3], ['pounce', 2.8], ['bigstretch', 3.8], ['nap', 7]],
  };
  const REACT = 1.4;
  function newState() { return { act: 'idle', t: 0, dur: 0, next: 3, blink: 2, react: 0, big: false, pending: -1 }; }
  // a caught fish: cheer now, or finish the current move gently first
  function react(P, rarity) {
    if (P.act === 'idle') { P.react = REACT; P.big = rarity >= 3; }
    else { P.pending = rarity; P.t = Math.max(P.t, P.dur * .8); }
  }
  function start(P, act, dur) { P.act = act; P.dur = dur; P.t = 0; P.react = 0; }
  function step(P, look, dt) {
    P.t += dt; P.blink -= dt; if (P.blink < -.14) P.blink = 2 + Math.random() * 3.5;
    if (P.react > 0) P.react = Math.max(0, P.react - dt);
    if (P.act === 'idle') {
      if (P.react <= 0 && (P.next -= dt) <= 0) { const l = ACTS[look] || [], a = l[Math.floor(Math.random() * l.length)]; if (a) start(P, a[0], a[1]); }
    } else if (P.t >= P.dur) {
      P.act = 'idle'; P.t = 0; P.next = 4 + Math.random() * 6;
      if (P.pending >= 0) { P.react = REACT; P.big = P.pending >= 3; P.pending = -1; }
    }
  }
  // eyes with an eyelid: o = 1 open, 0 closed. happy draws ^ ^. iris/slit for cats.
  function eyes(c, x1, x2, y, r, { o = 1, happy = 0, iris = null, slit = .32, glow = false, lash = '#16110e' } = {}) {
    if (happy > .5) {
      c.strokeStyle = lash; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath();
      c.arc(x1, y + 1, r, Math.PI * 1.15, Math.PI * 1.85); c.moveTo(x2 + r * .95, y - .2); c.arc(x2, y + 1, r, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); return;
    }
    if (o < .16) {
      c.strokeStyle = lash; c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath();
      c.moveTo(x1 - r, y); c.quadraticCurveTo(x1, y + r * .7, x1 + r, y); c.moveTo(x2 - r, y); c.quadraticCurveTo(x2, y + r * .7, x2 + r, y); c.stroke(); return;
    }
    const ry = r * 1.12 * o, cy = y + r * (1 - o) * .45;
    if (iris) {
      if (glow) { c.save(); c.globalCompositeOperation = 'lighter'; for (const x of [x1, x2]) { const g = c.createRadialGradient(x, cy, 0, x, cy, r * 3.2); g.addColorStop(0, 'rgba(210,240,90,.5)'); g.addColorStop(1, 'rgba(210,240,90,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, cy, r * 3.2, 0, 7); c.fill(); } c.restore(); }
      c.fillStyle = iris; c.beginPath(); c.ellipse(x1, cy, r, ry, 0, 0, 7); c.ellipse(x2, cy, r, ry, 0, 0, 7); c.fill();
      c.fillStyle = '#0b0b10'; c.beginPath(); c.ellipse(x1, cy, r * slit, ry * .85, 0, 0, 7); c.ellipse(x2, cy, r * slit, ry * .85, 0, 0, 7); c.fill();
    } else { c.fillStyle = '#16110e'; c.beginPath(); c.ellipse(x1, cy, r, ry, 0, 0, 7); c.ellipse(x2, cy, r, ry, 0, 0, 7); c.fill(); }
    if (o > .55) { c.fillStyle = '#fff'; c.beginPath(); c.arc(x1 + r * .35, cy - ry * .4, r * .3, 0, 7); c.arc(x2 + r * .35, cy - ry * .4, r * .3, 0, 7); c.fill(); }
  }
  const blush = (c, x1, x2, y, a = .45) => { c.fillStyle = `rgba(255,120,140,${a})`; c.beginPath(); c.ellipse(x1, y, 3, 1.8, 0, 0, 7); c.ellipse(x2, y, 3, 1.8, 0, 0, 7); c.fill(); };
  function heart(c, x, y, s, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = '#ff5a7a'; c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 3); c.bezierCurveTo(-6, -2, -3, -7, 0, -3.5); c.bezierCurveTo(3, -7, 6, -2, 0, 3); c.fill(); c.restore(); }
  function note(c, txt, x, y, a, size = 9) { if (a <= .01) return; c.save(); c.globalAlpha = Math.min(1, a); c.font = `${size}px "Lilita One", sans-serif`; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(5,20,28,.7)'; c.strokeText(txt, x, y); c.fillStyle = '#fff'; c.fillText(txt, x, y); c.restore(); }
  const curve = (c, p) => { c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[2], p[3], p[4], p[5]); };

  // ---------------- OTTER ----------------
  function otter(c, P, k, t, R) {
    const brown = '#7d5032', light = '#e2bd96', dark = '#4e301d';
    let u = 0; // 0 sitting on the dock, 1 floating on its back
    if (P.act === 'float') u = P.t < .8 ? ease(P.t / .8) : P.t > P.dur - .8 ? ease((P.dur - P.t) / .8) : 1;
    const g = P.act === 'groom' ? env(k, .25) : 0, sh = P.act === 'shell' ? env(k, .15) : 0;
    c.save();
    if (u > 0) {
      const x = 34 * u, y = 34 * u - Math.sin(u * Math.PI) * 22 + Math.sin(t * 2) * 1.5 * u;
      c.translate(x, y);
      const ra = Math.max(0, u - .5) * 2;
      if (ra > 0) { c.strokeStyle = `rgba(255,255,255,${ra * (.3 + .15 * Math.sin(t * 3))})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(16, 3, 26 + Math.sin(t * 2) * 3, 5, 0, 0, 7); c.stroke(); }
      c.rotate(Math.PI / 2 * u); // rolls onto its back as it slides in
    }
    c.translate(0, -R.hop); c.scale(1, R.breathe);
    const paddle = u > .7 ? Math.sin(t * 4) * 2 * u : 0;
    c.fillStyle = brown; c.beginPath(); c.ellipse(-13, -3, 9, 3.5, -.25, 0, 7); c.fill();
    c.beginPath(); c.ellipse(0, -14, 13, 15, 0, 0, 7); c.fill();
    c.fillStyle = light; c.beginPath(); c.ellipse(0, -12, 8.5, 10.5, 0, 0, 7); c.fill();
    c.fillStyle = dark; c.beginPath(); c.ellipse(-6 + paddle, -1, 4, 2.2, 0, 0, 7); c.ellipse(6 - paddle, -1, 4, 2.2, 0, 0, 7); c.fill();
    // shell rests on the tummy; paws hold it, wash the face, or clap it
    const w = Math.abs(Math.sin(P.t * 9)) * sh, cl = Math.abs(Math.sin(R.rp * Math.PI * 6)) * R.re;
    const lift = Math.max(w, cl) * 4;
    const sx = 0, sy = -16 - lift;
    c.save(); c.translate(sx, sy); c.fillStyle = '#ffb3c7'; c.beginPath(); c.moveTo(0, 3); c.arc(0, 0, 4, Math.PI * .9, Math.PI * 2.1); c.closePath(); c.fill(); c.strokeStyle = '#e07a98'; c.lineWidth = .8; c.beginPath(); c.moveTo(0, 3); c.lineTo(-2.4, -2.6); c.moveTo(0, 3); c.lineTo(0, -3.6); c.moveTo(0, 3); c.lineTo(2.4, -2.6); c.stroke(); c.restore();
    const wob = Math.sin(P.t * 16) * 2 * g, spread = (w + cl) * 2.2;
    const pl = { x: lerp(-4.5 - spread, -5 + wob, g), y: lerp(-18 - lift, -31, g) }, pr = { x: lerp(4.5 + spread, 5 - wob, g), y: lerp(-18 - lift, -31, g) };
    c.fillStyle = brown; c.beginPath(); c.ellipse(pl.x, pl.y, 3, 2.4, 0, 0, 7); c.ellipse(pr.x, pr.y, 3, 2.4, 0, 0, 7); c.fill();
    c.save(); c.translate(0, -34); c.rotate(Math.sin(t * .7) * .12 * (1 - g));
    c.fillStyle = brown; c.beginPath(); c.arc(-9, -7, 3.2, 0, 7); c.arc(9, -7, 3.2, 0, 7); c.fill();
    c.beginPath(); c.arc(0, 0, 11.5, 0, 7); c.fill();
    c.fillStyle = light; c.beginPath(); c.ellipse(0, 4, 7.5, 5.5, 0, 0, 7); c.fill();
    c.fillStyle = dark; c.beginPath(); c.ellipse(0, 1.6, 2.6, 1.8, 0, 0, 7); c.fill();
    c.strokeStyle = dark; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 3.4); c.lineTo(0, 5); c.arc(-1.6, 5, 1.6, 0, Math.PI); c.moveTo(3.2, 5); c.arc(1.6, 5, 1.6, 0, Math.PI); c.stroke();
    eyes(c, -4.8, 4.8, -2.5, 2.1, { o: R.o * (1 - .85 * u), happy: Math.max(R.re, g) });
    blush(c, -7.5, 7.5, 3);
    c.restore();
    c.restore();
    if (u > .95) note(c, '♡', 30, -2, Math.max(0, (Math.sin(t * 1.3) - .75) * 4), 12);
  }

  // ---------------- CAT ----------------
  function cat(c, P, k, t, R) {
    const fur = '#f2a03d', stripe = '#cf7414', cream = '#fff3e0';
    const n = P.act === 'nap' ? env(k, .16) : 0, st = P.act === 'stretch' ? Math.sin(k * Math.PI) : 0, g = P.act === 'groom' ? env(k, .25) : 0;
    c.save(); c.translate(0, -R.hop); c.scale(1 + st * .18, (1 - st * .16) * lerp(R.breathe, 1 + Math.sin(t * 1.4) * .03, n));
    const sw = lerp(Math.sin(t * 2.2) * 4, Math.sin(t * 9) * 6, R.re);
    // tail: sitting sweep -> wrapped around her while napping
    c.strokeStyle = fur; c.lineWidth = 5; c.lineCap = 'round';
    curve(c, lp([9, -3, 24, -4, 20 + sw, -22], [14, -4, 10, 5, -10, 2], n)); c.stroke();
    // body: upright pear -> curled ball
    c.fillStyle = fur; c.beginPath(); c.ellipse(lerp(0, 1, n), lerp(-13, -8, n), lerp(11.5, 17, n), lerp(13.5, 9.5, n), 0, 0, 7); c.fill();
    c.fillStyle = cream; c.globalAlpha = 1 - n; c.beginPath(); c.ellipse(0, -11, 6.5, 9, 0, 0, 7); c.fill(); c.globalAlpha = 1;
    if (n > 0) { c.fillStyle = stripe; c.globalAlpha = n; [-6, 0, 6].forEach(x => c.fillRect(x + 2, -16 + (1 - n) * 4, 2.2, 5)); c.globalAlpha = 1; }
    // paws tuck in as she lies down; one paw lifts to groom
    const ps = 1 - n;
    c.fillStyle = cream; c.beginPath(); c.ellipse(-4.5, -1.5, 3.5 * ps, 2.6 * ps, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(4.5 - 5.5 * g, -1.5 - (22.5 + Math.sin(P.t * 10) * 1.5) * g, 3.5 * ps, 2.6 * ps, 0, 0, 7); c.fill();
    // head moves down beside the body
    c.save(); c.translate(lerp(0, -11, n), lerp(-30, -11, n)); c.rotate(Math.sin(t * .6) * .1 * (1 - n) * (1 - g) - .25 * n); c.scale(lerp(1, .85, n), lerp(1, .85, n));
    c.fillStyle = fur; c.beginPath(); c.moveTo(-9.5, -3); c.lineTo(-8, -15); c.lineTo(-2, -8); c.moveTo(9.5, -3); c.lineTo(8, -15); c.lineTo(2, -8); c.fill();
    c.fillStyle = '#ffb3c0'; c.beginPath(); c.moveTo(-7.8, -5); c.lineTo(-7.4, -11.5); c.lineTo(-4, -7.5); c.moveTo(7.8, -5); c.lineTo(7.4, -11.5); c.lineTo(4, -7.5); c.fill();
    c.fillStyle = fur; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill();
    c.fillStyle = stripe; c.fillRect(-1, -10.5, 2, 4.5); c.fillRect(-5, -9.5, 2, 3.5); c.fillRect(3, -9.5, 2, 3.5);
    c.fillStyle = cream; c.beginPath(); c.ellipse(0, 4.5, 6.5, 4.5, 0, 0, 7); c.fill();
    c.fillStyle = '#ff8fa3'; c.beginPath(); c.moveTo(-1.6, 2.2); c.lineTo(1.6, 2.2); c.lineTo(0, 3.8); c.fill();
    if (st > .15) { c.fillStyle = '#c94a62'; c.beginPath(); c.ellipse(0, 6.4, 2.4, 2.6 * st, 0, 0, 7); c.fill(); }
    else { c.strokeStyle = '#7a3a12'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 3.8); c.lineTo(0, 5); c.arc(-1.5, 5, 1.5, 0, Math.PI); c.moveTo(3, 5); c.arc(1.5, 5, 1.5, 0, Math.PI); c.stroke(); }
    if (g > .6) { c.fillStyle = '#ff8fa3'; c.beginPath(); c.ellipse(-1, 7, 1.4, 1.8 * (g - .6) / .4, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .7; c.beginPath(); [[-5, 3.5, -13, 2], [-5, 5, -13, 6], [5, 3.5, 13, 2], [5, 5, 13, 6]].forEach(([a, b, d, e]) => { c.moveTo(a, b); c.lineTo(d, e); }); c.stroke();
    eyes(c, -4.5, 4.5, -2, 2.1, { o: R.o * (1 - n) * (1 - st * .9), happy: Math.max(R.re, g) });
    blush(c, -7.2, 7.2, 3.2);
    c.restore();
    c.restore();
    const z = (P.t * .8) % 1; note(c, 'z', 6 + z * 6, -22 - z * 14, (1 - z) * n, 9); note(c, 'Z', 12 + ((z + .5) % 1) * 6, -26 - ((z + .5) % 1) * 14, (1 - (z + .5) % 1) * n, 12);
  }

  // ---------------- FROG ----------------
  function frog(c, P, k, t, R) {
    const gr = '#5cc96a', dg = '#3f9a4c', belly = '#d4f5a8';
    const jump = P.act === 'hop' ? Math.sin(k * Math.PI) * 12 : 0, squash = P.act === 'hop' ? Math.sin(k * Math.PI) * .1 : 0;
    c.save(); c.translate(0, -R.hop - jump); c.scale(1 - squash * .5, (1 + squash) * R.breathe);
    c.fillStyle = dg; c.beginPath(); c.ellipse(-12, -4, 7, 4.5, -.3, 0, 7); c.ellipse(12, -4, 7, 4.5, .3, 0, 7); c.fill();
    c.fillStyle = gr; c.beginPath(); c.ellipse(0, -10, 14.5, 10.5, 0, 0, 7); c.fill();
    c.fillStyle = belly; c.beginPath(); c.ellipse(0, -6.5, 9, 6, 0, 0, 7); c.fill();
    c.fillStyle = dg; c.beginPath(); c.ellipse(-5.5, -.5, 3.5, 1.8, 0, 0, 7); c.ellipse(5.5, -.5, 3.5, 1.8, 0, 0, 7); c.fill();
    const puff = P.act === 'ribbit' ? Math.max(0, Math.sin(P.t * 7)) * env(k, .2) : 0;
    if (puff > .02) { c.fillStyle = '#f2ffd6'; c.beginPath(); c.arc(0, -6, 4 + puff * 5, 0, 7); c.fill(); }
    c.fillStyle = gr; c.beginPath(); c.arc(-7.5, -19, 6.5, 0, 7); c.arc(7.5, -19, 6.5, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-7.5, -19.5, 4.4, 4.4 * Math.max(.1, R.o), 0, 0, 7); c.ellipse(7.5, -19.5, 4.4, 4.4 * Math.max(.1, R.o), 0, 0, 7); c.fill();
    if (R.re > .5) eyes(c, -7.5, 7.5, -19.5, 2.4, { happy: 1 });
    else if (R.o > .2) { const ry = 2.4 * R.o; c.fillStyle = '#16110e'; c.beginPath(); c.ellipse(-7, -19.5, 2.4, ry, 0, 0, 7); c.ellipse(8, -19.5, 2.4, ry, 0, 0, 7); c.fill(); if (R.o > .6) { c.fillStyle = '#fff'; c.beginPath(); c.arc(-6.2, -20.5, .9, 0, 7); c.arc(8.8, -20.5, .9, 0, 7); c.fill(); } }
    c.strokeStyle = '#2a6a33'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -13, 6, .2, Math.PI - .2); c.stroke();
    blush(c, -9.5, 9.5, -12);
    note(c, '♪', 14, -26 - puff * 3, puff > .6 ? puff : 0, 11);
    if (P.act === 'tongue') {
      const fx = 26 + Math.sin(P.t * 23) * 3, fy = -28 + Math.sin(P.t * 18) * 2, fa = Math.min(1, P.t * 4) * (k < .55 ? 1 : 0);
      if (fa > 0) { c.globalAlpha = fa; c.fillStyle = '#333'; c.beginPath(); c.arc(fx, fy, 1.6, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(fx - 1, fy - 2, 1.6, 1, Math.sin(P.t * 60), 0, 7); c.fill(); c.globalAlpha = 1; }
      const r = win(k, .4, .7, .5); if (r > 0) { c.strokeStyle = '#ff6f8a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(1, -12); c.lineTo(1 + (26 - 1) * r, -12 + (-28 + 12) * r); c.stroke(); }
      note(c, 'gulp', 14, -32, k > .75 ? env((k - .75) / .25, .4) : 0, 8);
    }
    c.restore();
  }

  // ---------------- SEAGULL ----------------
  function gull(c, P, k, t, R) {
    const grey = '#a9b6bd', beak = '#ffc93c';
    const fl = Math.max(P.act === 'flap' ? env(k, .2) : 0, R.re), lift = P.act === 'flap' ? Math.sin(k * Math.PI) * 6 : 0;
    c.save(); c.translate(0, -R.hop - lift); c.scale(1, R.breathe);
    c.strokeStyle = '#ff9f1c'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -6); c.lineTo(-3, 0); c.moveTo(3, -6); c.lineTo(3, 0); c.stroke();
    c.fillStyle = '#ff9f1c'; c.beginPath(); c.ellipse(-3, .5, 3, 1.2, 0, 0, 7); c.ellipse(3, .5, 3, 1.2, 0, 0, 7); c.fill();
    // far wing (behind), same hinge as the near wing
    const ang = fl * (1.15 + Math.sin(t * 22) * .55);
    const wing = (a, col) => { c.save(); c.translate(-1, -18); c.rotate(a); c.fillStyle = col; c.beginPath(); c.ellipse(-7, 3, 10, 5.5, -.25, 0, 7); c.fill(); c.fillStyle = '#4a5560'; c.beginPath(); c.ellipse(-15, 5.5, 3.6, 2.2, -.3, 0, 7); c.fill(); c.restore(); };
    if (fl > .02) wing(ang * 1.1, '#8f9ca3');
    c.fillStyle = '#e8eef1'; c.beginPath(); c.moveTo(-10, -14); c.lineTo(-21, -10); c.lineTo(-11, -9); c.fill();
    c.fillStyle = '#fbfdfe'; c.beginPath(); c.ellipse(0, -14, 12.5, 10, -.1, 0, 7); c.fill();
    wing(ang, grey);
    const look = P.act === 'look' ? win(k, .15, .85, .3) : 0, turn = Math.cos(look * Math.PI);
    c.save(); c.translate(5, -27); c.scale(turn, 1); c.rotate(Math.sin(t * .9) * .12 * (1 - look));
    c.fillStyle = '#fbfdfe'; c.beginPath(); c.arc(0, 0, 8.5, 0, 7); c.fill();
    const open = P.act === 'squawk' ? Math.abs(Math.sin(P.t * 12)) * env(k, .2) : R.re * .5;
    c.fillStyle = beak; c.beginPath(); c.moveTo(6, -1.5); c.lineTo(15, -1 - open * 2); c.lineTo(7, 1); c.fill();
    c.beginPath(); c.moveTo(6, 1); c.lineTo(14, 1.5 + open * 3); c.lineTo(6, 3); c.fill();
    c.fillStyle = '#ff5a3d'; c.beginPath(); c.arc(11.5, 1.6 + open * 1.5, 1, 0, 7); c.fill();
    eyes(c, 2.5, 2.5, -2, 1.9, { o: R.o, happy: R.re });
    blush(c, 1, 1, 2.8);
    c.restore();
    c.restore();
    note(c, 'squawk!', 14, -46, P.act === 'squawk' ? win(k, .1, 1, .2) : 0, 9);
  }

  // ---------------- NÓTT ----------------
  const NB = '#17171f', NR = '#3c3c52', NP = '#ff9fb3';
  const nb = (c, f) => { c.fillStyle = NB; c.strokeStyle = NR; c.lineWidth = 1.6; c.beginPath(); f(); c.fill(); c.stroke(); };
  const limb = (c, x1, y1, x2, y2, w) => { if (w < .2) return; c.lineCap = 'round'; c.strokeStyle = NR; c.lineWidth = w + 1.8; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = NB; c.lineWidth = w; c.stroke(); };
  function nott(c, P, k, t, R, night) {
    const A = P.act;
    const loaf = A === 'loaf' ? env(k, .2) : 0, g = A === 'groom' ? env(k, .22) : 0, n = A === 'nap' ? env(k, .16) : 0;
    const s = A === 'bigstretch' ? env(k, .28) : 0, sWob = 1 + Math.sin(P.t * 7) * .02 * s;
    const crouch = A === 'pounce' ? win(k, .08, .6, .3) : 0, wig = Math.sin(P.t * 30) * 2.2 * (A === 'pounce' ? win(k, .22, .56, .3) : 0);
    const leap = A === 'pounce' ? win(k, .56, .86, .5) * 16 : 0;
    const px = A === 'pounce' ? (k < .56 ? 0 : k < .86 ? ease((k - .56) / .3) * 16 : 16 * (1 - ease((k - .86) / .14))) : 0;
    c.save(); c.translate(px, -R.hop - leap);
    c.scale(1 + loaf * .08 + crouch * .06, (1 - loaf * .18 - crouch * .15) * lerp(R.breathe, 1 + Math.sin(t * 1.4) * .03, n));
    // skeleton blended between sitting, stretching and napping
    const hip = { x: -7, y: -16 - 7 * s * sWob }, chest = { x: 6 + 3 * s, y: -15 + 7 * s * sWob };
    const stCx = (hip.x + chest.x) / 2, stCy = (hip.y + chest.y) / 2, stRx = Math.hypot(chest.x - hip.x, chest.y - hip.y) / 2 + 7, stRot = Math.atan2(chest.y - hip.y, chest.x - hip.x);
    let bx = lerp(wig, stCx, s), by = lerp(-14.5, stCy, s), brx = lerp(10, stRx, s), bry = lerp(15.5, 7.5, s), brot = lerp(0, stRot, s);
    bx = lerp(bx, 0, n); by = lerp(by, -8, n); brx = lerp(brx, 16, n); bry = lerp(bry, 8, n);
    let hx = lerp(wig, chest.x + 6, s), hy = lerp(-32, chest.y - 2 + 2 * s, s), hs = 1;
    hx = lerp(hx, -12, n); hy = lerp(hy, -12, n); hs = lerp(1, .9, n);
    // tail
    const sw = lerp(Math.sin(t * 2) * 4, Math.sin(t * 9) * 5, R.re);
    let tail = [7 + wig, -4, 26, -2, 26 + sw, -17];
    tail = lp(tail, [7, -3, 4, 3, -10, 1], loaf);
    tail = lp(tail, [hip.x - 2, hip.y - 2, hip.x - 10, hip.y - 14, hip.x - 4 + Math.sin(t * 3) * 2, hip.y - 26], s);
    tail = lp(tail, [14, -4, 10, 5, -12, 2], n);
    tail = lp(tail, [7, -8, 19, -20, 14 + sw * .4, -42], R.re);
    c.save(); c.lineCap = 'round'; c.strokeStyle = NR; c.lineWidth = 8; curve(c, tail); c.stroke(); c.strokeStyle = NB; c.lineWidth = 6; curve(c, tail); c.stroke(); c.restore();
    // back legs appear as she stretches
    limb(c, hip.x - 1, hip.y + 4, -9, -1, 5 * s); limb(c, hip.x + 2, hip.y + 4, -4, -1, 5 * s);
    nb(c, () => c.ellipse(bx, by, brx, bry, brot, 0, 7));
    c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.ellipse(bx - 3, by - 3.5, Math.max(0, 4 * (1 - s)), Math.max(0, 8 * (1 - n)), 0, 0, 7); c.fill();
    // front paws: sitting -> reaching far out (stretch) -> tucked (loaf, nap); one paw grooms
    const reach = 10 + 16 * s, tuck = Math.max(loaf, n);
    const lf = { x: lerp(-3.8 + wig, chest.x + reach - 4, s), y: lerp(-1.5, -1.2, s) }, rf = { x: lerp(3.8 + wig, chest.x + reach + 1, s), y: -1.5 };
    rf.x = lerp(rf.x, -1, g); rf.y = lerp(rf.y, -26 + Math.sin(P.t * 10) * 1.5, g);
    limb(c, chest.x - 2, chest.y + 3, lf.x, lf.y, 4.6 * s); limb(c, chest.x, chest.y + 3, rf.x, rf.y, 4.6 * s);
    const pw = 1 - tuck;
    if (pw > .02) nb(c, () => { c.ellipse(lf.x, lf.y, 3 * pw, 2.4 * pw, 0, 0, 7); c.ellipse(rf.x, rf.y, (3 + .4 * g) * pw, (2.4 + .4 * g) * pw, 0, 0, 7); });
    if (s > .9) { c.strokeStyle = '#ddd'; c.lineWidth = .7; for (const dx of [-1, 1, 3]) { c.beginPath(); c.moveTo(rf.x + 1 + dx, -2.6); c.lineTo(rf.x + 2.4 + dx, -3.8); c.stroke(); } }
    // head
    const tilt = Math.sin(t * .6) * .12 * (1 - s) * (1 - n) * (1 - g) + .15 * s - .25 * n + Math.sin(t * 8) * .08 * R.re;
    c.save(); c.translate(hx, hy); c.rotate(tilt); c.scale(hs, hs);
    nb(c, () => { c.moveTo(-10, -2); c.lineTo(-9 + 2 * s, -16 + 2 * s); c.lineTo(-2.5, -8.5); c.closePath(); c.moveTo(10, -2); c.lineTo(9 - 2 * s, -16 + 2 * s); c.lineTo(2.5, -8.5); c.closePath(); });
    c.fillStyle = NP; c.beginPath(); c.moveTo(-8.2, -4); c.lineTo(-8, -12.5); c.lineTo(-4.4, -8.2); c.moveTo(8.2, -4); c.lineTo(8, -12.5); c.lineTo(4.4, -8.2); c.fill();
    nb(c, () => c.ellipse(0, 0, 11, 10.5, 0, 0, 7));
    // eyelids: slow blink, loaf (half), nap and stretch (closed), pounce (wide)
    const sb = A === 'slowblink' ? win(k, .15, .8, .35) : 0;
    let o = R.o * (1 - .55 * loaf) * (1 - sb) * (1 - n) * (1 - s);
    const happy = Math.max(R.re, g > .5 ? 1 : 0, s > .5 ? 1 : 0);
    eyes(c, -4.6, 4.6, -1.2, 2.6, { o, happy, iris: night ? '#e4f25e' : '#cfdc4a', slit: .32 + .45 * crouch, glow: night && o > .3, lash: '#8f8fae' });
    c.fillStyle = NP; c.beginPath(); c.moveTo(-1.7, 3.4); c.lineTo(1.7, 3.4); c.lineTo(0, 5.2); c.fill();
    const yawn = A === 'bigstretch' ? win(k, .32, .72, .35) : 0;
    if (yawn > .15) { c.fillStyle = '#c94a62'; c.beginPath(); c.ellipse(0, 7.6, 2.2, 2.8 * yawn, 0, 0, 7); c.fill(); }
    else { c.strokeStyle = '#8f8fae'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 5.2); c.lineTo(0, 6.2); c.arc(-1.5, 6.2, 1.5, 0, Math.PI); c.moveTo(3, 6.2); c.arc(1.5, 6.2, 1.5, 0, Math.PI); c.stroke(); }
    if (g > .6) { c.fillStyle = '#ff7f99'; c.beginPath(); c.ellipse(-1, 8.4, 1.4, 1.8 * (g - .6) / .4, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .7; c.beginPath(); [[-6, 4.5, -15, 3], [-6, 6, -15, 7.5], [6, 4.5, 15, 3], [6, 6, 15, 7.5]].forEach(([a, b, d, e]) => { c.moveTo(a, b); c.lineTo(d, e); }); c.stroke();
    c.fillStyle = 'rgba(255,120,150,.35)'; c.beginPath(); c.ellipse(-7.2, 4.2, 2.4, 1.4, 0, 0, 7); c.ellipse(7.2, 4.2, 2.4, 1.4, 0, 0, 7); c.fill();
    // collar and tag sit just under the chin
    c.strokeStyle = '#c94a62'; c.lineWidth = 1.8; c.beginPath(); c.arc(0, 0, 9.8, Math.PI * .28, Math.PI * .72); c.stroke();
    c.fillStyle = '#f4eef2'; c.beginPath(); c.ellipse(0, 9.7, 2.4, 1.7, 0, 0, 7); c.fill();
    c.restore();
    if (sb > .3) heart(c, hx + 14, -52 - k * 10, 1, (sb - .3) / .7);
    c.restore();
    const z = (P.t * .7) % 1; note(c, 'z', 6 + z * 8, -24 - z * 16, (1 - z) * n, 11); note(c, 'Z', 13 + ((z + .5) % 1) * 8, -28 - ((z + .5) % 1) * 16, (1 - (z + .5) % 1) * n, 14);
    if (A === 'pounce') { // the fish she spots
      const fa = win(k, .05, .62, .2);
      if (fa > 0) { c.save(); c.globalAlpha = fa; c.fillStyle = '#9fd8ef'; c.translate(46 + Math.sin(t * 3) * 2, 14); c.beginPath(); c.ellipse(0, 0, 6, 2.6, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-5, 0); c.lineTo(-9, -3); c.lineTo(-9, 3); c.fill(); c.restore(); }
      const sp = win(k, .78, 1, .3); if (sp > 0) { c.save(); c.globalAlpha = sp; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(40, 14, 10 + (k - .78) * 40, 3, 0, 0, 7); c.stroke(); c.restore(); }
    }
  }

  const DRAW = { otter, cat, frog, gull, nott };
  // draw a pet: c is a 2D context already translated to the pet's feet and scaled
  function draw(c, look, P, t, night = false) {
    const k = P.act === 'idle' ? 0 : Math.min(1, P.t / Math.max(.01, P.dur));
    const rp = P.react > 0 ? 1 - P.react / REACT : 0, re = P.react > 0 ? env(rp, .15) : 0;
    const R = {
      breathe: 1 + Math.sin(t * 2.4) * .025, rp, re,
      hop: P.react > 0 ? Math.abs(Math.sin(rp * Math.PI * (P.big ? 3 : 2))) * (P.big ? 12 : 8) : 0,
      o: P.blink < 0 ? Math.abs(P.blink + .07) / .07 : 1, // eyelids close and open over a blink
    };
    (DRAW[look] || (() => {}))(c, P, k, t, R, night);
    if (P.react > 0) for (let i = 0; i < (P.big ? 4 : 2); i++) { const q = (rp * 1.2 + i * .28) % 1; heart(c, -6 + i * 6 + Math.sin(q * 6 + i) * 3, -44 - q * 34, 1.2 + (P.big ? .4 : 0), (1 - q) * env(rp, .1)); }
  }
  return { ACTS, newState, step, react, start, draw, REACT };
})();
if (typeof module !== 'undefined') module.exports = PETS;
