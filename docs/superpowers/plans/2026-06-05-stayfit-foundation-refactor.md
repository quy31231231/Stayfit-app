# StayFit Phase 1 — Foundation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the ~3376-line `app/page.js` into focused lib/data/component modules and apply 4 perf wins, with zero behavior change.

**Architecture:** Pure refactor. Move pure helpers → `app/_lib/`, static data → `app/_data/`, icons → `app/_components/icons.js`, and components (`StatsView`, `MacroProgressBar`, `BottomNav`, `MindfulCard`) → component files. `StatsView` becomes a lazy `dynamic()` import so `chart.js` leaves the initial bundle. State stays as `useState` in `App`, passed via props.

**Tech Stack:** Next.js 15 (App Router), React 18, chart.js 4, Tailwind. No test framework — verification is `npm run build` + manual browser checkpoints (★), per approved spec.

**Spec:** `docs/superpowers/specs/2026-06-05-stayfit-foundation-refactor-design.md`

**Branch:** `refactor/foundation-phase1` (already created; 2 commits in).

**Verification convention (this plan has no automated tests):**
- Every task ends with `npm run build` → must print `✓ Compiled successfully` with no type/lint errors.
- Tasks marked ★ add a manual browser smoke test the USER runs (`npm run dev`) before moving on.
- Each task = 1 commit (clean rollback point).

**Baseline to beat:** route `/` First Load JS = 308 kB (page chunk 123 kB). Goal: drop after Task 5 (chart.js deferred) and Task 6 (chart.js trimmed). Re-run `npm run build` and compare the route table.

---

### Task 1: Extract pure helpers → `app/_lib/`

**Files:**
- Create: `app/_lib/format.js`, `app/_lib/food.js`, `app/_lib/barcode.js`, `app/_lib/misc.js`
- Modify: `app/page.js` (remove helper defs at lines ~55-205, add imports)

Note: `UNIT_GRAM_WEIGHTS` and `GS1_PREFIXES` are each used by exactly one helper, so co-locate them in `food.js` / `barcode.js` (keeps `_lib` self-contained — no `_lib → _data` import). This refines the spec, which listed `UNIT_GRAM_WEIGHTS` under `constants.js`.

- [ ] **Step 1: Create `app/_lib/format.js`**

```js
// Định dạng ngày theo giờ VN (YYYY-MM-DD) + quy đổi macro.
export const formatDate = (date) => {
    const d = new Date(date);
    const vietnamDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return `${vietnamDate.getFullYear()}-${String(vietnamDate.getMonth() + 1).padStart(2, '0')}-${String(vietnamDate.getDate()).padStart(2, '0')}`;
};
export const calcMacro = (val, per, q) => Math.round((val / per) * q * 10) / 10;
```

- [ ] **Step 2: Create `app/_lib/food.js`**

Move verbatim from `app/page.js`: `removeAccents` (line 162), `normalizeFoodLookup` (163), `normalizeFoodGroupKey` (164-169), `suggestQty` (172-197), `UNIT_GRAM_WEIGHTS` (198), `unitToGrams` (200-205). Prefix each with `export` EXCEPT keep `UNIT_GRAM_WEIGHTS` as a non-exported module const. Result skeleton:

```js
// Chuẩn hóa & tra cứu tên món (bỏ dấu), gợi ý định lượng, quy đổi đơn vị → gram.
export const removeAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
export const normalizeFoodLookup = (value) => removeAccents(String(value || "").toLowerCase()).replace(/\s+/g, " ").trim();
export const normalizeFoodGroupKey = (value) => normalizeFoodLookup(value)
    .replace(/\bphan\s+nac\b/g, "nac").replace(/[()]/g, " ").replace(/[\/,;:.-]+/g, " ").replace(/\s+/g, " ").trim();
export const suggestQty = (history, foodName, unit) => { /* verbatim body from page.js 172-197 */ };
const UNIT_GRAM_WEIGHTS = { 'tô': 400, 'bát': 200, 'ly': 250, 'quả': 100, 'cái': 100, 'chiếc': 100, 'chén': 70, 'đĩa': 350, 'cuốn': 80, 'ổ': 80, 'suất': 350, 'gói': 75, 'miếng': 80, 'phần': 300 };
export const unitToGrams = (qty, unit) => {
    const u = (unit || "g").toLowerCase();
    if (['kg', 'l', 'lít'].includes(u)) return qty * 1000;
    if (['ml', 'g', 'gram'].includes(u)) return qty;
    return qty * (UNIT_GRAM_WEIGHTS[u] || 100);
};
```

