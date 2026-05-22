"use client";

import FoodLogItem from "./FoodLogItem";

const MEAL_THEMES = {
  "Bữa sáng": { icon: "☀️",  tone: "bg-clay-soft text-clay-deep",   ring: "ring-clay" },
  "Bữa trưa": { icon: "🌤",  tone: "bg-sage-soft text-sage-deep",   ring: "ring-sage" },
  "Bữa tối":  { icon: "🌙",  tone: "bg-lilac-soft text-lilac-deep", ring: "ring-lilac" },
  "Ăn vặt":   { icon: "⭐",  tone: "bg-orange-soft text-orange-deep", ring: "ring-orange" },
};

export default function FoodLogSection({ mealName, items = [], targetKcal, onAdd, onRemove }) {
  const theme = MEAL_THEMES[mealName] || MEAL_THEMES["Ăn vặt"];
  const totalKcal = items.reduce((sum, i) => sum + (i.kcal || 0), 0);
  const isEmpty = items.length === 0;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft md:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${theme.tone}`}>
            {theme.icon}
          </span>
          <div>
            <h3 className="text-base font-bold text-ink">{mealName}</h3>
            <p className="text-xs text-ink-muted">
              {isEmpty
                ? "Chưa có món nào hôm nay"
                : `${items.length} món · ${Math.round(totalKcal)} kcal`}
              {targetKcal ? ` · gợi ý ${targetKcal} kcal` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd?.(mealName)}
          className="grid h-10 w-10 place-items-center rounded-full bg-cream-soft text-ink transition hover:bg-orange hover:text-white"
          aria-label={`Thêm món vào ${mealName}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </header>

      {!isEmpty && (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <FoodLogItem key={item.id} item={item} onRemove={onRemove} />
          ))}
        </div>
      )}

      {isEmpty && (
        <button
          type="button"
          onClick={() => onAdd?.(mealName)}
          className="mt-4 w-full rounded-2xl border-2 border-dashed border-cream-deep py-4 text-sm font-medium text-ink-muted transition hover:border-orange hover:bg-orange-soft/40 hover:text-orange-deep"
        >
          + Thêm món vào {mealName.toLowerCase()}
        </button>
      )}
    </section>
  );
}
