# Meridian landing-page checks (SQU-427)

The two browser instruments behind the SQU-427 gate, kept so the checks can be
re-run against a preview or production, not only the dev server they were
first run on. Both drive headless Chrome over the DevTools protocol and need
Node 22 (built-in `WebSocket`), no npm packages.

| script | what it checks |
|---|---|
| `shoot.mjs` | A screenshot at an emulated width, plus `innerWidth` vs `scrollWidth` (no horizontal scroll), the faces that loaded, and any element wider than the viewport. |
| `form.mjs` | The newsletter form's states: `ok`, `no-consent`, `bad-email`, `honeypot`. Prints the page's message, whether the typed email was kept, and the hidden `src` it carried. |

The unit tests for the redirect allowlist and the signup checks are separate:
`npm run meridian:test`.
