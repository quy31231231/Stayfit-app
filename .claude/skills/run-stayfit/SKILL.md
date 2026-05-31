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
3. Runs checks (all verified working):
   - `GET /` → HTTP 200
   - HTML contains `"StayFit"`
   - `GET /api/barcode?code=3017620422003` → JSON `{"found":...}` (public, no auth)
   - `POST /api/vision-analyze {}` → error JSON (no GEMINI_API_KEY / no auth token)
   - `POST /api/text-analyze {}` → error JSON (no GEMINI_API_KEY / no auth token)
4. Waits (Ctrl-C to stop)

**For a quick one-off check against an already-running server:**

```bash
# Start server in one shell:
npm run dev -- --port 3099

# Smoke-test in another:
curl -s http://localhost:3099/                                # → 200 HTML
curl -s "http://localhost:3099/api/barcode?code=3017620422003"  # → {"found":...}
```

## Run (human path)

```bash
npm run dev        # opens http://localhost:3000
npm run build && npm run start  # production build
```

## Gotchas

- **Tailwind build**: Tailwind is built via PostCSS (`tailwind.config.js` + `app/globals.css`), not CDN. Custom colors (`cream`, `ink`, `orange`, `clay`, `sage`, `lilac`, `mist`) live in `tailwind.config.js`.
- **Supabase env vars**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` required for login/data. Without them the app still renders but auth is disabled (Google button hidden).
- **GEMINI_API_KEY missing / no auth token**: `/api/vision-analyze` and `/api/text-analyze` fail with an error JSON (401 without a valid Supabase token, or Gemini error). No crash.
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
