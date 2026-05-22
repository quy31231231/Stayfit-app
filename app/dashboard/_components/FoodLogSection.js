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
    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-cream-deep/60 transition-shadow hover:shadow-lift md:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${theme.tone}`}>
            {theme.icon}
          </span>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink">{mealName}</h3>
            <p className="mt-0.5 text-[11px] font-medium text-ink-muted tabular-nums">
              {isEmpty
                ? "Chưa có món nào"
                : `${items.length} món · ${Math.round(totalKcal)} kcal`}
              {targetKcal ? ` · gợi ý ${targetKcal}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd?.(mealName)}
          className="grid h-10 w-10 place-items-center rounded-full bg-cream-soft text-ink ring-1 ring-cream-deep/40 transition hover:bg-orange hover:text-white hover:ring-orange"
          aria-label={`Thêm món vào ${mealName}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </header>

      {!isEmpty && (
        <div className="mt-4 space-y-1.5">
          {items.map((item) => (
            <FoodLogItem key={item.id} item={item} onRemove={onRemove} />
          ))}
        </div>
      )}

      {isEmpty && (
        <button
          type="button"
          onClick={() => onAdd?.(mealName)}
          className="mt-4 w-full rounded-2xl border border-dashed border-cream-deep bg-cream-soft/30 py-4 text-[13px] font-medium text-ink-muted transition hover:border-orange/60 hover:bg-orange-soft/30 hover:text-orange-deep"
        >
          + Thêm món vào {mealName.toLowerCase()}
        </button>
      )}
    </section>
  );
}
