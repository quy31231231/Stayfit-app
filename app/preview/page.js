"use client";

/**
 * StayFit · Apple-language preview route
 *
 * KHÔNG dùng cho production — chỉ là preview để so sánh với /journal hiện tại.
 * Áp đúng spec Apple: tile alternation, single blue (#0066cc), SF Pro / Inter
 * negative letter-spacing, 17px body, no shadows except on the "product" (calorie ring),
 * pill CTAs, hairline borders, 80px section padding.
 */

import { useState } from "react";

// === Tokens (inline để route tự đứng được, không ảnh hưởng tailwind config) ===
const COLORS = {
  primary:        "#0066cc",
  primaryFocus:   "#0071e3",
  primaryOnDark:  "#2997ff",
  canvas:         "#ffffff",
  parchment:      "#f5f5f7",
  pearl:          "#fafafc",
  tile1:          "#272729",
  tile2:          "#2a2a2c",
  tile3:          "#252527",
  black:          "#000000",
  ink:            "#1d1d1f",
  inkMuted80:     "#333333",
  inkMuted48:     "#7a7a7a",
  bodyMuted:      "#cccccc",
  hairline:       "#e0e0e0",
  dividerSoft:    "#f0f0f0",
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
  { name: "Bữa sáng", items: 3, kcal: 420 },
  { name: "Bữa trưa", items: 4, kcal: 650 },
  { name: "Bữa tối",  items: 4, kcal: 397 },
  { name: "Ăn vặt",   items: 1, kcal: 150 },
];
const WEEK = [1850, 2100, 1620, 1950, 2280, 1740, 1320];

// === HELPERS ===
const fmt = (n) => Math.round(n).toLocaleString("vi-VN");

