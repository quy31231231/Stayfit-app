# CLAUDE.md

## Project: StayFit

Vietnamese calorie & fitness tracker. Next.js 15 (App Router) PWA. Uses **Supabase**
(Postgres + Auth, RLS) as the database and Google Gemini for AI food recognition (vision + text).

> Lịch sử: app từng dùng Google Sheets làm DB. Đã **di trú sang Supabase native** (xem
> `supabase/schema.sql` + `scripts/migrate-to-supabase.mjs`). Sheets không còn dùng trong runtime;
> `googleapis` chỉ còn ở devDependencies cho script di trú một lần.

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
    vision-analyze/  # Gemini vision → identify food from photo (auth: Supabase JWT)
    text-analyze/    # Gemini text → identify food from name (auth: Supabase JWT)
    barcode/         # Tra mã vạch qua Open Food Facts (public, no auth) — "Kiểm tra sản phẩm"
  auth/
    callback/page.js # Client OAuth callback — đổi ?code= → session (detectSessionInUrl)
  dashboard/
    _components/     # CalorieCircle, MacroDonut, FoodLogItem, FoodLogSection, BarcodeScanner, ...
    page.js          # Dashboard UI
  _data/             # Static data (common-foods.js — Vietnamese food DB)
  page.js            # Root — auth gate + toàn bộ app state (~3300 lines)
lib/supabase/
  client.js          # Browser client (supabase-js, localStorage session, PKCE)
  data.js            # Data-access: loadUserData(uid) / saveSnapshot(uid,..) + weight/feedback
  verify.js          # Server: verifySupabaseToken(jwt) cho AI routes
middleware.js        # In-memory rate limiting (30 req/min default, 10 for AI routes)
supabase/schema.sql  # Bảng + RLS + trigger auto-profile (chạy 1 lần trong Supabase SQL Editor)
scripts/migrate-to-supabase.mjs  # Di trú Sheets → Supabase (1 lần, dùng service role key)
```

Supabase Postgres là DB duy nhất. RLS khóa mọi bảng theo `auth.uid()`.

## Supabase Schema (xem `supabase/schema.sql`)

| Table | Khóa | Cột chính |
|-------|------|-----------|
| `profiles` | `id` = auth.users.id | gender, age, height, weight, activity, goal, manual_target_kcal, start_weight, target_weight, deleted_common_foods text[] |
| `food_logs` | `user_id` | date, meal, name, quantity, unit, kcal, protein, carb, fat (id = uuid) |
| `weight_logs` | `user_id`, unique(user_id,date) | date, weight |
| `custom_foods` | `user_id`, unique(user_id,name) | name, unit, per, kcal, protein, carb, fat, barcode |
| `scan_feedback` | `user_id` | ai_predicted_name, library_matched_name, user_corrected_name, confidence, ... |

Trigger `on_auth_user_created` tự tạo dòng `profiles` khi có user mới.

## Auth & Data flow

- **Đăng nhập**: Google OAuth + SĐT (email tổng hợp `<sđt>@phone.stayfit.app`, không OTP). Session lưu
  **localStorage** (SPA, không cookie). Gate ở `page.js`: `onAuthStateChange` → `userId = user.id`,
  `password = access_token` (token này gửi cho AI routes).
- **⚠ KHÔNG gọi `supabase.auth.getUser()/getSession()` bên trong `onAuthStateChange`** → deadlock auth-lock
  (Promise pending mãi). `loadUserData(uid)` nhận `uid` từ session; việc nạp được **defer** bằng `setTimeout(0)`.
- **Load**: `loadUserData(uid)` select song song 5 bảng → dựng lại shape state.
- **Save**: `saveSnapshot(uid, {...})` — UPSERT + RECONCILE (xóa row không còn trong state). Debounce 2.5s.
  Cân nặng ghi hạt mịn qua `upsertWeight`/`deleteWeight`.
- **AI routes**: client gửi access token qua field `password`; route gọi `verifySupabaseToken(token)`
  (`lib/supabase/verify.js`) → 401 nếu sai.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL `https://<ref>.supabase.co` (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key (public) |
| `GEMINI_API_KEY` | Google Generative AI key (cho vision/text routes) |
| `GEMINI_MODEL` | Gemini model name (optional; mặc định auto-xoay nhiều model) |
| `SUPABASE_SERVICE_ROLE_KEY` | **BÍ MẬT** — chỉ cho `scripts/migrate-to-supabase.mjs`, KHÔNG để client/commit |
| `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` / `SPREADSHEET_ID` | Chỉ cho script di trú (đọc Sheets cũ). Không cần cho app runtime. |

## Supabase setup (dashboard — không làm bằng code được)

- **Authentication → Providers → Google**: bật + dán Client ID/Secret (tạo ở Google Cloud Console).
  Authorized redirect URI bên Google = `https://<ref>.supabase.co/auth/v1/callback`.
- **Authentication → Providers → Email**: TẮT "Confirm email" (để đăng ký SĐT-qua-email-tổng-hợp không cần verify).
- **Authentication → URL Configuration**: Site URL = `https://stayfit.id.vn`; Redirect URLs gồm
  `https://stayfit.id.vn/auth/callback` + `http://localhost:3000/auth/callback`.

## Gotchas

- **auth-lock deadlock**: không await hàm `supabase.auth.*` khác trong callback `onAuthStateChange` (xem trên).
- **OAuth callback**: là **client page** (`app/auth/callback/page.js`), KHÔNG phải route handler — App Router
  + PKCE localStorage cần đổi mã ở client (`detectSessionInUrl: true`). Đừng đổi lại thành route.js.
- **Rate limiter is in-memory**: Resets on every restart. 30 req/min default, 10/min for AI routes.
- **Fuzzy food matching**: Both AI routes use a custom diacritic-stripping `normalize()`
  + token-Jaccard scorer to match Vietnamese food names.
- **Barcode ≠ thật/giả**: `/api/barcode` chỉ tra thông tin Open Food Facts để đối chiếu; UI luôn cảnh báo
  KHÔNG khẳng định hàng thật/giả (mã vạch có thể bị copy).

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
