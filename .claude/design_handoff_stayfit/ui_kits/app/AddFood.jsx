/* StayFit UI Kit — "Thêm món" (Add food) card. Quick-pick search + grid that
   actually inserts items into the day's log. */
const { useState: useStateAF } = React;

function AddFood({ selectedMeal, onSelectMeal, onAddFood }) {
  const [tab, setTab] = useStateAF("quick");
  const [q, setQ] = useStateAF("");
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const results = FOOD_LIBRARY.filter((f) => !q || norm(f.name).includes(norm(q)));

  const Tab = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, padding: 9, border: "none", cursor: "pointer",
      borderRadius: "var(--r-sm)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12,
      background: tab === id ? "var(--surface)" : "transparent",
      color: tab === id ? "var(--orange-deep)" : "var(--ink-muted)",
      boxShadow: tab === id ? "var(--shadow-ring)" : "none", transition: "all .15s" }}>{label}</button>
  );

  const ActionBtn = ({ children, label, dark }) => (
    <button aria-label={label} title={label} style={{ width: 36, height: 36, borderRadius: "var(--r-pill)",
      border: "none", cursor: "pointer", display: "grid", placeItems: "center",
      background: dark ? "var(--ink)" : "var(--orange)", color: dark ? "var(--cream)" : "var(--on-accent)",
      boxShadow: "var(--shadow-soft)" }}>{children}</button>
  );

  return (
    <Card tone="white" pad={18}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center",
            background: "var(--orange-soft)", color: "var(--orange-deep)" }}><IcPlus size={20} sw={2.5}/></span>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.012em", color: "var(--ink)" }}>Thêm món</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <ActionBtn label="Quét ảnh ✨"><IcCamera size={16} sw={2}/></ActionBtn>
          <ActionBtn label="Mô tả ✨"><IcEdit size={16} sw={2}/></ActionBtn>
          <ActionBtn label="Kiểm tra sản phẩm" dark><IcBarcode size={16} sw={2}/></ActionBtn>
          <div style={{ position: "relative" }}>
            <select value={selectedMeal} onChange={(e) => onSelectMeal(e.target.value)} style={{ appearance: "none",
              background: "var(--cream-soft)", color: "var(--ink)", fontFamily: "var(--font-sans)", fontWeight: 600,
              fontSize: 11, padding: "8px 30px 8px 13px", borderRadius: "var(--r-pill)", border: "none",
              cursor: "pointer", boxShadow: "var(--shadow-ring)" }}>
              {MEAL_ORDER.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
              color: "var(--ink-muted)", pointerEvents: "none", display: "grid" }}><IcChevD size={13} sw={2.5}/></span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--cream-soft)", borderRadius: "var(--r-md)", marginTop: 18 }}>
        <Tab id="quick" label="Chọn nhanh"/><Tab id="custom" label="Nhập tay"/><Tab id="recipe" label="Ghép món"/>
      </div>

      {tab === "quick" ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              color: "var(--ink-muted)", display: "grid" }}><IcSearch size={16} sw={2}/></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm món ăn..." style={{ width: "100%",
              boxSizing: "border-box", background: "var(--cream-soft)", border: "1px solid var(--cream-deep)",
              borderRadius: "var(--r-md)", padding: "12px 14px 12px 38px", fontFamily: "var(--font-sans)",
              fontSize: 13, fontWeight: 500, color: "var(--ink)", outline: "none" }}/>
          </div>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            maxHeight: 220, overflowY: "auto" }} className="no-scrollbar">
            {results.map((f) => (
              <button key={f.name} onClick={() => onAddFood(f)} style={{ textAlign: "left", border: "1px solid var(--hairline)",
                background: "var(--cream-soft)", borderRadius: "var(--r-md)", padding: "11px 13px", cursor: "pointer",
                fontFamily: "var(--font-sans)", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em" }}>{f.name}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
                  <strong style={{ fontWeight: 700, color: "var(--ink)" }}>{f.kcal}</strong> kcal/{f.per}{f.unit}</span>
              </button>
            ))}
            {results.length === 0 && <p style={{ gridColumn: "1/-1", textAlign: "center", fontSize: 12,
              color: "var(--ink-muted)", padding: "16px 0", margin: 0 }}>Không tìm thấy món nào</p>}
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--ink-muted)", padding: "20px 0" }}>
          {tab === "custom" ? "Nhập tay — biểu mẫu calo/macro tự nhập." : "Ghép món — cộng nhiều nguyên liệu thành một suất."}
        </p>
      )}
    </Card>
  );
}

Object.assign(window, { AddFood });