export default function ApplePreview() {
  const [bag] = useState(0);
  const remaining = Math.max(0, TODAY.target - TODAY.consumed);

  return (
    <div style={{ fontFamily: FONT_STACK, color: COLORS.ink, background: COLORS.canvas, letterSpacing: "-0.01em" }}>
      {/* ───────── GLOBAL NAV (44px, true black) ───────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 44,
          background: COLORS.black,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          fontSize: 12,
          letterSpacing: "-0.12px",
        }}
      >
        <span style={{ fontWeight: 600, marginRight: 32, letterSpacing: "-0.02em" }}>StayFit</span>
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          {["Nhật ký", "Thực phẩm", "Cân nặng", "Mục tiêu", "Hỗ trợ"].map((label) => (
            <a key={label} href="#" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#" aria-label="Tìm kiếm" style={{ color: "rgba(255,255,255,0.85)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </a>
          <a href="#" aria-label="Tài khoản" style={{ color: "rgba(255,255,255,0.85)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
        </div>
      </nav>

      {/* ───────── SUB-NAV (frosted parchment) ───────── */}
      <div
        style={{
          position: "sticky",
          top: 44,
          zIndex: 40,
          height: 52,
          background: "rgba(245, 245, 247, 0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: `1px solid ${COLORS.hairline}`,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
        }}
      >
        <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", color: COLORS.ink }}>Nhật ký hôm nay</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#" style={{ fontSize: 14, color: COLORS.ink, textDecoration: "none", letterSpacing: "-0.224px" }}>Tổng quan</a>
          <a href="#" style={{ fontSize: 14, color: COLORS.ink, textDecoration: "none", letterSpacing: "-0.224px" }}>Lịch sử</a>
          <button style={primaryPill}>Thêm món</button>
        </div>
      </div>

      {/* ───────── HERO TILE (parchment) — calorie circle as "the product" ───────── */}
      <section style={{ background: COLORS.parchment, padding: "80px 22px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p style={eyebrow}>Hôm nay · Thứ Bảy, 23 tháng 5</p>
          <h1 style={heroDisplay}>Còn dư {fmt(remaining)} kcal.</h1>
          <p style={lead}>Cơ thể bạn đang được nuôi dưỡng tốt — cứ tiếp tục cân bằng.</p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button style={primaryPill}>Thêm món</button>
            <button style={ghostPill}>Xem chi tiết</button>
          </div>

          {/* "PRODUCT" — calorie ring with the SINGLE system shadow */}
          <div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
            <CalorieRing consumed={TODAY.consumed} target={TODAY.target} />
          </div>
        </div>
      </section>

      {/* ───────── DARK TILE — macro overview ───────── */}
      <section style={{ background: COLORS.tile1, color: "#fff", padding: "80px 22px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...eyebrow, color: COLORS.bodyMuted }}>Dinh dưỡng</p>
          <h2 style={{ ...displayLg, color: "#fff" }}>Cân đối là điều quan trọng nhất.</h2>
          <p style={{ ...lead, color: COLORS.bodyMuted, marginTop: 8 }}>
            Theo dõi đủ ba chất chính. <a href="#" style={{ color: COLORS.primaryOnDark, textDecoration: "none" }}>Tìm hiểu thêm ›</a>
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 56 }}>
            <MacroBlock label="Protein" value={TODAY.protein.value} target={TODAY.protein.target} />
            <MacroBlock label="Carb"    value={TODAY.carb.value}    target={TODAY.carb.target} />
            <MacroBlock label="Fat"     value={TODAY.fat.value}     target={TODAY.fat.target} />
          </div>
        </div>
      </section>

      {/* ───────── LIGHT TILE (white) — meal utility cards ───────── */}
      <section style={{ background: COLORS.canvas, padding: "80px 22px" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={eyebrow}>Bữa ăn</p>
            <h2 style={displayLg}>Ghi từng món, thấy cả ngày.</h2>
            <p style={lead}>Nhật ký được đồng bộ giữa điện thoại và máy tính.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {MEALS.map((m) => (
              <MealCard key={m.name} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── DARK TILE 2 — weekly trend ───────── */}
      <section style={{ background: COLORS.tile2, color: "#fff", padding: "80px 22px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...eyebrow, color: COLORS.bodyMuted }}>Xu hướng 7 ngày</p>
          <h2 style={{ ...displayLg, color: "#fff" }}>Đều đặn mỗi ngày.</h2>
          <p style={{ ...lead, color: COLORS.bodyMuted, marginTop: 8 }}>Trung bình {fmt(WEEK.reduce((s, v) => s + v, 0) / 7)} kcal mỗi ngày.</p>

          <WeekChart data={WEEK} target={TODAY.target} />

          <button style={{ ...primaryPill, marginTop: 40 }}>Xem báo cáo đầy đủ</button>
        </div>
      </section>

      {/* ───────── PARCHMENT FOOTER ───────── */}
      <footer style={{ background: COLORS.parchment, color: COLORS.inkMuted80, padding: "64px 22px 40px" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, marginBottom: 40 }}>
            {[
              { title: "Tài khoản",  items: ["Hồ sơ", "Mục tiêu", "Đồng bộ", "Đăng xuất"] },
              { title: "Tính năng",  items: ["Nhật ký", "Thống kê", "Thư viện món", "Mindful"] },
              { title: "Hỗ trợ",     items: ["Hướng dẫn", "Câu hỏi thường gặp", "Liên hệ"] },
              { title: "Pháp lý",    items: ["Bảo mật", "Điều khoản", "Cookie", "Bản quyền"] },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 8 }}>{col.title}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2.41, fontSize: 14 }}>
                  {col.items.map((it) => (
                    <li key={it}><a href="#" style={{ color: COLORS.inkMuted80, textDecoration: "none" }}>{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.inkMuted48, letterSpacing: "-0.12px" }}>
            <span>© 2026 StayFit. Mọi quyền được bảo lưu.</span>
            <span>Việt Nam (Tiếng Việt)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  TYPOGRAPHY TOKENS — tuân spec Apple                        */
/* ─────────────────────────────────────────────────────────── */

const eyebrow = {
  fontSize: 17,
  fontWeight: 600,
  letterSpacing: "-0.374px",
  color: "#0066cc",
  margin: 0,
  marginBottom: 12,
  lineHeight: 1.24,
};

const heroDisplay = {
  fontSize: 56,
  fontWeight: 600,
  lineHeight: 1.07,
  letterSpacing: "-0.28px",
  margin: 0,
  marginBottom: 12,
};

const displayLg = {
  fontSize: 40,
  fontWeight: 600,
  lineHeight: 1.10,
  letterSpacing: "-0.005em",
  margin: 0,
  marginBottom: 12,
};

const lead = {
  fontSize: 21,
  fontWeight: 400,
  lineHeight: 1.38,
  letterSpacing: "0.011em",
  margin: 0,
  color: "inherit",
};

/* ─────────────────────────────────────────────────────────── */
/*  BUTTONS                                                    */
/* ─────────────────────────────────────────────────────────── */

const primaryPill = {
  background: COLORS.primary,
  color: "#fff",
  border: "none",
  borderRadius: 9999,
  padding: "11px 22px",
  fontSize: 17,
  fontFamily: "inherit",
  fontWeight: 400,
  letterSpacing: "-0.374px",
  cursor: "pointer",
  lineHeight: 1.24,
};

const ghostPill = {
  background: "transparent",
  color: COLORS.primary,
  border: `1px solid ${COLORS.primary}`,
  borderRadius: 9999,
  padding: "10px 22px",
  fontSize: 17,
  fontFamily: "inherit",
  fontWeight: 400,
  letterSpacing: "-0.374px",
  cursor: "pointer",
  lineHeight: 1.24,
};

/* ─────────────────────────────────────────────────────────── */
/*  CALORIE RING — "the product" with SINGLE system shadow     */
/* ─────────────────────────────────────────────────────────── */

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
        filter: "drop-shadow(rgba(0, 0, 0, 0.22) 3px 5px 30px)",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9F4B"/>
            <stop offset="100%" stopColor="#FF453A"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e8ea" strokeWidth={stroke}/>
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: COLORS.ink }}>
          {fmt(remaining)}
        </span>
        <span style={{ fontSize: 17, color: COLORS.inkMuted48, marginTop: 8, letterSpacing: "-0.374px", fontVariantNumeric: "tabular-nums" }}>
          kcal còn dư · {fmt(consumed)} / {fmt(target)}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  MACRO BLOCK (dark tile)                                    */
/* ─────────────────────────────────────────────────────────── */

function MacroBlock({ label, value, target }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 14, color: COLORS.bodyMuted, fontWeight: 400, letterSpacing: "-0.224px", margin: 0, marginBottom: 16, textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontSize: 56, fontWeight: 600, color: "#fff", letterSpacing: "-0.04em", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {value}<span style={{ fontSize: 21, color: COLORS.bodyMuted, marginLeft: 4 }}>g</span>
      </p>
      <p style={{ fontSize: 14, color: COLORS.bodyMuted, marginTop: 12, letterSpacing: "-0.224px", fontVariantNumeric: "tabular-nums" }}>
        mục tiêu {target}g · {pct}%
      </p>
      <div style={{ marginTop: 20, height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 9999, overflow: "hidden", maxWidth: 200, marginInline: "auto" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: COLORS.primaryOnDark, borderRadius: 9999 }}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  MEAL CARD (utility, white, hairline border, rounded-lg)    */
/* ─────────────────────────────────────────────────────────── */

function MealCard({ name, items, kcal }) {
  return (
    <div
      style={{
        background: COLORS.canvas,
        border: `1px solid ${COLORS.hairline}`,
        borderRadius: 18,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <p style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", margin: 0, color: COLORS.ink }}>{name}</p>
      <p style={{ fontSize: 14, color: COLORS.inkMuted48, margin: 0, letterSpacing: "-0.224px", fontVariantNumeric: "tabular-nums" }}>
        {items} món
      </p>
      <p style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, marginTop: 8, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>
        {fmt(kcal)}<span style={{ fontSize: 17, color: COLORS.inkMuted48, marginLeft: 6, fontWeight: 400 }}>kcal</span>
      </p>
      <a href="#" style={{ color: COLORS.primary, fontSize: 17, letterSpacing: "-0.374px", textDecoration: "none", marginTop: 12 }}>
        Mở chi tiết ›
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  WEEK CHART (dark tile)                                     */
/* ─────────────────────────────────────────────────────────── */

function WeekChart({ data, target }) {
  const max = Math.max(target, ...data);
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return (
    <div style={{ marginTop: 56, display: "flex", alignItems: "flex-end", gap: 16, height: 240, maxWidth: 640, marginInline: "auto" }}>
      {data.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "100%" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div style={{ width: "100%", height: `${h}%`, background: "#fff", borderRadius: 6, opacity: 0.9 }}/>
            </div>
            <span style={{ fontSize: 12, color: COLORS.bodyMuted, letterSpacing: "-0.12px", fontVariantNumeric: "tabular-nums" }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
