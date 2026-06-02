/* StayFit UI Kit — Journal screen (the home / Nhật ký tab). */
const { useState, useMemo } = React;

function GreetingHeader({ name, theme, onToggleTheme, compact = false }) {
  const quote = QUOTES[new Date().getHours() % QUOTES.length];
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "var(--r-pill)",
          fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em",
          background: "var(--protein-soft)", color: "var(--protein-deep)",
          boxShadow: "inset 0 0 0 1px var(--hairline)" }}>Thứ Ba, 3 tháng 6</span>
        <h1 style={{ margin: compact ? "10px 0 0" : "12px 0 0", fontSize: compact ? 22 : 26,
          fontWeight: 700, letterSpacing: "-0.012em", color: "var(--ink)", lineHeight: 1.15 }}>
          Chào buổi sáng, <span style={{ color: "var(--orange-deep)" }}>{name}</span>
        </h1>
        {!compact && <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--ink-muted)", fontWeight: 500 }}>{quote}</p>}
      </div>
      <button onClick={onToggleTheme} aria-label="Đổi giao diện" style={{ flexShrink: 0,
        width: 44, height: 44, borderRadius: "var(--r-md)", border: "none", cursor: "pointer",
        background: "var(--surface)", color: "var(--ink)", display: "grid", placeItems: "center",
        boxShadow: "var(--shadow-soft), var(--shadow-ring)" }}>
        {theme === "dark" ? <IcSun size={20}/> : <IcMoon size={20}/>}
      </button>
    </header>
  );
}

function CalorieHero({ totals, target, density = "spacious", macros = "bars" }) {
  const remaining = Math.max(0, target.kcal - totals.kcal);
  const over = totals.kcal > target.kcal;
  const vn = (n) => Math.round(n).toLocaleString("vi-VN");
  const compact = density === "compact";
  const ringSize = compact ? 152 : 208;
  const cardPad = compact ? 18 : 24;
  const sectionGap = compact ? 12 : 18;
  const numSize = compact ? 18 : 22;

  const MacroBar = ({ kind, value, target }) => {
    const t = MACRO[kind];
    const ratio = target > 0 ? Math.min(1, value / target) : 0;
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <Eyebrow style={{ color: t.ring, letterSpacing: "0.16em" }}>{t.label}</Eyebrow>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{Math.round(value)}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-faint)",
            fontVariantNumeric: "tabular-nums" }}>/ {target}g</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: t.track, overflow: "hidden", position: "relative" }}>
          <div style={{ height: "100%", width: `${ratio * 100}%`, background: t.ring,
            borderRadius: 999, transition: "width .6s ease-out" }}/>
        </div>
      </div>
    );
  };

  const MacroNumber = ({ kind, value, target }) => {
    const t = MACRO[kind];
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <Eyebrow style={{ color: t.ring, letterSpacing: "0.16em" }}>{t.label}</Eyebrow>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{Math.round(value)}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-faint)",
            fontVariantNumeric: "tabular-nums" }}>g</span>
        </div>
      </div>
    );
  };

  const MacroComponent = macros === "donuts" ? null : macros === "numbers" ? MacroNumber : MacroBar;

  return (
    <Card tone="white" pad={cardPad} style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 4, marginBottom: sectionGap }}>
        <CalorieRing consumed={totals.kcal} target={target.kcal} size={ringSize}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
        padding: `${compact ? 10 : 14}px 4px 4px`, borderTop: "1px solid var(--hairline)" }}>
        <div>
          <Eyebrow>Đã nạp</Eyebrow>
          <p style={{ margin: "6px 0 0", display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: numSize, fontWeight: 800, color: "var(--ink)",
              letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{vn(totals.kcal)}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-faint)",
              fontVariantNumeric: "tabular-nums" }}>/ {vn(target.kcal)} kcal</span>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <Eyebrow style={{ color: over ? "#C94040" : "var(--orange-deep)" }}>
            {over ? "Vượt" : "Còn dư"}
          </Eyebrow>
          <p style={{ margin: "6px 0 0", display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
            <span style={{ fontSize: numSize, fontWeight: 800,
              color: over ? "#C94040" : "var(--orange-deep)",
              letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {over ? `+${vn(totals.kcal - target.kcal)}` : vn(remaining)}
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-faint)",
              fontVariantNumeric: "tabular-nums" }}>kcal</span>
          </p>
        </div>
      </div>
      <div style={{ display: macros === "donuts" ? "grid" : "flex",
        gridTemplateColumns: macros === "donuts" ? "1fr 1fr 1fr" : undefined,
        gap: 16, marginTop: sectionGap, paddingTop: compact ? 12 : 16,
        borderTop: "1px solid var(--hairline)" }}>
        {macros === "donuts" ? (
          <React.Fragment>
            <MacroDonut kind="protein" value={totals.protein} target={target.protein} size={compact ? 60 : 74}/>
            <MacroDonut kind="carb"    value={totals.carb}    target={target.carb}    size={compact ? 60 : 74}/>
            <MacroDonut kind="fat"     value={totals.fat}     target={target.fat}     size={compact ? 60 : 74}/>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <MacroComponent kind="protein" value={totals.protein} target={target.protein}/>
            <MacroComponent kind="carb"    value={totals.carb}    target={target.carb}/>
            <MacroComponent kind="fat"     value={totals.fat}     target={target.fat}/>
          </React.Fragment>
        )}
      </div>
    </Card>
  );
}

