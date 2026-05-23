"use client";

/**
 * StayFit · Sports preview — Wellness warm + Lime burn accent
 *
 * Giữ palette Headspace warm hiện tại (cream/terracotta/sage/clay/lilac)
 * và thêm:
 *  - Activity rings 3 vòng đồng tâm (Move/Exercise/Stand kiểu Apple Fitness)
 *  - Streak chip "🔥 7 ngày liên tiếp" với lime accent
 *  - Section "Vận động" mới — log workouts với kcal đốt
 *  - Lime #C6F432 cho mọi metric "đã đốt cháy"
 *  - Wording đậm vibe vận động hơn (Burn, PR, Streak)
 */

import { useState } from "react";

const C = {
  // Wellness palette (giữ nguyên)
  cream:        "#FBF8F2",
  creamSoft:    "#F4EFE6",
  creamDeep:    "#EBE3D2",
  canvas:       "#FFFFFF",
  ink:          "#2D2620",
  inkMuted:     "#7A7066",
  inkFaint:     "#B8AFA4",
  orange:       "#D97757",
  orangeSoft:   "#F7E8DC",
  orangeDeep:   "#7A3318",
  sage:         "#5F8266",
  sageSoft:     "#DDE7DC",
  clay:         "#C49A4A",
  claySoft:     "#F0E5CC",
  lilac:        "#9B8AB8",
  lilacSoft:    "#E5DDED",
  mist:         "#6B95AB",
  // NEW: Energy accents cho vận động
  lime:         "#C6F432",
  limeDeep:     "#8FAD1F",
  limeSoft:     "#F0F8D6",
  // Activity ring colors (Apple Fitness inspired, warm-mapped)
  ringMove:     "#D97757",  // Terracotta — Move (calo)
  ringExercise: "#C6F432",  // Lime — Exercise minutes
  ringStand:    "#5F8266",  // Sage — Stand/hours active
};

const TODAY = {
  consumed: 1302,
  target: 2000,
  burned: 320,
  protein: { value: 95, target: 140 },
  carb:    { value: 120, target: 250 },
  fat:     { value: 45, target: 70 },
  move:    { value: 320, target: 500 },   // kcal đốt qua vận động
  exercise:{ value: 35, target: 60 },     // phút tập
  stand:   { value: 9, target: 12 },      // giờ active
};
const WORKOUTS = [
  { id: 1, name: "Chạy bộ", icon: "🏃", duration: "30 phút", kcal: 230, intensity: "vừa" },
  { id: 2, name: "Chống đẩy", icon: "💪", duration: "10 phút · 50 reps", kcal: 60, intensity: "cao" },
  { id: 3, name: "Đi bộ nhanh", icon: "🚶", duration: "12 phút", kcal: 30, intensity: "nhẹ" },
];
const STREAK = 7;
const STEPS = 8420;
const MEALS = [
  { name: "Bữa sáng", icon: "☀️", items: 3, kcal: 420 },
  { name: "Bữa trưa", icon: "🌤", items: 4, kcal: 650 },
  { name: "Bữa tối",  icon: "🌙", items: 4, kcal: 232 },
  { name: "Ăn vặt",   icon: "⭐", items: 0, kcal: 0 },
];

const fmt = (n) => Math.round(n).toLocaleString("vi-VN");

