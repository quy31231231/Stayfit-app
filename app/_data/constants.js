// Hằng số tĩnh dùng cho hồ sơ & nhập liệu (mức vận động, mục tiêu, loại bữa, gợi ý mô tả).
export const ACTIVITY_LEVELS = [
    { label: "Ít vận động", value: 1.2 }, { label: "Nhẹ (1-3 buổi/tuần)", value: 1.375 },
    { label: "Vừa (3-5 buổi/tuần)", value: 1.55 }, { label: "Nhiều (6-7 buổi/tuần)", value: 1.725 }
];
export const GOALS = [
    { label: "Giảm cân nhanh", value: -500 }, { label: "Giảm cân nhẹ", value: -250 },
    { label: "Duy trì", value: 0 }, { label: "Tăng cân", value: 300 }
];
export const MEAL_TYPES = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
export const TEXT_SUGGESTIONS = [
    "Bữa sáng tôi ăn 2 quả trứng luộc với 1 bát salad rau trộn",
    "Bữa tối tôi ăn 150g bò bít tết nướng với rau củ hấp",
    "Tôi ăn nhẹ với 200g sữa chua Hy Lạp không đường và các loại hạt",
];
