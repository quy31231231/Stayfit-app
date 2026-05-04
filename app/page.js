"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Khởi tạo Plugin DataLabels
Chart.register(ChartDataLabels);

// --- ICONS (SVG) ---
const IconUser = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const IconJournal = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>);
const IconTrash = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IconStats = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);

// --- DỮ LIỆU CƠ BẢN ---
const COMMON_FOODS = [
    { name: "Highland Coffee", unit: "ly", per: 1, kcal: 300, protein: 0, carb: 0, fat: 0 },
    { name: "Cacao", unit: "g", per: 100, kcal: 228, protein: 20, carb: 58, fat: 14 },
    { name: "Thịt dải", unit: "g", per: 100, kcal: 250, protein: 18, carb: 0, fat: 19 },
    { name: "Lòng lợn", unit: "g", per: 100, kcal: 150, protein: 15, carb: 0, fat: 10 },
    { name: "Ức gà", unit: "g", per: 100, kcal: 110, protein: 23, carb: 0, fat: 1 },
    { name: "Cơm trắng", unit: "g", per: 100, kcal: 130, protein: 2.7, carb: 28, fat: 0.3 }
];
const ACTIVITY_LEVELS = [
    { label: "Ít vận động", value: 1.2 }, { label: "Nhẹ (1-3 buổi/tuần)", value: 1.375 }, 
    { label: "Vừa (3-5 buổi/tuần)", value: 1.55 }, { label: "Nhiều (6-7 buổi/tuần)", value: 1.725 }
];
const GOALS = [
    { label: "Giảm cân nhanh", value: -500 }, { label: "Giảm cân nhẹ", value: -250 }, 
    { label: "Duy trì", value: 0 }, { label: "Tăng cân", value: 300 }
];
const MEAL_TYPES = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
const DIET_MODES = [
    {
        category: "1. Cân bằng & Lành mạnh",
        items: [
            { id: 'standard', name: "Tiêu chuẩn (Standard)", desc: "Duy trì năng lượng ổn định cho người trưởng thành khỏe mạnh.", carb: 0.50, pro: 0.20, fat: 0.30, label: "50C - 20P - 30F" },
            { id: 'mediterranean', name: "Địa Trung Hải", desc: "Tập trung chất béo không bão hòa từ dầu ô liu và cá béo.", carb: 0.50, pro: 0.15, fat: 0.35, label: "50C - 15P - 35F" },
            { id: 'dash', name: "DASH", desc: "Giảm muối, tăng kali, canxi để kiểm soát huyết áp.", carb: 0.55, pro: 0.18, fat: 0.27, label: "55C - 18P - 27F" }
        ]
    },
    {
        category: "2. Giảm cân & Chuyển hóa mỡ",
        items: [
            { id: 'keto', name: "Keto (Ketogenic)", desc: "Cắt giảm tinh bột tối đa để đốt mỡ làm năng lượng chính.", carb: 0.05, pro: 0.20, fat: 0.75, label: "5C - 20P - 75F" },
            { id: 'lowcarb', name: "Low Carb (Ít tinh bột)", desc: "Linh hoạt hơn Keto nhưng vẫn ưu tiên protein và chất béo.", carb: 0.25, pro: 0.30, fat: 0.45, label: "25C - 30P - 45F" },
            { id: 'zone', name: "Zone (40:30:30)", desc: "Tỷ lệ vàng để kiểm soát insulin và giảm viêm.", carb: 0.40, pro: 0.30, fat: 0.30, label: "40C - 30P - 30F" }
        ]
    },
    {
        category: "3. Các chế độ ăn đặc thù khác",
        items: [
            { id: 'paleo', name: "Paleo", desc: "Ăn theo thực phẩm tự nhiên, loại bỏ ngũ cốc và sữa.", carb: 0.30, pro: 0.30, fat: 0.40, label: "30C - 30P - 40F" },
            { id: 'bodybuilding', name: "Tăng cơ - Giảm mỡ", desc: "Yêu cầu lượng Protein cao để xây dựng cơ bắp.", carb: 0.45, pro: 0.35, fat: 0.20, label: "45C - 35P - 20F" },
            { id: 'lowfat', name: "Low Fat (Ít béo)", desc: "Hạn chế tối đa chất béo để giảm tổng lượng calo nạp vào.", carb: 0.60, pro: 0.25, fat: 0.15, label: "60C - 25P - 15F" }
        ]
    },
    {
        category: "4. Tùy chỉnh",
        items: [
            { id: 'custom', name: "Tự nhập tay (Custom)", desc: "Cho phép bạn tự thay đổi thông số Gram theo ý muốn.", carb: 0, pro: 0, fat: 0, label: "Tùy chọn" }
        ]
    }
];

const formatDate = (date) => { 
    const d = new Date(date); 
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
};
const calcMacro = (val, per, q) => Math.round((val / per) * q * 10) / 10;
const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