export default function SportsPreview() {
  const remaining = Math.max(0, TODAY.target - TODAY.consumed + TODAY.burned);
  const movePct = Math.min(100, (TODAY.move.value / TODAY.move.target) * 100);
  const exercisePct = Math.min(100, (TODAY.exercise.value / TODAY.exercise.target) * 100);
  const standPct = Math.min(100, (TODAY.stand.value / TODAY.stand.target) * 100);

  return (
    <div className="min-h-screen bg-cream pb-24 text-ink" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* SLIM HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-cream-deep px-4 py-3" style={{ background: "rgba(251, 248, 242, 0.85)" }}>
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
          <button className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-cream-soft transition" aria-label="Ngày trước">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 19l-7-7 7-7v14z"/></svg>
          </button>
          <div className="text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Hôm nay</span>
            <p className="text-sm font-bold text-ink tabular-nums">23/05/2026</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-cream-soft transition" aria-label="Ngày sau">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5l7 7-7 7V5z"/></svg>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-5 max-w-md md:max-w-2xl mx-auto">

        {/* GREETING + STREAK CHIP */}
        <section>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-deep ring-1 ring-sage/15">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                Thứ Bảy, 23 tháng 5
              </span>
              <h1 className="mt-3 text-[26px] md:text-[32px] font-bold leading-tight tracking-tight text-ink">
                Chào buổi sáng, <span className="text-orange-deep">Quy</span>
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">Hôm nay là một ngày tuyệt vời để vận động.</p>
            </div>

            {/* STREAK CHIP — lime accent */}
            <div
              className="shrink-0 flex flex-col items-center gap-0.5 rounded-2xl px-4 py-3 ring-1"
              style={{
                background: "linear-gradient(135deg, #F0F8D6 0%, #E8F4B8 100%)",
                ringColor: `${C.lime}50`,
                boxShadow: "0 0 0 1px rgba(143, 173, 31, 0.2)",
              }}
            >
              <span className="text-xl">🔥</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.limeDeep, letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {STREAK}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: C.limeDeep }}>
                ngày
              </span>
            </div>
          </div>
        </section>

        {/* HERO CARD — Calorie + Macros + Equation (no activity rings) */}
        <section className="rounded-3xl bg-white p-5 md:p-6 shadow-soft ring-1 ring-cream-deep/60">

          {/* Calorie ring centered */}
          <div className="flex justify-center">
            <CalorieRing consumed={TODAY.consumed} target={TODAY.target} burned={TODAY.burned} />
          </div>

          {/* MACROS */}
          <div className="mt-6 pt-5 border-t border-cream-deep/50 grid grid-cols-3 gap-3">
            <MacroDonut kind="protein" value={TODAY.protein.value} target={TODAY.protein.target} />
            <MacroDonut kind="carb"    value={TODAY.carb.value}    target={TODAY.carb.target} />
            <MacroDonut kind="fat"     value={TODAY.fat.value}     target={TODAY.fat.target} />
          </div>

          {/* EQUATION — 3 cell như app gốc */}
          <div className="mt-5 flex items-stretch gap-1 border-t border-cream-deep/50 pt-5 text-center">
            <EqCell label="Cần khoảng" value={fmt(TODAY.target)} tone="neutral" />
            <Op>−</Op>
            <EqCell label="Đã nạp" value={fmt(TODAY.consumed)} tone="sage" />
            <Op>=</Op>
            <EqCell label="Còn dư" value={fmt(TODAY.target - TODAY.consumed)} tone="orange" highlight />
          </div>
        </section>

        {/* THÊM MÓN — giống app chính */}
        <section className="rounded-3xl bg-white p-5 md:p-6 shadow-soft ring-1 ring-cream-deep/60">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-orange-deep">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </span>
              <h3 className="text-[15px] font-bold tracking-tight text-ink leading-none">Thêm món</h3>
            </div>
            <div className="relative">
              <select className="appearance-none bg-cream-soft hover:bg-cream-deep text-[11px] font-semibold text-ink py-2 pl-3.5 pr-9 rounded-full outline-none cursor-pointer ring-1 ring-cream-deep/60 focus:ring-2 focus:ring-orange/30 transition" defaultValue="Bữa trưa">
                <option>Bữa sáng</option><option>Bữa trưa</option><option>Bữa tối</option><option>Ăn vặt</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </header>

          {/* Tabs */}
          <div className="mt-5 flex gap-1 p-1 bg-cream-soft rounded-2xl">
            <button className="flex-1 py-2.5 text-[12px] font-semibold rounded-xl bg-white text-orange-deep shadow-soft ring-1 ring-cream-deep/60">Chọn nhanh</button>
            <button className="flex-1 py-2.5 text-[12px] font-semibold rounded-xl text-ink-muted">Nhập tay</button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Tìm món ăn..." className="w-full bg-cream-soft ring-1 ring-cream-deep/40 rounded-2xl py-3 pl-10 pr-4 text-[13px] font-medium outline-none focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition" />
          </div>

          {/* Food grid sample */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { name: "Tỏi", kcal: 149 },
              { name: "Hành tây", kcal: 40 },
              { name: "Cà chua", kcal: 18 },
              { name: "Khoai tây", kcal: 77 },
            ].map((f, i) => (
              <button key={i} className="p-3.5 rounded-2xl text-left bg-cream-soft ring-1 ring-transparent hover:ring-cream-deep transition">
                <p className="truncate text-[11px] font-semibold tracking-tight text-ink mb-0.5">{f.name}</p>
                <p className="text-[12px] font-bold text-ink tabular-nums">{f.kcal} <span className="text-[9px] font-medium text-ink-muted">kcal/100g</span></p>
              </button>
            ))}
          </div>
        </section>

        {/* NHẬT KÝ BỮA ĂN — giữ nguyên style cũ */}
        <section>
          <div className="flex items-baseline justify-between px-1 mb-3">
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Nhật ký bữa ăn</h2>
            <span className="text-[11px] font-medium text-ink-muted tabular-nums">11 món · 1,302 kcal</span>
          </div>

          <div className="space-y-3">
            {MEALS.map(m => (
              <MealCard key={m.name} {...m} />
            ))}
          </div>
        </section>
      </main>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md md:max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border-t border-cream-deep p-4 flex justify-around items-center rounded-t-[2.5rem]">
        <NavItem icon="📝" label="Nhật ký" active />
        <NavItem icon="📊" label="Thống kê" />
        <NavItem icon="👤" label="Hồ sơ" />
      </div>
    </div>
  );
}

