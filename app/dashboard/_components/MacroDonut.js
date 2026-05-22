"use client";

const TONE = {
  protein: { ring: "#A8C09A", track: "#DCEAD3", label: "Protein", unit: "g" },
  carb:    { ring: "#E8C892", track: "#F7EAD1", label: "Carb",    unit: "g" },
  fat:     { ring: "#C8B6E2", track: "#EBE3F5", label: "Chất béo", unit: "g" },
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
          <span className="text-base font-bold leading-none text-ink">
            {Math.round(value)}
          </span>
          <span className="text-[10px] font-medium text-ink-muted">/{Math.round(target)}{tone.unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold text-ink">{tone.label}</p>
        <p className="text-[11px] text-ink-muted">còn {Math.round(remaining)}{tone.unit}</p>
      </div>
    </div>
  );
}
