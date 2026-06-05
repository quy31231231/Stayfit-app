"use client";

import { useEffect, useRef, useState } from 'react';

// Đếm số mượt từ giá trị cũ → mới (ease-out cubic), cô lập trong 1 component nhỏ
// để KHÔNG re-render cả App mỗi frame. Tôn trọng prefers-reduced-motion → set thẳng.
export default function AnimatedNumber({ value, duration = 500, className, format = (n) => n.toLocaleString('vi-VN') }) {
    const [display, setDisplay] = useState(value);
    const fromRef = useRef(value);
    useEffect(() => {
        const reduce = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setDisplay(value); fromRef.current = value; return; }
        const from = fromRef.current;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
            else fromRef.current = value;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <span className={className}>{format(display)}</span>;
}
