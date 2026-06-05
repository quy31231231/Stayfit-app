"use client";

import { useState } from 'react';
import DashboardCard from './DashboardCard';
import BreathingTimer from './BreathingTimer';

export default function MindfulCard() {
    const [breathing, setBreathing] = useState(false);
    return (
        <>
            <DashboardCard tone="sage" padding="lg">
                <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-xl shadow-soft animate-gentle-pulse" style={{ animationDuration: "6s" }}>🧘</span>
                    <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-deep">Mindful</span>
                        <h3 className="mt-1 text-[15px] font-bold tracking-tight text-ink">Thư giãn 2 phút</h3>
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.</p>
                        <button type="button" onClick={() => setBreathing(true)} className="mt-3 rounded-full bg-surface px-4 py-1.5 text-[11px] font-semibold text-sage-deep ring-1 ring-sage/15 transition hover:bg-sage hover:text-white">Bắt đầu thở</button>
                    </div>
                </div>
            </DashboardCard>
            {breathing && <BreathingTimer onClose={() => setBreathing(false)} />}
        </>
    );
}
