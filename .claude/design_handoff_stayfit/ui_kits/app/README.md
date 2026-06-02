# StayFit App — UI Kit

A high-fidelity, interactive recreation of the StayFit mobile app (the Next.js 15
PWA in `Stayfit-app-main/`). Built as React + JSX with Babel-in-browser so it
loads as a single HTML file. Every visual value comes from
`../../colors_and_type.css` — toggle the theme in the header (☼/☾) to flip
between the warm **Light** identity and the new **Nike dark** mode.

## What you can do here
- Tap **Tiếp tục với Google** on the login screen → enter the app.
- **Add foods** from the quick-pick library → calorie ring + macro donuts +
  meal sections update live.
- **+** on any meal to add a placeholder dish; hover a row to reveal **×** to
  remove. Numbers reflow with `tabular-nums`.
- Switch tabs **Nhật ký / Thống kê / Hồ sơ** in the floating bottom nav.
- **Theme toggle** in the header or in the Profile screen — instantly flips the
  whole app between light (terracotta) and dark (Nike green).
- **Đăng xuất** in Profile returns you to the login screen.

## File map
| File | What it is |
|---|---|
| `index.html` | Phone-frame host. Loads tokens + all JSX modules in order. |
| `Icons.jsx` | Lucide-style line icons (lifted from the codebase) + brand mark. |
| `Primitives.jsx` | `Card`, `Button`, `Eyebrow`, `CalorieRing`, `MacroDonut`. Everything else composes from these. |
| `Data.jsx` | Vietnamese food library, initial day log, week trend, meal themes, wellness quotes. |
| `Journal.jsx` | `GreetingHeader`, `CalorieHero` (ring + donuts + math), `MealSection`, `FoodItem`. |
| `AddFood.jsx` | The "Thêm món" card — segmented tabs, search, quick-pick grid. |
| `Secondary.jsx` | `WeeklyTrend`, `WaterCard`, `StatsScreen`, `ProfileScreen`, `BottomNav`, `LoginScreen`. |
| `App.jsx` | Shell — theme + login + view + log state, screen routing. |

## What's faked
This is a UI kit, not the production app. AI photo recognition, barcode lookup,
Supabase persistence, the avatar cropper, the onboarding wizard, drag-to-reorder
between meals, the food-library editor, and per-day navigation are **not**
wired — they're documented in the codebase but out of scope for the recreation.
Login auto-succeeds. Add-food's "Nhập tay" and "Ghép món" tabs are stubbed with
a one-line description.

## Going further
Read the components in `Stayfit-app-main/app/dashboard/_components/` for the
real shapes; the kit's `Primitives.jsx` matches their CSS variables and
geometry. Logos live in `../../assets/`; line icons match Lucide (load from
<https://lucide.dev> CDN if you want to extend the set). The whole design
language is documented in `../../README.md`.
