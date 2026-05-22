"use client";

import { useMemo, useState } from "react";

import DashboardCard from "./_components/DashboardCard";
import CalorieCircle from "./_components/CalorieCircle";
import MacroDonut from "./_components/MacroDonut";
import FoodLogSection from "./_components/FoodLogSection";
import GreetingHeader from "./_components/GreetingHeader";
import WeeklyTrendCard from "./_components/WeeklyTrendCard";

const MEAL_ORDER = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];

const MOCK_INITIAL = [
  { id: 1, meal: "Bữa sáng", name: "Yến mạch + chuối", quantity: 1, unit: "bát", kcal: 320, protein: 12, carb: 55, fat: 6 },
  { id: 2, meal: "Bữa sáng", name: "Trứng luộc",       quantity: 2, unit: "quả", kcal: 155, protein: 13, carb:  1, fat: 11 },
  { id: 3, meal: "Bữa trưa", name: "Ức gà áp chảo",    quantity: 150, unit: "g", kcal: 246, protein: 46, carb:  0, fat:  6 },
  { id: 4, meal: "Bữa trưa", name: "Cơm gạo lứt",      quantity: 1, unit: "bát", kcal: 216, protein:  5, carb: 45, fat:  2 },
  { id: 5, meal: "Bữa trưa", name: "Bông cải xanh",    quantity: 100, unit: "g", kcal:  34, protein:  3, carb:  7, fat:  0.5 },
  { id: 6, meal: "Ăn vặt",   name: "Sữa chua không đường", quantity: 1, unit: "hộp", kcal: 90, protein:  6, carb: 12, fat:  1 },
];

const MOCK_WEEK = [
  { label: "T2", kcal: 1850 },
  { label: "T3", kcal: 2100 },
  { label: "T4", kcal: 1620 },
  { label: "T5", kcal: 1950 },
  { label: "T6", kcal: 2280 },
  { label: "T7", kcal: 1740 },
  { label: "CN", kcal: 1320 },
];

export default function DashboardPage() {
  const [userName] = useState("Quy");
  const [target] = useState({ kcal: 2000, protein: 125, carb: 250, fat: 55 });
  const [foodLog, setFoodLog] = useState(MOCK_INITIAL);

  const totals = useMemo(() => {
    return foodLog.reduce(
      (acc, item) => ({
        kcal:    acc.kcal    + (item.kcal    || 0),
        protein: acc.protein + (item.protein || 0),
        carb:    acc.carb    + (item.carb    || 0),
        fat:     acc.fat     + (item.fat     || 0),
      }),
      { kcal: 0, protein: 0, carb: 0, fat: 0 }
    );
  }, [foodLog]);

  const handleRemove = (id) => setFoodLog((prev) => prev.filter((item) => item.id !== id));

  const handleAdd = (mealName) => {
    const id = Date.now();
    setFoodLog((prev) => [...prev, {
      id, meal: mealName, name: "Món mới", quantity: 1, unit: "khẩu phần",
      kcal: 200, protein: 10, carb: 25, fat: 5,
    }]);
  };

  const itemsByMeal = useMemo(() => {
    const map = Object.fromEntries(MEAL_ORDER.map((m) => [m, []]));
    for (const item of foodLog) (map[item.meal] || (map[item.meal] = [])).push(item);
    return map;
  }, [foodLog]);

  return (
    <main className="min-h-screen bg-cream pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        <GreetingHeader userName={userName} />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ───── CỘT TRÁI: TỔNG QUAN HÔM NAY ───── */}
          <div className="space-y-6 lg:col-span-2">
            <DashboardCard tone="white" padding="lg" className="overflow-hidden">
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col items-center md:items-start">
                  <p className="text-sm font-medium text-ink-muted">Hôm nay</p>
                  <CalorieCircle consumed={totals.kcal} target={target.kcal} />
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    <div className="rounded-full bg-cream-soft px-3 py-1.5">
                      <span className="font-semibold text-ink">{Math.round(totals.kcal)}</span>
                      <span className="ml-1 text-ink-muted">đã nạp</span>
                    </div>
                    <div className="rounded-full bg-cream-soft px-3 py-1.5">
                      <span className="font-semibold text-ink">0</span>
                      <span className="ml-1 text-ink-muted">vận động</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <MacroDonut kind="protein" value={totals.protein} target={target.protein} />
                  <MacroDonut kind="carb"    value={totals.carb}    target={target.carb} />
                  <MacroDonut kind="fat"     value={totals.fat}     target={target.fat} />
                </div>
              </div>
            </DashboardCard>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-ink">Nhật ký bữa ăn</h2>
                <span className="text-xs text-ink-muted">{foodLog.length} món hôm nay</span>
              </div>

              <div className="space-y-4">
                {MEAL_ORDER.map((meal) => (
                  <FoodLogSection
                    key={meal}
                    mealName={meal}
                    items={itemsByMeal[meal] || []}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ───── CỘT PHẢI: PANEL PHỤ ───── */}
          <aside className="space-y-6">
            <DashboardCard tone="orange" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-orange-deep">Lời nhắc</p>
                  <h3 className="mt-2 text-lg font-bold text-ink">Uống đủ nước hôm nay</h3>
                  <p className="mt-1 text-sm text-ink-muted">5 / 8 ly đã uống</p>
                </div>
                <span className="text-4xl">💧</span>
              </div>
              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${i < 5 ? "bg-orange" : "bg-white/60"}`}
                  />
                ))}
              </div>
            </DashboardCard>

            <WeeklyTrendCard data={MOCK_WEEK} target={target.kcal} />

            <DashboardCard tone="sage" padding="lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧘</span>
                <div>
                  <h3 className="text-sm font-bold text-ink">Thư giãn 2 phút</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.
                  </p>
                  <button className="mt-3 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-sage-deep shadow-soft transition hover:bg-sage hover:text-white">
                    Bắt đầu thở
                  </button>
                </div>
              </div>
            </DashboardCard>
          </aside>
        </div>
      </div>

      {/* FAB — chỉ hiện trên mobile */}
      <button
        type="button"
        onClick={() => handleAdd("Ăn vặt")}
        className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-orange text-white shadow-lift transition hover:bg-orange-deep md:hidden"
        aria-label="Thêm món nhanh"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </main>
  );
}
