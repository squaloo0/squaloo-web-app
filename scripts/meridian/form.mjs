// The SQU-427 form check: fills and submits the newsletter form over CDP and
// prints what the page then says, and whether the typed email survived.
// Scenarios: ok (default), no-consent, bad-email, honeypot.
// Chrome as in shoot.mjs, then:
//   node scripts/meridian/form.mjs 9333 'http://localhost:3427/marshal-qr?src=card' no-consent
// Without NEON_DATABASE_URL the ok scenario reads "Signups aren't connected yet".
const [port, url, scenario] = process.argv.slice(2);
const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const P = new Map(); const W = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && P.has(d.id)) { P.get(d.id)(d); P.delete(d.id); } else for (const w of W) w(d); };
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) => new Promise((r) => { const i = ++id; P.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result.result?.value;
await send("Page.enable"); const loaded = new Promise((r) => W.push((d) => d.method === "Page.loadEventFired" && r()));
await send("Page.navigate", { url }); await loaded; await new Promise((r) => setTimeout(r, 2500));
const setv = (sel, v) => `(()=>{const el=document.querySelector('${sel}');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`;
const S = { email: "ada@example.com", consent: true, website: "" };
if (scenario === "no-consent") S.consent = false;
if (scenario === "bad-email") S.email = "ada@";
if (scenario === "honeypot") S.website = "http://spam.example";
await ev(setv('input[name=email]', S.email));
if (S.website) await ev(setv('input[name=website]', S.website));
if (S.consent) await ev(`document.querySelector('input[name=consent]').click()`);
console.log("hidden src =", await ev(`document.querySelector('input[name=src]').value`));
await ev(`document.querySelector('form button[type=submit]').click()`);
await new Promise((r) => setTimeout(r, 3500));
console.log(scenario, "->", JSON.stringify(await ev(`(()=>{const a=document.querySelector('#subscribe [role=alert]');const s=document.querySelector('#subscribe [role=status]');const e=document.querySelector('input[name=email]');return {alert:a&&a.textContent, status:s&&s.textContent, emailKept:e&&e.value}})()`)));
await send("Page.close").catch(()=>{}); ws.close(); process.exit(0);
