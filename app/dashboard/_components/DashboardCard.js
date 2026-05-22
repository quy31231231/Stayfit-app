"use client";

export default function DashboardCard({
  children,
  className = "",
  tone = "white",
  padding = "default",
  as: Tag = "div",
}) {
  const toneClass = {
    white:  "bg-white ring-1 ring-cream-deep/60",
    cream:  "bg-cream-soft ring-1 ring-cream-deep/40",
    orange: "bg-orange-soft ring-1 ring-orange/15",
    clay:   "bg-clay-soft ring-1 ring-clay/20",
    sage:   "bg-sage-soft ring-1 ring-sage/15",
    lilac:  "bg-lilac-soft ring-1 ring-lilac/15",
    mist:   "bg-mist-soft ring-1 ring-mist/15",
  }[tone] || "bg-white ring-1 ring-cream-deep/60";

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
