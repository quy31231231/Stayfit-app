"use client";

/**
 * StayFit · Hybrid preview — Apple layout + Wellness palette
 *
 * Áp đúng nguyên tắc Apple (section rhythm, single accent, negative tracking,
 * 17px body, single product shadow, pill CTAs, hairline borders, 80px sections,
 * museum-quiet density) nhưng dùng:
 *  - Accent = Terracotta (#D97757) thay Action Blue
 *  - Dark tile = Espresso (#2D2620) + Forest (#2D4632) thay near-black
 *  - Light tile = Cream parchment (#FBF8F2) / White
 *  - Macro colors = sage / clay / lilac thay đơn sắc
 *
 * Wording vẫn warm wellness ("Còn dư", "nuôi dưỡng nhẹ nhàng") thay vì instruction.
 */

import { useState } from "react";

// === TOKENS ===
const C = {
  accent:       "#D97757",
  accentDeep:   "#7A3318",
  accentOnDark: "#E89B7B",

  cream:        "#FBF8F2",
  creamSoft:    "#F4EFE6",
  creamDeep:    "#EBE3D2",
  canvas:       "#FFFFFF",

  espresso:     "#2D2620",
  forest:       "#2D4632",
  forestSoft:   "#1F3624",

  ink:          "#2D2620",
  inkMuted:     "#7A7066",
  inkFaint:     "#B8AFA4",

  sage:         "#A8C09A",
  sageDeep:     "#5F8266",
  clay:         "#E8C892",
  clayDeep:     "#C49A4A",
  lilac:        "#C8B6E2",
  lilacDeep:    "#9B8AB8",

  hairline:     "rgba(45, 38, 32, 0.12)",
  hairlineDark: "rgba(255, 255, 255, 0.12)",
};