/* ─────────────── COMPONENTS ─────────────── */

function CalorieRing({ consumed, target, burned }) {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const remaining = Math.max(0, target - consumed + burned);
  const ratio = Math.min(1, (consumed) / (target + burned));
  const offset = c * (1 - ratio);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="calRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E89B7B"/>
            <stop offset="100%" stopColor="#D97757"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F4EFE6" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#calRing)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }} className="text-ink-muted">Còn dư</span>
        <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }} className="mt-1 text-ink">{fmt(remaining)}</span>
        <span style={{ fontSize: 9, fontVariantNumeric: "tabular-nums" }} className="text-ink-muted mt-1">{fmt(consumed)}/{fmt(target)}</span>
      </div>
    </div>
  );
}

function ActivityRings({ move, exercise, stand }) {
  // 3 vòng đồng tâm: ngoài cùng = Move, giữa = Exercise, trong = Stand
  const size = 140;
  const center = size / 2;

  const ring = (radius, stroke, percent, color, bgColor) => {
    const c = 2 * Math.PI * radius;
    const offset = c * (1 - percent / 100);
    return (
      <>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={bgColor} strokeWidth={stroke}/>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}/>
      </>
    );
  };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {ring(58, 10, move,     C.ringMove,     "#F4EFE6")}
        {ring(42, 10, exercise, C.ringExercise, "#F0F8D6")}
        {ring(26, 10, stand,    C.ringStand,    "#DDE7DC")}
      </svg>
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl">⚡</span>
      </div>
    </div>
  );
}

function RingLegend({ color, label, value, target, unit }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }}/>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">{label}</span>
      </div>
      <p className="text-[14px] font-bold text-ink tabular-nums leading-none">
        {fmt(value)}<span className="text-[10px] font-medium text-ink-muted ml-0.5">/{fmt(target)}</span>
      </p>
      <p className="text-[9px] text-ink-faint mt-0.5">{unit}</p>
    </div>
  );
}

const MACRO_TONE = {
  protein: { ring: "#5F8266", track: "#DDE7DC", label: "Protein" },
  carb:    { ring: "#C49A4A", track: "#F0E5CC", label: "Carb" },
  fat:     { ring: "#9B8AB8", track: "#E5DDED", label: "Fat" },
};

function MacroDonut({ kind, value, target }) {
  const t = MACRO_TONE[kind];
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, value / target);
  const offset = c * (1 - ratio);
  const remaining = Math.max(0, target - value);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.track} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.ring} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[13px] font-bold tabular-nums text-ink leading-none">{value}</span>
          <span className="text-[9px] font-medium text-ink-muted tabular-nums">/{target}g</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-ink">{t.label}</p>
      <p className="text-[9px] font-medium text-ink-muted tabular-nums">
        {remaining > 0 ? `thêm ${remaining}g` : "đủ ✓"}
      </p>
    </div>
  );
}

function EqCell({ label, value, tone = "neutral", highlight = false }) {
  const styles = {
    neutral: { bg: C.creamSoft, text: C.ink },
    sage:    { bg: C.sageSoft, text: C.sage },
    clay:    { bg: C.claySoft, text: C.clay },
    lime:    { bg: C.limeSoft, text: C.limeDeep },
    orange:  { bg: C.orange,   text: "#fff" },
  }[tone];

  return (
    <div className="flex-1 min-w-0 rounded-2xl py-2.5 px-1" style={{ background: styles.bg }}>
      <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: styles.text }}>{value}</p>
      <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4, opacity: highlight ? 0.85 : 0.7, color: styles.text, whiteSpace: "nowrap" }}>{label}</p>
    </div>
  );
}

function Op({ children }) {
  return (
    <span className="flex items-center text-sm font-light text-ink-faint shrink-0 px-0.5">{children}</span>
  );
}

function MealCard({ name, icon, items, kcal }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-cream-deep/60">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream-soft text-xl">{icon}</span>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink">{name}</h3>
            <p className="mt-0.5 text-[11px] font-medium text-ink-muted tabular-nums">
              {items === 0 ? "Chưa có món" : `${items} món · ${fmt(kcal)} kcal`}
            </p>
          </div>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-cream-soft text-ink ring-1 ring-cream-deep/40 transition hover:bg-orange hover:text-white" aria-label="Thêm món">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </header>
    </section>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <button className={`flex flex-col items-center gap-1 w-1/3 transition ${active ? "text-orange-deep" : "text-ink-faint opacity-60"}`}>
      <span className="text-xl">{icon}</span>
      <span className="text-[9px] uppercase font-bold tracking-tighter">{label}</span>
    </button>
  );
}