- [ ] **Step 3: Create `app/_lib/barcode.js`**

Move verbatim: `isValidGtin` (123-132), `GS1_PREFIXES` (135-145, keep non-exported), `gs1Country` (146-153). Export `isValidGtin` and `gs1Country`.

- [ ] **Step 4: Create `app/_lib/misc.js`**

Move verbatim and `export`: `getMealByHour` (55-62), `mentionsMealInText` (65-69), `normPhone` (116-120), `generateUniqueTimestamp` (155-161).

- [ ] **Step 5: Remove the moved defs from `app/page.js` and add imports**

Delete the original definitions (lines ~55-62, 65-69, 108-205 region — leave anything not moved). Add near the top imports:

```js
import { formatDate, calcMacro } from './_lib/format';
import { removeAccents, normalizeFoodLookup, normalizeFoodGroupKey, suggestQty, unitToGrams } from './_lib/food';
import { isValidGtin, gs1Country } from './_lib/barcode';
import { getMealByHour, mentionsMealInText, normPhone, generateUniqueTimestamp } from './_lib/misc';
```

Then `grep` each moved symbol in `page.js`; if any imported name is NOT referenced, remove it from the import (unused import = lint warning). If a name IS referenced but you removed its import, the build will fail — re-add.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, no `is not defined` / unused-var errors.

- [ ] **Step 7: Commit**

```bash
git add app/_lib app/page.js
git commit -m "refactor: extract pure helpers from page.js into app/_lib"
```

---

### Task 2: Extract static data → `app/_data/`

**Files:**
- Create: `app/_data/constants.js`, `app/_data/diet-modes.js`
- Modify: `app/page.js`

- [ ] **Step 1: Create `app/_data/constants.js`**

Move verbatim and `export`: `ACTIVITY_LEVELS` (46-49), `GOALS` (50-53), `MEAL_TYPES` (54), `TEXT_SUGGESTIONS` (70-74).

- [ ] **Step 2: Create `app/_data/diet-modes.js`**

Move verbatim and `export`: `DIET_MODES` (75-106).

- [ ] **Step 3: Remove from `page.js`, add imports**

```js
import { ACTIVITY_LEVELS, GOALS, MEAL_TYPES, TEXT_SUGGESTIONS } from './_data/constants';
import { DIET_MODES } from './_data/diet-modes';
```

Grep each to confirm it's referenced; trim unused.

- [ ] **Step 4: Build** — `npm run build` → `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add app/_data app/page.js
git commit -m "refactor: extract constants and diet modes into app/_data"
```

---

### Task 3: Extract icons → `app/_components/icons.js`

**Files:**
- Create: `app/_components/icons.js`
- Modify: `app/page.js`

- [ ] **Step 1: Enumerate icons**

Run: `grep -n "const Icon" app/page.js` (use the Grep tool). Confirm the full set (known: `IconUser, IconJournal, IconTrash, IconPlus, IconSearch, IconStats, IconEdit, IconUndo` at lines 38-45 — check for any others further down).

- [ ] **Step 2: Create `app/_components/icons.js`**

Move every `const Icon* = () => (<svg.../>);` verbatim, prefix each with `export`. Top of file: nothing special needed (JSX in `.js` is fine in this Next setup; no `"use client"` required for pure presentational SVG, but add it if build complains).

- [ ] **Step 3: Remove from `page.js`, add import**

```js
import { IconUser, IconJournal, IconTrash, IconPlus, IconSearch, IconStats, IconEdit, IconUndo } from './_components/icons';
```

(Adjust list to the exact set found in Step 1.)

- [ ] **Step 4: Build** — `npm run build` → `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add app/_components/icons.js app/page.js
git commit -m "refactor: extract SVG icons into app/_components/icons.js"
```

---

### Task 4 ★A: Extract leaf components → files

