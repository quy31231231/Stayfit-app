// Kiểm tra check digit GTIN (EAN-13/EAN-8/UPC-A/GTIN-14) — thuần tính, offline.
export const isValidGtin = (code) => {
    const s = String(code || "").trim();
    if (!/^\d{8}$|^\d{12,14}$/.test(s)) return false;
    const digits = s.split("").map(Number);
    const check = digits.pop();
    let sum = 0;
    // Trọng số 3/1 xen kẽ, tính từ phải qua trái (ngay trước check digit).
    for (let i = digits.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) sum += digits[i] * w;
    return (10 - (sum % 10)) % 10 === check;
};

// Bảng prefix GS1 (3 số đầu EAN-13) → quốc gia đăng ký mã. Tập phổ biến + VN.
const GS1_PREFIXES = [
    [[0, 19], "Mỹ / Canada"], [[30, 39], "Mỹ"], [[60, 139], "Mỹ / Canada"],
    [[300, 379], "Pháp"], [[380, 380], "Bulgaria"], [[400, 440], "Đức"],
    [[450, 459], "Nhật Bản"], [[460, 469], "Nga"], [[471, 471], "Đài Loan"],
    [[480, 480], "Philippines"], [[489, 489], "Hong Kong"], [[490, 499], "Nhật Bản"],
    [[500, 509], "Anh"], [[690, 699], "Trung Quốc"], [[729, 729], "Israel"],
    [[760, 769], "Thụy Sĩ"], [[800, 839], "Ý"], [[840, 849], "Tây Ban Nha"],
    [[871, 871], "Hà Lan"], [[880, 880], "Hàn Quốc"], [[885, 885], "Thái Lan"],
    [[888, 888], "Singapore"], [[890, 890], "Ấn Độ"], [[893, 893], "Việt Nam"],
    [[899, 899], "Indonesia"], [[930, 939], "Úc"], [[955, 955], "Malaysia"],
];
export const gs1Country = (code) => {
    const s = String(code || "").trim();
    if (!/^\d{12,14}$/.test(s)) return null; // chỉ EAN-13/UPC mới có prefix vùng
    const ean13 = s.length === 12 ? "0" + s : s.slice(-13); // UPC-A → thêm 0 đầu
    const p = parseInt(ean13.slice(0, 3), 10);
    for (const [[lo, hi], name] of GS1_PREFIXES) if (p >= lo && p <= hi) return name;
    return "Không rõ";
};
