"use client";

import { useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";

export default function FoodLogItem({
  item,
  onRemove,
  selected = false,
  selectionMode = false,
  onLongPress,
  onToggleSelect,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { meal: item.meal },
  });

  const longPressTimer = useRef(null);
  const longPressFiredRef = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (isDragging) cancelLongPress();
  }, [isDragging]);

  const handlePointerDown = (e) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    longPressFiredRef.current = false;
    cancelLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress?.(item.id);
    }, 300);
    if (!selectionMode) listeners?.onPointerDown?.(e);
  };

  const handlePointerMove = (e) => {
    const absDx = Math.abs(e.clientX - startX.current);
    const absDy = Math.abs(e.clientY - startY.current);
    if (selectionMode ? (absDx > 3 || absDy > 3) : absDy > 15) {
      cancelLongPress();
    }
  };

  const handlePointerUp = () => {
    cancelLongPress();
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (selectionMode) onToggleSelect?.(item.id);
  };

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelLongPress}
      className={`group flex items-center justify-between rounded-2xl px-4 py-3 touch-none select-none cursor-grab active:cursor-grabbing ${
        isDragging
          ? "opacity-30"
          : selected
          ? "bg-orange-soft ring-1 ring-orange-deep/30"
          : "hover:bg-cream-soft"
      }`}
    >
      {selectionMode && (
        <div className={`mr-3 grid h-5 w-5 flex-none place-items-center rounded-md ring-1 transition ${
          selected ? "bg-orange-deep ring-orange-deep text-white" : "bg-white ring-cream-deep text-transparent"
        }`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

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
        {onRemove && !selectionMode && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
            onPointerDown={(e) => { e.stopPropagation(); cancelLongPress(); }}
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
