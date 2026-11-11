// node render.js <outDir> <frames...|all>
const { chromium } = require('playwright'); const fs = require('fs'); const http = require('http'); const path = require('path');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(8765);
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.goto('http://localhost:8765/scene.html'); await p.waitForFunction(() => window.READY, null, { timeout: 60000 });
  const { total, fps } = await p.evaluate(() => window.READY);
  const list = process.argv[3] === 'range' ? Array.from({ length: +process.argv[5] - +process.argv[4] }, (_, i) => +process.argv[4] + i) : process.argv[3] === 'all' ? Array.from({ length: Math.round(total * fps) }, (_, i) => i) : process.argv.slice(3).map(s => Math.round(+s * fps));
  const t0 = Date.now();
  for (const i of list) { await p.evaluate(i => draw(i), i); await p.screenshot({ path: `${OUT}/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 }); if (i % 60 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  await b.close(); srv.close(); console.log('done', list.length);
})();
