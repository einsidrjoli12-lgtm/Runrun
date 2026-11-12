// Sped-up gameplay recording that looks like a phone screen capture: full UI, a bot playing, touch dots.
// The game clock is virtual: each captured frame advances the game by SPEED x 1/30 s.
// Usage: node rec.js <outDir> [segment ...]
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2], ONLY = process.argv.slice(3);
const DIR = __dirname;
const SRC = fs.readFileSync('/home/user/Runrun/index.html', 'utf8');
const HOOK = `(() => { for (const k of Object.keys(SND)) { const f = SND[k]; if (typeof f !== 'function' || ['init', 'apply', 'pause', 'resume', 'resetMusic'].includes(k)) continue;
  SND[k] = (...a) => { (window.__sfx ||= []).push([performance.now(), k, a]); return f(...a); }; } })();\n`;
if (!SRC.includes('\nfunction syncToggles() {')) throw new Error('cannot find syncToggles');
fs.writeFileSync(`${DIR}/game-logged.html`, SRC.replace('\nfunction syncToggles() {', '\n' + HOOK + 'function syncToggles() {'));
const GAME = `file://${DIR}/game-logged.html`;
const FPS = 30, VP = { width: 405, height: 720 }, DSF = 1080 / 405;
fs.mkdirSync(OUT, { recursive: true });

const V12 = { retroPearls: 1, version: '1.2', seenVer: '1.2', seenHelp: true };
const save = (loc, extra = {}) => Object.assign({
  cash: [0, 61000, 3.2e6, 8.4e9, 6.1e13, 4.4e16][loc], loc, unlocked: [0, 1, 2, 3, 4, 5].map(i => i <= loc),
  up: { holder: 1, rod: [3, 12, 22, 34, 44, 58][loc], line: 3 + loc * 2, bait: 2 + loc * 2, net: Math.min(12, loc * 2), market: loc * 6 },
  crew: { hands: loc * 4, speed: loc, skill: loc }, sp: loc >= 1 ? { chum: 1, sonar: 1, golden: 1, frenzy: 1, lucky: 1, treasure: 1, scales: 1 } : {},
  catches: 500 * loc, perfects: 300 * loc, autoCast: false, nextStorm: Date.now() + 9e8, sinceMonster: 0,
  log: Object.fromEntries([...Array(extra.logN ?? 6 * loc + 3)].map((_, k) => [`${Math.floor(k / 6)}:${k % 6}`, { n: 3, best: 2 }])),
  lastSave: Date.now(), pearls: 40 + loc * 150, set: { master: 80, musicVol: 60, sfxVol: 100, shake: true, flash: true, numbers: true },
}, V12, extra);

