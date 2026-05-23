"use client";

/**
 * Shared health preview layout — used by /preview-health-1, -2, -4
 * Takes a `palette` prop with all theme colors.
 * Structure mirrors current journal view of main app (giữ layout y nguyên).
 */

const MEALS = [
  { name: "Bữa sáng", icon: "☀️", items: 3, kcal: 420 },
  { name: "Bữa trưa", icon: "🌤", items: 4, kcal: 650 },
  { name: "Bữa tối",  icon: "🌙", items: 4, kcal: 232 },
  { name: "Ăn vặt",   icon: "⭐", items: 0, kcal: 0 },
];
const TODAY = {
  consumed: 1302,
  target: 2000,
  protein: { value: 95, target: 140 },
  carb:    { value: 120, target: 250 },
  fat:     { value: 45, target: 70 },
};
const fmt = (n) => Math.round(n).toLocaleString("vi-VN");

export default function HealthPreviewBase({ palette: P, label }) {
  const remaining = Math.max(0, TODAY.target - TODAY.consumed);

  return (
    <div className="min-h-screen pb-24" style={{ background: P.bg, color: P.ink, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md px-4 py-3 border-b" style={{ background: P.bgHeader, borderColor: P.hairline }}>
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
          <button className="grid h-9 w-9 place-items-center rounded-full" style={{ color: P.inkMuted }} aria-label="Ngày trước">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 19l-7-7 7-7v14z"/></svg>
          </button>
          <div className="text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: P.inkMuted }}>Hôm nay</span>
            <p className="text-sm font-bold tabular-nums" style={{ color: P.ink }}>23/05/2026</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full" style={{ color: P.inkMuted }} aria-label="Ngày sau">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5l7 7-7 7V5z"/></svg>
          </button>
        </div>
      </header>

      {/* Variant label chip — chỉ trong preview, không có ở app chính */}
      <div className="max-w-md md:max-w-2xl mx-auto px-4 pt-3">
        <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: P.primarySoft, color: P.primaryDeep }}>
          Preview · {label}
        </span>
      </div>

      <main className="p-4 space-y-5 max-w-md md:max-w-2xl mx-auto">

        {/* Greeting */}
        <section>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ background: P.sageSoft, color: P.sageDeep, boxShadow: `inset 0 0 0 1px ${P.sage}33` }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: P.sage }}/>
            Thứ Bảy, 23 tháng 5
          </span>
          <h1 className="mt-3 text-[26px] md:text-[32px] font-bold leading-tight tracking-tight" style={{ color: P.ink }}>
            Chào buổi sáng, <span style={{ color: P.primaryDeep }}>Quy</span>
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: P.inkMuted }}>Hôm nay là một ngày tuyệt vời để chăm sóc bản thân.</p>
        </section>

        {/* Hero card */}
        <section className="rounded-3xl p-5 md:p-6" style={{ background: P.card, boxShadow: `inset 0 0 0 1px ${P.hairline}, 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08)` }}>
          <div className="flex justify-center">
            <CalorieRing consumed={TODAY.consumed} target={TODAY.target} palette={P} />
          </div>

          <div className="mt-6 pt-5 border-t grid grid-cols-3 gap-3" style={{ borderColor: P.hairline }}>
            <MacroDonut kind="protein" value={TODAY.protein.value} target={TODAY.protein.target} palette={P} />
            <MacroDonut kind="carb"    value={TODAY.carb.value}    target={TODAY.carb.target}    palette={P} />
            <MacroDonut kind="fat"     value={TODAY.fat.value}     target={TODAY.fat.target}     palette={P} />
          </div>

          <div className="mt-5 flex items-stretch gap-1 border-t pt-5 text-center" style={{ borderColor: P.hairline }}>
            <EqCell label="Cần khoảng" value={fmt(TODAY.target)} bg={P.neutralSoft} text={P.ink} />
            <Op color={P.inkFaint}>−</Op>
            <EqCell label="Đã nạp" value={fmt(TODAY.consumed)} bg={P.sageSoft} text={P.sageDeep} />
            <Op color={P.inkFaint}>=</Op>
            <EqCell label="Còn dư" value={fmt(remaining)} bg={P.primary} text="#fff" highlight />
          </div>
        </section>

        {/* Thêm món */}
        <section className="rounded-3xl p-5 md:p-6" style={{ background: P.card, boxShadow: `inset 0 0 0 1px ${P.hairline}, 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08)` }}>
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: P.primarySoft, color: P.primaryDeep }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </span>
              <h3 className="text-[15px] font-bold tracking-tight leading-none" style={{ color: P.ink }}>Thêm món</h3>
            </div>
            <div className="rounded-full px-3.5 py-2 text-[11px] font-semibold flex items-center gap-2" style={{ background: P.neutralSoft, color: P.ink, boxShadow: `inset 0 0 0 1px ${P.hairline}` }}>
              Bữa trưa
              <svg className="w-3 h-3" style={{ color: P.inkMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </header>

          <div className="mt-5 flex gap-1 p-1 rounded-2xl" style={{ background: P.neutralSoft }}>
            <button className="flex-1 py-2.5 text-[12px] font-semibold rounded-xl" style={{ background: P.card, color: P.primaryDeep, boxShadow: `inset 0 0 0 1px ${P.hairline}, 0 1px 2px rgba(0,0,0,0.05)` }}>Chọn nhanh</button>
            <button className="flex-1 py-2.5 text-[12px] font-semibold" style={{ color: P.inkMuted }}>Nhập tay</button>
          </div>

          <div className="mt-4 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: P.inkMuted }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Tìm món ăn..." className="w-full rounded-2xl py-3 pl-10 pr-4 text-[13px] font-medium outline-none" style={{ background: P.neutralSoft, boxShadow: `inset 0 0 0 1px ${P.hairline}`, color: P.ink }} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { name: "Tỏi", kcal: 149 },
              { name: "Hành tây", kcal: 40 },
              { name: "Cà chua", kcal: 18 },
              { name: "Khoai tây", kcal: 77 },
            ].map((f, i) => (
              <button key={i} className="p-3.5 rounded-2xl text-left transition" style={{ background: P.neutralSoft, boxShadow: `inset 0 0 0 1px ${P.hairline}` }}>
                <p className="truncate text-[11px] font-semibold tracking-tight mb-0.5" style={{ color: P.ink }}>{f.name}</p>
                <p className="text-[12px] font-bold tabular-nums" style={{ color: P.ink }}>{f.kcal} <span className="text-[9px] font-medium" style={{ color: P.inkMuted }}>kcal/100g</span></p>
              </button>
            ))}
          </div>
        </section>

        {/* Nhật ký bữa ăn */}
        <section>
          <div className="flex items-baseline justify-between px-1 mb-3">
            <h2 className="text-[15px] font-bold tracking-tight" style={{ color: P.ink }}>Nhật ký bữa ăn</h2>
            <span className="text-[11px] font-medium tabular-nums" style={{ color: P.inkMuted }}>11 món · 1,302 kcal</span>
          </div>

          <div className="space-y-3">
            {MEALS.map(m => <MealCard key={m.name} {...m} palette={P} />)}
          </div>
        </section>
      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md md:max-w-2xl mx-auto backdrop-blur-xl border-t p-4 flex justify-around items-center rounded-t-[2.5rem]" style={{ background: `${P.card}E6`, borderColor: P.hairline }}>
        <NavItem icon="📝" label="Nhật ký" active palette={P} />
        <NavItem icon="📊" label="Thống kê" palette={P} />
        <NavItem icon="👤" label="Hồ sơ" palette={P} />
      </div>
    </div>
  );
}

