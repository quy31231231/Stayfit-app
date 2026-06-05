"use client";

// Empty state tái dùng: icon emoji + tiêu đề + phụ đề + nút hành động (tùy chọn).
export default function EmptyState({ icon, title, subtitle, action }) {
    return (
        <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-2 text-3xl" aria-hidden="true">{icon}</div>
            <h3 className="text-[15px] font-bold text-ink">{title}</h3>
            {subtitle && <p className="mt-1 text-[12px] text-ink-muted">{subtitle}</p>}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 rounded-full bg-orange px-4 py-2 text-[12px] font-bold text-onaccent transition active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
