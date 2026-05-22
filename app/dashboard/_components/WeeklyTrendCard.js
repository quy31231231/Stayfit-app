"use client";

import DashboardCard from "./DashboardCard";

export default function WeeklyTrendCard({ data = [], target = 2000 }) {
  const max = Math.max(target, ...data.map((d) => d.kcal), 1);
  const avg = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.kcal, 0) / data.length) : 0;

  return (
    <DashboardCard tone="cream" padding="lg">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-bold text-ink">Xu hướng 7 ngày</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Trung bình {avg.toLocaleString("vi-VN")} kcal / ngày</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-muted shadow-soft">
          Mục tiêu {target.toLocaleString("vi-VN")}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-2 h-32">
        {data.map((d, i) => {
          const heightPct = (d.kcal / max) * 100;
          const onTarget = d.kcal >= target * 0.9 && d.kcal <= target * 1.1;
          const barColor = onTarget ? "bg-sage" : d.kcal > target ? "bg-orange" : "bg-lilac";

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full justify-center" style={{ height: "100%" }}>
                <div
                  className={`w-full max-w-[28px] rounded-xl ${barColor} transition-all`}
                  style={{ height: `${Math.max(heightPct, 3)}%`, alignSelf: "flex-end" }}
                  title={`${d.kcal} kcal`}
                />
              </div>
              <span className="text-[10px] font-medium text-ink-muted">{d.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-sage" />Đạt mục tiêu</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-lilac" />Thiếu</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-orange" />Vượt</span>
      </div>
    </DashboardCard>
  );
}
