// Chuẩn hóa & tra cứu tên món (bỏ dấu), gợi ý định lượng, quy đổi đơn vị → gram.
export const removeAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
export const normalizeFoodLookup = (value) => removeAccents(String(value || "").toLowerCase()).replace(/\s+/g, " ").trim();
export const normalizeFoodGroupKey = (value) => normalizeFoodLookup(value)
    .replace(/\bphan\s+nac\b/g, "nac")
    .replace(/[()]/g, " ")
    .replace(/[\/,;:.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
// Gợi ý định lượng từ lịch sử: trả về quantity hay dùng nhất cho món `foodName` (cùng `unit`).
// Hòa số lần → lấy lần ghi gần đây nhất. Không có dữ liệu → null.
export const suggestQty = (history, foodName, unit) => {
    const targetName = normalizeFoodLookup(foodName);
    const targetUnit = (unit || "g").toLowerCase();
    if (!targetName) return null;
    const stats = new Map(); // quantity -> { count, recency }
    let order = 0;
    for (const date of Object.keys(history || {}).sort()) {
        for (const item of history[date] || []) {
            if (normalizeFoodLookup(item.name) !== targetName) continue;
            if ((item.unit || "g").toLowerCase() !== targetUnit) continue;
            const q = Number(item.quantity);
            if (!(q > 0)) continue;
            const prev = stats.get(q);
            if (prev) { prev.count++; prev.recency = order; }
            else stats.set(q, { count: 1, recency: order });
            order++;
        }
    }
    let best = null, bestStat = null;
    for (const [q, s] of stats) {
        if (!bestStat || s.count > bestStat.count || (s.count === bestStat.count && s.recency > bestStat.recency)) {
            best = q; bestStat = s;
        }
    }
    return best;
};
const UNIT_GRAM_WEIGHTS = { 'tô': 400, 'bát': 200, 'ly': 250, 'quả': 100, 'cái': 100, 'chiếc': 100, 'chén': 70, 'đĩa': 350, 'cuốn': 80, 'ổ': 80, 'suất': 350, 'gói': 75, 'miếng': 80, 'phần': 300 };
// Quy đổi số lượng + đơn vị sang gram (ml tính tương đương gram). Đơn vị đếm dùng bảng ước lượng.
export const unitToGrams = (qty, unit) => {
    const u = (unit || "g").toLowerCase();
    if (['kg', 'l', 'lít'].includes(u)) return qty * 1000;
    if (['ml', 'g', 'gram'].includes(u)) return qty;
    return qty * (UNIT_GRAM_WEIGHTS[u] || 100);
};
