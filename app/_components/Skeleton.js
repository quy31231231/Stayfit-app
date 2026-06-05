"use client";

// Khối skeleton nhịp pulse, ăn theo token cream (đổi sáng/tối tự động).
export function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-md bg-cream-deep ${className}`} />;
}

// Skeleton cho biểu đồ — thay fallback "Đang tải biểu đồ…" khi StatsView lazy-load.
export function ChartSkeleton() {
    const bars = [40, 70, 55, 85, 60, 45, 75];
    return (
        <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <div className="flex h-40 items-end gap-1.5">
                {bars.map((h, i) => (
                    <div key={i} className="flex-1 animate-pulse rounded-t bg-cream-deep" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    );
}

// Skeleton dashboard — vòng calo + macro + vài dòng log, hiện khi nạp dữ liệu lần đầu (chưa có cache).
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-5">
            <div className="flex justify-center"><Skeleton className="h-44 w-44 rounded-full" /></div>
            <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" />
            </div>
        </div>
    );
}
