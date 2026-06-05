"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatDate } from '../../_lib/format';
import { upsertWeight as sbUpsertWeight, deleteWeight as sbDeleteWeight } from '../../../lib/supabase/data';
import { IconTrash } from '../../_components/icons';
import { toast } from '../../_components/Toast';
import EmptyState from '../../_components/EmptyState';
import BottomNav from './BottomNav';

Chart.register(ChartDataLabels);

function StatsView({ history, profile, setProfile, target, targetLog, setView, view, setCurrentDate, userId, password, pendingChangeRef, theme }) {
    const [weightLog, setWeightLog] = useState(() => {
        if (typeof window !== "undefined") {
            const s = localStorage.getItem('stayfit_weight_log'); return s ? JSON.parse(s) : {};
        }
        return {};
    });
    const [weightInput, setWeightInput] = useState("");
    const [weightDate, setWeightDate] = useState(() => formatDate(new Date()));
    const [chartOffset, setChartOffset] = useState(0);
    const daysPerPage = 14;

    // Weight menu / modals
    const [weightMenuOpen, setWeightMenuOpen] = useState(false);
    const [weightModal, setWeightModal] = useState(null); // "log" | "goal" | "history" | null
    const [goalDraft, setGoalDraft] = useState({ start: "", target: "" });

    const weightChartRef = useRef(null); 
    const kcalChartRef = useRef(null); 
    const macroChartRef = useRef(null);
    const weightChartInstance = useRef(null); 
    const kcalChartInstance = useRef(null); 
    const macroChartInstance = useRef(null);
    const todayStr = formatDate(new Date());

    const getWeekLabel = (dateStr) => { 
        if(!dateStr) return "";
        const d = new Date(dateStr); 
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; 
    };

    const currentChartDates = useMemo(() => {
        const dates = []; const today = new Date();
        const startDayAgo = (chartOffset + 1) * daysPerPage - 1;
        for (let i = startDayAgo; i >= chartOffset * daysPerPage; i--) {
            const d = new Date(today); d.setDate(today.getDate() - i); dates.push(formatDate(d));
        }
        return dates;
    }, [chartOffset]);

    const sumDayMacro = (dayLog, field) => { 
        if (!dayLog || !Array.isArray(dayLog)) return 0; 
        return dayLog.reduce((sum, item) => sum + (item[field] || 0), 0); 
    };

   const saveWeight = async () => {
        // Hỗ trợ cả "79.5" và "79,5" (kiểu VN với dấu phẩy thập phân)
        const normalizedInput = String(weightInput || "").replace(',', '.');
        const inputVal = parseFloat(normalizedInput);
        if (!inputVal || inputVal <= 0) { toast.error("Vui lòng nhập số kg hợp lệ!"); return; }
        const newLog = { ...weightLog, [weightDate]: inputVal };
        setWeightLog(newLog);
        localStorage.setItem('stayfit_weight_log', JSON.stringify(newLog));

        // Set pendingChangeRef IMMEDIATELY để chặn bất kỳ pull nào đang chạy
        if (pendingChangeRef) pendingChangeRef.current = true;

        // Cập nhật profile.weight (App sẽ tự persist profile qua saveSnapshot).
        setProfile({ ...profile, weight: inputVal });
        setWeightInput("");

        // Ghi cân nặng thẳng lên Supabase (hạt mịn).
        try { await sbUpsertWeight(userId, weightDate, inputVal); }
        catch (err) { console.error("Lỗi lưu cân nặng:", err.message); }
    };

    const deleteWeight = (date) => {
        const newLog = { ...weightLog }; delete newLog[date];
        setWeightLog(newLog); localStorage.setItem('stayfit_weight_log', JSON.stringify(newLog));
        sbDeleteWeight(userId, date).catch(err => console.error("Lỗi xóa cân nặng:", err.message));
    };

    const handleChartClick = (e, activeElements) => {
        if (activeElements.length > 0) {
            const dataIndex = activeElements[0].index;
            setCurrentDate(currentChartDates[dataIndex]);
            setView("journal");
        }
    };
    
    const handleChartHover = (e, activeElements) => {
        if(e.native && e.native.target) {
            e.native.target.style.cursor = activeElements?.length > 0 ? 'pointer' : 'default';
        }
    };

    useEffect(() => {
        const isDark = theme === 'dark';
        const axisColor = isDark ? '#9E9E9E' : '#7A7066';   // ticks / default text
        const inkColor  = isDark ? '#F5F5F5' : '#2D2620';   // datalabel / legend ink
        Chart.defaults.font.family = "'Inter', sans-serif"; Chart.defaults.color = axisColor;

        if (weightChartInstance.current) weightChartInstance.current.destroy();
        const sortedDates = Object.keys(weightLog).sort((a, b) => new Date(a) - new Date(b)).slice(-14);
        if (sortedDates.length > 0 && weightChartRef.current) {
            const ctx = weightChartRef.current.getContext('2d');
            const labels = sortedDates.map(d => getWeekLabel(d)); 
            const data = sortedDates.map(d => weightLog[d]);
            const gradient = ctx.createLinearGradient(0, 0, 0, 200); 
            gradient.addColorStop(0, 'rgba(217, 119, 87, 0.3)'); gradient.addColorStop(1, 'rgba(217, 119, 87, 0.0)');

            weightChartInstance.current = new Chart(ctx, { 
                type: 'line', 
                data: { labels: labels, datasets: [{ 
                    label: 'Cân nặng (kg)', data: data, borderColor: '#D97757', backgroundColor: gradient, borderWidth: 3, 
                    pointBackgroundColor: '#ffffff', pointBorderColor: '#D97757', pointRadius: 4, fill: true, tension: 0.3,
                    datalabels: { align: 'top', color: '#D97757', font: { weight: 'bold', size: 10 }, formatter: (val) => val }
                }] }, 
                options: { 
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 20 } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }, 
                    scales: { y: { display: false }, x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } } } 
                } 
            });
        }

        // Hex → rgba (dùng cho gradient line/area). Tái sử dụng cả 2 biểu đồ.
        const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };
        const sepColor = isDark ? '#1A1A1A' : '#FFFFFF';   // khe ngăn giữa các tile / lõi điểm

        if (kcalChartInstance.current) kcalChartInstance.current.destroy();
        if (kcalChartRef.current) {
            const ctx = kcalChartRef.current.getContext('2d');
            const labels = currentChartDates.map(d => getWeekLabel(d));

            // Một sắc độ duy nhất (Nike/Apple): cột là dải emerald/Volt trên near-black,
            // dải cam thương hiệu trên cream. Đáy đậm → đỉnh sáng để tip phát sáng.
            const meal = isDark
                ? { sang: '#13532C', trua: '#2A8F54', toi: '#3FA968', vat: '#62C089' }
                : { sang: '#B5532B', trua: '#D97757', toi: '#E89B7B', vat: '#F2C2A5' };
            
            // Hàm tính tổng Calo theo từng bữa ăn
            const sumMealKcal = (dayLog, mealName) => { 
                if (!dayLog || !Array.isArray(dayLog)) return 0; 
                return dayLog.filter(item => item.meal === mealName).reduce((sum, item) => sum + (item.kcal || 0), 0); 
            };

            // Lấy dữ liệu cho từng bữa
            const dataBreakfast = currentChartDates.map(d => Math.round(sumMealKcal(history[d], 'Bữa sáng')));
            const dataLunch = currentChartDates.map(d => Math.round(sumMealKcal(history[d], 'Bữa trưa')));
            const dataDinner = currentChartDates.map(d => Math.round(sumMealKcal(history[d], 'Bữa tối')));
            const dataSnack = currentChartDates.map(d => Math.round(sumMealKcal(history[d], 'Ăn vặt')));
            
            const dataTotal = currentChartDates.map(d => Math.round(sumDayMacro(history[d], 'kcal'))); 
            const targetLine = currentChartDates.map(d => {
                if (targetLog && targetLog[d]) return targetLog[d]; 
                
                // Nếu ngày đó không có dữ liệu chốt sổ, tự động lấy mục tiêu của ngày gần nhất trước đó
                if (targetLog) {
                    const pastDates = Object.keys(targetLog).filter(k => k < d).sort((a,b) => new Date(b) - new Date(a));
                    if (pastDates.length > 0) return targetLog[pastDates[0]];
                }
                return target; // Nếu trống hoàn toàn thì lấy mặc định
            });

            // Chỉ bo góc đỉnh của segment trên cùng (non-zero) mỗi cột → 1 nắp tròn gọn (Apple).
            const stackData = [dataBreakfast, dataLunch, dataDinner, dataSnack]; // thứ tự đáy → đỉnh
            const capRadius = (order) => (c) => {
                for (let k = stackData.length - 1; k > order; k--) if (stackData[k][c.dataIndex] > 0) return 0;
                return stackData[order][c.dataIndex] > 0 ? { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 } : 0;
            };

            kcalChartInstance.current = new Chart(ctx, {
                type: 'bar', 
                data: { 
                    labels: labels, 
                    datasets: [
                        // Đặt stack riêng rẽ cho các đường line để chúng không bị cộng dồn
                        { type: 'line', label: 'Tổng', data: dataTotal, stack: 'lineTotal', borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, datalabels: { align: 'end', anchor: 'end', color: inkColor, font: { weight: '800', size: 11 }, padding: { bottom: 2 }, formatter: (val) => val > 0 ? val.toLocaleString('vi-VN') : '' } },
                        { type: 'line', label: 'Mục tiêu', data: targetLine, stack: 'lineTarget', borderColor: isDark ? 'rgba(137,243,54,0.45)' : '#C7BCA8', borderWidth: 1.5, borderDash: [3, 5], borderCapStyle: 'round', pointRadius: 0, fill: false, tension: 0, datalabels: { display: false } },

                        // 4 bữa — một sắc độ (dải emerald/cam), không khe ngăn, 1 nắp tròn mỗi cột
                        { type: 'bar', label: 'Bữa sáng', data: dataBreakfast, stack: 'bars', backgroundColor: meal.sang, borderWidth: 0, borderRadius: capRadius(0), borderSkipped: false, datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa trưa', data: dataLunch, stack: 'bars', backgroundColor: meal.trua, borderWidth: 0, borderRadius: capRadius(1), borderSkipped: false, datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa tối', data: dataDinner, stack: 'bars', backgroundColor: meal.toi, borderWidth: 0, borderRadius: capRadius(2), borderSkipped: false, datalabels: { display: false } },
                        { type: 'bar', label: 'Ăn vặt', data: dataSnack, stack: 'bars', backgroundColor: meal.vat, borderWidth: 0, borderRadius: capRadius(3), borderSkipped: false, datalabels: { display: false } }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 28 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    categoryPercentage: 0.85,
                    barPercentage: 0.6,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(45, 38, 32, 0.95)',
                            titleColor: '#FFFFFF',
                            bodyColor: '#F4EFE6',
                            borderColor: 'transparent',
                            borderWidth: 0,
                            padding: 12,
                            cornerRadius: 12,
                            boxPadding: 4,
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            displayColors: true,
                            titleFont: { weight: '600', size: 11 },
                            bodyFont: { size: 12, weight: '500' },
                            callbacks: {
                                label: function(context) {
                                    if (context.dataset.label === 'Mục tiêu' || context.dataset.label === 'Tổng' || context.parsed.y === 0) return null;
                                    return ` ${context.dataset.label}: ${context.parsed.y.toLocaleString('vi-VN')} kcal`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { stacked: true, display: true, grid: { display: false, drawBorder: false }, ticks: { font: { weight: '500', size: 10 }, color: axisColor } },
                        y: { stacked: true, display: true, beginAtZero: true, grid: { color: 'rgba(45, 38, 32, 0.06)', drawBorder: false }, ticks: { display: false } }
                    }
                }
            });
        }

        if (macroChartInstance.current) macroChartInstance.current.destroy();
        if (macroChartRef.current) {
            const ctx = macroChartRef.current.getContext('2d');
            const labels = currentChartDates.map(d => getWeekLabel(d));
            const dataProtein = currentChartDates.map(d => Math.round(sumDayMacro(history[d], 'protein'))); 
            const dataCarb = currentChartDates.map(d => Math.round(sumDayMacro(history[d], 'carb')));
            const dataFat = currentChartDates.map(d => Math.round(sumDayMacro(history[d], 'fat')));

            // Màu macro năng động: rực trên near-black (Volt), trầm-ấm trên cream.
            const macro = isDark
                ? { protein: '#34D36B', carb: '#E0C064', fat: '#B49AE0' }
                : { protein: '#5F8266', carb: '#C49A4A', fat: '#9B8AB8' };
            // Dataset macro: đường mượt + nền gradient tan dần + điểm lõi trắng phát sáng (Apple Health).
            const macroSet = (label, data, color) => ({
                label, data,
                borderColor: color,
                backgroundColor: (() => { const g = ctx.createLinearGradient(0, 0, 0, 190); g.addColorStop(0, hexA(color, 0.16)); g.addColorStop(1, hexA(color, 0)); return g; })(),
                borderWidth: 3, tension: 0.4, fill: true,
                borderCapStyle: 'round', borderJoinStyle: 'round',
                pointBackgroundColor: sepColor, pointBorderColor: color, pointBorderWidth: 2,
                pointRadius: 3, pointHoverRadius: 6, pointHoverBorderWidth: 3,
                pointHoverBackgroundColor: sepColor,
                datalabels: { display: false },
            });

           macroChartInstance.current = new Chart(ctx, {
                type: 'line',
                data: { labels: labels, datasets: [
                    macroSet('Protein', dataProtein, macro.protein),
                    macroSet('Carb',    dataCarb,    macro.carb),
                    macroSet('Fat',     dataFat,     macro.fat),
                ]},
                options: {
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25, bottom: 15 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11, weight: '500' }, color: inkColor, padding: 12 } },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(45, 38, 32, 0.95)',
                            titleColor: '#FFFFFF',
                            bodyColor: '#F4EFE6',
                            borderColor: 'transparent',
                            padding: 12,
                            cornerRadius: 12,
                            displayColors: true,
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            titleFont: { weight: '600', size: 11 },
                            bodyFont: { size: 12, weight: '500' },
                            callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y}g` }
                        }
                    },
                    scales: {
                        y: { display: true, beginAtZero: true, grid: { color: 'rgba(45, 38, 32, 0.06)', drawBorder: false }, ticks: { display: false } },
                        x: { display: true, grid: { display: false, drawBorder: false }, ticks: { font: { weight: '500', size: 10 }, color: axisColor } }
                    }
                }
            });
        }
        
        return () => { 
            if (weightChartInstance.current) weightChartInstance.current.destroy(); 
            if (kcalChartInstance.current) kcalChartInstance.current.destroy(); 
            if (macroChartInstance.current) macroChartInstance.current.destroy(); 
        };
    }, [history, weightLog, target, targetLog, currentChartDates, theme]);

    const sortedDates = Object.keys(weightLog).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="max-w-md mx-auto min-h-screen bg-cream pb-28 relative text-ink">
            {/* Slim sticky header */}
            <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-cream-deep px-4 py-3 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Tổng quan</span>
                    <p className="text-sm font-bold text-ink">Thống kê & Biểu đồ</p>
                </div>
            </header>

            <main className="p-4 space-y-5">
                {/* TIẾN TRÌNH CÂN NẶNG */}
                {(() => {
                    // Lấy weight hiện tại từ weightLog (entry mới nhất theo ngày) — source of truth.
                    // Tránh dùng profile.weight vì hay bị race condition với sync.
                    const weightLogDates = Object.keys(weightLog).sort((a, b) => new Date(b) - new Date(a));
                    const latestLogWeight = weightLogDates.length > 0 ? Number(weightLog[weightLogDates[0]]) : null;
                    const currentWeight = latestLogWeight ?? Number(profile?.weight) ?? 0;
                    const startWeight = Number(profile?.startWeight) || currentWeight;
                    const targetWeight = Number(profile?.targetWeight) || currentWeight;
                    const change = currentWeight - startWeight;
                    const totalRange = Math.abs(targetWeight - startWeight);
                    let progressPct = 0;
                    if (totalRange > 0) {
                        if (targetWeight < startWeight) {
                            progressPct = ((startWeight - currentWeight) / totalRange) * 100;
                        } else {
                            progressPct = ((currentWeight - startWeight) / totalRange) * 100;
                        }
                        progressPct = Math.max(0, Math.min(100, progressPct));
                    }
                    const hasGoal = !!profile?.targetWeight && targetWeight !== startWeight;

                    return (
                        <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6 relative">
                            <header className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-xl">⚖️</span>
                                    <div>
                                        <h3 className="text-[15px] font-bold tracking-tight text-ink">Tiến trình cân nặng</h3>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setWeightMenuOpen(o => !o)}
                                        className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-cream-soft hover:text-ink transition"
                                        aria-label="Tùy chọn"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
                                    </button>
                                    {weightMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setWeightMenuOpen(false)} />
                                            <div className="absolute right-0 top-11 z-40 w-60 bg-surface rounded-2xl shadow-lift ring-1 py-1.5 overflow-hidden">
                                                <button
                                                    onClick={() => { setWeightInput(""); setWeightDate(formatDate(new Date())); setWeightModal("log"); setWeightMenuOpen(false); }}
                                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream-soft transition text-left"
                                                >
                                                    <span className="text-[13px] font-semibold text-ink">Ghi lại cân nặng</span>
                                                    <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-soft text-orange-deep">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setGoalDraft({
                                                            start: profile?.startWeight ?? profile?.weight ?? "",
                                                            target: profile?.targetWeight ?? "",
                                                        });
                                                        setWeightModal("goal");
                                                        setWeightMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream-soft transition text-left"
                                                >
                                                    <span className="text-[13px] font-semibold text-ink">Chỉnh sửa mục tiêu</span>
                                                    <span className="grid h-7 w-7 place-items-center rounded-full bg-sage-soft text-sage-deep">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => { setWeightModal("history"); setWeightMenuOpen(false); }}
                                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream-soft transition text-left"
                                                >
                                                    <span className="text-[13px] font-semibold text-ink">Lịch sử cân nặng</span>
                                                    <span className="grid h-7 w-7 place-items-center rounded-full bg-lilac-soft text-lilac-deep">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 14"/></svg>
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </header>

                            <div className="mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">Thay đổi</p>
                                <p className={`text-[40px] font-bold tabular-nums leading-none ${change > 0 ? 'text-orange-deep' : change < 0 ? 'text-sage-deep' : 'text-ink'}`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(2).replace(/\.?0+$/, '') || '0'}
                                    <span className="text-[16px] font-bold text-ink-muted ml-1">kg</span>
                                </p>
                            </div>

                            <div className="border-t border-cream-deep/60 pt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
                                    Đã đạt được <span className="text-orange-deep tabular-nums">{Math.round(progressPct)}%</span> mục tiêu
                                </p>
                                <div
                                    className="relative h-5 rounded-full ring-1 overflow-hidden"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(135deg, rgb(var(--cream-soft)) 0 8px, rgb(var(--cream-deep)) 8px 16px)',
                                    }}
                                >
                                    {hasGoal && progressPct > 0 && (
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full transition-[width]"
                                            style={{
                                                width: `${progressPct}%`,
                                                backgroundImage: 'repeating-linear-gradient(135deg, rgb(var(--orange)) 0 8px, rgb(var(--orange-deep)) 8px 16px)',
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-2.5 text-[12px]">
                                    <span className="font-bold tabular-nums text-ink">{startWeight} kg</span>
                                    <svg className="w-3.5 h-3.5 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    <span className="font-bold tabular-nums text-ink">{targetWeight} kg</span>
                                </div>
                                {!hasGoal && (
                                    <p className="text-[10px] text-ink-faint italic text-center mt-3">
                                        Chưa đặt mục tiêu, bấm <span className="font-semibold">⋯</span> để bắt đầu
                                    </p>
                                )}
                            </div>
                        </section>
                    );
                })()}

                {/* MODAL: GHI LẠI CÂN NẶNG */}
                {weightModal === "log" && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-surface rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[16px] font-bold text-ink tracking-tight">Ghi lại cân nặng</h3>
                                <button onClick={() => setWeightModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep active:scale-95 transition" aria-label="Đóng">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Ngày</label>
                                    <input type="date" value={weightDate} max={todayStr} onChange={e=>setWeightDate(e.target.value)} className="w-full bg-cream-soft p-3 rounded-2xl outline-none font-semibold text-[13px] text-ink tabular-nums ring-1 focus:ring-2 focus:ring-orange/30 transition" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Cân nặng (kg)</label>
                                    <input type="number" value={weightInput} onChange={e=>setWeightInput(e.target.value)} step="0.01" placeholder={weightLog[weightDate] ? `Đã ghi: ${weightLog[weightDate]}kg` : "Số kg..."} className="w-full bg-cream-soft p-3 rounded-2xl outline-none font-bold text-[18px] text-ink placeholder:text-ink-faint text-center tabular-nums ring-1 focus:ring-2 focus:ring-orange/30 transition" autoFocus />
                                </div>
                                <button
                                    onClick={() => { saveWeight(); setWeightModal(null); }}
                                    className="w-full h-12 bg-orange text-onaccent rounded-2xl font-bold text-[14px] transition hover:bg-orange-deep active:scale-95 shadow-soft ring-1 ring-orange-deep/20 mt-2"
                                >
                                    Lưu cân nặng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: CHỈNH SỬA MỤC TIÊU */}
                {weightModal === "goal" && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-surface rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[16px] font-bold text-ink tracking-tight">Chỉnh sửa mục tiêu</h3>
                                <button onClick={() => setWeightModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep active:scale-95 transition" aria-label="Đóng">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Bắt đầu (kg)</label>
                                        <input type="number" value={goalDraft.start} step="0.01" onChange={e => setGoalDraft(d => ({ ...d, start: e.target.value }))} className="w-full bg-cream-soft p-3 rounded-2xl outline-none font-bold text-[16px] text-ink text-center tabular-nums ring-1 focus:ring-2 focus:ring-orange/30 transition" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Mục tiêu (kg)</label>
                                        <input type="number" value={goalDraft.target} step="0.01" onChange={e => setGoalDraft(d => ({ ...d, target: e.target.value }))} className="w-full bg-cream-soft p-3 rounded-2xl outline-none font-bold text-[16px] text-orange-deep text-center tabular-nums ring-1 focus:ring-2 focus:ring-orange/30 transition" />
                                    </div>
                                </div>
                                <p className="text-[11px] text-ink-muted italic px-1">
                                    "Bắt đầu" là cân nặng tại thời điểm đặt mục tiêu. "Mục tiêu" là số kg bạn muốn đạt.
                                </p>
                                <button
                                    onClick={() => {
                                        const start = parseFloat(goalDraft.start);
                                        const tgt = parseFloat(goalDraft.target);
                                        if (!start || !tgt || start <= 0 || tgt <= 0) { toast.error("Vui lòng nhập số kg hợp lệ!"); return; }
                                        setProfile({ ...profile, startWeight: start, targetWeight: tgt });
                                        setWeightModal(null);
                                        // App tự persist profile (start_weight/target_weight) qua saveSnapshot.
                                    }}
                                    className="w-full h-12 bg-orange text-onaccent rounded-2xl font-bold text-[14px] transition hover:bg-orange-deep active:scale-95 shadow-soft ring-1 ring-orange-deep/20 mt-2"
                                >
                                    Lưu mục tiêu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: LỊCH SỬ CÂN NẶNG */}
                {weightModal === "history" && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-surface rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[16px] font-bold text-ink tracking-tight">Lịch sử cân nặng</h3>
                                <button onClick={() => setWeightModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep active:scale-95 transition" aria-label="Đóng">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar bg-cream-soft rounded-2xl p-2 ring-1">
                                {sortedDates.length === 0 ? (
                                    <EmptyState icon="⚖️" title="Chưa có dữ liệu cân nặng" subtitle="Ghi cân nặng đầu tiên để xem biểu đồ" />
                                ) : (
                                    sortedDates.map(date => (
                                        <div key={date} className="flex justify-between items-center p-3 bg-surface rounded-xl mb-1.5 last:mb-0 ring-1 ring-cream-deep/40">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-semibold text-ink-muted bg-cream-soft px-2 py-1 rounded-lg tabular-nums">{getWeekLabel(date)}/{date.split('-')[0]}</span>
                                                <span className="text-[14px] font-bold text-ink tabular-nums">{weightLog[date]}<span className="text-[11px] font-medium text-ink-muted ml-0.5">kg</span></span>
                                            </div>
                                            <button onClick={() => deleteWeight(date)} className="p-2 text-ink-faint hover:text-orange-deep bg-cream-soft hover:bg-orange-soft rounded-lg transition" aria-label="Xóa"><IconTrash /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* BIỂU ĐỒ CÂN NẶNG */}
                <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 relative md:p-6">
                    <header className="flex items-center gap-3 mb-4">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft text-xl">📈</span>
                        <div>
                            <h3 className="text-[15px] font-bold tracking-tight text-ink">Biểu đồ cân nặng</h3>
                        </div>
                    </header>
                    {sortedDates.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-surface/85 backdrop-blur-sm rounded-3xl z-10">
                            <p className="text-[12px] font-medium text-ink-muted italic">Chưa có dữ liệu</p>
                        </div>
                    )}
                    <div className="h-48 relative w-full"><canvas ref={weightChartRef}></canvas></div>
                </section>

                {/* CHỈ SỐ BMI */}
                {(() => {
                    const heightM = (profile?.height || 0) / 100;
                    const weightKg = profile?.weight || 0;
                    if (!heightM || !weightKg) return null;
                    const bmi = weightKg / (heightM * heightM);

                    let category, catColor, catBg;
                    if (bmi < 18.5)      { category = "Thiếu cân";  catColor = "text-mist-deep";   catBg = "bg-mist-soft"; }
                    else if (bmi < 25)   { category = "Khỏe mạnh";  catColor = "text-sage-deep";   catBg = "bg-sage-soft"; }
                    else if (bmi < 30)   { category = "Thừa cân";   catColor = "text-orange-deep"; catBg = "bg-orange-soft"; }
                    else                 { category = "Béo phì";    catColor = "text-rose-700";    catBg = "bg-rose-100"; }

                    const MIN_BMI = 15, MAX_BMI = 40;
                    const markerPct = Math.max(0, Math.min(100, ((bmi - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 100));

                    const segments = [
                        { color: "bg-mist",     flex: 3.5, label: "Thiếu cân",  range: "<18.5",     dot: "bg-mist" },
                        { color: "bg-sage",     flex: 6.5, label: "Khỏe mạnh",  range: "18.5-24.9", dot: "bg-sage" },
                        { color: "bg-orange",   flex: 5,   label: "Thừa cân",   range: "25.0-29.9", dot: "bg-orange" },
                        { color: "bg-rose-500", flex: 10,  label: "Béo phì",    range: ">30.0",     dot: "bg-rose-500" },
                    ];

                    return (
                        <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                            <header className="flex items-center gap-3 mb-4">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mist-soft text-xl">⚖️</span>
                                <div>
                                    <h3 className="text-[15px] font-bold tracking-tight text-ink">Chỉ số BMI của bạn</h3>
                                </div>
                            </header>

                            <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                                <p className="text-4xl font-bold text-ink tabular-nums leading-none">{bmi.toFixed(1)}</p>
                                <p className="text-[12px] text-ink-muted">Cân nặng của bạn</p>
                                <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${catBg} ${catColor}`}>
                                    {category}
                                </span>
                            </div>

                            <div className="relative h-2.5 rounded-full overflow-visible flex mb-4">
                                {segments.map((s, i) => (
                                    <div
                                        key={i}
                                        className={`${s.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === segments.length - 1 ? 'rounded-r-full' : ''}`}
                                        style={{ flexGrow: s.flex }}
                                    />
                                ))}
                                <div
                                    className="absolute top-[-4px] bottom-[-4px] w-[3px] bg-ink rounded-full shadow-sm"
                                    style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {segments.map(s => (
                                    <div key={s.label} className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                                            <p className="text-[10px] font-semibold text-ink leading-tight">{s.label}</p>
                                        </div>
                                        <p className="text-[10px] text-ink-muted tabular-nums mt-0.5">{s.range}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })()}

                {/* PAGINATION */}
                <div className="flex justify-between items-center bg-surface p-1.5 rounded-2xl shadow-soft ring-1 sticky top-[64px] z-10">
                    <button onClick={() => setChartOffset(p => p + 1)} className="px-3 py-2 bg-cream-soft hover:bg-orange-soft hover:text-orange-deep text-ink-muted rounded-xl text-[11px] font-semibold transition">‹ 14 ngày trước</button>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted text-center px-2 tabular-nums">
                        {getWeekLabel(currentChartDates[0])} - {getWeekLabel(currentChartDates[currentChartDates.length-1])}
                    </span>
                    <button onClick={() => setChartOffset(p => Math.max(0, p - 1))} disabled={chartOffset === 0} className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition ${chartOffset === 0 ? 'text-cream-deep cursor-not-allowed' : 'bg-cream-soft hover:bg-orange-soft hover:text-orange-deep text-ink-muted'}`}>Tiếp ›</button>
                </div>

                {/* KCAL CHART */}
                <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                    <header className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-clay-soft text-xl">🔥</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Năng lượng đã nạp</h3>
                            </div>
                        </div>
                    </header>
                    <div className="h-48 relative w-full"><canvas ref={kcalChartRef}></canvas></div>
                </section>

                {/* MACRO CHART */}
                <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                    <header className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lilac-soft text-xl">🥗</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Protein · Carb · Fat</h3>
                            </div>
                        </div>
                    </header>
                    <div className="h-48 relative w-full"><canvas ref={macroChartRef}></canvas></div>
                </section>
            </main>
            <BottomNav view={view} setView={setView} />
        </div>
    );
}

export default React.memo(StatsView);
