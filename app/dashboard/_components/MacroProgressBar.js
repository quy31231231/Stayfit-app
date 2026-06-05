"use client";

export default function MacroProgressBar({ label, current, target, colorClass }) {
    const pct = Math.min((current / target) * 100, 100) || 0;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                <span className="text-ink-muted">{label}</span>
                <span className="text-ink">{current}g <span className="opacity-40">/ {target}g</span></span>
            </div>
            <div className="w-full bg-cream-deep rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${colorClass} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}
