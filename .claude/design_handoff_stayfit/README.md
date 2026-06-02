# Handoff: StayFit App — Dark Mode "Volt" Identity + Tweakable Density

## Overview
A high-fidelity redesign of the **StayFit** mobile app (Vietnamese calorie & wellness tracker — production codebase: <https://github.com/quy31231231/Stayfit-app>, Next.js 15 PWA).

The redesign ships:
- A **warm Wellness identity** (Light theme — preserved from production: cream + terracotta orange).
- A new **athletic "Volt" identity** (Dark theme — near-black + Nike lime/emerald greens, Apple-Health-style data hierarchy).
- A redesigned **calorie hero** card: dominant 208 px ring, two-column "Đã nạp / Còn dư" data row, macro progress bars instead of donuts.
- **Three tweak controls** that reshape the feel without breaking the design system: Mood (Wellness ↔ Volt), Density (Spacious ↔ Compact), Macros Display (Bars / Donuts / Numbers).
- **Apple Health typography** — `ui-rounded` (SF Pro Rounded on Apple, Nunito fallback elsewhere).

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — interactive prototypes showing intended look and behavior, **not production code to copy directly**. Your job is to **recreate these designs in the StayFit Next.js 15 codebase** (`Stayfit-app-main/`) using its established patterns — Tailwind, custom hooks, `next/font/google`, dnd-kit, the existing `_components` folder structure.

The prototype uses Babel-in-browser + inline styles for portability; in production you should:
- Translate inline styles into Tailwind classes that consume the CSS variables in `colors_and_type.css`.
- Drop the CSS variables into `app/globals.css` and extend `tailwind.config.js` to expose them as theme tokens.
- Implement the `dark` mode by adding `class="dark"` to `<html>` (or use Tailwind's `darkMode: 'class'`).
- Reuse the existing `dashboard/_components/CalorieCircle`, `MacroDonut`, `DashboardCard`, `FoodLogItem`, etc — just update their styling and the new layout of `CalorieHero`.

## Fidelity

**High-fidelity (hifi).** Pixel-perfect: exact hex values, type sizes, weights, spacing, radii, shadows, and interaction states are documented below and embodied in the JSX. The developer should reproduce the visuals 1:1 in production, using Tailwind classes wired to the new design tokens.

## Design Tokens

All tokens live in `colors_and_type.css` as CSS custom properties. The same token name flips value when `<html class="dark">` is on — that's how the Mood tweak works.

### Color tokens

| Token | Light value | Dark value | Used for |
|---|---|---|---|
| `--cream` | `#FBF8F2` | `#0E0E0E` | App background |
| `--cream-soft` | `#F4EFE6` | `#1F1F1F` | Inset / input / track |
| `--cream-deep` | `#EBE3D2` | `#2A2A2A` | Hairline borders |
| `--surface` | `#FFFFFF` | `#1A1A1A` | Cards |
| `--ink` | `#2D2620` | `#F5F5F5` | Primary text |
| `--ink-muted` | `#7A7066` | `#9E9E9E` | Secondary text |
| `--ink-faint` | `#B8AFA4` | `#6B6B6B` | Tertiary / placeholder |
| `--orange` | `#D97757` (terracotta) | `#22C55E` (emerald) | **Primary fill** — buttons, FAB, badges |
| `--orange-soft` | `#F7E8DC` | `#0E2A1A` | Tinted tile / chip bg |
| `--orange-deep` | `#7A3318` | `#89F336` (lime) | **Accent text** — wordmark color, "Còn dư" number |
| `--on-accent` | `#FFFFFF` | `#0A0A0A` | Text on `--orange` fill |
| `--protein` | `#7E9A84` (sage) | `#7E9A84` | Protein everywhere |
| `--protein-soft` | `#DDE7DC` | `#182320` | Tinted protein bg |
| `--protein-deep` | `#2D4632` | `#7E9A84` | Protein accent text |
| `--carb` | `#C9AC74` (clay) | `#C9AC74` | Carb everywhere |
| `--carb-soft` | `#F0E5CC` | `#26200F` | Tinted carb bg |
| `--fat` | `#A99CC2` (lilac) | `#A99CC2` | Fat everywhere |
| `--fat-soft` | `#E5DDED` | `#1F1B2A` | Tinted fat bg |
| `--water` | `#8CA9BA` (mist) | `#8CA9BA` | Water |
| `--ring-cal-from` | `#E89B7B` | `#89F336` | Calorie ring gradient start |
| `--ring-cal-to` | `#D97757` | `#5BB820` | Calorie ring gradient end |
| `--ring-track` | `#F4EFE6` | `#1F1F1F` | Calorie ring track |
| `--hairline` | `rgba(45,38,32,0.06)` | `rgba(255,255,255,0.12)` | Subtle borders |
| `--focus` | `#D97757` | `#89F336` | Focus outline |

### Shape tokens

| Token | Value | Used for |
|---|---|---|
| `--r-sm`   | `12px` | chips, small controls |
| `--r-md`   | `16px` | inputs, list rows |
| `--r-lg`   | `24px` | **cards (signature radius)** |
| `--r-xl`   | `40px` | sheets, bottom nav top corners |
| `--r-pill` | `999px` | badges, FAB, avatars |

### Spacing scale (4 px base)
`--s-1: 4px · --s-2: 8px · --s-3: 12px · --s-4: 16px · --s-5: 20px · --s-6: 24px · --s-8: 32px · --s-10: 40px`

### Shadow tokens

| Token | Light value | Dark value | Used for |
|---|---|---|---|
| `--shadow-soft` | `0 1px 2px rgba(45,38,32,0.04), 0 8px 24px -12px rgba(45,38,32,0.08)` | `0 1px 2px rgba(0,0,0,0.40), 0 8px 24px -12px rgba(0,0,0,0.70)` | Resting cards |
| `--shadow-lift` | `0 4px 12px -4px rgba(45,38,32,0.12), 0 16px 40px -16px rgba(45,38,32,0.20)` | `0 4px 12px -4px rgba(0,0,0,0.55), 0 16px 40px -16px rgba(0,0,0,0.80)` | Hover / sheet / FAB |
| `--shadow-ring` | `inset 0 0 0 1px rgba(45,38,32,0.06)` | `inset 0 0 0 1px rgba(255,255,255,0.08)` | Hairline inner ring |

### Atmospheric background (dark only)
```css
--bg-atmosphere:
  radial-gradient(ellipse 90% 60% at 50% 0%,   rgba(137,243,54,0.10), transparent 70%),
  radial-gradient(ellipse 80% 100% at 50% 100%, #050505, transparent 60%);
```
Apply on the app shell when `dark` is active — gives the Apple-Watch-style green glow falling from the top.

### Typography
**Font stack** (`--font-sans`):
```css
ui-rounded,                              /* → SF Pro Rounded on macOS / iOS / iPadOS */
-apple-system, BlinkMacSystemFont,       /* → SF Pro fallback */
"SF Pro Rounded", "SF Pro Display",      /* local install */
"Nunito",                                 /* Google Fonts cross-platform twin */
system-ui, sans-serif;                   /* safe fallback */
```
Load Nunito via `next/font/google` (weights `400, 500, 600, 700, 800`).

**Type scale (semantic classes — see `colors_and_type.css`):**
| Role | weight | size | line-height | tracking |
|---|---|---|---|---|
| `.t-display` (calorie hero number) | 800 | clamp(40, 8vw, 56) | 0.95 | -0.03em |
| `.t-wordmark` (STAYFIT lockup) | 800 italic | — | — | -0.04em uppercase |
| `.t-h1` (greeting) | 700 | 26 | 1.15 | -0.012em |
| `.t-h2` (section) | 700 | 18 | 1.2  | -0.012em |
| `.t-h3` (card title) | 700 | 15 | 1.25 | -0.012em |
| `.t-body` | 500 | 13 | 1.5 | -0.012em |
| `.t-small` | 500 | 11 | 1.4 | — |
| `.t-eyebrow` (uppercase labels) | 600 | 10 | 1 | 0.14–0.16em uppercase |
| `.t-num` | tabular-nums on numbers everywhere |

## Screens / Views

### 1. Login screen (`LoginScreen`)
- **Purpose**: Sign in or sign up. Auto-succeeds in the prototype.
- **Layout**: Full-bleed colored field (`--orange` in light, near-black `#0A0A0A` in dark); two blurred color blobs as atmosphere; centered frosted-glass card (36 px radius, `backdrop-filter: blur(24px)`, white-tint `12%` light / `4%` dark, 1 px white-tint border) holding STAYFIT wordmark, copy, Google button, divider, phone + password inputs, primary CTA.
- **Components**:
  - **Wordmark**: `STAYFIT` — `t-wordmark`, 38 px, weight 800, italic, `-0.04em`, color `#fff`.
  - **Subtitle** (changes per mood):
    - Light: *"Đăng nhập để đồng bộ dữ liệu của bạn"*
    - Dark: *"Sẵn sàng cho buổi tập tiếp theo."*
  - **Google button**: white bg, 18 px radius, 14 px / weight 700 text, 14 px vertical pad. Text color is always `#2D2620` (never theme-dependent — button is always white).
  - **Phone / password inputs**: full-width pills, 16 px radius, semi-transparent white bg (`rgba(255,255,255,0.2)` light / `0.06` dark), white text + placeholder, centered, weight 700.
  - **Primary CTA**: 18 px radius, uppercase 13 px weight 800, `0.1em` letter-spacing.
    - Light: white bg + `--orange` text.
    - Dark: `#22C55E` (emerald) bg + `#0A0A0A` ink (~7:1 contrast), with a green glow shadow `0 12px 30px -8px rgba(34,197,94,0.5)`.
  - **Theme toggle** (top-right): 40 px round, frosted, `IcSun`/`IcMoon`.
- **Behavior**: any button → `onLogin()`. Theme toggle flips Mood without leaving the login screen.

### 2. Journal — Greeting header (`GreetingHeader`)
- **Purpose**: Date + personalized greeting + theme toggle.
- **Layout**: row, `align-items: flex-start`, `gap: 12`.
- **Components**:
  - **Date pill**: `Thứ Ba, 3 tháng 6` — `--protein-soft` bg, `--protein-deep` text, 6×12 padding, pill radius, eyebrow type.
  - **Heading**: `Chào buổi sáng, <name>` — `.t-h1`. The `<name>` span is colored `--orange-deep` (terracotta-burnt in light, lime in dark). When `compact`, font size shrinks to 22 px.
  - **Wellness quote** (light only / hidden in compact): 13 px / 500 / `--ink-muted` — rotates among 4 mantras.
  - **Theme toggle**: 44 × 44, `--r-md`, `--surface` bg, `IcSun`/`IcMoon`, soft shadow + ring.
- **Behavior**: theme toggle calls `setTweak('mood', mood==='volt'?'wellness':'volt')`.

### 3. Journal — Calorie hero (`CalorieHero`)
**The key composition.** Card with `tone="white"`, padding 24 (`compact` → 18), overflow hidden.

Three stacked zones, separated by 1 px `--hairline` borders:

1. **Ring zone** — centered `CalorieRing`:
   - **Size**: 208 (spacious) / 152 (compact).
   - **Stroke**: 14 px round-cap.
   - **Track**: `--ring-track`.
   - **Progress**: gradient `--ring-cal-from → --ring-cal-to`, rotated -90°. Animates `stroke-dashoffset` over 600 ms ease-out.
   - **Center label**: stacked `eyebrow` ("Còn lại" / "Vượt" / "Hoàn thành") + 40 px / weight 800 / `-0.03em` tabular number ("973" or "+120") + 11 px target tag ("/ 2.000 kcal").
   - When `consumed > target`, eyebrow + number switch to a red theme; the prototype uses the same gradient but in production swap to `--ring-over-from → --ring-over-to`.

2. **Data row** — 2-column grid (`1fr 1fr`, gap 16, top-padded `14px`):
   - **Left ("Đã nạp")**: eyebrow + 22 px / 800 / `-0.03em` consumed value + small `/ {target} kcal` after.
   - **Right ("Còn dư" / "Vượt")**: same shape, right-aligned. Eyebrow + value colored `--orange-deep` normally, `#C94040` when over. Format: `vn(remaining)` or `+vn(over)` with `kcal` unit after.
   - All numbers are `tabular-nums` with Vietnamese locale formatting (`toLocaleString("vi-VN")` → `1.027`, `2.000`).

3. **Macros zone** — switches by `macros` tweak (top-padded `16px`, top border):
   - **`bars`**: 3 columns (flex, gap 16). Each: eyebrow in macro color + 20 px / 800 number + small `/ {target}g` + 4 px tall progress pill (track = `--{macro}-soft`, fill = `--{macro}`).
   - **`donuts`**: 3 columns (grid 1fr/1fr/1fr). Each: a 74 px (60 px compact) circular `MacroDonut` (9 px stroke, gradient track/fill, center label). Component already exists in production at `app/dashboard/_components/MacroDonut.js` — reuse and recolor via `--{macro}` tokens.
   - **`numbers`**: 3 columns (flex). Each: eyebrow + giant 28 px / 800 / `-0.04em` number + tiny `g` unit. No progress visualization.

### 4. Journal — Add food (`AddFood`)
- **Purpose**: Quick-add foods to the selected meal.
- **Header**: tinted `--orange-soft` square tile (44 px, `--r-md`) with `IcPlus` in `--orange-deep`, then "Thêm món" `.t-h3`. Right side: a row of three round AI buttons (camera, edit, barcode) and the meal-select dropdown.
- **AI buttons**: 36 × 36 round, two filled `--orange` with `--on-accent` icon, one filled `--ink` with `--cream` icon (the barcode contrast button).
- **Meal selector**: native `<select>` styled to a chip — `--cream-soft` bg, 11 px / 600, `IcChevD` overlay, pill radius.
- **Segmented tabs**: 3-way control (`Chọn nhanh` / `Nhập tay` / `Ghép món`) — see "Segmented control" pattern below.
- **Search input**: full-width, 12 px radius, 38 px left pad for the `IcSearch` overlay icon, `--cream-soft` bg, 1 px `--cream-deep` border, 13 px text.
- **Quick-pick grid**: 2-column grid, gap 8, max-height 220 + scroll. Each cell: `--cream-soft` bg, 16 px radius, 1 px `--hairline`, 11×13 padding. Bold dish name (12.5 px / 700) over a metadata line: **`<kcal>`** in `--ink` weight 700, then `kcal/<unit>` in 11 px / 500 / `--ink-muted` (see "Ức gà áp chảo · **246** kcal/150g").

### 5. Journal — Meal section (`MealSection`)
- **Per-meal card** (`tone="white"`, pad 18) for each of: Bữa sáng / Bữa trưa / Bữa tối / Ăn vặt.
- **Header**: emoji-in-tinted-tile (44 px, `--r-md`, `TONE_BG[theme.tone]`), meal name `.t-h3`, count + total kcal underneath (`{n} món · {total} kcal`).
- **Right control**: 40 px round chip with `IcPlus`.
- **Item rows** (`FoodItem`): horizontal flex, 11×14 pad, 16 px radius. Hover → `--cream-soft` bg + reveals delete `IcX` button. Left column: dish name 13/700 + macros line (`<qty><unit> · <green>P</green>/<gold>C</gold>/<purple>F</purple>`). Right column: bold total kcal + small "kcal" unit + delete button.
- **Empty state**: dashed-border `Ghi món cho <meal>` CTA in `--ink-muted`.

### 6. Stats screen (`StatsScreen`)
- **Eyebrow `Thống kê` + h1 `Tuần này`**.
- **Weekly trend card** (`WeeklyTrend`): 7-day bar chart. Dashed target line. Bars colored by status (sage/lilac/orange). Legend at bottom.
- **Water card** (`WaterCard`): drop emoji tile + grid of 8 squares filled per glass consumed (`--water` fill / `--cream-soft` track).
- **Mindful tinted card** (`tone="sage"`): icon tile + headline + supportive 2-line body.

### 7. Profile screen (`ProfileScreen`)
- **Avatar block**: 84 × 84 `--orange` square, initial letter centered, weight 800.
- **Name + tagline** under it.
- **Targets card**: 4-row list with `border-bottom: 1px solid --hairline` separators — Năng lượng / Protein / Carb / Fat.
- **Theme toggle row**: full-width row in a card. Left: icon + label (`Giao diện tối · Nike` / `Giao diện sáng`). Right: iOS-style toggle pill — 46 × 27, knob slides between left=3 and right=22, bg goes from `--cream-deep` to `--orange`.
- **Đăng xuất button**: tinted `--cream-soft`, no border, 13 px / weight 700.

### 8. Bottom nav (`BottomNav`)
- Absolute, bottom 0, full width.
- Backdrop blur on a 92 %-tint `--surface` bg, 1 px top hairline, `--r-xl` top corners.
- 3 tabs: Nhật ký / Thống kê / Hồ sơ — each a centered icon over a 9 px uppercase label, `-0.02em` letter-spacing, weight 700.
- Active tab: color `--orange` + scale 1.08.
- Inactive: color `--ink-faint`, opacity 0.6.
- **Important transition rule**: animate `transform` and `opacity` ONLY, NOT `color` — animating `color` here causes a Chromium var-evaluation freeze when the theme changes (we hit this bug; documented in Pattern Notes below).

## Patterns & Components

### Card (`Card`)
- `border-radius: var(--r-lg)` (24 px), `padding: 18` default (configurable).
- `tone="white"` → `--surface` bg + `--shadow-soft, --shadow-ring`.
- `tone="sage|clay|lilac|mist|orange"` → respective `--{macro}-soft` bg + `--shadow-soft`.

### Button (`Button`)
- **Primary**: `--orange` bg, `--on-accent` text, `--r-md`, 13×20 pad, soft shadow.
- **Chip**: `--cream-soft` bg, `--ink` text, pill radius, ring shadow.
- **Ghost**: transparent bg, `--orange-deep` text, pill radius.
- **All**: press → `transform: scale(0.96)` via pointer handlers.
- **FAB**: 56 × 56 round, primary fill + lift shadow.

### Segmented control
- Wrapper: `display:flex`, 4 px padding, `--cream-soft` bg, 16 px radius.
- Tabs: `flex:1`, 9 px vertical pad, 12 px / 600 text, 12 px radius.
- Selected: `--surface` bg, `--orange-deep` text, `--shadow-ring`.
- Unselected: transparent, `--ink-muted`.

### Eyebrow
10 px / 600, uppercase, `0.14em` tracking, `--ink-muted` color (or recolored via prop).

### Tweaks panel (3 controls)
- **Mood** radio: Wellness (`mood: "wellness"`) ↔ Volt (`mood: "volt"`). Toggles dark class.
- **Density** radio: Spacious ↔ Compact. Threads `compact` prop to GreetingHeader, ring size, card padding, screen gap.
- **Macros Display** radio: Bars / Donuts / Numbers. Switches the macros zone of `CalorieHero` between three render modes.
- Defaults: `mood: "wellness", density: "spacious", macros: "bars"`.

## Interactions & Behavior

- **Login** — any button calls `onLogin()`; sets `loggedIn` state. In production this is the existing Supabase phone-auth flow at `app/page.js` (lines ~115+). Theme toggle on login flips Mood inline.
- **Theme toggle** — header button + Profile row + Login top-right ALL call the same handler. Stores `theme: "light"|"dark"` and adds/removes `class="dark"` on the phone shell.
- **Add food** — Quick-pick cell click → appends a new `Log` entry to the selected meal, recalculates totals via `useMemo`, ring + macros animate via `stroke-dashoffset 0.6s ease-out` / `width 0.6s ease-out`.
- **Remove food** — hover row reveals `IcX`; click removes by id.
- **Meal +** button — inserts a placeholder dish into that meal. In production this should open the existing food-picker sheet at `dashboard/_components` (drag-reorder via dnd-kit).
- **List entrance** — each meal section uses a `.rise` animation: `translateY(8px) → 0, opacity 0 → 1, 0.5s ease-out` with `70 ms × index` stagger.
- **`prefers-reduced-motion: reduce`** — all `.rise` and `.pulse` animations are disabled.

## State Management

Three top-level states drive the journal screen:
- `tweaks` — persisted to localStorage by `useTweaks` (see `tweaks-panel.jsx`). Keys: `mood`, `density`, `macros`. In production: replace with your settings store; map `mood` to your existing dark-mode flag.
- `log` — array of `{ id, meal, name, quantity, unit, kcal, protein, carb, fat }`. Replace with the Supabase-backed log already in production (`app/page.js` `meals` state).
- `selectedMeal` — string, one of `"Bữa sáng" | "Bữa trưa" | "Bữa tối" | "Ăn vặt"`. Controls which meal a quick-pick lands in.

Derived (`useMemo`):
- `totals` — reduces `log` into `{ kcal, protein, carb, fat }`.
- `byMeal` — groups `log` by `meal` for the four meal sections.

## Assets
- `assets/icon.svg` — gradient orange brand mark (light theme + favicon).
- `assets/icon-dark.svg` — Nike-green brand mark variant for dark contexts. Generated by recoloring the light icon.
- `assets/icon-maskable.svg` — PWA full-bleed maskable icon.
- **No stock photography is used in the design** — the only photographic surfaces in production are user-uploaded meal photos. Render those as 1:1 squares with `--r-md` radius, served via signed URLs (Cloudflare R2 in production).

## Iconography
- **Lucide-style inline SVG line icons** — `stroke="currentColor"`, `fill="none"`, `stroke-width: 2–2.5`, round caps and joins, 24 × 24 viewBox. They inherit text color and recolor in dark mode automatically.
- The set in use is exported from `Icons.jsx`: `IcUser, IcEdit, IcPlus, IcSearch, IcStats, IcCamera, IcBarcode, IcX, IcChevL, IcChevR, IcChevD, IcSun, IcMoon, IcCheck`.
- In production install `lucide-react` and import the matching names — they are pixel-exact equivalents.
- **Emoji are used deliberately as category glyphs** (☀️ breakfast, 🌤 lunch, 🌙 dinner, ⭐ snack, 💧 water, 🧘 mindful, 🥗 nutrition), inside tinted rounded tiles. **Never** use emoji as UI control icons.

## Pattern Notes (production gotchas we hit)

1. **`transition: all` + CSS-var flips = broken color**. When you flip `class="dark"` on an ancestor, child elements that have `transition: all` (or `transition: color/background`) will sometimes freeze their resolved `var(--…)` value at the pre-flip state in Chromium. **Always scope transitions to specific non-color properties** (e.g. `transition: transform .25s, opacity .25s`). We hit this on `.phone` (background) and `BottomNav` tab (color). See active-tab + theme-toggle flow.
2. **`var(--ink)` on white-background buttons**. When a button is always white (Google sign-in, primary CTA on login), hard-code its text color — don't let it inherit `--ink`, or it goes invisible in dark mode where `--ink` is white.
3. **On-accent contrast in Volt mode**: `--orange` is emerald `#22C55E` which is bright; pair it with `--on-accent: #0A0A0A` (deep ink), never with white. Contrast is ~7:1. The bright lime `#89F336` is reserved for *accent text* only (ring, "Còn dư", eyebrow brand color) — never for button fills.

## Files in this handoff

| Path | What it is |
|---|---|
| `README.md` | This document. |
| `colors_and_type.css` | Source of truth for all design tokens. Drop into `app/globals.css` or import directly. |
| `assets/` | Brand marks (`icon.svg`, `icon-dark.svg`, `icon-maskable.svg`). |
| `ui_kits/app/index.html` | The interactive prototype host — loads React + Babel + JSX modules. |
| `ui_kits/app/Icons.jsx` | Inline Lucide-style icons + brand mark renderer. |
| `ui_kits/app/Primitives.jsx` | `Card`, `Button`, `Eyebrow`, `CalorieRing`, `MacroDonut`. |
| `ui_kits/app/Journal.jsx` | `GreetingHeader`, `CalorieHero`, `FoodItem`, `MealSection`. |
| `ui_kits/app/AddFood.jsx` | The "Thêm món" card with tabs, search, quick-pick grid. |
| `ui_kits/app/Secondary.jsx` | `WeeklyTrend`, `WaterCard`, `StatsScreen`, `ProfileScreen`, `BottomNav`, `LoginScreen`. |
| `ui_kits/app/App.jsx` | Shell — wires tweaks + theme + login + view routing. |
| `ui_kits/app/Tweaks.jsx` | The 3-control tweaks panel (Mood / Density / Macros). |
| `ui_kits/app/tweaks-panel.jsx` | Tweaks panel runtime (useTweaks hook, segmented controls). |
| `ui_kits/app/Data.jsx` | Vietnamese food library + initial day log + meal themes + quotes. |
| `StayFit App.html` | The full prototype bundled as a single offline-capable HTML file. Open it in any browser to interact with the design before re-implementing. |

## Suggested implementation order (Next.js / Tailwind)

1. **Tokens first** — copy `colors_and_type.css` into `app/globals.css` and extend `tailwind.config.js` `theme.extend.colors` so Tailwind classes like `bg-cream`, `bg-orange`, `text-ink-muted` work. Switch `darkMode: 'class'`.
2. **Icons** — `npm i lucide-react`; replace the inline icons in `_components` with `lucide-react` imports of the same names.
3. **CalorieCircle / CalorieHero** — refactor `dashboard/_components/CalorieCircle.js` to the new 208 / 152 sizes and the gradient via `var(--ring-cal-from/to)`. Build the new two-column "Đã nạp / Còn dư" row and macro bars (a new `MacroBar` component alongside the existing `MacroDonut`).
4. **Theme + density store** — add a `useUiPrefs` Zustand/context hook with `mood`, `density`, `macros`. Persist via `localStorage`. Thread `compact` and `macros` down to `CalorieHero`.
5. **Login screen** — wire the dark variant in `app/page.js` by reading `mood` from prefs at the root.
6. **Bottom nav** — fix the `transition: all` bug if present in production.

A developer should be able to ship a full pass in ~1 day starting from this README + the JSX files as visual reference.
