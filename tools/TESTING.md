# Testing the "Queries" assistant

## 1. Just open the site (no setup)
Upload or open the site as usual. The assistant works in **test mode**: it answers from the
website's own text, politely declines pricing and anything it can't find, and shows a small note
("Showing answers taken from the website text"). No key, no server, nothing to configure.

If you change page text, refresh its index:  `node tools/make-demo-index.js`

## 2. Try real Claude answers on your own computer
Needs Node.js 18+ (nodejs.org). In a terminal, from the site folder:

Mac / Linux:
    ANTHROPIC_API_KEY=sk-ant-... node tools/run-local.js

Windows PowerShell:
    $env:ANTHROPIC_API_KEY="sk-ant-..."; node tools/run-local.js

Open http://localhost:8200. Drop PDFs/Word files into `knowledge/` and restart the command to
let it read them. The key lives only in that terminal session; it is not saved anywhere.

## 3. When you're ready to go live
The key must sit on a server, never inside the site files. Pick your host's option:
Netlify / Vercel / Cloudflare (function + secret) or PHP shared hosting (server-side file).
The front end only needs one line changed: `window.ZFQ_ENDPOINT = "https://your-backend-address"`.
