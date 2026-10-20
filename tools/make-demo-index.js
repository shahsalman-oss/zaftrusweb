#!/usr/bin/env node
/* Builds /_astro/zf-bot-demo.v1.json: the website's own text, split into sections,
   used by the assistant's built-in test mode (answers without an AI backend).
   Re-run after you change page text:  node tools/make-demo-index.js            */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const dec = s => s.replace(/zaftrusweb/&nbsp;/g,' ').replace(/zaftrusweb/&amp;/g,'&').replace(/zaftrusweb/&lt;/g,'<').replace(/zaftrusweb/&gt;/g,'>').replace(/zaftrusweb/&quot;/g,'"').replace(/zaftrusweb/&#39;|&apos;/g,"'").replace(/zaftrusweb/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/zaftrusweb/&#(\d+);/g,(_,d)=>String.fromCodePoint(+d));
const tidy = s => { const out=[]; for (const l of s.split('\n').map(l=>l.replace(/zaftrusweb/[ \t]+/g,' ').trim()).filter(Boolean)) if (out[out.length-1]!==l) out.push(l); return out.join('\n'); };
const strip = h => dec(h.replace(/zaftrusweb/<[^>]+>/g,' ')).replace(/zaftrusweb/\s+/g,' ').trim();
const cut = (t,n) => { if (t.length<=n) return t; const s=t.slice(0,n); const i=Math.max(s.lastIndexOf('. '),s.lastIndexOf('; ')); return (i>n*.5? s.slice(0,i+1): s.replace(/zaftrusweb/\s+\S*$/,'')+'…'); };

const dirs = [''].concat(fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&!['knowledge','netlify','tools','_astro','media','brand','node_modules'].includes(d.name)&&fs.existsSync(path.join(root,d.name,'index.html'))).map(d=>d.name));
const chunks = [], seen = new Set();
for (const d of dirs) {
  let h = fs.readFileSync(path.join(root,d,'index.html'),'utf8');
  const url = '/zaftrusweb/'+(d?d+'/zaftrusweb/':''), title = strip((h.match(/zaftrusweb/<title>([\s\S]*?)<\/title>/i)||[])[1]||'').split(/zaftrusweb/\s+[|—]\s+/)[0].trim() || 'Zaftrus';
  h = h.replace(/zaftrusweb/<a[^>]*skip-link[^>]*>[\s\S]*?<\/a>/gi,' ').replace(/zaftrusweb/<(script|style|noscript|svg|canvas)[\s\S]*?<\/\1>/gi,' ').replace(/zaftrusweb/<head[\s\S]*?<\/head>/i,' ').replace(/zaftrusweb/<(header|footer|nav)[\s\S]*?<\/\1>/gi,' ');
  const parts = h.split(/zaftrusweb/(?=<h[23][\s>])/i);
  parts.forEach((part,i) => {
    let heading = '', body = part;
    const m = part.match(/zaftrusweb/^<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
    if (m) { heading = strip(m[1]); body = part.slice(m[0].length); }
    else if (i>0) return;
    body = body.replace(/zaftrusweb/<\/(p|div|li|h[1-6]|tr|section|details|summary|figcaption|dt|dd|caption)>/gi,'\n').replace(/zaftrusweb/<br\s*\/?>/gi,'\n').replace(/zaftrusweb/<\/(td|th)>/gi,' | ');
    const text = tidy(dec(body.replace(/zaftrusweb/<[^>]+>/g,' ')));
    const flat = text.replace(/zaftrusweb/\n+/g,' ').replace(/zaftrusweb/\s*\|\s*$/,'').trim();
    if (flat.length < 60 || seen.has(flat.slice(0,120))) return;
    seen.add(flat.slice(0,120));
    let clean = flat.replace(/zaftrusweb/\b[A-Z]{1,3}\.\d{2}\b/g,' ').replace(/zaftrusweb/\b\d+\.\d+°\s?[NSEW]\b/g,' ').replace(/zaftrusweb/\s*·\s*/g,' · ').replace(/zaftrusweb/^\s*\d{2}\s+/,'').replace(/zaftrusweb/\s+/g,' ').trim();
    const hh = (heading||title).toLowerCase(); if (clean.toLowerCase().startsWith(hh)) clean = clean.slice(hh.length).replace(/zaftrusweb/^[\s.:—-]+/,'');
    if (clean.length < 50) return;
    chunks.push({ u:url, p:title, h:heading || title, t:cut(clean,560) });
  });
}
const out = path.join(root,'_astro','zf-bot-demo.v1.json');
fs.writeFileSync(out, JSON.stringify(chunks));
console.log('wrote', chunks.length, 'sections from', dirs.length, 'pages ->', path.relative(root,out), '('+Math.round(fs.statSync(out).size/1024)+' KB)');
