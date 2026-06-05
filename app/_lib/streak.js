// Tính chuỗi ngày ghi nhật ký (streak) thuần từ history — không lưu thêm gì.
// Ngày "hợp lệ" = có ≥1 món. Số học ngày trên chuỗi "YYYY-MM-DD" → an toàn timezone.

const shiftDay = (s, delta) => {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + delta);
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
};

const dayDiff = (a, b) => {
    const pa = a.split('-').map(Number);
    const pb = b.split('-').map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
};

// Trả về { current, longest }.
// current: số ngày liên tiếp tính tới hôm nay (hoặc hôm qua nếu hôm nay chưa ghi).
// longest: chuỗi liên tiếp dài nhất từng đạt.
export function computeStreak(history, todayStr) {
    const active = new Set(
        Object.keys(history || {}).filter((d) => Array.isArray(history[d]) && history[d].length > 0)
    );
    if (active.size === 0) return { current: 0, longest: 0 };

    const dates = [...active].sort();
    let longest = 1;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
        if (dayDiff(dates[i - 1], dates[i]) === 1) { run++; if (run > longest) longest = run; }
        else run = 1;
    }

    let cursor;
    if (active.has(todayStr)) cursor = todayStr;
    else if (active.has(shiftDay(todayStr, -1))) cursor = shiftDay(todayStr, -1);
    else return { current: 0, longest };

    let current = 0;
    while (active.has(cursor)) { current++; cursor = shiftDay(cursor, -1); }
    return { current, longest };
}