**Files:**
- Create: `app/dashboard/_components/MacroProgressBar.js`, `app/dashboard/_components/BottomNav.js`, `app/dashboard/_components/MindfulCard.js`
- Modify: `app/page.js`

- [ ] **Step 1: Create `MacroProgressBar.js`**

Move `MacroProgressBar` (page.js 208-221) verbatim. Add `"use client";` at top (uses no hooks but lives in a client tree — safe). End with `export default function MacroProgressBar(...)` (convert the declaration to a default export).

- [ ] **Step 2: Create `BottomNav.js`**

Move `BottomNav` (875-~890) verbatim. It uses icon components — add `import { IconJournal, IconStats, IconUser, IconPlus } from '../../_components/icons';` (adjust to the icons it actually references — grep inside the function). Add `"use client";`. Default-export it.

- [ ] **Step 3: Create `MindfulCard.js`**

Move `MindfulCard` (3364-end) verbatim. Grep its body for any helper/icon usage and add matching imports. Add `"use client";`. Default-export it.

- [ ] **Step 4: Remove the three from `page.js`, add imports**

```js
import MacroProgressBar from './dashboard/_components/MacroProgressBar';
import BottomNav from './dashboard/_components/BottomNav';
import MindfulCard from './dashboard/_components/MindfulCard';
```

- [ ] **Step 5: Build** — `npm run build` → `✓ Compiled successfully`.

- [ ] **Step 6 ★A: Manual smoke test (USER)**

Run `npm run dev`, log in, and verify:
- Bottom nav renders, all tabs switch (Nhật ký / Thống kê / Hồ sơ).
- Dashboard macro progress bars render and animate.
- Any "MindfulCard / breathing" element renders where it did before.

Confirm OK before continuing.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/_components app/page.js
git commit -m "refactor: extract MacroProgressBar, BottomNav, MindfulCard into components"
```

---

### Task 5 ★B: Extract `StatsView` + lazy-load (chart.js leaves initial bundle)

**Files:**
- Create: `app/dashboard/_components/StatsView.js`
- Modify: `app/page.js`

- [ ] **Step 1: Confirm chart.js is only used in StatsView**

Run (Grep tool): `new Chart|Chart\.(register|defaults)|chart.js` across `app/page.js`. Expected: all matches are inside the `StatsView` body (223-873) plus the module-level `import Chart from 'chart.js/auto'` (5) and `Chart.register(ChartDataLabels)` (35). If any `Chart` usage is OUTSIDE StatsView, stop and note it (the lazy split assumptions change).

- [ ] **Step 2: Create `app/dashboard/_components/StatsView.js`**

Top of file:

```js
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatDate } from '../../_lib/format';
import { upsertWeight as sbUpsertWeight, deleteWeight as sbDeleteWeight } from '../../../lib/supabase/data';

Chart.register(ChartDataLabels);
```

Then paste the `StatsView` function body verbatim (page.js 223-873) and `export default StatsView` at the end. Grep the body for every external symbol it uses (`formatDate`, `sbUpsertWeight`, `sbDeleteWeight`, any constants/helpers) and ensure each has an import above. Note `StatsView` keeps its own internal helpers (`getWeekLabel`, `sumDayMacro`, `sumMealKcal`, `hexA`, `capRadius`) — those stay inside.

- [ ] **Step 3: Remove `StatsView` from `page.js`; remove now-orphaned module-level chart imports**

Delete `StatsView` (223-873). Delete the top-level `import Chart from 'chart.js/auto';` (line 5) and `import ChartDataLabels ...` (6) and `Chart.register(ChartDataLabels);` (35) from `page.js` — they moved into StatsView. (If Step 1 found other Chart users, do NOT delete these; instead keep them. Expected: StatsView is the only user, so delete.)

- [ ] **Step 4: Add lazy import in `page.js`**

With the other `dynamic()` imports (near line 30):

```js
const StatsView = dynamic(() => import('./dashboard/_components/StatsView'), {
    ssr: false,
    loading: () => <div className="p-10 text-center text-ink-faint text-sm">Đang tải biểu đồ…</div>,
});
```

- [ ] **Step 5: Build + check bundle**

Run: `npm run build`
Expected: `✓ Compiled successfully`. In the route table, `/` First Load JS should DROP from 308 kB (chart.js now in a lazily-loaded chunk). Record the new number.

- [ ] **Step 6 ★B: Manual smoke test (USER)**

`npm run dev` → tab Thống kê:
- "Đang tải biểu đồ…" flashes briefly, then 3 charts render (cân nặng line, kcal stacked bars, macro lines).
- Nhập cân nặng → biểu đồ cân nặng cập nhật; reload → vẫn còn.
- Click một cột kcal → nhảy sang Nhật ký đúng ngày.
- Đổi sáng/tối → màu biểu đồ đổi theo.

Confirm OK.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/_components/StatsView.js app/page.js
git commit -m "perf: extract StatsView into a lazy dynamic import (defers chart.js from initial bundle)"
```

