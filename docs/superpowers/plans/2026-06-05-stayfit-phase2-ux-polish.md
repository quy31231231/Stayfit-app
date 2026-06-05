# StayFit Phase 2 — UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace native `alert()` with a toast system, add loading skeletons + reusable empty states, and extend micro-animations — without changing app logic.

**Architecture:** A module-singleton toast store (`toast.success/error/info`) + a `<Toaster/>` rendered once in `App`; presentational `Skeleton`/`EmptyState` components; a `useCountUp` hook for the calorie number; extend the already-present `@formkit/auto-animate`.

**Tech Stack:** Next.js 15, React 18, Tailwind (CSS-var color tokens), `@formkit/auto-animate` (already a dep). No test framework — verification is `npm run build` + manual ★ checkpoints (per approved spec).

**Spec:** `docs/superpowers/specs/2026-06-05-stayfit-phase2-ux-polish-design.md`

**Verification convention (no automated tests):**
- Every task ends with `npm run build` → `✓ Compiled successfully`.
- ★ tasks add a manual browser smoke test (`npm run dev`) the USER runs.
- Each task = 1 commit.

**Tailwind tokens used (confirmed in `tailwind.config.js`):** `bg-ink`/`text-cream` (flip together → good contrast both themes), `bg-ringcal-over-from` (`#E07070` red, identical both themes → error), `text-onaccent` (white in light / near-black in dark → text on `bg-orange`), `bg-cream-deep` (skeleton), `animate-pulse` (tailwindcss-animate), `animate-fade-rise` (globals.css; auto-disabled under `prefers-reduced-motion`).

**`alert()` sites to replace (9 total):**
- `app/page.js`: lines 272, 273, 275, 284, 288, 294, 1082
- `app/dashboard/_components/StatsView.js`: lines 62, 496

---

### Task 0: Branch setup

**Why:** Phase 2 edits `StatsView.js` and the heavily-refactored `page.js`, which exist only on the Phase 1 branch. Branch from there, not `main`.

- [ ] **Step 1: Create the Phase 2 branch from the Phase 1 tip**

```bash
git checkout refactor/foundation-phase1
git checkout -b feat/phase2-ux
git branch --show-current   # expect: feat/phase2-ux
```

- [ ] **Step 2: Confirm a clean build baseline**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

---

### Task 1: Toast component (store + `<Toaster/>`)

**Files:**
- Create: `app/_components/Toast.js`
- Modify: `app/page.js` (render `<Toaster/>` once)

- [ ] **Step 1: Create `app/_components/Toast.js`**

