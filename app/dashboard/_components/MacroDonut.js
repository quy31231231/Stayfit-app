"use client";

const TONE = {
  protein: { ring: "#4F7155", track: "#F5F5F7", label: "Protein", unit: "g" },
  carb:    { ring: "#A87B3F", track: "#F5F5F7", label: "Carb",    unit: "g" },
  fat:     { ring: "#7E70A0", track: "#F5F5F7", label: "Fat",     unit: "g" },
};

export default function MacroDonut({ kind = "protein", value = 0, target = 0, size = 88 }) {
  const tone = TONE[kind] || TONE.protein;
  const ratio = target > 0 ? Math.min(1, value / target) : 0;

  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  const remaining = Math.max(0, target - value);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tone.track} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.ring}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold leading-none text-ink tabular-nums">
            {Math.round(value)}
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-ink-muted tabular-nums">/{Math.round(target)}{tone.unit}</span>
        </div>
      </div>
      <div className="mt-2.5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink">{tone.label}</p>
        <p className="mt-0.5 text-[10px] font-medium tabular-nums">
          {remaining > 0
            ? <span className="text-ink-muted">thêm {Math.round(remaining)}{tone.unit}</span>
            : <span className="text-sage-deep">đủ rồi ✓</span>}
        </p>
      </div>
    </div>
  );
}