---

### Task 6 ★C: Trim chart.js — selective registration (RISKY, isolated commit)

**Files:**
- Modify: `app/dashboard/_components/StatsView.js`

- [ ] **Step 1: Replace `chart.js/auto` with selective registration**

Swap the StatsView header:

```js
import {
    Chart,
    BarController, LineController,
    BarElement, LineElement, PointElement,
    LinearScale, CategoryScale,
    Tooltip, Legend, Filler,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(
    BarController, LineController,
    BarElement, LineElement, PointElement,
    LinearScale, CategoryScale,
    Tooltip, Legend, Filler,
    ChartDataLabels,
);
```

Rationale for each: bar+line controllers/elements (the 3 charts), `PointElement` (line points), `LinearScale`+`CategoryScale` (x/y), `Tooltip` (kcal tooltip), `Legend` (registered though display:false — keep to be safe), `Filler` (gradient `fill:true` areas), `ChartDataLabels` (datalabels plugin).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. `/` First Load JS should be ≤ Task 5's number (chart.js tree-shaken).

- [ ] **Step 3 ★C: Manual smoke test (USER) — scrutinize all 3 charts**

`npm run dev` → Thống kê. Verify NOTHING regressed vs Task 5:
- Weight line chart: line, gradient fill, points, datalabels.
- Kcal bars: stacked, single rounded cap per column, tooltip lists each meal, total datalabel on top, dashed target line.
- Macro lines: 3 smooth lines, gradient fills, white-cored points.
- No console error like `"... is not a registered ..."`.

If ANY chart is broken → `git revert` is not needed yet; instead identify the missing component, add it to the `Chart.register(...)` list, rebuild. If unrecoverable, abandon this commit (the lazy-load win from Task 5 stands on its own).

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/_components/StatsView.js
git commit -m "perf: register only the chart.js components StatsView uses (trim bundle)"
```

---

### Task 7 ★D: `React.memo` extracted components

**Files:**
- Modify: `app/dashboard/_components/MacroProgressBar.js`, `BottomNav.js`, `MindfulCard.js`, `StatsView.js`

- [ ] **Step 1: Wrap each extracted component in `React.memo`**

For each file, change the default export to a memoized component. Example (`BottomNav.js`):

```js
import React from 'react';
function BottomNav({ view, setView }) { /* unchanged */ }
export default React.memo(BottomNav);
```

Apply the same pattern to `MacroProgressBar`, `MindfulCard`, `StatsView`. Do NOT change their internals.

- [ ] **Step 2: Verify prop stability for the memo to help**

In `page.js`, `BottomNav` receives `setView` (stable state setter — fine). `StatsView` receives `pendingChangeRef` (ref — stable) and several values. `React.memo` does a shallow compare; setters/refs are stable, primitives compare by value. No callback props are created inline for these four, so no `useCallback` needed. Confirm by grep: none of the four are passed an inline `() =>` arrow or freshly-built object/array prop in `page.js`. If one is, memo won't help there — note it but don't over-engineer.

- [ ] **Step 3: Build** — `npm run build` → `✓ Compiled successfully`.

- [ ] **Step 4 ★D: Manual smoke test (USER)**

`npm run dev`:
- Gõ vào ô tìm món → danh sách lọc, KHÔNG giật; bottom nav / dashboard không nháy.
- Thêm/sửa/xóa món vẫn cập nhật tức thì.
- Đổi tab, đổi ngày vẫn đúng.

Confirm OK.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/_components
git commit -m "perf: memoize extracted components to cut whole-app re-renders"
```

