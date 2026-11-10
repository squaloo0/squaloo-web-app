// The SQU-427 layout check: a CDP screenshot under device emulation, plus the
// numbers the gate quoted (innerWidth vs scrollWidth, loaded faces, any element
// wider than the viewport). Chrome's --window-size can't go below ~500 px, so
// the width comes from Emulation.setDeviceMetricsOverride instead.
//
// Chrome first:  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//   --headless=new --remote-debugging-port=9333 --user-data-dir="$(mktemp -d)"
// Then:          node scripts/meridian/shoot.mjs 9333 http://localhost:3427/marshal-qr 390 out.png mobile
// CLIP_Y / CLIP_H crop the capture (defaults: the whole page, up to 16000 px).
import { writeFileSync } from "node:fs";
const [port, url, width, out, mobile] = process.argv.slice(2);
const W = Number(width);
const list = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(list.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const waiters = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else if (d.method) { for (const w of waiters) w(d); } };
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: mobile === "mobile" });
const loaded = new Promise((r) => waiters.push((d) => d.method === "Page.loadEventFired" && r()));
await send("Page.navigate", { url });
await loaded; await new Promise((r) => setTimeout(r, 2500));
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result.result.value;
const metrics = await ev(`JSON.stringify({inner: innerWidth, scrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, height: document.documentElement.scrollHeight, fonts: [...new Set([...document.querySelectorAll('h1,h2,p,.font-mono')].slice(0,40).map(e=>getComputedStyle(e).fontFamily.split(',')[0]))], fontsLoaded: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).filter((v,i,a)=>a.indexOf(v)===i), wide: [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.right>innerWidth+1 && getComputedStyle(e).position!=='fixed'}).slice(0,6).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,60))})`);
console.log(metrics);
const H = JSON.parse(metrics).height;
await send("Emulation.setDeviceMetricsOverride", { width: W, height: Math.min(H, 16000), deviceScaleFactor: 1, mobile: mobile === "mobile" });
await new Promise((r) => setTimeout(r, 800));
console.log("scrollY before reset:", await ev("scrollY"));
await ev("window.scrollTo(0,0); scrollY");
await new Promise((r) => setTimeout(r, 300));
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: Number(process.env.CLIP_Y || 0), width: W, height: Number(process.env.CLIP_H || Math.min(H, 16000)), scale: 1 } });
writeFileSync(out, Buffer.from(shot.result.data, "base64"));
await send("Page.close").catch(() => {}); ws.close(); process.exit(0);
