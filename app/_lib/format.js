// Định dạng ngày theo giờ VN (YYYY-MM-DD) + quy đổi macro theo định lượng.
export const formatDate = (date) => {
    const d = new Date(date);
    const vietnamDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return `${vietnamDate.getFullYear()}-${String(vietnamDate.getMonth() + 1).padStart(2, '0')}-${String(vietnamDate.getDate()).padStart(2, '0')}`;
};
export const calcMacro = (val, per, q) => Math.round((val / per) * q * 10) / 10;
