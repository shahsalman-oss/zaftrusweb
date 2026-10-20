#!/usr/bin/env node
/* Run the whole site on your own computer, including the real assistant.
   Your API key stays in your terminal session; nothing is written to any file.

   Mac / Linux :  ANTHROPIC_API_KEY=sk-ant-... node tools/run-local.js
   Windows (PowerShell) :  $env:ANTHROPIC_API_KEY="sk-ant-..."; node tools/run-local.js
   Then open  http://localhost:8200
   (Without a key the chat still works in its built-in test mode.)                    */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), PORT = +process.env.PORT || 8200;
process.env.ZAFTRUS_SITE_ROOT = ROOT;
process.env.ZAFTRUS_ADMIN_KEY = process.env.ZAFTRUS_ADMIN_KEY || 'local';
const fn = require(path.join(ROOT, 'netlify', 'functions', 'queries.js'));
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.woff2':'font/woff2', '.mp4':'video/mp4', '.webm':'video/webm', '.xml':'application/xml', '.txt':'text/plain', '.ico':'image/x-icon' };

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/.netlify/functions/queries') {
    let body = ''; req.on('data', c => body += c);
    req.on('end', async () => {
      const r = await fn.handler({ httpMethod: req.method, headers: req.headers, body, queryStringParameters: Object.fromEntries(u.searchParams) });
      res.writeHead(r.statusCode, r.headers); res.end(r.body);
    }); return;
  }
  if (/^\/(knowledge|netlify|tools)(\/|$)/.test(u.pathname)) { res.writeHead(404); res.end('Not found'); return; }
  let p = path.join(ROOT, decodeURIComponent(u.pathname));
  if (!p.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end('Not found'); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' }); res.end(d); });
}).listen(PORT, () => {
  const kb = fn._internals.loadKnowledge();
  console.log(`\n  Zaftrus site running at  http://localhost:${PORT}`);
  console.log(`  Assistant:  ${process.env.ANTHROPIC_API_KEY ? 'REAL Claude answers (key found)' : 'built-in test mode (no ANTHROPIC_API_KEY set)'}`);
  console.log(`  Reads:      ${kb.site.length} site pages, ${kb.docs.length} text documents, ${kb.pdfs.length} PDFs from /knowledge`);
  if (kb.skipped.length) console.log('  Skipped:    ' + kb.skipped.join('; '));
  console.log(`  Check what it loaded:  http://localhost:${PORT}/.netlify/functions/queries?key=local\n`);
});
