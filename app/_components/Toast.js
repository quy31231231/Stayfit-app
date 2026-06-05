"use client";

import { useState, useEffect } from 'react';

// Singleton pub/sub store — gọi toast.* từ bất kỳ đâu (kể cả ngoài cây React, trong event handler).
let _id = 0;
const listeners = new Set();
let _toasts = [];
const emit = () => { for (const l of listeners) l(_toasts); };
const dismiss = (id) => { _toasts = _toasts.filter((t) => t.id !== id); emit(); };
const push = (type, message, duration = 2500) => {
    const id = ++_id;
    _toasts = [..._toasts, { id, type, message }];
    emit();
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
};

export const toast = {
    success: (message, duration) => push('success', message, duration),
    error: (message, duration) => push('error', message, duration),
    info: (message, duration) => push('info', message, duration),
};

const ICON = { success: '✓', error: '⚠', info: 'ⓘ' };

export function Toaster() {
    const [items, setItems] = useState(_toasts);
    useEffect(() => {
        const l = (t) => setItems(t);
        listeners.add(l);
        setItems(_toasts);
        return () => { listeners.delete(l); };
    }, []);
    if (items.length === 0) return null;
    return (
        <div
            className="fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
        >
            {items.map((t) => (
                <button
                    key={t.id}
                    onClick={() => dismiss(t.id)}
                    className={`animate-fade-rise pointer-events-auto flex w-fit max-w-md items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-lift ${
                        t.type === 'error' ? 'bg-ringcal-over-from text-white' : 'bg-ink text-cream'
                    }`}
                >
                    <span aria-hidden="true">{ICON[t.type]}</span>
                    <span>{t.message}</span>
                </button>
            ))}
        </div>
    );
}
