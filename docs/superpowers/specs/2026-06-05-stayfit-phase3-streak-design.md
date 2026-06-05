# StayFit — Phase 3: Streak / Động lực — Design

**Date:** 2026-06-05
**Status:** Implemented on `feat/phase3-streak`
**Scope:** First Phase 3 feature (động lực). Driven autonomously per user request ("thực hiện toàn bộ các phase", full authority).

## Mục tiêu
Tăng động lực dùng đều bằng **chuỗi ngày ghi nhật ký (streak)** — suy ra hoàn toàn từ dữ liệu sẵn có, không thêm lưu trữ.

## Quyết định
| Hạng mục | Lựa chọn |
|---|---|
| Ngày "hợp lệ" | Có ≥1 món trong `history[date]` |
| Chuỗi hiện tại | Số ngày liên tiếp tới **hôm nay** (hoặc **hôm qua** nếu hôm nay chưa ghi → không gãy oan giữa ngày) |
| Kỷ lục | Chuỗi liên tiếp dài nhất từng đạt |
| Hiển thị | Chip 🔥 dưới lời chào ở Nhật ký; **ẩn khi `current === 0`** |
| Lưu trữ | Không — tính bằng `useMemo(computeStreak, [history])` |

## Kiến trúc
- `app/_lib/streak.js` — `computeStreak(history, todayStr) → { current, longest }`. Thuần, số học ngày trên chuỗi `YYYY-MM-DD` qua `Date.UTC` (an toàn timezone, không lệch DST).
- `app/dashboard/_components/StreakBadge.js` — chip trình bày (props `current`, `longest`), `memo`. Thông điệp đổi khi đang lập kỷ lục.
- `app/page.js` — `const streak = useMemo(() => computeStreak(history, formatDate(new Date())), [history]);` + `<StreakBadge>` ngay sau `<GreetingHeader>`.

## Ngoài phạm vi (sau)
- Push-notification / nhắc nhở (cần service worker + quyền).
- Hệ thống huy hiệu/cấp độ, phần thưởng.
- Streak "đóng băng" (freeze) khi nghỉ 1 ngày.

## Verify
- `npm run build` xanh.
- Test tay: ghi món vài ngày liên tiếp → chip 🔥 hiện đúng số; bỏ trống hôm nay nhưng hôm qua có → chuỗi vẫn giữ; chưa ghi gì → không hiện chip.
