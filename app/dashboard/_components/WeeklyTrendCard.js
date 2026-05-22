"use client";

import DashboardCard from "./DashboardCard";

export default function WeeklyTrendCard({ data = [], target = 2000 }) {
  const max = Math.max(target, ...data.map((d) => d.kcal), 1);
  const avg = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.kcal, 0) / data.length) : 0;

  return (
    <DashboardCard tone="white" padding="lg">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">7 ngày</span>
          <h3 className="mt-1 text-[15px] font-bold tracking-tight text-ink">Xu hướng năng lượng</h3>
          <p className="mt-0.5 text-[11px] text-ink-muted tabular-nums">
            TB <span className="font-semibold text-ink">{avg.toLocaleString("vi-VN")}</span> kcal / ngày
          </p>
        </div>
        <span className="rounded-full bg-cream-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted ring-1 ring-cream-deep/60 tabular-nums">
          Mục tiêu {target.toLocaleString("vi-VN")}
        </span>
      </div>

      <div className="relative mt-5 h-32">
        {/* dashed target line */}
        <div
          className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-ink-faint/40"
          style={{ top: `${(1 - target / max) * 100}%` }}
        />
        <div className="flex h-full items-end justify-between gap-2">
          {data.map((d, i) => {
            const heightPct = (d.kcal / max) * 100;
            const onTarget = d.kcal >= target * 0.9 && d.kcal <= target * 1.1;
            const barColor = onTarget ? "bg-sage" : d.kcal > target ? "bg-orange" : "bg-lilac";

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full justify-center" style={{ height: "100%" }}>
                  <div
                    className={`w-full max-w-[22px] rounded-t-lg rounded-b-md ${barColor} transition-all duration-500`}
                    style={{ height: `${Math.max(heightPct, 3)}%`, alignSelf: "flex-end" }}
                    title={`${d.kcal} kcal`}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-cream-deep/50 pt-3 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-sage" />Cân bằng</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-lilac" />Nhẹ</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-orange" />Đầy</span>
      </div>
    </DashboardCard>
  );
}
