"use client";

import { useMemo, useState } from "react";

import DashboardCard from "./_components/DashboardCard";
import CalorieCircle from "./_components/CalorieCircle";
import MacroDonut from "./_components/MacroDonut";
import FoodLogSection from "./_components/FoodLogSection";
import GreetingHeader from "./_components/GreetingHeader";
import WeeklyTrendCard from "./_components/WeeklyTrendCard";
import BreathingTimer from "./_components/BreathingTimer";

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

  const exercise = 0;
  const kcalRemaining = Math.max(0, target.kcal - totals.kcal + exercise);

  return (
    <main className="min-h-screen bg-cream pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        <GreetingHeader userName={userName} />

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {/* ───── CỘT TRÁI: TỔNG QUAN HÔM NAY ───── */}
          <div className="space-y-5 lg:col-span-2 lg:space-y-6">

            {/* Calorie Hero Card */}
            <DashboardCard tone="white" padding="lg" className="overflow-hidden">
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
                <CalorieCircle consumed={totals.kcal} target={target.kcal} />

                <div className="grid grid-cols-3 gap-4">
                  <MacroDonut kind="protein" value={totals.protein} target={target.protein} />
                  <MacroDonut kind="carb"    value={totals.carb}    target={target.carb} />
                  <MacroDonut kind="fat"     value={totals.fat}     target={target.fat} />
                </div>
              </div>

              {/* Calorie equation — Mục tiêu − Đã nạp + Luyện tập = Còn lại */}
              <div className="mt-6 grid grid-cols-7 items-center gap-2 border-t border-cream-deep/50 pt-5 text-center">
                <EqCell label="Cần khoảng" value={target.kcal.toLocaleString("vi-VN")} tone="neutral" />
                <span className="text-base font-light text-ink-faint">−</span>
                <EqCell label="Đã nạp" value={Math.round(totals.kcal).toLocaleString("vi-VN")} tone="sage" />
                <span className="text-base font-light text-ink-faint">+</span>
                <EqCell label="Vận động" value={exercise} tone="clay" />
                <span className="text-base font-light text-ink-faint">=</span>
                <EqCell label="Còn dư" value={Math.round(kcalRemaining).toLocaleString("vi-VN")} tone="orange" highlight />
              </div>
            </DashboardCard>

            {/* Nhật ký bữa ăn */}
            <div>
              <div className="mb-3 flex items-baseline justify-between px-1">
                <h2 className="text-[15px] font-bold tracking-tight text-ink">Nhật ký bữa ăn</h2>
                <span className="text-[11px] font-medium text-ink-muted tabular-nums">
                  {foodLog.length} món · {Math.round(totals.kcal)} kcal
                </span>
              </div>

              <div className="space-y-3">
                {MEAL_ORDER.map((meal, i) => (
                  <div
                    key={meal}
                    className="animate-fade-rise"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <FoodLogSection
                      mealName={meal}
                      items={itemsByMeal[meal] || []}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ───── CỘT PHẢI: PANEL PHỤ ───── */}
          <aside className="space-y-5 lg:space-y-6">
            <WaterCard consumed={5} target={8} />
            <WeeklyTrendCard data={MOCK_WEEK} target={target.kcal} />
            <MindfulCard />
          </aside>
        </div>
      </div>

      {/* FAB — chỉ hiện trên mobile */}
      <button
        type="button"
        onClick={() => handleAdd("Ăn vặt")}
        className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-orange text-white shadow-lift ring-1 ring-orange-deep/20 transition hover:bg-orange-deep md:hidden"
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

/* ────────────────────────────────────────────────────────────── */
/*  HELPER COMPONENTS (chỉ dùng nội bộ page này)                 */
/* ────────────────────────────────────────────────────────────── */

function EqCell({ label, value, tone = "neutral", highlight = false }) {
  const toneClass = {
    neutral: "bg-cream-soft text-ink",
    sage:    "bg-sage-soft text-sage-deep",
    clay:    "bg-clay-soft text-clay-deep",
    orange:  "bg-orange text-white shadow-soft ring-1 ring-orange-deep/20",
  }[tone];

  return (
    <div className={`rounded-2xl py-2.5 ${toneClass}`}>
      <p className={`text-lg font-bold leading-none tracking-tight tabular-nums ${highlight ? "" : ""}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-medium uppercase tracking-wider ${highlight ? "text-white/80" : "opacity-70"}`}>{label}</p>
    </div>
  );
}

function WaterCard({ consumed = 0, target = 8 }) {
  return (
    <DashboardCard tone="white" padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-deep">Nước</span>
          <h3 className="mt-1 text-[15px] font-bold tracking-tight text-ink">Nhâm nhi ly nước nào</h3>
          <p className="mt-0.5 text-[11px] font-medium text-ink-muted tabular-nums">
            <span className="font-bold text-mist-deep">{consumed}</span> / {target} ly · {(consumed * 0.25).toFixed(2)} lít
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mist-soft text-xl animate-gentle-pulse">💧</span>
      </div>

      <div className="mt-4 grid grid-cols-8 gap-1.5">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`h-9 rounded-lg transition ${i < consumed ? "bg-mist ring-1 ring-mist-deep/10" : "bg-cream-soft ring-1 ring-cream-deep/40"}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-2xl bg-cream-soft py-2.5 text-[12px] font-semibold text-ink-muted ring-1 ring-cream-deep/40 transition hover:bg-mist hover:text-white hover:ring-mist-deep/20"
      >
        Thêm một ly
      </button>
    </DashboardCard>
  );
}

function MindfulCard() {
  const [breathing, setBreathing] = useState(false);

  return (
    <>
      <DashboardCard tone="sage" padding="lg">
        <div className="flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-soft animate-gentle-pulse"
            style={{ animationDuration: "6s" }}
          >
            🧘
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-deep">Mindful</span>
            <h3 className="mt-1 text-[15px] font-bold tracking-tight text-ink">Thư giãn 2 phút</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.
            </p>
            <button
              type="button"
              onClick={() => setBreathing(true)}
              className="mt-3 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-sage-deep ring-1 ring-sage/15 transition hover:bg-sage hover:text-white"
            >
              Bắt đầu thở
            </button>
          </div>
        </div>
      </DashboardCard>

      {breathing && <BreathingTimer onClose={() => setBreathing(false)} />}
    </>
  );
}
