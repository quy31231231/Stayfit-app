"use client";

import HealthPreviewBase from "../_preview-shared/HealthPreviewBase";

/**
 * Hướng 1 — Cronometer/Lifesum: Forest green primary trên cream warm
 * Background warm cream giữ, mọi CTA/accent đổi sang forest green
 */
const PALETTE = {
  bg:         "#FBF8F2",  // cream (giữ)
  bgHeader:   "rgba(251, 248, 242, 0.85)",
  card:       "#FFFFFF",
  hairline:   "rgba(45, 38, 32, 0.10)",
  neutralSoft:"#F4EFE6",  // cream-soft

  ink:        "#2D2620",
  inkMuted:   "#7A7066",
  inkFaint:   "#B8AFA4",

  // Primary = forest green
  primary:     "#3F6E50",
  primaryDeep: "#1F4D2E",
  primarySoft: "#E0EAE3",
  primarySoft2:"#5E8E70",  // gradient stop sáng

  // Sage cho greeting chip (giữ wellness vibe)
  sage:        "#5F8266",
  sageDeep:    "#2D4632",
  sageSoft:    "#DDE7DC",

  // Macros — đổi Protein khác green primary để không trùng
  macros: {
    protein: { ring: "#2B7A4B", track: "#D5E8DD", label: "Protein" },  // green deeper
    carb:    { ring: "#C49A4A", track: "#F0E5CC", label: "Carb" },     // honey giữ
    fat:     { ring: "#9B8AB8", track: "#E5DDED", label: "Fat" },      // lilac giữ
  },
};

export default function PreviewHealth1() {
  return <HealthPreviewBase palette={PALETTE} label="Cronometer · Forest Green" />;
}
