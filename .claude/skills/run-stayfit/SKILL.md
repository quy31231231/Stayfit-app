---
name: run-stayfit
description: Run, start, launch, screenshot, verify, test, smoke-test the StayFit Next.js app. Use when asked to run the app, confirm a fix works, check that a feature works, or validate local changes.
---

StayFit is a Next.js 15 (App Router) PWA. The dev server starts on port 3000 (or any free port). The smoke script at `.claude/skills/run-stayfit/smoke.sh` starts the server and runs HTTP-level checks via `curl` — no browser needed.

## Prerequisites

- Node.js ≥ 18 (tested: v24)
- `npm install` done (or `node_modules/` already present)
- No env vars required to start the server; API endpoints return `{"error":"Missing SPREADSHEET_ID"}` without them — that is the expected smoke-test response.

## Build

```bash
# No compile step needed for dev. For production:
npm run build
```

## Run (agent path — smoke script)

```bash
bash .claude/skills/run-stayfit/smoke.sh [port]
# Default port: 3099
```

The script:
1. Starts `npm run dev -- --port <port>` in background
2. Waits up to 20s for the server to respond
3. Runs 5 checks (all verified working):
   - `GET /` → HTTP 200
   - HTML contains `"StayFit"` and Tailwind CDN tag
   - `GET /api/sync?userId=_smoke&password=_smoke` → `{"error":"Missing SPREADSHEET_ID"}` (400)
   - `POST /api/vision-analyze {}` → error JSON (no GEMINI_API_KEY)
   - `POST /api/text-analyze {}` → error JSON (no GEMINI_API_KEY)
4. Waits (Ctrl-C to stop)

**For a quick one-off check against an already-running server:**

```bash
# Start server in one shell:
npm run dev -- --port 3099

# Smoke-test in another:
curl -s http://localhost:3099/                          # → 200 HTML
curl -s "http://localhost:3099/api/sync?userId=x&password=x"  # → {"error":"Missing SPREADSHEET_ID"}
```

## Run (human path)

```bash
npm run dev        # opens http://localhost:3000
npm run build && npm run start  # production build
```

## Gotchas

- **`tailwind.config` inline script**: Tailwind is loaded via CDN (`cdn.tailwindcss.com`), not PostCSS. There is no `tailwind.config.js` file. All custom colors (`cream`, `ink`, `orange`, `clay`, `sage`, `lilac`) are defined inline in `app/layout.js`.
- **Google Sheets env vars**: Without `SPREADSHEET_ID` / `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY`, all `/api/sync` calls return 400 `{"error":"Missing SPREADSHEET_ID"}`. This is expected in local dev without credentials.
- **GEMINI_API_KEY missing**: `/api/vision-analyze` and `/api/text-analyze` fail with an error JSON. No crash, no stack trace — clean 4xx/5xx.
- **Rate limiter is in-memory**: Resets on every restart. 30 req/min default, 10/min for AI routes.
- **`npm run dev` first compile is slow** (~3–5s to compile 600 modules). The smoke script waits up to 20s.
- **Port 3000 may be in use**: Pass an alternate port to the smoke script: `bash .../smoke.sh 3099`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Error: Cannot find module 'next'` | Run `npm install` first |
| Server never responds (timeout) | Check if port is in use: `netstat -an \| grep 3099` |
| `{"error":"Missing SPREADSHEET_ID"}` on sync | Expected — no env vars set. Add `.env.local` with real values to test sync. |
| `EADDRINUSE` | Another process on port; pass different port arg to smoke.sh |
