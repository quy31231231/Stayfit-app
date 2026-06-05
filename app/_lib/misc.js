// Helper linh tinh: đoán bữa theo giờ, dò nhắc bữa trong text, chuẩn hóa SĐT, sinh timestamp.
export const getMealByHour = () => {
    const h = new Date().getHours();
    if (h >= 4 && h < 10) return "Bữa sáng";
    if (h >= 10 && h < 14) return "Bữa trưa";
    if (h >= 14 && h < 17) return "Ăn vặt";
    if (h >= 17 && h < 21) return "Bữa tối";
    return "Ăn vặt";
};
// Check user has explicitly mention meal type in their description.
// Strip diacritics for robust match.
export const mentionsMealInText = (text) => {
    if (!text) return false;
    const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return /\b(bua\s*sang|bua\s*trua|bua\s*toi|an\s*vat|an\s*nhe|sang\s*nay|trua\s*nay|toi\s*nay|sang\s*som|toi\s*muon)\b/.test(t);
};
// Chuẩn hóa số điện thoại → userId (chỉ chữ số, +84/84 → 0...).
export const normPhone = (p) => {
    let d = (p || "").replace(/\D/g, "");
    if (d.startsWith("84")) d = "0" + d.slice(2);
    return d;
};
export const generateUniqueTimestamp = () => {
  const now = new Date();
  const svSE = now.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  const rand = Math.random().toString(36).slice(2, 7);
  return `${svSE}.${ms}-${rand}`;
};
