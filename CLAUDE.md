# CLAUDE.md

## Project: StayFit

Vietnamese calorie & fitness tracker. Next.js 15 (App Router) PWA. Uses Google
Sheets as the database and Google Gemini for AI food recognition (vision + text).

## Commands

```bash
npm run dev    # Start dev server (http://localhost:3000)
npm run build  # Production build
npm run start  # Run production build
npm run lint   # ESLint via next lint
```

## Architecture

```
app/
  api/
    vision-analyze/  # Gemini vision → identify food from photo
    text-analyze/    # Gemini text → identify food from name
    save-meal/       # Append a meal row to Google Sheets
    sync/            # Read/write user data from Google Sheets
  dashboard/         # Main UI (calorie circle, food log, macros)
  _data/             # Static data (common-foods.js — Vietnamese food DB)
middleware.js        # In-memory rate limiting (30 req/min default, 10 for AI routes)
```

Google Sheets is the sole database. No SQL, no ORM.

## Environment Variables

| Variable | Purpose |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account for Sheets API |
| `GOOGLE_PRIVATE_KEY` | Service account private key (see gotcha below) |
| `GOOGLE_SHEET_ID` / `SPREADSHEET_ID` | Target spreadsheet ID |
| `GEMINI_API_KEY` | Google Generative AI key |
| `GEMINI_MODEL` | Gemini model name (e.g. `gemini-1.5-flash`) |

## Gotchas

- **Private key escaping**: `GOOGLE_PRIVATE_KEY` in `.env` stores literal `\n`.
  The API routes call `.replace(/\\n/g, "\n")` before using it — don't remove that.
- **Rate limiter is in-memory**: Resets on every server restart. Fine for a personal
  app, not suitable for multi-instance deployments.
- **Sheets locale**: Vietnamese locales write decimals with commas (`81,4`).
  `safeFloat()` in sync/route.js handles this — don't use raw `parseFloat` on Sheets values.
- **Fuzzy food matching**: Both AI routes use a custom diacritic-stripping `normalize()`
  + token-Jaccard scorer to match Vietnamese food names. Threshold is 0.6.

---

## Behavioral Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
