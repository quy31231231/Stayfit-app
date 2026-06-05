# StayFit — Phase 1: Nền móng (Cấu trúc + Hiệu năng) — Design

**Date:** 2026-06-05
**Status:** Approved (proceed continuously)
**Scope:** Phase 1 of a 3-phase upgrade roadmap. Phases 2 (UX) and 3 (Features) get their own spec → plan cycles later.

## Bối cảnh / Vấn đề

`app/page.js` ~3376 dòng gói **toàn bộ app trong một component `App`**. Hệ quả:

- **Hiệu năng:** mọi thay đổi state (gõ search, đổi `qty`, đổi tab…) re-render toàn bộ cây component khổng lồ. `chart.js` (+datalabels) và `zxing` nằm trong bundle ban đầu dù chỉ dùng ở tab Thống kê / scanner.
- **Bảo trì:** helper thuần, hằng số, data tĩnh, icon, và nhiều view/modal đều nhồi trong một file → khó đọc, khó sửa, dễ bug.

Đã sửa 2 điểm an toàn trước khi vào Phase 1 (commit đầu tiên của nhánh refactor):
- Debounce ghi cache localStorage (không serialize `history` trên render path mỗi lần state đổi).
- Đọc localStorage có try/catch (1 key hỏng không làm vỡ khởi tạo app).

## Mục tiêu Phase 1

Refactor **thuần** (zero behavior change) `page.js` thành các đơn vị có ranh giới rõ, kèm 4 tối ưu hiệu năng đã chốt. Giao diện & hành vi giữ y hệt.

## Ràng buộc & Quyết định (đã chốt với user)

| Quyết định | Lựa chọn |
|---|---|
| Hướng | Phase 1 = Cấu trúc + Hiệu năng (gộp, vì cùng một việc) |
| Chống hồi quy | Tách **từng bước**, build pass mỗi bước, user **test tay** ở các mốc ★ |
| Độ sâu tách | **Vừa phải**: helper/data/icon ra file; view lớn (StatsView) + leaf component ra file. **KHÔNG** đổi state management (giữ `useState` ở App, truyền props) |
| Perf đi kèm | (1) Lazy-load chart + scanner, (2) `React.memo` component tách ra, (3) Trim chart.js (selective import — *rủi ro, cô lập 1 commit*), (4) Tối ưu ghi localStorage |
| Modal lồng | Tách thận trọng/một phần ở bước cuối, chỉ khi gỡ sạch được |

## Cấu trúc thư mục mục tiêu

Bám quy ước repo (`app/_data/`, `app/_components/`, `app/dashboard/_components/`):

```
app/_lib/
  format.js      # formatDate, calcMacro
  food.js        # removeAccents, normalizeFoodLookup, normalizeFoodGroupKey, suggestQty, unitToGrams
  barcode.js     # isValidGtin, gs1Country (+ GS1_PREFIXES nội bộ)
  misc.js        # normPhone, generateUniqueTimestamp, getMealByHour, mentionsMealInText
app/_data/
  constants.js   # ACTIVITY_LEVELS, GOALS, MEAL_TYPES, TEXT_SUGGESTIONS, UNIT_GRAM_WEIGHTS
  diet-modes.js  # DIET_MODES
  common-foods.js (đã có)
app/_components/
  icons.js       # 8 Icon SVG (IconUser, IconJournal, ...)
  AvatarCropper.js / OnboardingWizard.js (đã có)
app/dashboard/_components/
  StatsView.js       # lazy-loaded; chứa chart.js + selective register
  MacroProgressBar.js
  BottomNav.js
  MindfulCard.js
  (các component đã có giữ nguyên)
```

> Lựa chọn thay thế đã loại: nhét helper vào `lib/` top-level — `lib/` đang là hạ tầng (supabase/r2), trộn helper UI vào sẽ rối.

## Trình tự thực thi (mỗi bước = 1 commit + `npm run build` pass; ★ = mốc user test tay)

| Bước | Việc | Rủi ro | Verify |
|------|------|--------|--------|
| 1 | Helper thuần → `app/_lib/*` | ~0 | build |
| 2 | Constants + DIET_MODES → `app/_data/*` | ~0 | build |
| 3 | Icons → `app/_components/icons.js` | ~0 | build |
| 4 | `MacroProgressBar`, `BottomNav`, `MindfulCard` → file | thấp | build **★A**: nav + dashboard render |
| 5 | `StatsView` → file + `dynamic()` lazy (chart.js rời initial bundle) | TB | **★B**: charts/cân nặng/click cột → journal |
| 6 | Trim chart.js: thay `chart.js/auto` bằng selective `Chart.register(...)` trong StatsView | **cao** (cô lập 1 commit) | **★C**: cả 3 biểu đồ (cột/đường/cân nặng) đúng |
| 7 | `React.memo` các component đã tách | thấp | **★D**: gõ search không lag, mọi thứ vẫn cập nhật |
| 8 | Tối ưu ghi localStorage (chỉ ghi key khi data của nó đổi) | thấp | **★E**: thêm/sửa/xóa món → reload còn nguyên |
| 9 | (tùy chọn) tách modal lồng nào gỡ sạch được | TB | ★ |

## Data flow / Nguyên tắc

- State vẫn `useState` ở `App`; component con nhận props (StatsView vốn đã nhận props → không phát sinh prop-drilling mới đáng kể).
- Pure refactor: không sửa logic kèm theo, trừ 4 mục perf đã chốt. Mỗi mục perf nằm ở bước riêng để cô lập rủi ro.
- Mỗi bước 1 commit → rollback sạch theo bước.

## Tiêu chí thành công (đo được)

1. `npm run build` pass sau **mỗi** bước.
2. Hành vi & giao diện không đổi (xác nhận qua các mốc ★).
3. **First Load JS của route `/` giảm** (baseline: 308 kB, page chunk 123 kB) nhờ defer chart.js + zxing — đo trước/sau.
4. `page.js` ngắn đi rõ rệt; helper/data/component có ranh giới rõ, import 2 chiều sạch (không vòng).

## Rủi ro & Giảm thiểu

- **Bước 6 (chart.js trim)** dễ vỡ biểu đồ nhất → 1 commit riêng; hỏng thì revert mình nó.
- **Lazy StatsView** có thể nháy "loading" khi mở tab Thống kê → fallback nhẹ (skeleton/spinner).
- **Import vòng** giữa `_lib`/`_data` → giữ helper thuần không phụ thuộc data, data không import helper.

## Ngoài phạm vi (Phase 2/3)

- Đổi state management (Context/reducer), tách toàn bộ modal lồng sâu.
- UX polish (skeleton toàn app, empty states, a11y, animation) → Phase 2.
- Tính năng mới → Phase 3 (cần brainstorm riêng).
