/* StayFit UI Kit — mock data (Vietnamese food). */

const FOOD_LIBRARY = [
  { name: "Ức gà áp chảo", unit: "g", per: 150, kcal: 246, protein: 46, carb: 0, fat: 6 },
  { name: "Cơm gạo lứt", unit: "bát", per: 1, kcal: 216, protein: 5, carb: 45, fat: 2 },
  { name: "Trứng luộc", unit: "quả", per: 2, kcal: 155, protein: 13, carb: 1, fat: 11 },
  { name: "Yến mạch + chuối", unit: "bát", per: 1, kcal: 320, protein: 12, carb: 55, fat: 6 },
  { name: "Bông cải xanh", unit: "g", per: 100, kcal: 34, protein: 3, carb: 7, fat: 0.5 },
  { name: "Sữa chua không đường", unit: "hộp", per: 1, kcal: 90, protein: 6, carb: 12, fat: 1 },
  { name: "Cá hồi nướng", unit: "g", per: 120, kcal: 250, protein: 25, carb: 0, fat: 16 },
  { name: "Khoai lang luộc", unit: "củ", per: 1, kcal: 130, protein: 2, carb: 30, fat: 0 },
  { name: "Phở bò", unit: "tô", per: 1, kcal: 420, protein: 26, carb: 55, fat: 9 },
  { name: "Bún chả", unit: "phần", per: 1, kcal: 480, protein: 28, carb: 50, fat: 18 },
  { name: "Salad cá ngừ", unit: "phần", per: 1, kcal: 210, protein: 22, carb: 9, fat: 10 },
  { name: "Chuối", unit: "quả", per: 1, kcal: 105, protein: 1, carb: 27, fat: 0 },
];

const INITIAL_LOG = [
  { id: 1, meal: "Bữa sáng", name: "Yến mạch + chuối", quantity: 1, unit: "bát", kcal: 320, protein: 12, carb: 55, fat: 6 },
  { id: 2, meal: "Bữa sáng", name: "Trứng luộc", quantity: 2, unit: "quả", kcal: 155, protein: 13, carb: 1, fat: 11 },
  { id: 3, meal: "Bữa trưa", name: "Ức gà áp chảo", quantity: 150, unit: "g", kcal: 246, protein: 46, carb: 0, fat: 6 },
  { id: 4, meal: "Bữa trưa", name: "Cơm gạo lứt", quantity: 1, unit: "bát", kcal: 216, protein: 5, carb: 45, fat: 2 },
  { id: 5, meal: "Ăn vặt", name: "Sữa chua không đường", quantity: 1, unit: "hộp", kcal: 90, protein: 6, carb: 12, fat: 1 },
];

const MEAL_ORDER = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
const MEAL_THEME = {
  "Bữa sáng": { icon: "☀️", tone: "clay" },
  "Bữa trưa": { icon: "🌤", tone: "sage" },
  "Bữa tối":  { icon: "🌙", tone: "lilac" },
  "Ăn vặt":   { icon: "⭐", tone: "orange" },
};
const WEEK = [
  { label: "T2", kcal: 1850 }, { label: "T3", kcal: 2100 }, { label: "T4", kcal: 1620 },
  { label: "T5", kcal: 1950 }, { label: "T6", kcal: 2280 }, { label: "T7", kcal: 1740 },
  { label: "CN", kcal: 1320 },
];
const QUOTES = [
  "Mỗi bữa ăn là một cách nói cảm ơn với cơ thể.",
  "Cân bằng quan trọng hơn kỷ luật.",
  "Bạn không cần hoàn hảo, chỉ cần có mặt.",
  "Bước nhỏ mỗi ngày tạo nên thay đổi lớn.",
];

const TONE_BG = { clay: "var(--carb-soft)", sage: "var(--protein-soft)", lilac: "var(--fat-soft)", orange: "var(--orange-soft)" };

Object.assign(window, { FOOD_LIBRARY, INITIAL_LOG, MEAL_ORDER, MEAL_THEME, WEEK, QUOTES, TONE_BG });
