"use client";

export default function FoodLogItem({ item, onRemove }) {
  return (
    <div className="group flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-cream-soft">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold tracking-tight text-ink">{item.name}</p>
        <p className="mt-0.5 text-[11px] font-medium text-ink-muted tabular-nums">
          {item.quantity}{item.unit}
          <span className="mx-1.5 text-ink-faint">·</span>
          <span className="text-sage-deep">{Math.round(item.protein)}P</span>
          <span className="mx-0.5 text-ink-faint">/</span>
          <span className="text-clay-deep">{Math.round(item.carb)}C</span>
          <span className="mx-0.5 text-ink-faint">/</span>
          <span className="text-lilac-deep">{Math.round(item.fat)}F</span>
        </p>
      </div>

      <div className="ml-3 flex items-center gap-3">
        <span className="whitespace-nowrap text-[14px] font-bold tabular-nums text-ink">
          {Math.round(item.kcal)} <span className="text-[10px] font-medium text-ink-muted">kcal</span>
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="grid h-7 w-7 place-items-center rounded-full text-ink-faint opacity-0 transition group-hover:opacity-100 hover:bg-orange-soft hover:text-orange-deep"
            aria-label="Xóa món ăn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
