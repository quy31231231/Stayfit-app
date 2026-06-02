/* StayFit UI Kit — Primitives + ring widgets
   All visual values come from CSS vars (../../colors_and_type.css), so every
   primitive themes itself when an ancestor carries `.dark`. */

const R = { sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)", xl: "var(--r-xl)", pill: "var(--r-pill)" };

function Card({ tone = "white", pad = 18, style, children, onClick, ...rest }) {
  const toneBg = {
    white: "var(--surface)", sage: "var(--protein-soft)", clay: "var(--carb-soft)",
    lilac: "var(--fat-soft)", mist: "var(--water-soft)", orange: "var(--orange-soft)",
  }[tone];
  return (
    <div onClick={onClick} style={{
      background: toneBg, borderRadius: R.lg, padding: pad,
      boxShadow: tone === "white" ? "var(--shadow-soft), var(--shadow-ring)" : "var(--shadow-soft)",
      ...style,
    }} {...rest}>{children}</div>
  );
}

function Eyebrow({ children, style }) {
  return <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.14em", color: "var(--ink-muted)", ...style }}>{children}</span>;
}

function Button({ variant = "primary", children, style, onClick, ...rest }) {
  const base = { fontFamily: "var(--font-sans)", border: "none", cursor: "pointer",
    fontWeight: 700, letterSpacing: "-0.01em", transition: "transform .15s, background .15s",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 };
  const v = {
    primary: { background: "var(--orange)", color: "var(--on-accent)", padding: "13px 20px",
      borderRadius: R.md, fontSize: 13, boxShadow: "var(--shadow-soft)" },
    chip: { background: "var(--cream-soft)", color: "var(--ink)", padding: "9px 15px",
      borderRadius: R.pill, fontSize: 12, boxShadow: "var(--shadow-ring)" },
    ghost: { background: "transparent", color: "var(--orange-deep)", padding: "9px 14px",
      borderRadius: R.pill, fontSize: 12, fontWeight: 600 },
  }[variant];
  return (
    <button onClick={onClick}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
      style={{ ...base, ...v, ...style }} {...rest}>{children}</button>
  );
}

/* — Calorie ring — gradient progress; track + gradient read from vars — */
function CalorieRing({ consumed = 0, target = 2000, size = 168 }) {
  const ratio = Math.min(1, target > 0 ? consumed / target : 0);
  const over = consumed > target;
  const remaining = Math.max(0, target - consumed);
  const stroke = 14, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const id = "cg" + Math.round(size);
  const vn = (n) => Math.round(n).toLocaleString("vi-VN");
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--ring-cal-from)"/><stop offset="100%" stopColor="var(--ring-cal-to)"/>
        </linearGradient></defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio)}
          style={{ transition: "stroke-dashoffset .6s ease-out" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Eyebrow>{over ? "Vượt" : remaining === 0 ? "Hoàn thành" : "Còn lại"}</Eyebrow>
        <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1,
          fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>
          {over ? `+${vn(consumed - target)}` : vn(remaining)}
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>/ {vn(target)} kcal</span>
      </div>
    </div>
  );
}

const MACRO = {
  protein: { ring: "var(--protein)", track: "var(--protein-soft)", label: "Protein" },
  carb:    { ring: "var(--carb)",    track: "var(--carb-soft)",    label: "Carb" },
  fat:     { ring: "var(--fat)",     track: "var(--fat-soft)",     label: "Fat" },
};
function MacroDonut({ kind = "protein", value = 0, target = 0, size = 70 }) {
  const t = MACRO[kind];
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  const stroke = 9, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.track} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.ring} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio)}
            style={{ transition: "stroke-dashoffset .6s ease-out" }}/>
        </svg>
        <span style={{ position: "absolute", fontSize: 15, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{Math.round(value)}</span>
      </div>
      <Eyebrow>{t.label}</Eyebrow>
    </div>
  );
}

Object.assign(window, { R, Card, Eyebrow, Button, CalorieRing, MacroDonut });
