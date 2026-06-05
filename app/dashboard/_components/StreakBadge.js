"use client";

import { memo } from 'react';

// Chip động lực 🔥 — hiện chuỗi ngày liên tiếp + kỷ lục. Ẩn khi chưa có chuỗi.
function StreakBadge({ current, longest }) {
    if (!current) return null;
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-orange-soft px-4 py-3 ring-1 ring-orange/20">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-xl shadow-soft">🔥</span>
            <div className="min-w-0">
                <p className="text-[13px] font-bold leading-tight text-orange-deep">
                    {current} ngày liên tiếp
                </p>
                <p className="mt-0.5 text-[10px] text-ink-muted">
                    {current >= longest ? "Đang lập kỷ lục mới! Giữ chuỗi nhé" : `Giữ chuỗi nhé · Kỷ lục: ${longest} ngày`}
                </p>
            </div>
        </div>
    );
}

export default memo(StreakBadge);