// --- COMPONENTS ---
function MacroProgressBar({ label, current, target, colorClass }) {
    const pct = Math.min((current / target) * 100, 100) || 0;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-700">{current}g <span className="opacity-40">/ {target}g</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${colorClass} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}

function StatsView({ history, profile, setProfile, target, setView, view, setCurrentDate }) {
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

   const saveWeight = () => {
        const inputVal = parseFloat(weightInput);
        if (!inputVal || inputVal <= 0) return alert("Vui lòng nhập số kg hợp lệ!");
        const newLog = { ...weightLog, [weightDate]: inputVal };
        setWeightLog(newLog); 
        localStorage.setItem('stayfit_weight_log', JSON.stringify(newLog));
        setProfile({...profile, weight: inputVal}); setWeightInput("");
    };

    const deleteWeight = (date) => { 
        const newLog = { ...weightLog }; delete newLog[date]; 
        setWeightLog(newLog); localStorage.setItem('stayfit_weight_log', JSON.stringify(newLog)); 
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
        Chart.defaults.font.family = "'Inter', sans-serif"; Chart.defaults.color = '#94a3b8';

        if (weightChartInstance.current) weightChartInstance.current.destroy();
        const sortedDates = Object.keys(weightLog).sort((a, b) => new Date(a) - new Date(b)).slice(-14);
        if (sortedDates.length > 0 && weightChartRef.current) {
            const ctx = weightChartRef.current.getContext('2d');
            const labels = sortedDates.map(d => getWeekLabel(d)); 
            const data = sortedDates.map(d => weightLog[d]);
            const gradient = ctx.createLinearGradient(0, 0, 0, 200); 
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)'); gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

            weightChartInstance.current = new Chart(ctx, { 
                type: 'line', 
                data: { labels: labels, datasets: [{ 
                    label: 'Cân nặng (kg)', data: data, borderColor: '#10B981', backgroundColor: gradient, borderWidth: 3, 
                    pointBackgroundColor: '#ffffff', pointBorderColor: '#10B981', pointRadius: 4, fill: true, tension: 0.3,
                    datalabels: { align: 'top', color: '#10B981', font: { weight: 'bold', size: 10 }, formatter: (val) => val }
                }] }, 
                options: { 
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 20 } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }, 
                    scales: { y: { display: false }, x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } } } 
                } 
            });
        }

        if (kcalChartInstance.current) kcalChartInstance.current.destroy();
        if (kcalChartRef.current) {
            const ctx = kcalChartRef.current.getContext('2d');
            const labels = currentChartDates.map(d => getWeekLabel(d));
            const dataKcal = currentChartDates.map(d => Math.round(sumDayMacro(history[d], 'kcal'))); 
            const targetLine = new Array(14).fill(target);

            kcalChartInstance.current = new Chart(ctx, { 
                type: 'bar', 
                data: { labels: labels, datasets: [
                    { type: 'bar', label: 'Kcal thực tế', data: dataKcal, backgroundColor: '#3B82F6', borderRadius: 4, datalabels: { align: 'end', anchor: 'end', color: '#3B82F6', font: { weight: 'bold', size: 9 }, formatter: (val) => val > 0 ? val : '' } }, 
                    { type: 'line', label: 'Mục tiêu', data: targetLine, borderColor: '#cbd5e1', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0, datalabels: { display: false } }
                ]}, 
                options: { 
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }, 
                    scales: { y: { display: true, beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { display: false } }, x: { display: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { weight: 'bold', size: 9 } } } } 
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

           macroChartInstance.current = new Chart(ctx, { 
                type: 'line', 
                data: { labels: labels, datasets: [
                    { label: 'Protein', data: dataProtein, borderColor: '#10B981', backgroundColor: '#10B981', borderWidth: 2, tension: 0.4, pointRadius: 3, datalabels: { display: false } }, 
                    { label: 'Carb', data: dataCarb, borderColor: '#3B82F6', backgroundColor: '#3B82F6', borderWidth: 2, tension: 0.4, pointRadius: 3, datalabels: { display: false } },
                    { label: 'Fat', data: dataFat, borderColor: '#F59E0B', backgroundColor: '#F59E0B', borderWidth: 2, tension: 0.4, pointRadius: 3, datalabels: { display: false } }
                ]},
                options: { 
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25, bottom: 15 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 10, font: {size: 10, weight: 'bold'} } }, tooltip: { enabled: false } }, 
                    scales: { y: { display: true, beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { display: false } }, x: { display: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { weight: 'bold', size: 9 } } } } 
                } 
            });
        }
        
        return () => { 
            if (weightChartInstance.current) weightChartInstance.current.destroy(); 
            if (kcalChartInstance.current) kcalChartInstance.current.destroy(); 
            if (macroChartInstance.current) macroChartInstance.current.destroy(); 
        };
    }, [history, weightLog, target, currentChartDates]);

    const sortedDates = Object.keys(weightLog).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-28 animate-in fade-in duration-300 relative text-slate-800">
            <header className="bg-white p-6 border-b border-slate-100 flex justify-center items-center shadow-sm sticky top-0 z-20">
                <h1 className="font-black uppercase tracking-widest text-slate-800 text-xs text-center w-full">Thống kê & Biểu đồ</h1>
            </header>
            <main className="p-4 space-y-6">
                <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Cập nhật cân nặng</h3>
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-[1.25rem] mb-4 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all border border-slate-100 shadow-inner">
                        {/* Khu vực chọn ngày */}
                        <div className="relative flex items-center">
                            <svg className="w-4 h-4 text-emerald-500 absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <input 
                                type="date" 
                                value={weightDate} 
                                max={todayStr} 
                                onChange={e=>setWeightDate(e.target.value)} 
                                className="w-[115px] bg-transparent py-3 pl-9 pr-1 outline-none font-black text-[10px] uppercase text-slate-600 cursor-pointer tracking-wider [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                            />
                        </div>
                        
                        {/* Vạch ngăn cách */}
                        <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
                        
                        {/* Khu vực nhập số kg */}
                        <input 
                            type="number" 
                            value={weightInput} 
                            onChange={e=>setWeightInput(e.target.value)} 
                            step="0.1" 
                            placeholder={weightLog[weightDate] ? `Đã ghi: ${weightLog[weightDate]}kg` : "Số kg..."} 
                            className="flex-1 bg-transparent p-3 outline-none font-bold text-sm text-slate-800 placeholder:text-slate-300 w-full min-w-[60px]" 
                        />
                        
                        {/* Nút GHI tích hợp bên trong */}
                        <button 
                            onClick={saveWeight} 
                            className="h-10 px-5 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-md shadow-emerald-200 shrink-0"
                        >
                            Ghi
                        </button>
                    </div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2 mt-6">Lịch sử (Gần nhất)</h4>
                    <div className="max-h-32 overflow-y-auto no-scrollbar bg-slate-50 rounded-2xl p-2 border border-slate-100">
                        {sortedDates.length === 0 ? (
                            <p className="text-center text-slate-400 text-[10px] uppercase font-bold italic py-4">Chưa có bản ghi</p>
                        ) : (
                            sortedDates.slice(0, 14).map(date => (
                                <div key={date} className="flex justify-between items-center p-3 bg-white rounded-xl mb-1 shadow-sm border border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{getWeekLabel(date)}/{date.split('-')[0]}</span>
                                        <span className="text-sm font-black text-slate-800">{weightLog[date]} <span className="text-[10px] font-bold italic opacity-40">kg</span></span>
                                    </div>
                                    <button onClick={() => deleteWeight(date)} className="p-2 text-slate-200 hover:text-red-500 bg-slate-50 rounded-lg transition-colors group"><IconTrash /></button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Biểu đồ cân nặng</h3>
                    {sortedDates.length === 0 && ( <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[2.5rem] z-10"><p className="text-xs font-bold text-slate-400 italic">Chưa có dữ liệu</p></div> )}
                    <div className="h-48 relative w-full"><canvas ref={weightChartRef}></canvas></div>
                </section>
                <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100 sticky top-[80px] z-10">
                    <button onClick={() => setChartOffset(p => p + 1)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase transition-colors">◀ 14 Ngày Trước</button>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center px-2">
                        {getWeekLabel(currentChartDates[0])} - {getWeekLabel(currentChartDates[currentChartDates.length-1])}
                    </span>                    
                    <button onClick={() => setChartOffset(p => Math.max(0, p - 1))} disabled={chartOffset === 0} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-colors ${chartOffset === 0 ? 'bg-transparent text-slate-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>Tiếp Theo ▶</button>
                </div>
                <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-1"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calo nạp vào</h3><span className="text-[8px] italic text-slate-300">Nhấn vào cột để xem</span></div>
                    <div className="h-48 relative w-full"><canvas ref={kcalChartRef}></canvas></div>
                </section>
               <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protein, Carb & Fat</h3><span className="text-[8px] italic text-slate-300">Nhấn vào điểm để xem</span></div>
                    <div className="h-48 relative w-full"><canvas ref={macroChartRef}></canvas></div>
                </section>
            </main>
            
            {/* THÊM DÒNG NÀY ĐỂ HIỆN THANH MENU ĐIỀU HƯỚNG */}
            <BottomNav view={view} setView={setView} />
            
        </div>
    );
}

function BottomNav({view, setView}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 z-40 flex justify-around items-center rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] max-w-md mx-auto">
            <button onClick={() => setView("journal")} className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/3 ${view==='journal' ? 'text-emerald-600 scale-110 font-black':'text-slate-300 opacity-60'}`}>
                <IconJournal /><span className="text-[9px] uppercase font-bold tracking-tighter">Nhật ký</span>
            </button>
            <button onClick={() => setView("stats")} className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/3 ${view==='stats' ? 'text-emerald-600 scale-110 font-black':'text-slate-300 opacity-60'}`}>
                <IconStats /><span className="text-[9px] uppercase font-bold tracking-tighter">Thống kê</span>
            </button>
            <button onClick={() => setView("profile")} className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/3 ${view==='profile' ? 'text-emerald-600 scale-110 font-black':'text-slate-300 opacity-60'}`}>
                <IconUser /><span className="text-[9px] uppercase font-bold tracking-tighter">Hồ sơ</span>
            </button>
        </div>
    );
}

// --- MAIN APP EXPORT ---
export default function App() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [view, setView] = useState("profile");
    const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);

    const [profile, setProfile] = useState({ 
        gender: "male", age: 25, height: 165, weight: 60, activity: 1.375, goal: 0, 
        isManualTarget: false, manualTargetKcal: 2000,
        isManualMacro: false, manualProtein: 125, manualCarb: 250, manualFat: 55, macroDietMode: "Tiêu chuẩn (Standard)"
    });
    const [history, setHistory] = useState({});
    const [customFoodList, setCustomFoodList] = useState([]);
    const [deletedCommonFoods, setDeletedCommonFoods] = useState([]);
    const [tab, setTab] = useState("quick");
    const [selectedMeal, setSelectedMeal] = useState("Bữa sáng");
    const [selectedFood, setSelectedFood] = useState(null);
    const [qty, setQty] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [customFood, setCustomFood] = useState({ name: "", quantity: 1, unit: "g", kcal: "", protein: "", carb: "", fat: "" });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, foodToDelete: null, alertMessage: "" });
    const [inputUser, setInputUser] = useState("");
    const [inputPass, setInputPass] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined") {
            setUserId(localStorage.getItem('stayfit_userid') || "");
            setPassword(localStorage.getItem('stayfit_password') || "");
            const p = localStorage.getItem('stayfit_profile'); if(p) setProfile({...profile, ...JSON.parse(p)});
            const h = localStorage.getItem('stayfit_history'); if(h) setHistory(JSON.parse(h));
            const c = localStorage.getItem('stayfit_custom_foods'); if(c) setCustomFoodList(JSON.parse(c));
            const d = localStorage.getItem('stayfit_deleted_common'); if(d) setDeletedCommonFoods(JSON.parse(d));
            setView(localStorage.getItem('stayfit_setup') ? "journal" : "profile");
            
            try {
                const hour = new Date().getHours();
                if (hour >= 4 && hour < 10) setSelectedMeal("Bữa sáng");
                else if (hour >= 10 && hour < 14) setSelectedMeal("Bữa trưa");
                else if (hour >= 14 && hour < 17) setSelectedMeal("Ăn vặt");
                else if (hour >= 17 && hour < 21) setSelectedMeal("Bữa tối");
                else setSelectedMeal("Ăn vặt"); // Khuya muộn và rạng sáng (21h đêm - 4h sáng) mặc định là Ăn vặt
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('stayfit_profile', JSON.stringify(profile));
            localStorage.setItem('stayfit_history', JSON.stringify(history));
            localStorage.setItem('stayfit_custom_foods', JSON.stringify(customFoodList));
            localStorage.setItem('stayfit_deleted_common', JSON.stringify(deletedCommonFoods));
            if (view !== "profile" && userId) localStorage.setItem('stayfit_setup', 'done');
        }
    }, [profile, history, customFoodList, deletedCommonFoods, view, userId, isClient]);

    const syncToCloud = async () => {
        if (!userId || !password) return; 
        try {
            const profileToSave = { ...profile };
            if (!profileToSave.isManualTarget) profileToSave.manualTargetKcal = "";
            if (!profileToSave.isManualMacro) {
                profileToSave.manualProtein = ""; profileToSave.manualCarb = ""; profileToSave.manualFat = ""; profileToSave.macroDietMode = "";
            }
            await fetch("/api/sync", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "upload", userId: userId, password: password, profile: profileToSave,
                    history: history, weightLog: JSON.parse(localStorage.getItem("stayfit_weight_log") || "{}"),
                }),
            });
        } catch (err) { console.error("Lỗi lưu ngầm:", err.message); }
    };

    const syncFromCloud = async () => {
        if (!userId || !password) return; 
        try {
            const res = await fetch(`/api/sync?userId=${userId}&password=${password}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (Object.keys(data).length === 0 || (!data.profile && !data.history)) return;

            if (data.profile) {
                data.profile.isManualTarget = typeof data.profile.manualTargetKcal === 'number' && !isNaN(data.profile.manualTargetKcal);
                if (!data.profile.isManualTarget) data.profile.manualTargetKcal = 2000; 
                data.profile.isManualMacro = profile.isManualMacro || false;
                data.profile.manualProtein = profile.manualProtein || 125;
                data.profile.manualCarb = profile.manualCarb || 250;
                data.profile.manualFat = profile.manualFat || 55;
                data.profile.macroDietMode = profile.macroDietMode || "Tiêu chuẩn (Standard)";
                setProfile(data.profile);
            }
            if (data.history) setHistory(data.history);
            if (data.weightLog) localStorage.setItem("stayfit_weight_log", JSON.stringify(data.weightLog));
            if (!sessionStorage.getItem(`sync_done_${userId}`)) {
                sessionStorage.setItem(`sync_done_${userId}`, 'true');
                window.location.reload();
            }
        } catch (err) { console.error("Lỗi tải ngầm:", err.message); }
    };

    const handleLogin = async () => {
        const uid = inputUser.trim().toLowerCase(); const pwd = inputPass.trim();
        if (!uid || !pwd) return alert("Vui lòng nhập cả ID và Mật khẩu!"); 
        setLoginLoading(true);
        try {
            const res = await fetch(`/api/sync?userId=${uid}&password=${pwd}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('stayfit_userid', uid); localStorage.setItem('stayfit_password', pwd);
            setUserId(uid); setPassword(pwd);
            if (data.profile) setProfile({...profile, ...data.profile});
            if (data.history) setHistory(data.history);
            if (data.weightLog) localStorage.setItem("stayfit_weight_log", JSON.stringify(data.weightLog));
            window.location.reload();
        } catch (err) { alert("❌ Lỗi: " + err.message); } 
        finally { setLoginLoading(false); }
    };

    useEffect(() => {
        if (!userId || !password || !isClient) return;
        if (!sessionStorage.getItem(`stayfit_initial_sync_${userId}`)) {
            sessionStorage.setItem(`stayfit_initial_sync_${userId}`, 'true');
            syncFromCloud();
        }
    }, [userId, password, isClient]);

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (!isClient) return;
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timeoutId = setTimeout(() => { syncToCloud(); }, 2500);
        return () => clearTimeout(timeoutId);
    }, [history, profile]); 

    useEffect(() => {
        if (!isClient) return;
        const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') syncToCloud(); };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isClient]);

    const calculatedTarget = useMemo(() => {
        let bmr = profile.gender === "male" 
            ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        return Math.round(bmr * profile.activity) + profile.goal;
    }, [profile]);

    const target = profile.isManualTarget ? profile.manualTargetKcal : calculatedTarget;
    const dailyLog = history[currentDate] || [];
    
    const dailyKcal = Math.round(dailyLog.reduce((s, i) => s + (i.kcal || 0), 0) * 10) / 10;
    const dailyProtein = Math.round(dailyLog.reduce((s, i) => s + (i.protein || 0), 0) * 10) / 10;
    const dailyCarb = Math.round(dailyLog.reduce((s, i) => s + (i.carb || 0), 0) * 10) / 10;
    const dailyFat = Math.round(dailyLog.reduce((s, i) => s + (i.fat || 0), 0) * 10) / 10;
    
    const targetProtein = profile.isManualMacro ? (parseFloat(profile.manualProtein) || 0) : Math.round((target * 0.25 / 4) * 10) / 10;
    const targetCarb = profile.isManualMacro ? (parseFloat(profile.manualCarb) || 0) : Math.round((target * 0.50 / 4) * 10) / 10;
    const targetFat = profile.isManualMacro ? (parseFloat(profile.manualFat) || 0) : Math.round((target * 0.25 / 9) * 10) / 10;

    const mealBreakdown = useMemo(() => {
        return [ 
            { name: "Bữa sáng", icon: "☀️", color: "bg-orange-400" }, { name: "Bữa trưa", icon: "🌤️", color: "bg-emerald-500" }, 
            { name: "Bữa tối", icon: "🌙", color: "bg-blue-500" }, { name: "Ăn vặt", icon: "⭐", color: "bg-purple-400" } 
        ].map(meal => {
            const mealTotal = dailyLog.filter(item => item.meal === meal.name).reduce((sum, item) => sum + (item.kcal || 0), 0);
            return { ...meal, kcal: Math.round(mealTotal * 10) / 10 };
        });
    }, [dailyLog]);

    const maxMealKcal = Math.max(...mealBreakdown.map(m => m.kcal), 1);
    const isDailyLogEmpty = mealBreakdown.every(m => m.kcal === 0);

    const allFoods = useMemo(() => {
        const common = COMMON_FOODS.filter(f => !deletedCommonFoods.includes(f.name));
        return [...customFoodList, ...common];
    }, [customFoodList, deletedCommonFoods]);
    
    const filteredFoods = useMemo(() => {
        let results = allFoods;
        if (searchQuery.trim()) {
            const query = removeAccents(searchQuery.toLowerCase().trim());
            results = allFoods.filter(f => removeAccents(f.name.toLowerCase()).includes(query));
        }
        return results.slice(0, 50);
    }, [searchQuery, allFoods]);

    const handleAddSelectedFood = () => {
        if (!selectedFood) return;
        const quantity = parseFloat(qty) || 0;
        const newItem = { 
            name: selectedFood.name, quantity: quantity, unit: selectedFood.unit,
            kcal: calcMacro(selectedFood.kcal, selectedFood.per, quantity), protein: calcMacro(selectedFood.protein, selectedFood.per, quantity),
            carb: calcMacro(selectedFood.carb, selectedFood.per, quantity), fat: calcMacro(selectedFood.fat, selectedFood.per, quantity),
            meal: selectedMeal, id: Date.now(), timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })
        };
        setHistory(prev => ({ ...prev, [currentDate]: [...(prev[currentDate] || []), newItem] }));
        setSelectedFood(null); setSearchQuery(""); setQty(1);
    };

    const addCustom = () => {
        if (!customFood.name || !customFood.kcal) return;
        const foodName = customFood.name.trim();
        if (allFoods.some(f => f.name.toLowerCase().trim() === foodName.toLowerCase())) { 
            setConfirmModal({ isOpen: true, foodToDelete: null, alertMessage: "Món ăn này đã có sẵn!" }); return; 
        }
        const q = parseFloat(customFood.quantity) || 1; const u = (customFood.unit || "g").toLowerCase();
        const k = parseFloat(customFood.kcal) || 0; const p = parseFloat(customFood.protein) || 0;
        const c = parseFloat(customFood.carb) || 0; const f = parseFloat(customFood.fat) || 0;

        const newItem = {
            name: foodName, quantity: q, unit: u, kcal: Math.round(k * 10) / 10,
            protein: Math.round(p * 10) / 10, carb: Math.round(c * 10) / 10, fat: Math.round(f * 10) / 10,
            meal: selectedMeal, id: Date.now(), timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })
        };
        setHistory(prev => ({ ...prev, [currentDate]: [...(prev[currentDate] || []), newItem] }));

        let weightInGrams = q; let baseUnit = 'g';
        if (['kg'].includes(u)) { weightInGrams = q * 1000; } else if (['l', 'lít'].includes(u)) { weightInGrams = q * 1000; baseUnit = 'ml'; }
        else if (['ml'].includes(u)) { weightInGrams = q; baseUnit = 'ml'; } else if (['g', 'gram'].includes(u)) { weightInGrams = q; }
        else { const mockWeights = { 'tô': 400, 'bát': 400, 'ly': 250, 'quả': 100 }; weightInGrams = q * (mockWeights[u] || 100); }

        const factor100g = weightInGrams > 0 ? (100 / weightInGrams) : 1;
        setCustomFoodList(prev => [{ 
            name: foodName, unit: baseUnit, per: 100, kcal: Math.round(k * factor100g), 
            protein: Math.round((p * factor100g) * 10) / 10, carb: Math.round((c * factor100g) * 10) / 10, fat: Math.round((f * factor100g) * 10) / 10 
        }, ...prev]);
        setCustomFood({ name: "", quantity: 1, unit: "g", kcal: "", protein: "", carb: "", fat: "" });
        setTab("quick");
    };

    const removeFood = async (id) => {
        const itemToDelete = (history[currentDate] || []).find(i => i.id === id);
        setHistory(prev => ({ ...prev, [currentDate]: (prev[currentDate] || []).filter(i => i.id !== id) }));
        if (itemToDelete && itemToDelete.timestamp && userId && password) {
            try {
                await fetch("/api/sync", {
                    method: "DELETE", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, password, timestamp: itemToDelete.timestamp }),
                });
            } catch (err) { console.error("Lỗi xóa:", err); }
        }
    };

    const handleConfirmDelete = () => {
        if (!confirmModal.foodToDelete) return;
        const foodName = confirmModal.foodToDelete.name;
        setCustomFoodList(prev => prev.filter(f => f.name !== foodName));
        if (COMMON_FOODS.some(f => f.name === foodName)) setDeletedCommonFoods(prev => [...prev, foodName]);
        setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" }); setSelectedFood(null); 
    };

    const applyDietMode = (mode) => {
        if (mode.id === 'custom') setProfile({...profile, macroDietMode: "Tự nhập tay (Custom)"});
        else setProfile({
            ...profile, macroDietMode: mode.name, manualProtein: Math.round((target * mode.pro) / 4), 
            manualCarb: Math.round((target * mode.carb) / 4), manualFat: Math.round((target * mode.fat) / 9)
        });
        setIsDietModalOpen(false);
    };

    if (!isClient) return null;

    if (!userId || !password) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden font-sans">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-700 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
                <div className="bg-white/10 p-8 rounded-[2.5rem] w-full backdrop-blur-xl border border-white/20 text-center shadow-2xl relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter italic mb-8">STAYFIT</h1>
                    <div className="space-y-3 mb-6">
                        <input type="text" value={inputUser} onChange={e=>setInputUser(e.target.value)} placeholder="Tên ID (vd: quy2026)" className="w-full bg-white/20 text-white placeholder:text-white/60 p-4 rounded-2xl outline-none font-bold text-center focus:ring-2 focus:ring-white transition-all" />
                        <input type="password" value={inputPass} onChange={e=>setInputPass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-white/20 text-white placeholder:text-white/60 p-4 rounded-2xl outline-none font-bold text-center focus:ring-2 focus:ring-white transition-all" onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
                    </div>
                    <button onClick={handleLogin} disabled={loginLoading} className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black uppercase tracking-widest hover:scale-95 transition-all shadow-xl disabled:opacity-50">{loginLoading ? "Đang kết nối..." : "Đăng Nhập"}</button>
                    <p className="text-[9px] text-white/50 font-bold mt-4 px-4 leading-relaxed">Nếu chưa có tài khoản, hãy nhập ID & Mật khẩu mới để tự động đăng ký.</p>
                </div>
            </div>
        );
    }

    if (view === "stats") {
        return <StatsView history={history} profile={profile} setProfile={setProfile} target={target} setView={setView} view={view} setCurrentDate={setCurrentDate} />;
    }
    
    if (view === "profile") {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-white p-8 flex flex-col justify-center space-y-6 animate-in fade-in duration-500 pb-28 relative font-sans text-slate-800">
                <div className="text-center mb-4"><h1 className="text-4xl font-black text-emerald-600 tracking-tighter italic">STAYFIT</h1><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Hồ sơ cá nhân</p></div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button onClick={() => setProfile({...profile, gender: 'male'})} className={`flex-1 py-3 rounded-xl font-bold transition-all ${profile.gender==='male' ? 'bg-white text-emerald-600 shadow-sm':'text-slate-400'}`}>Nam</button>
                    <button onClick={() => setProfile({...profile, gender: 'female'})} className={`flex-1 py-3 rounded-xl font-bold transition-all ${profile.gender==='female' ? 'bg-white text-emerald-600 shadow-sm':'text-slate-400'}`}>Nữ</button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative"><label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Tuổi</label><div className="relative group"><input type="number" value={profile.age} onChange={e=>setProfile({...profile, age:+e.target.value})} className="w-full bg-slate-50 p-4 pr-12 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 italic">tuổi</span></div></div>
                        <div className="relative"><label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Cân nặng</label><div className="relative group"><input type="number" value={profile.weight} onChange={e=>setProfile({...profile, weight:+e.target.value})} className="w-full bg-slate-50 p-4 pr-10 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 italic">kg</span></div></div>
                    </div>
                    <div className="relative"><label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Chiều cao</label><div className="relative group"><input type="number" value={profile.height} onChange={e=>setProfile({...profile, height:+e.target.value})} className="w-full bg-slate-50 p-4 pr-10 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 italic">cm</span></div></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Mức độ vận động</label><select value={profile.activity} onChange={e=>{ setProfile({...profile, activity:+e.target.value, isManualTarget: false}); }} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none cursor-pointer appearance-none">{ACTIVITY_LEVELS.map(l => ( <option key={l.value} value={l.value}>{l.label}</option> ))}</select></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Mục tiêu cân nặng</label><select value={profile.goal} onChange={e=>{ setProfile({...profile, goal:+e.target.value, isManualTarget: false}); }} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none cursor-pointer appearance-none">{GOALS.map(l => ( <option key={l.value} value={l.value}>{l.label}</option> ))}</select></div>
                </div>
                <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-xl flex flex-col items-center">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ngân sách Calo/Ngày</span>
                    <div className="flex justify-center items-end mt-1"><input type="number" value={target} onChange={e => { setProfile({ ...profile, isManualTarget: true, manualTargetKcal: parseInt(e.target.value) || 0 }); }} className="text-4xl font-black text-emerald-400 tracking-tighter bg-transparent text-center outline-none w-32 border-b-2 border-dashed border-slate-700 hover:border-emerald-400 focus:border-emerald-400 transition-colors" /><span className="text-lg font-normal text-slate-500 italic mb-1 ml-1">kcal</span></div>
                    {profile.isManualTarget && <button onClick={() => setProfile({...profile, isManualTarget: false})} className="text-[9px] text-emerald-500/80 mt-3 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">⟲ Trở về Mức Tính Tự Động ({calculatedTarget})</button>}
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-2">
                    <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tùy chỉnh Macro</span><button onClick={() => { const nextState = !profile.isManualMacro; setProfile({...profile, isManualMacro: nextState}); if (nextState) setIsDietModalOpen(true); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${profile.isManualMacro ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${profile.isManualMacro ? 'translate-x-5' : 'translate-x-1'}`} /></button></div>
                    {profile.isManualMacro ? (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-3 bg-slate-50 p-2 rounded-xl"><span className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">{profile.macroDietMode || "Tự nhập tay (Custom)"}</span><button onClick={() => setIsDietModalOpen(true)} className="text-[9px] font-black bg-white px-3 py-1.5 rounded-lg text-emerald-600 shadow-sm border border-slate-100 hover:bg-emerald-50 transition-colors uppercase active:scale-95">Đổi chế độ</button></div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center relative"><label className="text-[9px] font-black text-emerald-500 uppercase block mb-1">Protein</label><input type="number" value={profile.manualProtein} onChange={e => setProfile({...profile, manualProtein: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-slate-50 py-3 rounded-xl text-center font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" /><span className="text-[9px] text-slate-400 italic absolute bottom-3 right-3 pointer-events-none">g</span></div>
                                <div className="text-center relative"><label className="text-[9px] font-black text-blue-500 uppercase block mb-1">Carb</label><input type="number" value={profile.manualCarb} onChange={e => setProfile({...profile, manualCarb: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-slate-50 py-3 rounded-xl text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" /><span className="text-[9px] text-slate-400 italic absolute bottom-3 right-3 pointer-events-none">g</span></div>
                                <div className="text-center relative"><label className="text-[9px] font-black text-yellow-500 uppercase block mb-1">Fat</label><input type="number" value={profile.manualFat} onChange={e => setProfile({...profile, manualFat: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-slate-50 py-3 rounded-xl text-center font-bold text-sm outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all" /><span className="text-[9px] text-slate-400 italic absolute bottom-3 right-3 pointer-events-none">g</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-center opacity-50">
                            <div><p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Protein</p><p className="text-xs font-bold">{Math.round((target * 0.25 / 4) * 10) / 10}g</p></div>
                            <div><p className="text-[9px] font-black text-blue-500 uppercase mb-1">Carb</p><p className="text-xs font-bold">{Math.round((target * 0.50 / 4) * 10) / 10}g</p></div>
                            <div><p className="text-[9px] font-black text-yellow-500 uppercase mb-1">Fat</p><p className="text-xs font-bold">{Math.round((target * 0.25 / 9) * 10) / 10}g</p></div>
                        </div>
                    )}
                </div>
                <div className="space-y-3 mt-2">
                    <button onClick={() => setView("journal")} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase shadow-lg shadow-emerald-200 active:scale-95 transition-all">Bắt đầu ngay</button>
                    <button onClick={() => { setUserId(""); setPassword(""); localStorage.removeItem('stayfit_userid'); localStorage.removeItem('stayfit_password'); }} className="w-full py-4 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all">Đăng xuất</button>
                </div>
                <BottomNav view={view} setView={setView} />
                {isDietModalOpen && (
                    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden max-w-md mx-auto animate-in slide-in-from-bottom-full duration-300">
                        <div className="sticky top-0 z-20 bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm"><h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Chọn chế độ ăn</h3><button onClick={() => setIsDietModalOpen(false)} className="w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><span className="font-black text-xs">X</span></button></div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-10">
                            {DIET_MODES.map((cat, idx) => (
                                <div key={idx}><h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 ml-2">{cat.category}</h4>
                                    <div className="space-y-2">
                                        {cat.items.map(mode => (
                                            <button key={mode.id} onClick={() => applyDietMode(mode)} className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-95 ${profile.macroDietMode === mode.name ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50 shadow-sm'}`}>
                                                <div className="flex justify-between items-center mb-1"><span className="text-sm font-black text-slate-800">{mode.name}</span><span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{mode.label}</span></div>
                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{mode.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === "journal") {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-28 animate-in fade-in duration-300 relative font-sans text-slate-800">
             <header className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        {/* Nút lùi ngày: Không viền, mờ 50%, phát sáng mờ khi hover/chạm */}
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()-1); setCurrentDate(formatDate(d)); }} className="p-2 text-slate-300 opacity-50 hover:opacity-100 hover:text-emerald-500 hover:bg-emerald-50 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-full transition-all duration-300 active:scale-95">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 19l-7-7 7-7v14z"/></svg>
                        </button>
                        
                        <div className="text-center min-w-[90px]">
                            <span className="font-black text-slate-800 uppercase text-[11px] tracking-widest">{currentDate === formatDate(new Date()) ? "Hôm nay" : currentDate}</span>
                        </div>
                        
                        {/* Nút tiến ngày: Không viền, mờ 50%, phát sáng mờ khi hover/chạm */}
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()+1); setCurrentDate(formatDate(d)); }} className="p-2 text-slate-300 opacity-50 hover:opacity-100 hover:text-emerald-500 hover:bg-emerald-50 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-full transition-all duration-300 active:scale-95">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5l7 7-7 7V5z"/></svg>
                        </button>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shadow-sm">SF</div>
                </header>
                <main className="p-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="transform -rotate-90 w-24 h-24">
                                    <circle cx="48" cy="48" r="40" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                                    <circle cx="48" cy="48" r="40" stroke={dailyKcal > target ? "#EF4444" : "#10B981"} strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(dailyKcal/target, 1.2))} strokeLinecap="round" className="transition-all duration-1000" />
                                </svg>
                                <span className="absolute font-black text-xl text-slate-800">{Math.round((dailyKcal/target)*100) || 0}%</span>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Mục tiêu: {target}</p>
                                <h3 className="text-4xl font-black text-slate-800 leading-none">{dailyKcal}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Calo đã nạp</p>
                            </div>
                        </div>
                        <div className="border-t border-slate-50 pt-5 space-y-3">
                            <MacroProgressBar label="Protein" current={dailyProtein} target={targetProtein} colorClass="bg-emerald-500" />
                            <MacroProgressBar label="Carb" current={dailyCarb} target={targetCarb} colorClass="bg-blue-500" />
                            <MacroProgressBar label="Fat" current={dailyFat} target={targetFat} colorClass="bg-yellow-400" />
                        </div>
                        <div className="border-t border-slate-50 pt-5 mt-1">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Theo bữa ăn</h3>
                            {isDailyLogEmpty ? ( <p className="text-center text-[11px] italic text-slate-300 py-2">Chưa có dữ liệu hôm nay</p> ) : (
                                <div className="space-y-3">
                                    {mealBreakdown.map(meal => (
                                        <div key={meal.name} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 w-24"><span className="w-5 h-5 flex items-center justify-center text-sm">{meal.icon}</span><span className="font-bold text-xs text-slate-700 uppercase">{meal.name}</span></div>
                                            <div className="flex-1 bg-slate-100 rounded-full h-[3px]"><div className={`h-full rounded-full transition-all duration-500 ${meal.color}`} style={{ width: `${meal.kcal > 0 ? (meal.kcal / maxMealKcal) * 100 : 0}%` }}></div></div>
                                            <div className="text-right min-w-[56px]">{meal.kcal > 0 ? ( <span className="font-black text-sm text-slate-800">{meal.kcal} <span className="text-[8px] text-slate-400 font-bold ml-0.5">KCAL</span></span> ) : ( <span className="font-black text-sm text-slate-300">—</span> )}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2"><IconPlus /> Thêm món</h4>
                            <div className="relative">
                                <select value={selectedMeal} onChange={e=>setSelectedMeal(e.target.value)} className="bg-slate-50 hover:bg-emerald-50 text-[10px] font-black text-slate-600 py-2 pl-4 pr-8 rounded-full outline-none uppercase tracking-widest cursor-pointer border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:text-emerald-700 transition-all shadow-sm appearance-none select-none">
                                    {MEAL_TYPES.map(m => ( <option key={m} value={m} className="font-bold text-slate-700">{m}</option> ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg></div>
                            </div>
                        </div>
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                            <button onClick={() => setTab("quick")} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${tab === "quick" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}>Chọn nhanh</button>
                            <button onClick={() => setTab("custom")} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${tab === "custom" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}>Nhập tay</button>
                        </div>
                        {tab === "quick" ? (
                            <div>
                                <div className="relative mb-4"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><IconSearch /></div><input type="text" placeholder="Tìm món ăn..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar pb-2">
                                    {filteredFoods.map((f, idx) => (
                                        <div key={f.name + idx} className="relative group flex">
                                            <button onClick={() => { setSelectedFood(f); setQty(f.per); }} className={`w-full p-4 pr-8 rounded-2xl text-left transition-all border ${selectedFood?.name === f.name ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-transparent"} active:scale-95`}>
                                                <p className="text-[9px] font-black text-slate-500 uppercase leading-tight truncate mb-1">{f.name}</p><p className="text-sm font-black text-slate-800">{f.kcal} <span className="text-[8px] font-normal italic opacity-40">kcal/{f.per}{f.unit}</span></p>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, foodToDelete: f, alertMessage: "" }); }} className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"><IconTrash /></button>
                                        </div>
                                    ))}
                                    {filteredFoods.length === 0 && ( <p className="col-span-2 text-center py-6 text-slate-400 text-xs italic">Không tìm thấy món ăn</p> )}
                                </div>
                                {selectedFood && (() => {
                                    let weightInGrams = qty; const u = selectedFood.unit.toLowerCase();
                                    if (['kg', 'l', 'lít'].includes(u)) { weightInGrams = qty * 1000; } else if (['ml', 'g', 'gram'].includes(u)) { weightInGrams = qty; } else { const mockWeights = { 'tô': 400, 'ly': 250, 'quả': 100 }; weightInGrams = qty * (mockWeights[u] || 100); }
                                    const totalKcal = calcMacro(selectedFood.kcal, selectedFood.per, qty); const totalPro = calcMacro(selectedFood.protein, selectedFood.per, qty); const totalCarb = calcMacro(selectedFood.carb, selectedFood.per, qty); const totalFat = calcMacro(selectedFood.fat, selectedFood.per, qty);
                                    return (
                                    <div className="mt-4 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2">
                                        <div className="bg-slate-900 rounded-2xl p-4 mb-4 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><IconJournal /></div>
                                            <div className="relative z-10 flex justify-between items-start mb-3"><div><h5 className="font-black text-lg text-emerald-400 leading-tight">{selectedFood.name}</h5><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{qty} {selectedFood.unit} (~{Math.round(weightInGrams)}g)</p></div><div className="text-right"><span className="text-2xl font-black text-white">{totalKcal}</span><span className="text-[9px] text-slate-400 font-bold ml-1">KCAL</span></div></div>
                                            <div className="flex justify-between items-center bg-white/10 rounded-xl p-2 mb-3"><div className="text-center w-1/3 border-r border-white/10"><p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Protein</p><p className="text-xs font-black text-emerald-400">{totalPro}g</p></div><div className="text-center w-1/3 border-r border-white/10"><p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Carb</p><p className="text-xs font-black text-blue-400">{totalCarb}g</p></div><div className="text-center w-1/3"><p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Fat</p><p className="text-xs font-black text-yellow-400">{totalFat}g</p></div></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 relative"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Số lượng</label><input type="number" value={qty} step="any" min="0.1" onChange={e => setQty(parseFloat(e.target.value) || 0)} className="w-full bg-slate-100 text-slate-800 p-3 rounded-xl text-sm outline-none font-black text-center focus:ring-2 focus:ring-emerald-500/20 transition-all" /></div>
                                            <button onClick={() => handleAddSelectedFood()} className="flex-1 mt-4 h-12 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-xl shadow-emerald-100 flex items-center justify-center gap-1 active:scale-95 transition-all">Ghi vào nhật ký <IconPlus /></button>
                                            <button onClick={() => { setSelectedFood(null); setQty(1); }} className="mt-4 p-3 text-slate-300 hover:text-red-500 bg-slate-50 rounded-xl transition-colors"><IconTrash /></button>
                                        </div>
                                    </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input placeholder="Tên món ăn (vd: Gà rán...)" value={customFood.name} onChange={e => setCustomFood(p=>({...p, name:e.target.value}))} className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Số lượng nhập" value={customFood.quantity} onChange={e => setCustomFood(p=>({...p, quantity:e.target.value}))} className="bg-slate-50 p-4 rounded-2xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                    <select value={customFood.unit} onChange={e => setCustomFood(p=>({...p, unit:e.target.value}))} className="bg-slate-50 p-4 rounded-2xl text-sm outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                        <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="ly">ly</option><option value="tô">tô</option><option value="quả">quả</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative group"><input type="number" placeholder="Kcal" value={customFood.kcal} onChange={e => setCustomFood(p=>({...p, kcal:e.target.value}))} className="w-full bg-slate-50 p-4 pr-10 rounded-2xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange-500/20" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-orange-400 uppercase">kcal</span></div>
                                    <div className="relative group"><input type="number" placeholder="Protein" value={customFood.protein} onChange={e => setCustomFood(p=>({...p, protein:e.target.value}))} className="w-full bg-slate-50 p-4 pr-10 rounded-2xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-400 uppercase">Pro</span></div>
                                    <div className="relative group"><input type="number" placeholder="Carb" value={customFood.carb} onChange={e => setCustomFood(p=>({...p, carb:e.target.value}))} className="w-full bg-slate-50 p-4 pr-10 rounded-2xl text-sm outline-none font-bold focus:ring-2 focus:ring-blue-500/20" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-400 uppercase">Carb</span></div>
                                    <div className="relative group"><input type="number" placeholder="Fat" value={customFood.fat} onChange={e => setCustomFood(p=>({...p, fat:e.target.value}))} className="w-full bg-slate-50 p-4 pr-10 rounded-2xl text-sm outline-none font-bold focus:ring-2 focus:ring-yellow-500/20" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-yellow-400 uppercase">Fat</span></div>
                                </div>
                                {customFood.name.trim() !== "" && parseFloat(customFood.kcal) > 0 && (
                                    <button onClick={addCustom} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4 active:scale-95 transition-all shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300">Xác nhận thêm</button>
                                )}
                            </div>
                        )}
                    </section>
                    <div className="space-y-3 pb-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Danh sách nạp vào</h3>
                        {dailyLog.map(item => (
                            <div key={item.id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-50 border-l-4 border-l-emerald-400 animate-in slide-in-from-left duration-300 group">
                                <div className="flex-1 pr-3">
                                    <div className="relative inline-flex items-center bg-slate-100 hover:bg-emerald-50 rounded-md transition-colors mb-1.5 border border-transparent hover:border-emerald-200 cursor-pointer">
                                        <select value={item.meal || "Bữa sáng"} onChange={(e) => updateItemMeal(item.id, e.target.value)} className="text-[9px] font-black text-slate-600 hover:text-emerald-700 uppercase tracking-widest bg-transparent outline-none cursor-pointer appearance-none py-1 pl-2 pr-5 w-full h-full focus:outline-none focus:text-emerald-700 focus:bg-emerald-100 rounded-md transition-all select-none">
                                            {MEAL_TYPES.map(m => ( <option key={m} value={m} className="font-bold text-slate-700">{m}</option> ))}
                                        </select>
                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-slate-400"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg></div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 uppercase truncate mb-1.5">{item.name} &mdash; {item.quantity}{item.unit}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 flex-wrap"><span className="text-orange-500 font-black">{item.kcal} kcal</span><span className="text-slate-200">|</span> P: {item.protein}g <span className="text-slate-200">|</span> C: {item.carb}g <span className="text-slate-200">|</span> F: {item.fat}g</p>
                                </div>
                                <div className="flex items-center"><button onClick={() => removeFood(item.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2 bg-slate-50 rounded-xl group-hover:bg-red-50"><IconTrash /></button></div>
                            </div>
                        ))}
                        {dailyLog.length === 0 && ( <p className="text-center text-slate-300 text-[10px] uppercase font-bold italic py-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] tracking-[0.2em]">Danh sách trống</p> )}
                    </div>
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
                                {confirmModal.alertMessage ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-4"><span className="font-black text-xl">!</span></div>
                                        <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-widest">Thông báo</h3>
                                        <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">{confirmModal.alertMessage}</p>
                                        <button onClick={() => setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" })} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Đã hiểu</button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4"><IconTrash /></div>
                                        <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-widest">Xác nhận xóa</h3>
                                        <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">Bạn có chắc muốn xóa <span className="font-black text-slate-700">"{confirmModal.foodToDelete?.name}"</span>?</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" })} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Hủy</button>
                                            <button onClick={handleConfirmDelete} className="flex-1 py-3.5 bg-red-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all">Xóa Món</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
                <BottomNav view={view} setView={setView} />
            </div>
        );
    }
    return null;
}