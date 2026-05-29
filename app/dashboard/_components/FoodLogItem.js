"use client";

import { useState, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";

const DELETE_THRESHOLD = 50;

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

  const [swipeX, setSwipeX] = useState(0);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const swipeDecided = useRef(null); // null | 'swipe' | 'drag'

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (isDragging) {
      cancelLongPress();
      setSwipeX(0);
      swipeDecided.current = null;
    }
  }, [isDragging]);

  const handlePointerDown = (e) => {
    swipeStartX.current = e.clientX;
    swipeStartY.current = e.clientY;
    swipeDecided.current = null;
    longPressFiredRef.current = false;
    cancelLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress?.(item.id);
    }, 300);
    if (!selectionMode) listeners?.onPointerDown?.(e);
  };

  const handlePointerMove = (e) => {
    const dx = e.clientX - swipeStartX.current;
    const dy = e.clientY - swipeStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (swipeDecided.current === null) {
      if (selectionMode ? (absDx > 3 || absDy > 3) : absDy > 15) {
        cancelLongPress();
      }
    }

    if (swipeDecided.current === null && (absDx > 8 || absDy > 8)) {
      if (selectionMode && absDx > absDy && dx > 0) {
        swipeDecided.current = 'swipe';
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      } else {
        swipeDecided.current = 'drag';
      }
    }

    if (swipeDecided.current === 'swipe') {
      e.stopPropagation();
      setSwipeX(Math.min(Math.max(0, dx), 200));
    }
  };

  const handlePointerUp = (e) => {
    cancelLongPress();

    if (swipeDecided.current === 'swipe') {
      if (swipeX >= DELETE_THRESHOLD) {
        onRemove?.(item.id);
      } else {
        setSwipeX(0);
      }
      swipeDecided.current = null;
      return;
    }

    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (selectionMode) {
      e.stopPropagation();
      onToggleSelect?.(item.id);
    }
  };

  const handlePointerCancel = () => {
    cancelLongPress();
    setSwipeX(0);
    swipeDecided.current = null;
  };

  // Combine dnd-kit transform and swipe transform
  const contentStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : swipeX > 0
    ? { transform: `translateX(${swipeX}px)`, transition: 'none' }
    : { transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' };

  const isActiveSwipe = swipeX > 8;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete reveal background */}
      <div
        className="absolute inset-0 flex items-center gap-1.5 pl-5 rounded-2xl bg-red-50 pointer-events-none"
        style={{ opacity: isActiveSwipe ? Math.min(swipeX / DELETE_THRESHOLD, 1) : 0 }}
        aria-hidden="true"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        <span className="text-[11px] font-semibold text-red-400">Xóa</span>
      </div>

      {/* Main draggable element — setNodeRef here so dnd-kit has correct element */}
      <div
        ref={setNodeRef}
        style={contentStyle}
        {...attributes}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`group flex items-center justify-between rounded-2xl px-4 py-3 touch-none select-none cursor-grab active:cursor-grabbing ${
          isDragging
            ? 'opacity-30'
            : selected
            ? 'bg-orange-soft ring-1 ring-orange-deep/30'
            : 'hover:bg-cream-soft'
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
    </div>
  );
}
