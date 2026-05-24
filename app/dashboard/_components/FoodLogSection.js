"use client";

import FoodLogItem from "./FoodLogItem";
import { useDroppable } from "@dnd-kit/core";

const MEAL_THEMES = {
  "Bữa sáng": { icon: "☀️",  tone: "bg-clay-soft text-clay-deep",   ring: "ring-clay" },
  "Bữa trưa": { icon: "🌤",  tone: "bg-sage-soft text-sage-deep",   ring: "ring-sage" },
  "Bữa tối":  { icon: "🌙",  tone: "bg-lilac-soft text-lilac-deep", ring: "ring-lilac" },
  "Ăn vặt":   { icon: "⭐",  tone: "bg-orange-soft text-orange-deep", ring: "ring-orange" },
};

export default function FoodLogSection({
  mealName,
  items = [],
  targetKcal,
  onAdd,
  onRemove,
  selectedItemIds,
  selectionMode = false,
  onLongPress,
  onToggleSelect,
  onToggleSelectAll,
}) {
  const theme = MEAL_THEMES[mealName] || MEAL_THEMES["Ăn vặt"];
  const totalKcal = items.reduce((sum, i) => sum + (i.kcal || 0), 0);
  const isEmpty = items.length === 0;

  const { setNodeRef, isOver } = useDroppable({ id: mealName });

  const allSelected = !isEmpty && items.every((it) => selectedItemIds?.has(it.id));

  return (
    <section
      ref={setNodeRef}
      className={`rounded-3xl bg-white p-5 shadow-soft ring-1 transition md:p-6 ${
        isOver
          ? "ring-2 ring-orange-deep shadow-lift scale-[1.01]"
          : "hover:shadow-lift"
      }`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${theme.tone}`}>
            {theme.icon}
          </span>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink">{mealName}</h3>
            <p className="mt-0.5 text-[11px] font-medium text-ink-muted tabular-nums">
              {isEmpty
                ? "Khi nào sẵn sàng, ghi vào nhé"
                : `${items.length} món · ${Math.round(totalKcal)} kcal`}
              {!isEmpty && targetKcal ? ` · gợi ý ${targetKcal}` : ""}
            </p>
          </div>
        </div>

        {selectionMode && !isEmpty ? (
          <button
            type="button"
            onClick={() => onToggleSelectAll?.(mealName)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-orange-soft text-orange-deep ring-1 ring-orange-deep/30 hover:bg-orange/20 transition whitespace-nowrap"
          >
            {allSelected ? "Bỏ chọn cả bữa" : "Chọn cả bữa"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAdd?.(mealName)}
            className="grid h-10 w-10 place-items-center rounded-full bg-cream-soft text-ink ring-1 transition hover:bg-orange hover:text-white hover:ring-orange"
            aria-label={`Thêm món vào ${mealName}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
      </header>

      {!isEmpty && (
        <div className="mt-4 space-y-1.5">
          {items.map((item) => (
            <FoodLogItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              selected={selectedItemIds?.has(item.id) || false}
              selectionMode={selectionMode}
              onLongPress={onLongPress}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <button
          type="button"
          onClick={() => onAdd?.(mealName)}
          className={`mt-4 w-full rounded-2xl border border-dashed py-4 text-[13px] font-medium transition ${
            isOver
              ? "border-orange-deep bg-orange-soft/40 text-orange-deep"
              : "border-cream-deep bg-cream-soft/30 text-ink-muted hover:border-orange/60 hover:bg-orange-soft/30 hover:text-orange-deep"
          }`}
        >
          {isOver ? `Thả vào ${mealName.toLowerCase()}` : `Ghi món cho ${mealName.toLowerCase()}`}
        </button>
      )}
    </section>
  );
}