const FONT_STACK = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif`;

// === MOCK DATA ===
const TODAY = {
  consumed: 1302,
  target: 2000,
  protein: { value: 95, target: 140 },
  carb:    { value: 120, target: 250 },
  fat:     { value: 45, target: 70 },
};
const MEALS = [
  { name: "Bữa sáng", icon: "☀️", items: 3, kcal: 420, accent: C.clayDeep },
  { name: "Bữa trưa", icon: "🌤", items: 4, kcal: 650, accent: C.sageDeep },
  { name: "Bữa tối",  icon: "🌙", items: 4, kcal: 397, accent: C.lilacDeep },
  { name: "Ăn vặt",   icon: "⭐", items: 1, kcal: 150, accent: C.accentDeep },
];
const WEEK = [1850, 2100, 1620, 1950, 2280, 1740, 1320];

const fmt = (n) => Math.round(n).toLocaleString("vi-VN");

export default function WarmPreview() {
  const remaining = Math.max(0, TODAY.target - TODAY.consumed);

  return (
    <div style={{ fontFamily: FONT_STACK, color: C.ink, background: C.canvas, letterSpacing: "-0.01em" }}>
      {/* ───────── GLOBAL NAV — espresso 44px ───────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 44,
          background: C.espresso,
          color: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          fontSize: 12,
          letterSpacing: "-0.12px",
        }}
      >
        <span style={{ fontWeight: 600, marginRight: 32, letterSpacing: "-0.02em", color: "#fff" }}>StayFit</span>
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          {["Nhật ký", "Thực phẩm", "Cân nặng", "Mục tiêu", "Mindful"].map((label) => (
            <a key={label} href="#" style={{ color: "inherit", textDecoration: "none" }}>{label}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#" aria-label="Tìm" style={{ color: "inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </a>
          <a href="#" aria-label="Hồ sơ" style={{ color: "inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
        </div>
      </nav>

      {/* ───────── SUB-NAV frosted cream ───────── */}
      <div
        style={{
          position: "sticky",
          top: 44,
          zIndex: 40,
          height: 52,
          background: "rgba(251, 248, 242, 0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: `1px solid ${C.hairline}`,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
        }}
      >
        <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", color: C.ink }}>Nhật ký hôm nay</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#" style={{ fontSize: 14, color: C.ink, textDecoration: "none", letterSpacing: "-0.224px" }}>Tổng quan</a>
          <a href="#" style={{ fontSize: 14, color: C.ink, textDecoration: "none", letterSpacing: "-0.224px" }}>Lịch sử</a>
          <button style={primaryPill}>Thêm món</button>
        </div>
      </div>

      {/* ───────── HERO TILE — cream parchment ───────── */}
      <section style={{ background: C.cream, padding: "80px 22px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...eyebrow, color: C.accent }}>Hôm nay · Thứ Bảy, 23 tháng 5</p>
          <h1 style={heroDisplay}>Còn dư {fmt(remaining)} kcal.</h1>
          <p style={lead}>Cơ thể bạn đang được nuôi dưỡng tốt — cứ giữ nhịp nhẹ nhàng.</p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button style={primaryPill}>Thêm món</button>
            <button style={ghostPill}>Xem chi tiết</button>
          </div>

          {/* "PRODUCT" — calorie ring với 1 shadow duy nhất */}
          <div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
            <CalorieRing consumed={TODAY.consumed} target={TODAY.target} />
          </div>
        </div>
      </section>

      {/* ───────── DARK TILE — espresso, macro overview ───────── */}
      <section style={{ background: C.espresso, color: "#fff", padding: "80px 22px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...eyebrow, color: C.accentOnDark }}>Dinh dưỡng</p>
          <h2 style={{ ...displayLg, color: "#fff" }}>Cân đối là một dạng chăm sóc.</h2>
          <p style={{ ...lead, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
            Theo dõi ba chất chính. <a href="#" style={{ color: C.accentOnDark, textDecoration: "none" }}>Tìm hiểu thêm ›</a>
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 56 }}>
            <MacroBlock label="Protein" value={TODAY.protein.value} target={TODAY.protein.target} accent={C.sage} />
            <MacroBlock label="Carb"    value={TODAY.carb.value}    target={TODAY.carb.target}    accent={C.clay} />
            <MacroBlock label="Fat"     value={TODAY.fat.value}     target={TODAY.fat.target}     accent={C.lilac} />
          </div>
        </div>
      </section>

      {/* ───────── LIGHT TILE — white, meal utility cards ───────── */}
      <section style={{ background: C.canvas, padding: "80px 22px" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ ...eyebrow, color: C.accent }}>Bữa ăn</p>
            <h2 style={displayLg}>Ghi từng món, thấy cả ngày.</h2>
            <p style={lead}>Nhật ký được đồng bộ liền mạch giữa các thiết bị.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {MEALS.map((m) => <MealCard key={m.name} {...m} />)}
          </div>
        </div>
      </section>

      {/* ───────── DARK TILE — forest, weekly trend ───────── */}
      <section style={{ background: C.forest, color: "#fff", padding: "80px 22px", position: "relative", overflow: "hidden" }}>
        {/* Subtle atmospheric vignette */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${C.forestSoft}, transparent 70%)`, pointerEvents: "none" }}/>

        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <p style={{ ...eyebrow, color: C.accentOnDark }}>Xu hướng 7 ngày</p>
          <h2 style={{ ...displayLg, color: "#fff" }}>Bước nhỏ mỗi ngày, đường dài bền bỉ.</h2>
          <p style={{ ...lead, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
            Trung bình {fmt(WEEK.reduce((s, v) => s + v, 0) / 7)} kcal · {WEEK.length} ngày liên tục
          </p>

          <WeekChart data={WEEK} target={TODAY.target} />

          <button style={{ ...primaryPill, marginTop: 40 }}>Xem báo cáo đầy đủ</button>
        </div>
      </section>

      {/* ───────── MINDFUL TILE — cream-soft, breathing prompt ───────── */}
      <section style={{ background: C.creamSoft, padding: "80px 22px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...eyebrow, color: C.sageDeep }}>Mindful</p>
          <h2 style={displayLg}>Thư giãn 2 phút.</h2>
          <p style={lead}>Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.</p>

          <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${C.sage}, ${C.sageDeep})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                filter: "drop-shadow(rgba(0, 0, 0, 0.18) 3px 5px 30px)",
              }}
            >🧘</div>
          </div>

          <button style={{ ...ghostPill, marginTop: 40 }}>Bắt đầu thở</button>
        </div>
      </section>

      {/* ───────── FOOTER — cream-soft, dense link columns ───────── */}
      <footer style={{ background: C.creamSoft, color: C.inkMuted, padding: "64px 22px 40px", borderTop: `1px solid ${C.hairline}` }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, marginBottom: 40 }}>
            {[
              { title: "Tài khoản", items: ["Hồ sơ", "Mục tiêu", "Đồng bộ", "Đăng xuất"] },
              { title: "Tính năng", items: ["Nhật ký", "Thống kê", "Thư viện món", "Mindful"] },
              { title: "Hỗ trợ",    items: ["Hướng dẫn", "Câu hỏi thường gặp", "Liên hệ"] },
              { title: "Pháp lý",   items: ["Bảo mật", "Điều khoản", "Cookie", "Bản quyền"] },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 8, color: C.ink }}>{col.title}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2.41, fontSize: 14 }}>
                  {col.items.map((it) => (
                    <li key={it}><a href="#" style={{ color: C.inkMuted, textDecoration: "none" }}>{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkFaint, letterSpacing: "-0.12px" }}>
            <span>© 2026 StayFit. Đồng hành cùng bạn.</span>
            <span>Việt Nam (Tiếng Việt)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── TYPOGRAPHY (Apple-quiet, áp lên palette warm) ─────────── */

const eyebrow = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  margin: 0,
  marginBottom: 16,
  lineHeight: 1.4,
};

const heroDisplay = {
  fontSize: 56,
  fontWeight: 600,
  lineHeight: 1.07,
  letterSpacing: "-0.028em",
  margin: 0,
  marginBottom: 12,
};

const displayLg = {
  fontSize: 40,
  fontWeight: 600,
  lineHeight: 1.10,
  letterSpacing: "-0.022em",
  margin: 0,
  marginBottom: 12,
};

const lead = {
  fontSize: 21,
  fontWeight: 400,
  lineHeight: 1.38,
  letterSpacing: "0.011em",
  margin: 0,
};

/* ─────────── BUTTONS — terracotta pill ─────────── */

const primaryPill = {
  background: C.accent,
  color: "#fff",
  border: "none",
  borderRadius: 9999,
  padding: "11px 22px",
  fontSize: 17,
  fontFamily: "inherit",
  fontWeight: 500,
  letterSpacing: "-0.374px",
  cursor: "pointer",
  lineHeight: 1.24,
};

const ghostPill = {
  background: "transparent",
  color: C.accent,
  border: `1px solid ${C.accent}`,
  borderRadius: 9999,
  padding: "10px 22px",
  fontSize: 17,
  fontFamily: "inherit",
  fontWeight: 500,
  letterSpacing: "-0.374px",
  cursor: "pointer",
  lineHeight: 1.24,
};

/* ─────────── CALORIE RING (single product-shadow) ─────────── */

function CalorieRing({ consumed, target }) {
  const size = 320;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, consumed / target);
  const offset = c * (1 - ratio);
  const remaining = Math.max(0, target - consumed);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        filter: "drop-shadow(rgba(45, 38, 32, 0.18) 3px 5px 30px)",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringWarm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E89B7B"/>
            <stop offset="100%" stopColor="#D97757"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.creamDeep} strokeWidth={stroke}/>
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          fill="none"
          stroke="url(#ringWarm)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: C.ink }}>
          {fmt(remaining)}
        </span>
        <span style={{ fontSize: 15, color: C.inkMuted, marginTop: 8, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
          kcal còn dư
        </span>
        <span style={{ fontSize: 12, color: C.inkFaint, marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase", fontVariantNumeric: "tabular-nums" }}>
          {fmt(consumed)} / {fmt(target)}
        </span>
      </div>
    </div>
  );
}

/* ─────────── MACRO BLOCK (dark tile) ─────────── */

function MacroBlock({ label, value, target, accent }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 13, color: accent, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0, marginBottom: 16 }}>
        {label}
      </p>
      <p style={{ fontSize: 56, fontWeight: 600, color: "#fff", letterSpacing: "-0.04em", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {value}<span style={{ fontSize: 21, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>g</span>
      </p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 12, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
        mục tiêu {target}g · {pct}%
      </p>
      <div style={{ marginTop: 20, height: 3, background: "rgba(255,255,255,0.12)", borderRadius: 9999, overflow: "hidden", maxWidth: 200, marginInline: "auto" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 9999 }}/>
      </div>
    </div>
  );
}

/* ─────────── MEAL CARD (utility, white, hairline) ─────────── */

function MealCard({ name, icon, items, kcal, accent }) {
  return (
    <div
      style={{
        background: C.canvas,
        border: `1px solid ${C.hairline}`,
        borderRadius: 18,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <p style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.374px", margin: 0, color: C.ink }}>{name}</p>
      </div>
      <p style={{ fontSize: 13, color: C.inkMuted, margin: 0, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
        {items} món hôm nay
      </p>
      <p style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.022em", margin: 0, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
        {fmt(kcal)}<span style={{ fontSize: 17, color: C.inkMuted, marginLeft: 6, fontWeight: 400 }}>kcal</span>
      </p>
      <a href="#" style={{ color: accent, fontSize: 15, letterSpacing: "-0.01em", textDecoration: "none", marginTop: 4, fontWeight: 500 }}>
        Mở chi tiết ›
      </a>
    </div>
  );
}

/* ─────────── WEEK CHART (dark forest) ─────────── */

function WeekChart({ data, target }) {
  const max = Math.max(target, ...data);
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return (
    <div style={{ marginTop: 56, display: "flex", alignItems: "flex-end", gap: 16, height: 240, maxWidth: 640, marginInline: "auto" }}>
      {data.map((v, i) => {
        const h = (v / max) * 100;
        const onTarget = v >= target * 0.9 && v <= target * 1.1;
        const color = onTarget ? C.sage : v > target ? C.accentOnDark : C.lilac;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "100%" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div style={{ width: "100%", height: `${h}%`, background: color, borderRadius: 6, opacity: 0.95 }}/>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em", textTransform: "uppercase", fontVariantNumeric: "tabular-nums" }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
