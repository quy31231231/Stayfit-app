"use client";

import { useEffect, useState } from "react";

const PHASES = [
  { name: "Hít vào",  duration: 4000, scale: 1.35, hint: "qua mũi, chầm chậm" },
  { name: "Giữ hơi",  duration: 7000, scale: 1.35, hint: "thư giãn vai" },
  { name: "Thở ra",   duration: 8000, scale: 1.00, hint: "qua miệng, dài hơi" },
];
const TOTAL_CYCLES = 4;

export default function BreathingTimer({ onClose }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      if (phaseIdx === PHASES.length - 1) {
        if (cycle >= TOTAL_CYCLES) {
          onClose?.();
          return;
        }
        setCycle((c) => c + 1);
        setPhaseIdx(0);
      } else {
        setPhaseIdx((i) => i + 1);
      }
    }, PHASES[phaseIdx].duration);
    return () => clearTimeout(t);
  }, [phaseIdx, cycle, onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const phase = PHASES[phaseIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cream/95 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Bài thở 4-7-8"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-56 w-56 place-items-center">
          <div
            className="absolute inset-0 rounded-full bg-sage-soft ring-1 ring-sage/30"
            style={{
              transform: `scale(${phase.scale})`,
              transition: `transform ${phase.duration}ms ease-in-out`,
            }}
          />
          <div className="relative text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sage-deep">
              Vòng {cycle} / {TOTAL_CYCLES}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{phase.name}</p>
            <p className="mt-1 text-xs text-ink-muted">{phase.hint}</p>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2">
          {PHASES.map((p, i) => (
            <span
              key={p.name}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === phaseIdx ? "w-10 bg-sage" : "w-4 bg-sage/30"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-ink ring-1 ring-cream-deep shadow-soft transition hover:bg-cream-soft"
        >
          Dừng lại
        </button>

        <p className="mt-4 text-[11px] text-ink-muted">Nhấn Esc để thoát · Phương pháp 4-7-8</p>
      </div>
    </div>
  );
}
