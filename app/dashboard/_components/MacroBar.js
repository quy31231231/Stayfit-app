"use client";

// Thanh macro ngang cho calorie hero (eyebrow + số + thanh fill).
// Màu lấy từ token sage/clay/lilac → tự đổi theo light/dark.
const TONE = {
  protein: { eyebrow: "text-sage-deep",  fill: "bg-sage",  track: "bg-sage-soft",  label: "Protein" },
  carb:    { eyebrow: "text-clay-deep",  fill: "bg-clay",  track: "bg-clay-soft",  label: "Carb" },
  fat:     { eyebrow: "text-lilac-deep", fill: "bg-lilac", track: "bg-lilac-soft", label: "Fat" },
};

export default function MacroBar({ kind = "protein", value = 0, target = 0 }) {
  const tone = TONE[kind] || TONE.protein;
  const ratio = target > 0 ? Math.min(1, value / target) : 0;

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.eyebrow}`}>
        {tone.label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-extrabold leading-none tracking-tight text-ink tabular-nums">
          {Math.round(value)}
        </span>
        <span className="text-[11px] font-medium text-ink-faint tabular-nums">/ {Math.round(target)}g</span>
      </div>
      <div className={`relative h-1 overflow-hidden rounded-full ${tone.track}`}>
        <div
          className={`h-full rounded-full ${tone.fill}`}
          style={{ width: `${ratio * 100}%`, transition: "width 0.6s ease-out" }}
        />
      </div>
    </div>
  );
}
