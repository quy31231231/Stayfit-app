/* StayFit UI Kit — Stats, Profile, Water, BottomNav, Login. */

function WeeklyTrend({ data, target }) {
  const max = Math.max(target, ...data.map((d) => d.kcal), 1);
  const avg = Math.round(data.reduce((s, d) => s + d.kcal, 0) / data.length);
  return (
    <Card tone="white" pad={20}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <Eyebrow>7 ngày</Eyebrow>
          <h3 style={{ margin: "5px 0 0", fontSize: 15, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.012em" }}>Xu hướng năng lượng</h3>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
            TB <strong style={{ color: "var(--ink)" }}>{avg.toLocaleString("vi-VN")}</strong> kcal / ngày</p>
        </div>
        <span style={{ background: "var(--cream-soft)", color: "var(--ink-muted)", padding: "6px 12px",
          borderRadius: "var(--r-pill)", fontSize: 10, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.08em", boxShadow: "var(--shadow-ring)", fontVariantNumeric: "tabular-nums" }}>
          Mục tiêu {target.toLocaleString("vi-VN")}</span>
      </div>
      <div style={{ position: "relative", marginTop: 20, height: 128 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - target / max) * 100}%`,
          borderTop: "1px dashed var(--ink-faint)", opacity: 0.5 }}/>
        <div style={{ display: "flex", height: "100%", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          {data.map((d, i) => {
            const onT = d.kcal >= target * 0.9 && d.kcal <= target * 1.1;
            const col = onT ? "var(--protein)" : d.kcal > target ? "var(--orange)" : "var(--fat)";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "center", flex: 1, alignItems: "flex-end" }}>
                  <div style={{ width: "100%", maxWidth: 22, height: `${Math.max((d.kcal / max) * 100, 3)}%`,
                    background: col, borderRadius: "6px 6px 3px 3px", transition: "height .5s" }} title={`${d.kcal} kcal`}/>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", color: "var(--ink-muted)" }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--hairline)",
        fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)" }}>
        <Legend c="var(--protein)" t="Cân bằng"/><Legend c="var(--fat)" t="Nhẹ"/><Legend c="var(--orange)" t="Đầy"/>
      </div>
    </Card>
  );
}
const Legend = ({ c, t }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <i style={{ width: 6, height: 6, borderRadius: "50%", background: c }}/>{t}</span>
);

function WaterCard({ consumed = 5, target = 8 }) {
  return (
    <Card tone="white" pad={20}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Eyebrow style={{ color: "var(--water-deep)" }}>Nước</Eyebrow>
          <h3 style={{ margin: "5px 0 0", fontSize: 15, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.012em" }}>Nhâm nhi ly nước nào</h3>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: "var(--water-deep)" }}>{consumed}</strong> / {target} ly · {(consumed * 0.25).toFixed(2)} lít</p>
        </div>
        <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center",
          background: "var(--water-soft)", fontSize: 20 }} className="pulse">💧</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6, marginTop: 16 }}>
        {Array.from({ length: target }).map((_, i) => (
          <div key={i} style={{ height: 36, borderRadius: 8,
            background: i < consumed ? "var(--water)" : "var(--cream-soft)",
            boxShadow: "var(--shadow-ring)" }}/>
        ))}
      </div>
    </Card>
  );
}

function StatsScreen({ target }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Eyebrow>Thống kê</Eyebrow>
        <h1 style={{ margin: "5px 0 0", fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Tuần này</h1>
      </div>
      <WeeklyTrend data={WEEK} target={target.kcal}/>
      <WaterCard/>
      <Card tone="sage" pad={18}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center",
            background: "var(--surface)", fontSize: 20, boxShadow: "var(--shadow-soft)" }} className="pulse">🧘</span>
          <div>
            <Eyebrow style={{ color: "var(--protein-deep)" }}>Mindful</Eyebrow>
            <h3 style={{ margin: "5px 0 0", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Thư giãn 2 phút</h3>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
              Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProfileScreen({ name, target, theme, onToggleTheme, onLogout }) {
  const Row = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0",
      borderBottom: "1px solid var(--hairline)" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-muted)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0" }}>
        <span style={{ width: 84, height: 84, borderRadius: "var(--r-lg)", display: "grid", placeItems: "center",
          background: "var(--orange)", color: "var(--on-accent)", fontSize: 36, fontWeight: 800 }}>{name[0]}</span>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>{name}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-muted)" }}>Mục tiêu giữ dáng · {target.kcal.toLocaleString("vi-VN")} kcal/ngày</p>
        </div>
      </div>
      <Card tone="white" pad={18}>
        <Eyebrow>Mục tiêu dinh dưỡng</Eyebrow>
        <div style={{ marginTop: 6 }}>
          <Row label="Năng lượng" value={`${target.kcal.toLocaleString("vi-VN")} kcal`}/>
          <Row label="Protein" value={`${target.protein} g`}/>
          <Row label="Carb" value={`${target.carb} g`}/>
          <Row label="Fat" value={`${target.fat} g`}/>
        </div>
      </Card>
      <Card tone="white" pad={8}>
        <button onClick={onToggleTheme} style={{ width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "12px 12px", background: "transparent", border: "none",
          cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
            {theme === "dark" ? <IcMoon size={20}/> : <IcSun size={20}/>}
            Giao diện {theme === "dark" ? "tối · Nike" : "sáng"}
          </span>
          <span style={{ width: 46, height: 27, borderRadius: 999, background: theme === "dark" ? "var(--orange)" : "var(--cream-deep)",
            position: "relative", transition: "background .2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: theme === "dark" ? 22 : 3, width: 21, height: 21,
              borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}/>
          </span>
        </button>
      </Card>
      <button onClick={onLogout} style={{ padding: "13px", borderRadius: "var(--r-md)", border: "none",
        background: "var(--cream-soft)", color: "var(--ink-muted)", fontFamily: "var(--font-sans)",
        fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "var(--shadow-ring)" }}>Đăng xuất</button>
    </div>
  );
}

function BottomNav({ view, setView }) {
  const tabs = [
    { id: "journal", label: "Nhật ký", icon: IcEdit },
    { id: "stats", label: "Thống kê", icon: IcStats },
    { id: "profile", label: "Hồ sơ", icon: IcUser },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around",
      alignItems: "center", padding: "14px 18px 18px", background: "color-mix(in srgb, var(--surface) 92%, transparent)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid var(--hairline)",
      borderRadius: "var(--r-xl) var(--r-xl) 0 0", zIndex: 20 }}>
      {tabs.map((t) => {
        const on = view === t.id; const I = t.icon;
        return (
          <button key={t.id} onClick={() => setView(t.id)} style={{ display: "flex", flexDirection: "column",
            alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer",
            color: on ? "var(--orange)" : "var(--ink-faint)", opacity: on ? 1 : 0.6,
            transform: on ? "scale(1.08)" : "none", transition: "transform .25s, opacity .25s" }}>
            <I size={22} sw={2.5}/>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LoginScreen({ onLogin, theme = "light", onToggleTheme }) {
  const dark = theme === "dark";
  const field   = dark ? "#0A0A0A" : "var(--orange)";
  const blob1   = dark ? "#89F336" : "var(--orange-deep)";
  const blob2   = dark ? "#22C55E" : "#fff";
  const cardBg  = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.12)";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.22)";
  const muted   = dark ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.75)";
  const divider = dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.20)";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.2)";
  const accent  = dark ? "#22C55E" : "var(--orange)";

  return (
    <div style={{ position: "absolute", inset: 0, background: field, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, overflow: "hidden" }}>
      {/* atmospheric blobs */}
      <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
        background: blob1, filter: "blur(80px)", opacity: dark ? 0.35 : 0.5 }}/>
      <div style={{ position: "absolute", bottom: -90, left: -70, width: 240, height: 240, borderRadius: "50%",
        background: blob2, filter: "blur(80px)", opacity: dark ? 0.30 : 0.25 }}/>

      {/* theme toggle */}
      {onToggleTheme && (
        <button onClick={onToggleTheme} aria-label="Đổi giao diện"
          style={{ position: "absolute", top: 24, right: 24, width: 40, height: 40, borderRadius: 999,
            background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff", display: "grid", placeItems: "center", cursor: "pointer",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", zIndex: 2 }}>
          {dark ? <IcSun size={18}/> : <IcMoon size={18}/>}
        </button>
      )}

      <div style={{ position: "relative", width: "100%", background: cardBg,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: cardBorder, borderRadius: 36, padding: 32, textAlign: "center",
        boxShadow: dark
          ? "0 30px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 30px 60px -20px rgba(0,0,0,0.4)" }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, fontStyle: "italic",
          letterSpacing: "-0.04em", color: "#fff" }}>STAYFIT</h1>
        <p style={{ margin: "8px 0 26px", fontSize: 11, fontWeight: 600, color: muted }}>
          {dark ? "Sẵn sàng cho buổi tập tiếp theo." : "Đăng nhập để đồng bộ dữ liệu của bạn"}</p>

        <button onClick={onLogin} style={{ width: "100%", padding: "14px", borderRadius: 18, border: "none",
          background: "#fff", color: "#2D2620", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 12px 24px -8px rgba(0,0,0,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.5-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5c-.5.4 7-5 7-15 0-1.2-.1-2.4-.4-3.5z"/></svg>
          Tiếp tục với Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: divider }}/>
          <span style={{ fontSize: 10, fontWeight: 700, color: dark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.1em" }}>hoặc</span>
          <div style={{ flex: 1, height: 1, background: divider }}/>
        </div>

        <input placeholder="Số điện thoại" style={{ ...inputGlass, background: inputBg }}/>
        <input type="password" placeholder="Mật khẩu" style={{ ...inputGlass, background: inputBg, marginTop: 12 }}/>

        <button onClick={onLogin} style={{ width: "100%", marginTop: 14, padding: "15px", borderRadius: 18, border: "none",
          background: dark ? accent : "#fff", color: dark ? "#0A0A0A" : "var(--orange)",
          fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 13,
          textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
          boxShadow: dark
            ? "0 12px 30px -8px rgba(34,197,94,0.5), 0 4px 12px rgba(0,0,0,0.4)"
            : "0 12px 24px -8px rgba(0,0,0,0.3)" }}>
          Đăng ký / Đăng nhập</button>
      </div>
    </div>
  );
}
const inputGlass = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.2)", border: "none",
  borderRadius: 16, padding: "15px", textAlign: "center", fontFamily: "var(--font-sans)", fontWeight: 700,
  fontSize: 14, color: "#fff", outline: "none" };

Object.assign(window, { WeeklyTrend, WaterCard, StatsScreen, ProfileScreen, BottomNav, LoginScreen });