function CalorieRing({ consumed, target, palette: P }) {
  const size = 200;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, consumed / target);
  const offset = c * (1 - ratio);
  const remaining = Math.max(0, target - consumed);
  const fmt = (n) => Math.round(n).toLocaleString("vi-VN");
  const id = `ring-${P.primary.replace("#", "")}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={P.primarySoft2 || P.primary}/>
            <stop offset="100%" stopColor={P.primary}/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.neutralSoft} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: P.inkMuted }}>Còn dư</span>
        <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: P.ink, marginTop: 4 }}>{fmt(remaining)}</span>
        <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: P.inkMuted, marginTop: 6 }}>/ {fmt(target)}</span>
      </div>
    </div>
  );
}

function MacroDonut({ kind, value, target, palette: P }) {
  const macro = P.macros[kind];
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
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={macro.track} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={macro.ring} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[13px] font-bold tabular-nums leading-none" style={{ color: P.ink }}>{value}</span>
          <span className="text-[9px] font-medium tabular-nums" style={{ color: P.inkMuted }}>/{target}g</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: P.ink }}>{macro.label}</p>
      <p className="text-[9px] font-medium tabular-nums" style={{ color: P.inkMuted }}>
        {remaining > 0 ? `thêm ${remaining}g` : "đủ ✓"}
      </p>
    </div>
  );
}

function EqCell({ label, value, bg, text, highlight }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl py-2.5 px-1" style={{ background: bg, color: text, boxShadow: highlight ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
      <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4, opacity: highlight ? 0.85 : 0.7, whiteSpace: "nowrap" }}>{label}</p>
    </div>
  );
}

function Op({ children, color }) {
  return <span className="flex items-center text-sm font-light shrink-0 px-0.5" style={{ color }}>{children}</span>;
}

function MealCard({ name, icon, items, kcal, palette: P }) {
  return (
    <section className="rounded-3xl p-5" style={{ background: P.card, boxShadow: `inset 0 0 0 1px ${P.hairline}, 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08)` }}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl text-xl" style={{ background: P.neutralSoft }}>{icon}</span>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight" style={{ color: P.ink }}>{name}</h3>
            <p className="mt-0.5 text-[11px] font-medium tabular-nums" style={{ color: P.inkMuted }}>
              {items === 0 ? "Chưa có món" : `${items} món · ${Math.round(kcal).toLocaleString("vi-VN")} kcal`}
            </p>
          </div>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full transition" style={{ background: P.neutralSoft, color: P.ink, boxShadow: `inset 0 0 0 1px ${P.hairline}` }} aria-label="Thêm món">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </header>
    </section>
  );
}

function NavItem({ icon, label, active, palette: P }) {
  return (
    <button className="flex flex-col items-center gap-1 w-1/3" style={{ color: active ? P.primaryDeep : P.inkFaint, opacity: active ? 1 : 0.6 }}>
      <span className="text-xl">{icon}</span>
      <span className="text-[9px] uppercase font-bold tracking-tighter">{label}</span>
    </button>
  );
}
