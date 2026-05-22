"use client";

export default function CalorieCircle({ consumed = 0, target = 2000, size = 220 }) {
  const remaining = Math.max(0, target - consumed);
  const ratio = Math.min(1, target > 0 ? consumed / target : 0);

  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E89B7B" />
            <stop offset="100%" stopColor="#D97757" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F4EFE6"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#calorieGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Còn dư
        </span>
        <span className="mt-1.5 text-5xl font-bold leading-none tracking-tight text-ink tabular-nums">
          {Math.round(remaining).toLocaleString("vi-VN")}
        </span>
        <span className="mt-1.5 text-[11px] font-medium text-ink-muted tabular-nums">
          / {target.toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
}
