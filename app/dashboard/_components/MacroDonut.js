"use client";

const TONE = {
  protein: { ring: "#5F8266", track: "#DDE7DC", label: "Protein", unit: "g" },
  carb:    { ring: "#C49A4A", track: "#F0E5CC", label: "Carb",    unit: "g" },
  fat:     { ring: "#9B8AB8", track: "#E5DDED", label: "Fat",     unit: "g" },
};

export default function MacroDonut({ kind = "protein", value = 0, target = 0, size = 88 }) {
  const tone = TONE[kind] || TONE.protein;
  const isOver = value > target;
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  const remaining = Math.max(0, target - value);
  const over = Math.round(value - target);

  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  const ringStroke = isOver ? "#C94040" : tone.ring;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={tone.track} strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={ringStroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-bold leading-none tabular-nums ${isOver ? "text-red-500" : "text-ink"}`}>
            {Math.round(value)}
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-ink-muted tabular-nums">
            /{Math.round(target)}{tone.unit}
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink">{tone.label}</p>
        <p className="mt-0.5 text-[10px] font-medium tabular-nums">
          {isOver
            ? <span className="text-red-500 font-semibold">vượt +{over}{tone.unit} ↑</span>
            : remaining === 0
            ? <span className="text-sage-deep">đạt ✓</span>
            : <span className="text-ink-muted">còn {Math.round(remaining)}{tone.unit}</span>
          }
        </p>
      </div>
    </div>
  );
}