function boot() {
  // virtual clock
  let v = 0; const base = Date.now(); const start = performance.now();
  performance.now = () => start + v; Date.now = () => base + v;
  let q = [];
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  // touch dots, like "show touches" in a screen recording; they fade on the virtual clock
  const dots = [];
  addEventListener('pointerdown', e => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;z-index:9999;left:${e.clientX - 17}px;top:${e.clientY - 17}px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.45);border:2px solid rgba(255,255,255,.75);pointer-events:none;box-shadow:0 0 10px rgba(0,0,0,.25)`;
    document.body.appendChild(d); dots.push([d, performance.now()]);
  }, true);
  window.__step = ms => {
    v += ms; const cbs = q; q = []; cbs.forEach(cb => cb(start + v));
    for (let i = dots.length - 1; i >= 0; i--) { const [d, t0] = dots[i], a = (performance.now() - t0) / 1000; if (a > .35) { d.remove(); dots.splice(i, 1); } else { d.style.opacity = 1 - a / .35; d.style.transform = `scale(${1 + a * 1.2})`; } }
  };
}

const segs = [];
async function seg(browser, name, data, run) {
  if (ONLY.length && !ONLY.includes(name)) return;
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: DSF, hasTouch: false });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log(name, 'PAGEERROR', e.message));
  await p.addInitScript(boot);
  if (data) await p.addInitScript(s => localStorage.setItem('bobber-brine-save-v2', JSON.stringify(s)), data);
  await p.goto(GAME); await p.waitForTimeout(700);
  if (name !== 's1') await p.evaluate(() => { document.getElementById('startBtn')?.click(); for (let i = 0; i < 300; i++) window.__step(1000 / 30); document.getElementById('toasts').innerHTML = ''; window.__sfx = []; });
  const dir = `${OUT}/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  let n = 0, speed = 1; const speedLog = [];
  const vStart = await p.evaluate(() => performance.now());
  let gameT = 0; // game seconds elapsed, to map sounds to video time
  const map = []; // per frame: game time at that frame
  const frame = async () => {
    await p.evaluate(([ms, k]) => { for (let i = 0; i < k; i++) window.__step(ms); }, [1000 / FPS, speed]);
    gameT += speed / FPS; map.push(gameT);
    await p.screenshot({ path: `${dir}/${String(n++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 90 });
  };
  const frames = async k => { for (let i = 0; i < k; i++) await frame(); };
  const act = () => p.textContent('#action');
  const tap = async () => { const b = await p.$('#action'); const bb = await b.boundingBox(); await p.mouse.click(bb.x + bb.width * (.35 + Math.random() * .3), bb.y + bb.height * (.3 + Math.random() * .4)); };
  const buy = async () => { // tap one affordable upgrade in the open tab (cheapest-looking first)
    const h = await p.$('.panel button[data-cost]:not([data-pcost]):not([disabled])'); if (!h) return false;
    await h.scrollIntoViewIfNeeded(); const bb = await h.boundingBox(); if (!bb || bb.y > VP.height - 20) return false;
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); return true;
  };
  const tab = async t => { const h = await p.$(`#tabs [data-tab="${t}"]`); const bb = await h.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  // play: fish for k frames, buying now and then
  const play = async (k, { buyEvery = 0, perfect = .8 } = {}) => {
    let reelAt = -1;
    for (let i = 0; i < k; i++) {
      const a = await act();
      if (/Cast line/.test(a) && Math.random() < .5) await tap();
      else if (/REEL/.test(a)) { if (reelAt < 0) reelAt = i + (Math.random() < perfect ? 0 : 1); if (i >= reelAt) { await tap(); reelAt = -1; } }
      else if (/TAP/.test(a)) { if (i % Math.max(1, Math.round(4 / speed)) === 0) await tap(); }
      if (buyEvery && i % buyEvery === buyEvery - 1) await buy();
      await frame();
    }
  };
  await run({ p, frame, frames, play, tap, buy, tab, act, setSpeed: s => { speed = s; speedLog.push([n, s]); } });
  const sfx = (await p.evaluate(() => window.__sfx || [])).map(([t, k, a]) => ({ g: (t - vStart) / 1000, k, a }));
  // game time -> video time
  const vid = g => { let i = map.findIndex(x => x >= g - 1e-6); return i < 0 ? null : i / FPS; };
  const ev = sfx.map(e => ({ t: vid(e.g), k: e.k, a: e.a })).filter(e => e.t !== null);
  fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify({ frames: n, seconds: n / FPS, sfx: ev, speeds: speedLog }, null, 1));
  console.log(name, n, 'frames', ev.length, 'sounds');
  await ctx.close();
}

(async () => {
  const b = await chromium.launch();
  // 1) brand new game: title screen, first casts, first upgrades
  await seg(b, 's1', Object.assign({}, V12), async ({ p, frames, play, setSpeed, tap }) => {
    setSpeed(1); await frames(20);
    const s = await p.$('#startBtn'); const bb = await s.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await frames(12); setSpeed(4); await play(230, { buyEvery: 18 });
  });
  // 2) Willow River: crew hiring and rod upgrades
  await seg(b, 's2', save(1, { cash: 4.5e5 }), async ({ play, setSpeed, tab, frames }) => {
    setSpeed(5); await play(70, { buyEvery: 10 }); await tab('crew'); await frames(3); await play(50, { buyEvery: 8 }); await tab('tackle'); await play(70, { buyEvery: 12 });
  });
  // 3) Glacier Lake in a storm
  await seg(b, 's3', save(2, { cash: 2.2e7, nextStorm: Date.now() + 1500 }), async ({ play, setSpeed }) => {
    setSpeed(4); await play(200, { buyEvery: 14 });
  });
  // 4) a legendary monster on the open ocean, at normal speed
  await seg(b, 's4', save(4, { logN: 30 }), async ({ p, play, setSpeed, frames, tap, act }) => {
    setSpeed(3); await play(30);
    await p.evaluate(() => { window.__bbForceMonster = true; });
    for (let i = 0; i < 200 && !/TAP/.test(await act()); i++) { if (/Cast line/.test(await act())) await tap(); await frames(1); }
    await p.evaluate(() => { window.__bbForceMonster = false; });
    setSpeed(1);
    for (let i = 0; i < 400 && /TAP/.test(await act()); i++) { if (i % 4 === 0) await tap(); await frames(1); }
    await frames(70);
  });
  // 5) Midnight Trench: huge numbers, buying in bulk, skins on
  await seg(b, 's5', save(5, { logN: 36, cash: 9e16, buyMax: true, owned: { crown: 1, otter: 1, lava: 1, golden: 1, fireflies: 1, royal: 1 }, equip: { hat: 'crown', pet: 'otter', rod: 'lava', bobber: 'golden', lantern: 'fireflies', boat: 'royal' } }), async ({ play, setSpeed }) => {
    setSpeed(5); await play(200, { buyEvery: 9 });
  });
  await b.close();
})();
