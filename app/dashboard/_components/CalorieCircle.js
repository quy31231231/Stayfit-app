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
            <stop offset="0%" stopColor="#F2A65A" />
            <stop offset="100%" stopColor="#D4853F" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F6F1E7"
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
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          Còn lại
        </span>
        <span className="mt-1 text-5xl font-bold leading-none text-ink">
          {Math.round(remaining).toLocaleString("vi-VN")}
        </span>
        <span className="mt-1 text-xs font-medium text-ink-muted">
          / {target.toLocaleString("vi-VN")} kcal
        </span>
      </div>
    </div>
  );
}
