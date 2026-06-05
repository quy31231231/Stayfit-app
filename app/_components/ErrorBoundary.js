"use client";

import { Component } from 'react';

// Chặn lỗi render để không "trắng cả app" — hiện màn fallback + nút tải lại.
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-8 text-center dark:bg-[#0E0E0E]">
                    <span className="text-4xl" aria-hidden="true">😵‍💫</span>
                    <h1 className="text-lg font-bold text-ink">Có lỗi xảy ra</h1>
                    <p className="max-w-[30ch] text-[13px] text-ink-muted">Ứng dụng gặp sự cố hiển thị. Hãy thử tải lại — dữ liệu của bạn vẫn an toàn.</p>
                    <button onClick={() => window.location.reload()} className="rounded-full bg-orange px-5 py-2.5 text-[13px] font-bold text-onaccent transition active:scale-95">
                        Tải lại
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