```jsx
"use client";

import { useState, useEffect } from 'react';

// Singleton pub/sub store — gọi toast.* từ bất kỳ đâu (kể cả ngoài cây React, trong event handler).
let _id = 0;
const listeners = new Set();
let _toasts = [];
const emit = () => { for (const l of listeners) l(_toasts); };
const dismiss = (id) => { _toasts = _toasts.filter((t) => t.id !== id); emit(); };
const push = (type, message, duration = 2500) => {
    const id = ++_id;
    _toasts = [..._toasts, { id, type, message }];
    emit();
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
};

export const toast = {
    success: (message, duration) => push('success', message, duration),
    error: (message, duration) => push('error', message, duration),
    info: (message, duration) => push('info', message, duration),
};

const ICON = { success: '✓', error: '⚠', info: 'ⓘ' };

export function Toaster() {
    const [items, setItems] = useState(_toasts);
    useEffect(() => {
        const l = (t) => setItems(t);
        listeners.add(l);
        setItems(_toasts);
        return () => { listeners.delete(l); };
    }, []);
    if (items.length === 0) return null;
    return (
        <div
            className="fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
        >
            {items.map((t) => (
                <button
                    key={t.id}
                    onClick={() => dismiss(t.id)}
                    className={`animate-fade-rise pointer-events-auto flex w-fit max-w-md items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-lift ${
                        t.type === 'error' ? 'bg-ringcal-over-from text-white' : 'bg-ink text-cream'
                    }`}
                >
                    <span aria-hidden="true">{ICON[t.type]}</span>
                    <span>{t.message}</span>
                </button>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Render `<Toaster/>` once in `App`**

In `app/page.js`, add the import near the other component imports:

```js
import { toast, Toaster } from './_components/Toast';
```

Then render `<Toaster />` just before the closing tag of `App`'s top-level returned element. Use the Grep tool to find App's return roots: search `return (` inside `App` and locate the outermost wrapper that is always rendered. Place `<Toaster />` as the last child of the outermost always-rendered `<div>` (so it overlays every view). If App has multiple `return` branches (login gate vs app), add `<Toaster />` to BOTH the logged-in shell and the login screen root so toasts show during login errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. (`toast` imported-but-unused yet is fine — used in Task 2. If lint blocks on unused, proceed to Task 2 before worrying.)

- [ ] **Step 4: Commit**

```bash
git add app/_components/Toast.js app/page.js
git commit -m "feat(ux): add singleton toast store + Toaster"
```

---

### Task 2 ★: Replace all 9 `alert()` calls with toasts

**Files:**
- Modify: `app/page.js` (7 sites), `app/dashboard/_components/StatsView.js` (2 sites)

- [ ] **Step 1: Replace the 7 `page.js` alerts**

Apply these exact replacements (keep `return` control flow intact — only the call changes):

```js
// line ~272-273 (handlePhoneAuth validation)
if (!phone || phone.length < 8) { toast.error("Số điện thoại không hợp lệ!"); return; }
if (pwd.length < 6) { toast.error("Mật khẩu tối thiểu 6 ký tự!"); return; }
// line ~275
if (!supa) { toast.error("Chưa cấu hình Supabase."); return; }
// line ~284 (signup info)
if (!up.data.session) {
    toast.info("Đã tạo tài khoản. Nếu chưa vào được, kiểm tra Supabase đã TẮT 'Confirm email'.");
}
// line ~288 (catch)
} catch (e) { toast.error(e.message || "Lỗi đăng nhập"); }
// line ~294 (handleGoogleLogin)
if (!supa) { toast.error("Đăng nhập Google chưa được cấu hình (thiếu Supabase env)."); return; }
// line ~1082 (library edit validation)
if (!libraryEditForm.name || libraryEditForm.kcal === "") {
    toast.error("Vui lòng nhập đủ tên và số Kcal.");
    return;
}
```

Note: `return alert(x)` becomes `{ toast.error(x); return; }` — `alert` returned `undefined` so the early-return semantics are preserved.

- [ ] **Step 2: Replace the 2 `StatsView.js` alerts**

`StatsView.js` is a separate file — import `toast` at the top (add to the existing import block):

```js
import { toast } from '../../_components/Toast';
```

Then:

```js
// line ~62 (saveWeight)
if (!inputVal || inputVal <= 0) { toast.error("Vui lòng nhập số kg hợp lệ!"); return; }
// line ~496 (goal save)
if (!start || !tgt || start <= 0 || tgt <= 0) { toast.error("Vui lòng nhập số kg hợp lệ!"); return; }
```

- [ ] **Step 3: Add a success toast when a food is logged (demonstrate success variant)**

In `app/page.js`, find `handleAddSelectedFood` (it ends with `setSelectedFood(null); setSearchQuery(""); setQty(1);`). Add before those resets:

```js
toast.success(`Đã thêm ${newItem.name}`);
```

- [ ] **Step 4: Verify no `alert(` remains**

Run (Grep tool): pattern `alert\(` across `app/`. Expected: zero matches.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 6 ★: Manual smoke test (USER)**

`npm run dev`:
- Đăng nhập sai (SĐT < 8 số) → **toast đỏ** "Số điện thoại không hợp lệ!".
- Thêm 1 món → **toast ink** "Đã thêm …".
- Tab Thống kê → nhập cân nặng rỗng/0 → **toast đỏ** "Vui lòng nhập số kg hợp lệ!".
- Toast tự ẩn ~2.5s, bấm vào toast đóng ngay, nằm trên bottom-nav.
- Mở 1 modal rồi gây lỗi validation → toast vẫn thấy (không bị modal che). Nếu bị che, đổi `z-[60]` → `z-[100]` trong Toaster.

Confirm OK.

- [ ] **Step 7: Commit**

```bash
git add app/page.js app/dashboard/_components/StatsView.js
git commit -m "feat(ux): replace 9 alert() calls with toasts (+ add-food success toast)"
```

---

### Task 3 ★: Loading skeletons

**Files:**
- Create: `app/_components/Skeleton.js`
- Modify: `app/page.js` (StatsView dynamic `loading`, + initial-load DashboardSkeleton)

- [ ] **Step 1: Create `app/_components/Skeleton.js`**

```jsx
"use client";

// Khối skeleton nhịp pulse, ăn theo token cream (đổi sáng/tối tự động).
export function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-md bg-cream-deep ${className}`} />;
}

// Skeleton cho biểu đồ — thay fallback "Đang tải biểu đồ…" khi StatsView lazy-load.
export function ChartSkeleton() {
    const bars = [40, 70, 55, 85, 60, 45, 75];
    return (
        <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <div className="flex h-40 items-end gap-1.5">
                {bars.map((h, i) => (
                    <div key={i} className="flex-1 animate-pulse rounded-t bg-cream-deep" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    );
}

// Skeleton dashboard — vòng calo + macro + vài dòng log, hiện khi nạp dữ liệu lần đầu.
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-5">
            <div className="flex justify-center"><Skeleton className="h-44 w-44 rounded-full" /></div>
            <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Use `ChartSkeleton` as the StatsView lazy fallback**

In `app/page.js`, add to the Skeleton import and swap the `loading` fn:

```js
import { ChartSkeleton, DashboardSkeleton } from './_components/Skeleton';
```

Replace the existing dynamic import loading fn:

```js
const StatsView = dynamic(() => import('./dashboard/_components/StatsView'), {
    ssr: false,
    loading: () => <ChartSkeleton />,
});
```

- [ ] **Step 3: Show `DashboardSkeleton` during first data load**

In `app/page.js`, find where the journal/dashboard view renders (the `view === 'journal'` branch). The app loads data into `history`/`profile` after login via `loadForUser`; `dataLoadedRef.current` flips true when done. Add a guard at the top of the journal view's content: if logged in (`userId`) but data not yet loaded (`!dataLoadedRef.current`) AND `isClient`, render `<DashboardSkeleton />` instead of the dashboard body.

Use the Grep tool to find the journal render branch (search `view === "journal"` or the `<GreetingHeader` / `<CalorieCircle` usage). Wrap the dashboard body:

```jsx
{userId && isClient && !dataLoadedRef.current
    ? <DashboardSkeleton />
    : (/* existing dashboard body */)}
```

If `dataLoadedRef` (a ref) doesn't trigger re-render on its own, gate on an existing state that flips post-load instead (e.g., presence of `displayName`, set in `loadForUser`). Prefer the simplest existing signal that re-renders; document which you used in the commit message.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5 ★: Manual smoke test (USER)**

`npm run dev`:
- Mở tab Thống kê lần đầu → thấy **ChartSkeleton** (cột xám pulse) thay vì chữ trơ, rồi biểu đồ hiện.
- Tải lại app khi đã đăng nhập → thoáng thấy **DashboardSkeleton** trước khi dashboard hiện (có thể rất nhanh).
- Đổi sáng/tối → skeleton đổi màu theo nền.

Confirm OK.

- [ ] **Step 6: Commit**

```bash
git add app/_components/Skeleton.js app/page.js
git commit -m "feat(ux): loading skeletons for charts and first dashboard load"
```

---

### Task 4 ★: Reusable empty states

**Files:**
- Create: `app/_components/EmptyState.js`
- Modify: `app/page.js` (journal-empty, search-no-results), `app/dashboard/_components/StatsView.js` (weight history empty)

- [ ] **Step 1: Create `app/_components/EmptyState.js`**

```jsx
"use client";

// Empty state tái dùng: icon emoji + tiêu đề + phụ đề + nút hành động (tùy chọn).
export default function EmptyState({ icon, title, subtitle, action }) {
    return (
        <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-2 text-3xl" aria-hidden="true">{icon}</div>
            <h3 className="text-[15px] font-bold text-ink">{title}</h3>
            {subtitle && <p className="mt-1 text-[12px] text-ink-muted">{subtitle}</p>}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 rounded-full bg-orange px-4 py-2 text-[12px] font-bold text-onaccent transition active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Journal day empty state**

In `app/page.js`, import: `import EmptyState from './_components/EmptyState';`. The app already computes `isDailyLogEmpty`. In the journal view, where the meal sections / food log render, add: when `isDailyLogEmpty` is true, render the empty state instead of (or above) the empty meal sections:

```jsx
{isDailyLogEmpty ? (
    <EmptyState
        icon="🍽️"
        title="Chưa có món nào hôm nay"
        subtitle="Thêm bữa đầu tiên để bắt đầu theo dõi calo"
        action={{ label: "+ Thêm món", onClick: () => setTab("quick") }}
    />
) : (/* existing meal sections */)}
```

Locate the insertion point with Grep: search `isDailyLogEmpty` (already referenced) and the food-log render in the journal branch. If the add-food UI is opened by a different setter than `setTab("quick")`, use the existing one that opens the food picker (grep how the `+` add button opens it).

- [ ] **Step 3: Search no-results empty state**

In `app/page.js`, the food picker maps `filteredFoods`. Where it renders the list, add: when `searchQuery.trim()` is non-empty AND `filteredFoods.length === 0`, render:

```jsx
{searchQuery.trim() && filteredFoods.length === 0 ? (
    <EmptyState icon="🔍" title="Không tìm thấy món" subtitle={`Không có kết quả cho "${searchQuery}"`} />
) : (/* existing filteredFoods.map(...) */)}
```

Find the spot with Grep: search `filteredFoods.map`.

- [ ] **Step 4: Weight history empty state**

In `app/dashboard/_components/StatsView.js`, import `EmptyState` (`import EmptyState from '../../_components/EmptyState';`). Find the weight-history modal/list (grep `weightModal === "history"` or where `Object.keys(weightLog)` is mapped). When there are no weight entries, render:

```jsx
{Object.keys(weightLog).length === 0
    ? <EmptyState icon="⚖️" title="Chưa có dữ liệu cân nặng" subtitle="Ghi cân nặng đầu tiên để xem biểu đồ" />
    : (/* existing history list */)}
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 6 ★: Manual smoke test (USER)**

`npm run dev`:
- Chuyển tới một ngày chưa ăn gì (mũi tên ngày) → **empty state "Chưa có món nào hôm nay"** + nút mở thêm món.
- Mở thêm món, gõ chuỗi vô nghĩa ("xyzzy") → **empty "Không tìm thấy món"**.
- Tab Thống kê → lịch sử cân nặng khi chưa ghi gì → **empty "Chưa có dữ liệu cân nặng"**.

Confirm OK.

- [ ] **Step 7: Commit**

```bash
git add app/_components/EmptyState.js app/page.js app/dashboard/_components/StatsView.js
git commit -m "feat(ux): reusable empty states for journal, search, weight history"
```

---

### Task 5 ★: Micro-animations (auto-animate + calorie count-up)

**Files:**
- Create: `app/_hooks/useCountUp.js`
- Modify: `app/page.js` (food picker list + recipe list auto-animate; calorie number count-up)

- [ ] **Step 1: Create `app/_hooks/useCountUp.js`**

```js
"use client";

import { useEffect, useRef, useState } from 'react';

// Đếm số mượt từ giá trị cũ → mới (ease-out cubic). Tôn trọng prefers-reduced-motion → set thẳng.
export function useCountUp(value, duration = 500) {
    const [display, setDisplay] = useState(value);
    const fromRef = useRef(value);
    useEffect(() => {
        const reduce = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setDisplay(value); fromRef.current = value; return; }
        const from = fromRef.current;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
            else fromRef.current = value;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return display;
}
```

- [ ] **Step 2: Animate the calorie number**

In `app/page.js`, import: `import { useCountUp } from './_hooks/useCountUp';`. After `dailyKcal` is computed, add:

```js
const animatedKcal = useCountUp(Math.round(dailyKcal));
```

Find where `dailyKcal` (or the rounded kcal) is displayed in the calorie ring — grep how `<CalorieCircle` is used and what prop receives the eaten kcal. Pass `animatedKcal` to that display prop instead of the raw value. If `CalorieCircle` also uses the value to compute the ring arc, keep the RAW value for the arc and use `animatedKcal` only for the printed number (pass a separate prop or render the number outside). Do NOT animate the arc geometry — only the printed integer.

- [ ] **Step 3: Extend auto-animate to food picker + recipe lists**

`@formkit/auto-animate` is already used in `FoodLogSection.js`. In `app/page.js`, add the hook import:

```js
import { useAutoAnimate } from '@formkit/auto-animate/react';
```

Inside `App`, create refs:

```js
const [foodListRef] = useAutoAnimate();
const [recipeListRef] = useAutoAnimate();
```

Attach `ref={foodListRef}` to the container element that wraps the `filteredFoods.map(...)` items, and `ref={recipeListRef}` to the container wrapping `recipe.ingredients.map(...)`. (Grep `filteredFoods.map` and `recipe.ingredients.map` for the containers.) The container must be the direct parent of the mapped items for auto-animate to animate add/remove.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5 ★: Manual smoke test (USER)**

`npm run dev`:
- Thêm/xóa món trong nhật ký & trong danh sách kết quả tìm → các dòng **trượt vào/ra mượt** (auto-animate).
- Thêm món → số calo ở vòng tròn **đếm lên** mượt tới giá trị mới.
- Bật Reduced Motion (OS) rồi thử lại → số nhảy thẳng, không animation (không lỗi).

Confirm OK.

- [ ] **Step 6: Commit**

```bash
git add app/_hooks/useCountUp.js app/page.js
git commit -m "feat(ux): auto-animate food/recipe lists + calorie count-up"
```

---

## Final verification

- [ ] `npm run build` passes.
- [ ] Grep `alert\(` across `app/` → zero matches.
- [ ] All ★ checkpoints confirmed by user.
- [ ] `git log --oneline` shows one commit per task on `feat/phase2-ux`.
- [ ] Offer: open a PR for `feat/phase2-ux`, or stack onto Phase 1.

## Self-review notes

- **Spec coverage:** Task 1–2 = toast (pillar 1, all 9 alerts incl. the 2 in StatsView the spec hinted at); Task 3 = skeletons (pillar 2); Task 4 = empty states (pillar 3); Task 5 = micro-animation (pillar 4). All four pillars mapped.
- **Theme correctness:** error toast uses `bg-ringcal-over-from` (stable red both themes); success/info use `bg-ink text-cream` (flip together). Avoids the dark-mode `orange-deep = lime` trap noted while reading globals.css.
- **No new deps:** auto-animate already present; skeleton uses built-in `animate-pulse`; toast entrance reuses `animate-fade-rise`.
- **Reduced motion:** `useCountUp` checks the media query; `animate-fade-rise`/`animate-pulse` already disabled by the globals.css reduced-motion reset.
- **Located-at-execution wiring:** a few JSX insertion points (journal-empty guard, search-no-results, weight-history empty, calorie display prop, auto-animate containers) are specified by exact guard conditions + grep anchors rather than line numbers, because page.js line numbers shift across tasks. Each has a concrete code block and a precise anchor.
