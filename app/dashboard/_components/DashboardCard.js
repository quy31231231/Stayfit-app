"use client";

export default function DashboardCard({
  children,
  className = "",
  tone = "white",
  padding = "default",
  as: Tag = "div",
}) {
  const toneClass = {
    white:  "bg-white",
    cream:  "bg-cream-soft",
    orange: "bg-orange-soft",
    clay:   "bg-clay-soft",
    sage:   "bg-sage-soft",
    lilac:  "bg-lilac-soft",
  }[tone] || "bg-white";

  const paddingClass = {
    none:    "p-0",
    sm:      "p-4",
    default: "p-5 md:p-6",
    lg:      "p-6 md:p-8",
  }[padding];

  return (
    <Tag className={`rounded-3xl shadow-soft ${toneClass} ${paddingClass} ${className}`}>
      {children}
    </Tag>
  );
}
