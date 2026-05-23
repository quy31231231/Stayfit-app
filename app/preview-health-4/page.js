"use client";

import HealthPreviewBase from "../_preview-shared/HealthPreviewBase";

/**
 * Hướng 4 — Noom modern: Mint cream + deep teal primary
 * Background mint nhạt cho cảm giác "modern wellness clinic"
 */
const PALETTE = {
  bg:         "#F4F8F5",   // mint cream (xanh nhạt)
  bgHeader:   "rgba(244, 248, 245, 0.85)",
  card:       "#FFFFFF",
  hairline:   "rgba(15, 60, 50, 0.10)",
  neutralSoft:"#EAF1EC",   // mint deeper than bg

  ink:        "#1F3A2E",   // dark green-ink (thay vì warm espresso)
  inkMuted:   "#5C7166",
  inkFaint:   "#9CB5A6",

  // Primary = deep teal
  primary:     "#0F766E",   // teal sâu
  primaryDeep: "#0A5048",
  primarySoft: "#D5EAE6",
  primarySoft2:"#2A9D8F",   // gradient stop sáng

  // Sage cho greeting chip
  sage:        "#10B981",   // emerald
  sageDeep:    "#065F46",
  sageSoft:    "#D1FAE5",

  // Macros — fresher vibes
  macros: {
    protein: { ring: "#059669", track: "#D1FAE5", label: "Protein" },  // emerald
    carb:    { ring: "#D97706", track: "#FED7AA", label: "Carb" },     // amber
    fat:     { ring: "#8B5CF6", track: "#E9D5FF", label: "Fat" },      // violet
  },
};

export default function PreviewHealth4() {
  return <HealthPreviewBase palette={PALETTE} label="Noom · Mint + Teal" />;
}