function FoodItem({ item, onRemove }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 14px", borderRadius: "var(--r-md)",
        background: hover ? "var(--cream-soft)" : "transparent", transition: "background .15s" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
        <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 500, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
          {item.quantity}{item.unit}
          <span style={{ color: "var(--ink-faint)" }}> · </span>
          <span style={{ color: "var(--protein)" }}>{Math.round(item.protein)}P</span>
          <span style={{ color: "var(--ink-faint)" }}>/</span>
          <span style={{ color: "var(--carb-deep)" }}>{Math.round(item.carb)}C</span>
          <span style={{ color: "var(--ink-faint)" }}>/</span>
          <span style={{ color: "var(--fat-deep)" }}>{Math.round(item.fat)}F</span>
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {Math.round(item.kcal)} <span style={{ fontSize: 10, fontWeight: 500, color: "var(--ink-muted)" }}>kcal</span>
        </span>
        <button onClick={() => onRemove(item.id)} aria-label="Xóa" style={{ width: 28, height: 28,
          borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", display: "grid", placeItems: "center",
          background: "transparent", color: "var(--ink-faint)", opacity: hover ? 1 : 0, transition: "opacity .15s" }}>
          <IcX size={14} sw={2.5}/>
        </button>
      </div>
    </div>
  );
}

function MealSection({ meal, items, onAdd, onRemove }) {
  const theme = MEAL_THEME[meal];
  const total = items.reduce((s, i) => s + i.kcal, 0);
  const empty = items.length === 0;
  return (
    <Card tone="white" pad={18}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid",
            placeItems: "center", fontSize: 20, background: TONE_BG[theme.tone] }}>{theme.icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.012em", color: "var(--ink)" }}>{meal}</h3>
            <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 500, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
              {empty ? "Khi nào sẵn sàng, ghi vào nhé" : `${items.length} món · ${Math.round(total)} kcal`}</p>
          </div>
        </div>
        <button onClick={() => onAdd(meal)} aria-label={`Thêm vào ${meal}`} style={{ width: 40, height: 40,
          borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", display: "grid", placeItems: "center",
          background: "var(--cream-soft)", color: "var(--ink)", boxShadow: "var(--shadow-ring)" }}>
          <IcPlus size={18} sw={2.5}/>
        </button>
      </header>
      {!empty && <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => <FoodItem key={it.id} item={it} onRemove={onRemove}/>)}
      </div>}
      {empty && <button onClick={() => onAdd(meal)} style={{ marginTop: 14, width: "100%",
        borderRadius: "var(--r-md)", border: "1px dashed var(--cream-deep)", background: "transparent",
        padding: "16px", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", cursor: "pointer",
        fontFamily: "var(--font-sans)" }}>Ghi món cho {meal.toLowerCase()}</button>}
    </Card>
  );
}

Object.assign(window, { GreetingHeader, CalorieHero, FoodItem, MealSection });
