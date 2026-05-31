#!/usr/bin/env bash
# smoke.sh — launch StayFit dev server and run smoke tests against it
# Usage: bash .claude/skills/run-stayfit/smoke.sh [port]
set -euo pipefail

PORT=${1:-3099}
BASE="http://localhost:$PORT"

echo "[stayfit] Starting dev server on port $PORT..."
cd "$(dirname "$0")/../../.."   # repo root
npm run dev -- --port "$PORT" &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null; exit" EXIT INT TERM

# Wait for server
for i in $(seq 1 20); do
  if curl -sf "$BASE/" -o /dev/null; then break; fi
  sleep 1
done

echo "[stayfit] Server up at $BASE"

# --- Smoke tests ---

# 1. Homepage renders HTML (Next.js SSR)
HTTP=$(curl -sf -o /dev/null -w "%{http_code}" "$BASE/")
[ "$HTTP" = "200" ] && echo "PASS homepage $HTTP" || { echo "FAIL homepage $HTTP"; exit 1; }

# 2. HTML contains app identifiers
HTML=$(curl -sf "$BASE/")
echo "$HTML" | grep -q "StayFit" && echo "PASS title 'StayFit' in HTML" || { echo "FAIL title not found"; exit 1; }

# 3. API: barcode lookup (public, no auth) returns JSON
BC=$(curl -sf "http://localhost:$PORT/api/barcode?code=3017620422003")
echo "$BC" | grep -q '"found"' && echo "PASS barcode API returns JSON" || { echo "FAIL barcode API unexpected: $BC"; exit 1; }

# 4. API: vision-analyze rejects missing body (method check)
VA=$(curl -sf -X POST -H "Content-Type: application/json" -d '{}' "http://localhost:$PORT/api/vision-analyze" 2>&1 || true)
echo "$VA" | grep -qiE '"error"|"missing"' && echo "PASS vision-analyze rejects empty body" || echo "INFO vision-analyze: $VA"

# 5. API: text-analyze rejects missing body
TA=$(curl -sf -X POST -H "Content-Type: application/json" -d '{}' "http://localhost:$PORT/api/text-analyze" 2>&1 || true)
echo "$TA" | grep -qiE '"error"|"missing"' && echo "PASS text-analyze rejects empty body" || echo "INFO text-analyze: $TA"

echo ""
echo "[stayfit] Smoke tests complete. Server running at $BASE (PID $SERVER_PID)"
echo "  Press Ctrl-C to stop."
wait $SERVER_PID
