# StayFit — Phase 2: Trau chuốt UX — Design

**Date:** 2026-06-05
**Status:** Approved scope (4 pillars), design pending user spec review
**Scope:** Phase 2 of the 3-phase roadmap. Builds on Phase 1 (component extraction, in progress on branch `refactor/foundation-phase1`).

## Bối cảnh

Phase 1 tách `page.js` thành modules + perf. Phase 2 nâng trải nghiệm: app hiện dùng `alert()` gốc cho mọi phản hồi (chói, chặn thao tác), thiếu loading state (dashboard nhấp nháy, tab Thống kê chỉ có chữ "Đang tải biểu đồ…"), các màn rỗng trơ trụi, và chuyển động rời rạc.

## Mục tiêu (4 trụ cột — đã duyệt)

1. **Toast** thay 7 lần gọi `alert()` trong `page.js`.
2. **Loading skeleton** cho dashboard + biểu đồ.
3. **Empty states** tái dùng ở 3 chỗ.
4. **Micro-animation**: mở rộng `auto-animate` (đã có) + đếm số vòng calo.

## Ràng buộc & Quyết định

| Quyết định | Lựa chọn |
|---|---|
| Chống hồi quy | Tách từng nhóm, `npm run build` pass mỗi bước, user test tay ở mốc ★ |
| Pure vs behavior | Toast **đổi hành vi** (alert→toast) — test từng call; 3 trụ còn lại thuần thêm UI |
| State mgmt | Giữ nguyên; Toast dùng **singleton pub/sub** (không Context, không wrapper export) |
| Nhánh | Tiếp tục sau khi Phase 1 hợp nhất, hoặc nhánh `feat/phase2-ux` riêng (quyết khi writing-plans) |

## Kiến trúc & Components

### 1. Toast — `app/_components/Toast.js`
- **API singleton** (kiểu react-hot-toast): export `toast` với `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`; backed bởi store pub/sub nhỏ (mảng + listeners). Export component `<Toaster/>` subscribe store và render stack.
- **Vì sao singleton, không Context:** 7 `alert()` nằm trong event handler của `App` (và `saveWeight` ở `StatsView`). Context yêu cầu Provider ở trên consumer → phải bọc/đổi default export. Singleton gọi được từ bất kỳ đâu (kể cả ngoài cây React) → 0 tái cấu trúc.
- **Hiển thị:** `<Toaster/>` đặt 1 lần trong return của `App`. Vị trí: fixed, bottom-center, trên bottom-nav (`bottom: ~88px`), `max-w-md mx-auto`. Mỗi toast: pill bo tròn, ink nền (success/info) hoặc orange-deep (error), icon ✓/⚠/ⓘ. Tự ẩn 2.5s, trượt lên + mờ; `prefers-reduced-motion` → ẩn/hiện tức thì. Bấm để đóng sớm.
- **Thay thế:** 7 `alert("…")` → `toast.error("…")` (validation/lỗi) hoặc `toast.success(...)` (thành công). `StatsView` nhận `toast` qua import trực tiếp (singleton) — không cần prop.

### 2. Skeleton — `app/_components/Skeleton.js`
- `Skeleton({ className })`: div shimmer dùng token cream (`--cream-soft`/`--cream-deep`) — tự đổi theo sáng/tối.
- `ChartSkeleton`: khung biểu đồ (vòng + cột giả) → thay `loading: () => <div>Đang tải biểu đồ…</div>` trong `dynamic(() => import StatsView)`.
- `DashboardSkeleton`: vòng calo + thanh macro + vài dòng log giả, hiện khi `!dataLoadedRef`/đang nạp lần đầu (chỉ khi đã đăng nhập mà chưa có dữ liệu).

### 3. EmptyState — `app/_components/EmptyState.js`
- `EmptyState({ icon, title, subtitle, action })` — `action` là `{ label, onClick }` tùy chọn. Style: căn giữa, icon lớn, nút cam bo tròn.
- Dùng ở: (a) ngày Nhật ký không có món, (b) tìm món không ra kết quả, (c) lịch sử cân nặng rỗng.

### 4. Micro-animation
- `useAutoAnimate` (đã dùng ở `FoodLogSection.js`) mở rộng cho: danh sách kết quả tìm món, danh sách nguyên liệu công thức.
- `useCountUp(value, ms)` — hook nhỏ animate số (vòng calo `dailyKcal`) từ giá trị cũ → mới bằng `requestAnimationFrame`; `prefers-reduced-motion` → set thẳng.
- Không thêm thư viện mới (auto-animate đã có trong deps).

## Data flow
- Toast store sống ngoài React (module singleton) → bất biến giữa render, không gây re-render App. `<Toaster/>` là consumer duy nhất re-render khi có toast.
- Skeleton/EmptyState là presentational thuần (props), không state toàn cục.

## Trình tự thực thi (mỗi nhóm = 1 commit + build pass; ★ = test tay)

| Bước | Việc | Verify |
|------|------|--------|
| 1 | `Toast.js` (store + `<Toaster/>`) + thả `<Toaster/>` trong App | build |
| 2 | Thay 7 `alert()` → `toast.*` (page.js + StatsView) | **★** từng thông báo bật đúng loại |
| 3 | `Skeleton.js` + `ChartSkeleton` cho StatsView fallback + `DashboardSkeleton` | **★** mở tab Thống kê / nạp đầu |
| 4 | `EmptyState.js` + gắn 3 chỗ | **★** ngày trống / tìm trống / cân trống |
| 5 | auto-animate mở rộng + `useCountUp` vòng calo | **★** thêm/xóa món mượt, số đếm lên, reduced-motion OK |

## Tiêu chí thành công
1. `npm run build` pass mỗi bước.
2. 0 `alert()` còn lại trong `page.js` (`grep` xác nhận).
3. Tab Thống kê / nạp đầu hiện skeleton thay vì trống.
4. 3 màn rỗng có empty state.
5. List động mượt; số vòng calo đếm lên; `prefers-reduced-motion` tắt chuyển động.

## Rủi ro & Giảm thiểu
- **Toast đổi hành vi**: một số `alert()` có thể đứng sau `return` chặn luồng (vd validation rồi `return`). Khi thay phải giữ nguyên `return` — chỉ đổi cách hiển thị, không đổi control flow.
- **`<Toaster/>` z-index**: phải trên modal? Không — toast dưới đáy, modal full-screen; đặt z-index toast cao hơn nav nhưng cân nhắc với overlay. Test với modal mở.
- **Reduced-motion**: dùng class CSS + media query (globals.css đã có) thay vì animation JS cứng.

## Ngoài phạm vi (sau)
- Toast nâng cao (queue limit, undo action, vị trí cấu hình).
- Skeleton cho mọi màn (chỉ dashboard + chart).
- Haptics, sound, theme chuyển động nâng cao.