---

### Task 8 ★E: Optimize localStorage cache writes (per-key change detection)

**Files:**
- Modify: `app/page.js` (the debounced cache effect added earlier, ~line 1015-1028)

- [ ] **Step 1: Split the single debounced write into per-key writes guarded by `useRef` of last-written value**

Replace the current single debounced effect with writes that only `setItem` a key when its serialized value changed since last write. Keep the 400ms debounce. Implementation:

```js
const lastCacheRef = useRef({});
useEffect(() => {
    if (!isClient) return;
    const id = setTimeout(() => {
        const writeIfChanged = (key, value) => {
            const s = JSON.stringify(value);
            if (lastCacheRef.current[key] !== s) { localStorage.setItem(key, s); lastCacheRef.current[key] = s; }
        };
        writeIfChanged('stayfit_profile', profile);
        writeIfChanged('stayfit_history', history);
        writeIfChanged('stayfit_custom_foods', customFoodList);
        writeIfChanged('stayfit_deleted_common', deletedCommonFoods);
        writeIfChanged('stayfit_dismissed_suggestions', dismissedSuggestions);
        if (view !== "profile" && userId) localStorage.setItem('stayfit_setup', 'done');
    }, 400);
    return () => clearTimeout(id);
}, [profile, history, customFoodList, deletedCommonFoods, dismissedSuggestions, view, userId, isClient]);
```

This stops re-serializing+rewriting `history` when only `view` (tab nav) changed.

- [ ] **Step 2: Build** — `npm run build` → `✓ Compiled successfully`.

- [ ] **Step 3 ★E: Manual smoke test (USER)**

`npm run dev`:
- Thêm món → đổi tab vài lần → reload trang: dữ liệu món còn nguyên (cache vẫn ghi đúng).
- Đổi hồ sơ → reload: hồ sơ còn nguyên.
- (DevTools → Application → Local Storage) các key cập nhật khi data đổi.

Confirm OK.

- [ ] **Step 4: Commit**

```bash
git add app/page.js
git commit -m "perf: only rewrite a localStorage cache key when its value actually changed"
```

---

### Task 9 (optional): Extract one cleanly-separable inline modal

Only attempt if a modal block inside `App`'s return reads few props and sets state via setters already in scope (so it can be a presentational component taking `{ value, onChange, onClose }`-style props). The inline `return (` blocks are at page.js ~1957/2007/2282/2450/2489/3005/3015/3035.

- [ ] **Step 1: Pick the lowest-coupling block** (e.g., the confirm/alert modal driven by `confirmModal` state) and extract it to `app/dashboard/_components/ConfirmModal.js` taking explicit props. Do NOT lift complex state.
- [ ] **Step 2: Build** — `npm run build` → `✓ Compiled successfully`.
- [ ] **Step 3 ★: Manual test** the affected modal opens/closes/acts correctly.
- [ ] **Step 4: Commit** — `git commit -m "refactor: extract <Modal> from page.js"`.

If no block is cleanly separable at moderate depth, SKIP this task (defer deep modal extraction to Phase 2).

---

## Final verification

- [ ] `npm run build` passes; record final `/` First Load JS vs baseline 308 kB.
- [ ] `git log --oneline` shows one commit per task; each is a clean rollback point.
- [ ] `app/page.js` line count dropped substantially (was 3376). Run `wc -l app/page.js`.
- [ ] All ★ checkpoints confirmed by user — behavior & visuals unchanged.
- [ ] Offer: open a PR for `refactor/foundation-phase1`, or continue to Phase 2 (UX).

## Self-review notes

- **Spec coverage:** Tasks 1-4 = structure split; Task 5 = lazy chart/scanner (scanner already `dynamic()`; this plan defers chart.js — the remaining initial-bundle item); Tasks 6/7/8 = the other 3 perf wins; Task 9 = optional modal. All spec items mapped.
- **Scanner note:** `BarcodeScanner` is ALREADY a `dynamic()` import (page.js:30), so the "lazy scanner" spec item is already satisfied — no task needed. Documented here so it isn't mistaken for a gap.
- **No automated tests:** intentional per approved spec; verification = build + ★ manual checkpoints.
