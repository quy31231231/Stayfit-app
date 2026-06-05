"use client";

import { useEffect, useRef, useState } from 'react';

// Đếm số mượt từ giá trị cũ → mới (ease-out cubic), cô lập trong 1 component nhỏ
// để KHÔNG re-render cả App mỗi frame. Tôn trọng prefers-reduced-motion → set thẳng.
export default function AnimatedNumber({ value, duration = 500, className, format = (n) => n.toLocaleString('vi-VN') }) {
    const [display, setDisplay] = useState(value);
    const displayRef = useRef(value); // giá trị đang hiển thị → mốc bắt đầu khi value đổi giữa chừng
    useEffect(() => {
        const reduce = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { displayRef.current = value; setDisplay(value); return; }
        const from = displayRef.current;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const next = Math.round(from + (value - from) * eased);
            displayRef.current = next;
            setDisplay(next);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <span className={className}>{format(display)}</span>;
}
