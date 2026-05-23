"use client";

import HealthPreviewBase from "../_preview-shared/HealthPreviewBase";

/**
 * Hướng 2 — Headspace+ : Giữ terracotta primary, thêm health green accent
 * Bản warm hiện tại + health green chỉ cho "đủ rồi ✓" / positive states
 */
const PALETTE = {
  bg:         "#FBF8F2",
  bgHeader:   "rgba(251, 248, 242, 0.85)",
  card:       "#FFFFFF",
  // Viền sage tone — opacity 0.32 đủ để thấy rõ tone xanh lá, dùng sage deeper #5F9870 cho saturation tốt
  hairline:   "rgba(95, 152, 112, 0.32)",
  neutralSoft:"#F4EFE6",

  ink:        "#2D2620",
  inkMuted:   "#7A7066",
  inkFaint:   "#B8AFA4",

  // Primary giữ terracotta (như app gốc)
  primary:     "#D97757",
  primaryDeep: "#7A3318",
  primarySoft: "#F7E8DC",
  primarySoft2:"#E89B7B",

  // Sage cho greeting chip + health-green signal
  sage:        "#4A8B5E",   // sáng hơn để rõ "health" hơn
  sageDeep:    "#2D5C3F",
  sageSoft:    "#DDF0E2",

  // Macros giữ nguyên như app chính
  macros: {
    protein: { ring: "#5F8266", track: "#DDE7DC", label: "Protein" },
    carb:    { ring: "#C49A4A", track: "#F0E5CC", label: "Carb" },
    fat:     { ring: "#9B8AB8", track: "#E5DDED", label: "Fat" },
  },
};

export default function PreviewHealth2() {
  return <HealthPreviewBase palette={PALETTE} label="Headspace+ · Terracotta + Health Green" />;
}
