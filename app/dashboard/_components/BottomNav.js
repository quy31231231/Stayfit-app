"use client";

import { IconJournal, IconStats, IconUser } from '../../_components/icons';

export default function BottomNav({ view, setView }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-cream-deep p-4 z-40 flex justify-around items-center rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] max-w-md mx-auto">
            <button onClick={() => setView("journal")} className={`flex flex-col items-center gap-1.5 transition-transform duration-300 w-1/3 ${view==='journal' ? 'text-orange scale-110 font-black':'text-ink-faint opacity-60'}`}>
                <IconJournal /><span className="text-[9px] uppercase font-bold tracking-tighter">Nhật ký</span>
            </button>
            <button onClick={() => setView("stats")} className={`flex flex-col items-center gap-1.5 transition-transform duration-300 w-1/3 ${view==='stats' ? 'text-orange scale-110 font-black':'text-ink-faint opacity-60'}`}>
                <IconStats /><span className="text-[9px] uppercase font-bold tracking-tighter">Thống kê</span>
            </button>
            <button onClick={() => setView("profile")} className={`flex flex-col items-center gap-1.5 transition-transform duration-300 w-1/3 ${view==='profile' ? 'text-orange scale-110 font-black':'text-ink-faint opacity-60'}`}>
                <IconUser /><span className="text-[9px] uppercase font-bold tracking-tighter">Hồ sơ</span>
            </button>
        </div>
    );
}
