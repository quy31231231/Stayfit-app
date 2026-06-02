"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { COMMON_FOODS } from './_data/common-foods';

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';

import DashboardCard from './dashboard/_components/DashboardCard';
import CalorieCircle from './dashboard/_components/CalorieCircle';
import MacroBar from './dashboard/_components/MacroBar';
import FoodLogSection from './dashboard/_components/FoodLogSection';
import GreetingHeader from './dashboard/_components/GreetingHeader';
import BreathingTimer from './dashboard/_components/BreathingTimer';
import { getSupabaseBrowser, isSupabaseConfigured } from '../lib/supabase/client';
import { loadUserData, saveSnapshot, upsertWeight as sbUpsertWeight, deleteWeight as sbDeleteWeight, addScanFeedback } from '../lib/supabase/data';
import { uploadImage, signGets } from '../lib/r2/upload';

// Lazy: thư viện quét mã (zxing) chỉ tải khi mở scanner, không phình bundle ban đầu.
const BarcodeScanner = dynamic(() => import('./dashboard/_components/BarcodeScanner'), { ssr: false });
const AvatarCropper = dynamic(() => import('./_components/AvatarCropper'), { ssr: false });
const OnboardingWizard = dynamic(() => import('./_components/OnboardingWizard'), { ssr: false });

// Khởi tạo Plugin DataLabels
Chart.register(ChartDataLabels);

// --- ICONS (SVG) ---
const IconUser = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const IconJournal = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>);
const IconTrash = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IconStats = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>);
const IconUndo = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>);
const ACTIVITY_LEVELS = [
    { label: "Ít vận động", value: 1.2 }, { label: "Nhẹ (1-3 buổi/tuần)", value: 1.375 }, 
    { label: "Vừa (3-5 buổi/tuần)", value: 1.55 }, { label: "Nhiều (6-7 buổi/tuần)", value: 1.725 }
];
const GOALS = [
    { label: "Giảm cân nhanh", value: -500 }, { label: "Giảm cân nhẹ", value: -250 }, 
    { label: "Duy trì", value: 0 }, { label: "Tăng cân", value: 300 }
];
const MEAL_TYPES = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
const getMealByHour = () => {
    const h = new Date().getHours();
    if (h >= 4 && h < 10) return "Bữa sáng";
    if (h >= 10 && h < 14) return "Bữa trưa";
    if (h >= 14 && h < 17) return "Ăn vặt";
    if (h >= 17 && h < 21) return "Bữa tối";
    return "Ăn vặt";
};
// Check user has explicitly mention meal type in their description.
// Strip diacritics for robust match.
const mentionsMealInText = (text) => {
    if (!text) return false;
    const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return /\b(bua\s*sang|bua\s*trua|bua\s*toi|an\s*vat|an\s*nhe|sang\s*nay|trua\s*nay|toi\s*nay|sang\s*som|toi\s*muon)\b/.test(t);
};
const TEXT_SUGGESTIONS = [
    "Bữa sáng tôi ăn 2 quả trứng luộc với 1 bát salad rau trộn",
    "Bữa tối tôi ăn 150g bò bít tết nướng với rau củ hấp",
    "Tôi ăn nhẹ với 200g sữa chua Hy Lạp không đường và các loại hạt",
];
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
    const vietnamDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return `${vietnamDate.getFullYear()}-${String(vietnamDate.getMonth() + 1).padStart(2, '0')}-${String(vietnamDate.getDate()).padStart(2, '0')}`;
};
const calcMacro = (val, per, q) => Math.round((val / per) * q * 10) / 10;

// Chuẩn hóa số điện thoại → userId (chỉ chữ số, +84/84 → 0...).
const normPhone = (p) => {
    let d = (p || "").replace(/\D/g, "");
    if (d.startsWith("84")) d = "0" + d.slice(2);
    return d;
};

// Kiểm tra check digit GTIN (EAN-13/EAN-8/UPC-A/GTIN-14) — thuần tính, offline.
const isValidGtin = (code) => {
    const s = String(code || "").trim();
    if (!/^\d{8}$|^\d{12,14}$/.test(s)) return false;
    const digits = s.split("").map(Number);
    const check = digits.pop();
    let sum = 0;
    // Trọng số 3/1 xen kẽ, tính từ phải qua trái (ngay trước check digit).
    for (let i = digits.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) sum += digits[i] * w;
    return (10 - (sum % 10)) % 10 === check;
};

// Bảng prefix GS1 (3 số đầu EAN-13) → quốc gia đăng ký mã. Tập phổ biến + VN.
const GS1_PREFIXES = [
    [[0, 19], "Mỹ / Canada"], [[30, 39], "Mỹ"], [[60, 139], "Mỹ / Canada"],
    [[300, 379], "Pháp"], [[380, 380], "Bulgaria"], [[400, 440], "Đức"],
    [[450, 459], "Nhật Bản"], [[460, 469], "Nga"], [[471, 471], "Đài Loan"],
    [[480, 480], "Philippines"], [[489, 489], "Hong Kong"], [[490, 499], "Nhật Bản"],
    [[500, 509], "Anh"], [[690, 699], "Trung Quốc"], [[729, 729], "Israel"],
    [[760, 769], "Thụy Sĩ"], [[800, 839], "Ý"], [[840, 849], "Tây Ban Nha"],
    [[871, 871], "Hà Lan"], [[880, 880], "Hàn Quốc"], [[885, 885], "Thái Lan"],
    [[888, 888], "Singapore"], [[890, 890], "Ấn Độ"], [[893, 893], "Việt Nam"],
    [[899, 899], "Indonesia"], [[930, 939], "Úc"], [[955, 955], "Malaysia"],
];
const gs1Country = (code) => {
    const s = String(code || "").trim();
    if (!/^\d{12,14}$/.test(s)) return null; // chỉ EAN-13/UPC mới có prefix vùng
    const ean13 = s.length === 12 ? "0" + s : s.slice(-13); // UPC-A → thêm 0 đầu
    const p = parseInt(ean13.slice(0, 3), 10);
    for (const [[lo, hi], name] of GS1_PREFIXES) if (p >= lo && p <= hi) return name;
    return "Không rõ";
};

const generateUniqueTimestamp = () => {
  const now = new Date();
  const svSE = now.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  const rand = Math.random().toString(36).slice(2, 7);
  return `${svSE}.${ms}-${rand}`;
};
const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const normalizeFoodLookup = (value) => removeAccents(String(value || "").toLowerCase()).replace(/\s+/g, " ").trim();
const normalizeFoodGroupKey = (value) => normalizeFoodLookup(value)
    .replace(/\bphan\s+nac\b/g, "nac")
    .replace(/[()]/g, " ")
    .replace(/[\/,;:.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
// Gợi ý định lượng từ lịch sử: trả về quantity hay dùng nhất cho món `foodName` (cùng `unit`).
// Hòa số lần → lấy lần ghi gần đây nhất. Không có dữ liệu → null.
const suggestQty = (history, foodName, unit) => {
    const targetName = normalizeFoodLookup(foodName);
    const targetUnit = (unit || "g").toLowerCase();
    if (!targetName) return null;
    const stats = new Map(); // quantity -> { count, recency }
    let order = 0;
    for (const date of Object.keys(history || {}).sort()) {
        for (const item of history[date] || []) {
            if (normalizeFoodLookup(item.name) !== targetName) continue;
            if ((item.unit || "g").toLowerCase() !== targetUnit) continue;
            const q = Number(item.quantity);
            if (!(q > 0)) continue;
            const prev = stats.get(q);
            if (prev) { prev.count++; prev.recency = order; }
            else stats.set(q, { count: 1, recency: order });
            order++;
        }
    }
    let best = null, bestStat = null;
    for (const [q, s] of stats) {
        if (!bestStat || s.count > bestStat.count || (s.count === bestStat.count && s.recency > bestStat.recency)) {
            best = q; bestStat = s;
        }
    }
    return best;
};
const UNIT_GRAM_WEIGHTS = { 'tô': 400, 'bát': 200, 'ly': 250, 'quả': 100, 'cái': 100, 'chiếc': 100, 'chén': 70, 'đĩa': 350, 'cuốn': 80, 'ổ': 80, 'suất': 350, 'gói': 75, 'miếng': 80, 'phần': 300 };
// Quy đổi số lượng + đơn vị sang gram (ml tính tương đương gram). Đơn vị đếm dùng bảng ước lượng.
const unitToGrams = (qty, unit) => {
    const u = (unit || "g").toLowerCase();
    if (['kg', 'l', 'lít'].includes(u)) return qty * 1000;
    if (['ml', 'g', 'gram'].includes(u)) return qty;
    return qty * (UNIT_GRAM_WEIGHTS[u] || 100);
};

// --- COMPONENTS ---
function MacroProgressBar({ label, current, target, colorClass }) {
    const pct = Math.min((current / target) * 100, 100) || 0;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                <span className="text-ink-muted">{label}</span>
                <span className="text-ink">{current}g <span className="opacity-40">/ {target}g</span></span>
            </div>
            <div className="w-full bg-cream-deep rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${colorClass} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}

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
        if (!inputVal || inputVal <= 0) return alert("Vui lòng nhập số kg hợp lệ!");
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

            // Gradient dọc kính-mờ kiểu Apple Health: đỉnh sáng → đáy đậm.
            const barGrad = ([top, bottom]) => {
                const g = ctx.createLinearGradient(0, 0, 0, 190);
                g.addColorStop(0, top); g.addColorStop(1, bottom);
                return g;
            };
            // Bảng màu năng động (Nike): rực hơn trên near-black, ấm-tươi trên cream.
            const meal = isDark
                ? { sang: ['#F0D98C', '#D9B25A'], trua: ['#5CE38A', '#22C55E'], toi: ['#CDB8EC', '#A988D8'], vat: ['#FFB089', '#FF7A4D'] }
                : { sang: ['#F2CE84', '#E0AE4E'], trua: ['#86C497', '#5C9E73'], toi: ['#C0AAE0', '#9D86C0'], vat: ['#F2A883', '#E07A50'] };
            
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

            kcalChartInstance.current = new Chart(ctx, { 
                type: 'bar', 
                data: { 
                    labels: labels, 
                    datasets: [
                        // Đặt stack riêng rẽ cho các đường line để chúng không bị cộng dồn
                        { type: 'line', label: 'Tổng', data: dataTotal, stack: 'lineTotal', borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, datalabels: { align: 'end', anchor: 'end', color: inkColor, font: { weight: '800', size: 11 }, padding: { bottom: 2 }, formatter: (val) => val > 0 ? val.toLocaleString('vi-VN') : '' } },
                        { type: 'line', label: 'Mục tiêu', data: targetLine, stack: 'lineTarget', borderColor: isDark ? 'rgba(137,243,54,0.45)' : '#C7BCA8', borderWidth: 1.5, borderDash: [3, 5], borderCapStyle: 'round', pointRadius: 0, fill: false, tension: 0, datalabels: { display: false } },

                        // 4 bữa — tile bo góc nổi, gradient kính-mờ, khe ngăn mảnh theo nền (Apple Activity)
                        { type: 'bar', label: 'Bữa sáng', data: dataBreakfast, stack: 'bars', backgroundColor: barGrad(meal.sang), borderColor: sepColor, borderWidth: 1.5, borderRadius: 5, borderSkipped: false, datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa trưa', data: dataLunch, stack: 'bars', backgroundColor: barGrad(meal.trua), borderColor: sepColor, borderWidth: 1.5, borderRadius: 5, borderSkipped: false, datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa tối', data: dataDinner, stack: 'bars', backgroundColor: barGrad(meal.toi), borderColor: sepColor, borderWidth: 1.5, borderRadius: 5, borderSkipped: false, datalabels: { display: false } },
                        { type: 'bar', label: 'Ăn vặt', data: dataSnack, stack: 'bars', backgroundColor: barGrad(meal.vat), borderColor: sepColor, borderWidth: 1.5, borderRadius: 5, borderSkipped: false, datalabels: { display: false } }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 28 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    categoryPercentage: 0.85,
                    barPercentage: 0.75,
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
                                        if (!start || !tgt || start <= 0 || tgt <= 0) { alert("Vui lòng nhập số kg hợp lệ!"); return; }
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
                                    <p className="text-center text-ink-faint text-[12px] italic font-medium py-8">Chưa có bản ghi nào</p>
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

function BottomNav({view, setView}) {
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

// --- MAIN APP EXPORT ---
export default function App() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState(""); // tên hiển thị (email/SĐT) — userId giờ là uuid
    const [showOnboarding, setShowOnboarding] = useState(false); // wizard lần đầu đăng nhập
    const [view, setView] = useState("profile");
    // Theme sáng/tối — mặc định sáng, lưu localStorage theo thiết bị (không sync Supabase).
    const [theme, setTheme] = useState(() =>
        (typeof window !== "undefined" && localStorage.getItem("stayfit_theme") === "dark") ? "dark" : "light"
    );
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        try { localStorage.setItem("stayfit_theme", theme); } catch {}
        const m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute("content", theme === "dark" ? "#0E0E0E" : "#FBF8F2");
    }, [theme]);
    const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    
    // NÂNG CẤP: State cho chức năng chỉnh sửa món ăn TẠI THƯ VIỆN CHỌN NHANH
    const [editLibraryModal, setEditLibraryModal] = useState({ isOpen: false, item: null, originalName: "" });
    const [libraryEditForm, setLibraryEditForm] = useState({ name: "", unit: "g", per: 100, kcal: "", protein: "", carb: "", fat: "" });
    const [targetLog, setTargetLog] = useState({}); // Lưu lịch sử mục tiêu theo ngày

    // ---> DÁN 4 DÒNG ĐÓ VÀO ĐÂY <---
    const [undoStack, setUndoStack] = useState([]); // Mảng chứa Lịch sử các món đã xóa
    useEffect(() => { setUndoStack([]); }, [currentDate]); // Đổi ngày thì dọn sạch thùng rác
    // -------------------------------

    // Drag-and-drop + multi-select state cho tab Nhật ký
    const [selectedItemIds, setSelectedItemIds] = useState(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [activeDragId, setActiveDragId] = useState(null);
    const [dragOverDelete, setDragOverDelete] = useState(false);
    const [openMoveMenu, setOpenMoveMenu] = useState(null); // null | mealName
    useEffect(() => {
        setSelectedItemIds(new Set());
        setSelectionMode(false);
        setOpenMoveMenu(null);
    }, [currentDate]);

    const journalSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const [profile, setProfile] = useState({ 
        gender: "male", age: 25, height: 165, weight: 60, activity: 1.375, goal: 0, 
        isManualTarget: false, manualTargetKcal: 2000,
        isManualMacro: false, manualProtein: 125, manualCarb: 250, manualFat: 55, macroDietMode: "Tiêu chuẩn (Standard)"
    });
    const [history, setHistory] = useState({});
    const [customFoodList, setCustomFoodList] = useState([]);
    const [deletedCommonFoods, setDeletedCommonFoods] = useState([]);
    const [imgUrls, setImgUrls] = useState({});         // R2 presigned GET: imageKey/avatarKey → url tạm
    const [lightboxUrl, setLightboxUrl] = useState(null); // xem ảnh món phóng to
    const avatarInputRef = useRef(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState(null); // ảnh đang chờ crop (dataURL)
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [tab, setTab] = useState("quick");
    const [selectedMeal, setSelectedMeal] = useState("Bữa sáng");
    const [selectedFood, setSelectedFood] = useState(null);
    const [qty, setQty] = useState(1);

    // Barcode scan state (tính năng "Kiểm tra sản phẩm")
    const [barcodeOpen, setBarcodeOpen] = useState(false);
    const [barcodeLoading, setBarcodeLoading] = useState(false); // đang tra cứu sau khi quét
    const [barcodeResult, setBarcodeResult] = useState(null); // kết quả kiểm tra: {type, ...}

    // AI Vision scan state
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [scanState, setScanState] = useState({
        file: null,
        preview: null,
        loading: false,
        error: null,
        items: null,
    });
    const [scanMode, setScanMode] = useState('image'); // 'image' | 'text'
    const [scanText, setScanText] = useState('');
    const [scanDesc, setScanDesc] = useState(''); // mô tả tùy chọn cho quét ảnh (giúp AI nhận diện đúng)
    const [scanFeedbackCache, setScanFeedbackCache] = useState([]);
    const [dismissedSuggestions, setDismissedSuggestions] = useState([]);
    const [librarySuggestion, setLibrarySuggestion] = useState(null);
    const [suggestionForm, setSuggestionForm] = useState({ name: "", per: 100, kcal: 0, protein: 0, carb: 0, fat: 0 });
    const [searchQuery, setSearchQuery] = useState("");
    const [customFood, setCustomFood] = useState({ name: "", quantity: 1, unit: "g", kcal: "", protein: "", carb: "", fat: "" });
    const [recipe, setRecipe] = useState({ name: "", ingredients: [], weightOverride: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, foodToDelete: null, alertMessage: "" });
    const [phoneInput, setPhoneInput] = useState("");
    const [phonePass, setPhonePass] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined") {
            // userId/password giờ lấy từ session Supabase (xem effect bên dưới), không đọc localStorage nữa.
            const p = localStorage.getItem('stayfit_profile'); if(p) setProfile({...profile, ...JSON.parse(p)});
            const tl = localStorage.getItem('stayfit_target_log'); if(tl) setTargetLog(JSON.parse(tl));
            const h = localStorage.getItem('stayfit_history'); if(h) setHistory(JSON.parse(h));
            const c = localStorage.getItem('stayfit_custom_foods'); if(c) setCustomFoodList(JSON.parse(c));
            const d = localStorage.getItem('stayfit_deleted_common'); if(d) setDeletedCommonFoods(JSON.parse(d));
            try {
                const fb = localStorage.getItem('stayfit_scan_feedback');
                if (fb) {
                    const parsed = JSON.parse(fb);
                    if (parsed.data && parsed.ts && Date.now() - parsed.ts < 24*60*60*1000) {
                        setScanFeedbackCache(parsed.data);
                    }
                }
            } catch (e) {}
            try {
                const dis = localStorage.getItem('stayfit_dismissed_suggestions');
                if (dis) setDismissedSuggestions(JSON.parse(dis));
            } catch (e) {}
            setView(localStorage.getItem('stayfit_setup') ? "journal" : "profile");
            
            try { setSelectedMeal(getMealByHour()); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('stayfit_profile', JSON.stringify(profile));
            localStorage.setItem('stayfit_history', JSON.stringify(history));
            localStorage.setItem('stayfit_custom_foods', JSON.stringify(customFoodList));
            localStorage.setItem('stayfit_deleted_common', JSON.stringify(deletedCommonFoods));
            localStorage.setItem('stayfit_dismissed_suggestions', JSON.stringify(dismissedSuggestions));
            if (view !== "profile" && userId) localStorage.setItem('stayfit_setup', 'done');
        }
    }, [profile, history, customFoodList, deletedCommonFoods, dismissedSuggestions, view, userId, isClient]);

    // Refs giữ lại để các tham chiếu khác (StatsView, removeFood...) không vỡ — native không cần chống echo Sheets nữa.
    const lastPullAtRef = useRef(0);
    const pullingRef = useRef(false);
    const pendingChangeRef = useRef(false);
    const pendingDeleteCountRef = useRef(0);
    // Chỉ cho phép lưu (persist) SAU khi đã load xong — chống ghi đè/xóa-trắng dữ liệu khi state còn rỗng.
    const dataLoadedRef = useRef(false);

    // Lưu toàn bộ state lên Supabase (gọi debounced). RLS tự khóa theo user đăng nhập.
    const persist = async () => {
        if (!dataLoadedRef.current || !userId) return;
        try {
            await saveSnapshot(userId, {
                profile,
                history,
                weightLog: JSON.parse(localStorage.getItem("stayfit_weight_log") || "{}"),
                customFoods: customFoodList,
                deletedCommonFoods,
            });
        } catch (err) { console.error("Lỗi lưu Supabase:", err.message); }
    };

    // Nạp dữ liệu của user (gọi NGOÀI callback onAuthStateChange để tránh deadlock auth lock).
    const loadForUser = async (uid, email) => {
        if (dataLoadedRef.current) return;
        try {
            const d = await loadUserData(uid);
            if (!d) return;
            setProfile(prev => ({ ...prev, ...d.profile }));
            setHistory(d.history);
            setCustomFoodList(d.customFoods);
            setDeletedCommonFoods(d.deletedCommonFoods);
            localStorage.setItem("stayfit_weight_log", JSON.stringify(d.weightLog));
            setDisplayName(email || "");
            dataLoadedRef.current = true;
            // Lần đầu (chưa có biệt danh & chưa hoàn tất setup) → mở onboarding wizard.
            if (!d.profile.nickname && !localStorage.getItem('stayfit_setup')) {
                setShowOnboarding(true);
            }
        } catch (err) { console.error("Lỗi nạp dữ liệu:", err.message); }
    };

    // Hoàn tất onboarding: merge profile + đánh dấu đã setup + vào Nhật ký.
    const finishOnboarding = (partial) => {
        setProfile(prev => ({ ...prev, ...partial }));
        try { localStorage.setItem('stayfit_setup', 'done'); } catch (e) {}
        setShowOnboarding(false);
        setView('journal');
    };

    // Phiên đăng nhập Supabase: userId=user.id, password=access_token (cho AI route).
    // QUAN TRỌNG: trong onAuthStateChange KHÔNG await hàm supabase khác (deadlock) → defer bằng setTimeout(0).
    useEffect(() => {
        if (!isClient) return;
        const supa = getSupabaseBrowser();
        if (!supa) return;
        let active = true;
        const apply = (session) => {
            if (!active) return;
            if (session?.user) {
                const uid = session.user.id;
                const email = session.user.email || session.user.phone || "";
                setUserId(uid);
                setPassword(session.access_token || "");
                setTimeout(() => { if (active) loadForUser(uid, email); }, 0);
            } else {
                setUserId(""); setPassword(""); dataLoadedRef.current = false;
            }
        };
        supa.auth.getSession().then(({ data }) => apply(data.session));
        const { data: sub } = supa.auth.onAuthStateChange((_e, session) => apply(session));
        return () => { active = false; sub.subscription.unsubscribe(); };
    }, [isClient]);

    // SĐT làm username: dùng email tổng hợp <sđt>@phone.stayfit.app (không OTP). Thử login → chưa có thì đăng ký.
    const handlePhoneAuth = async () => {
        const phone = normPhone(phoneInput); const pwd = phonePass.trim();
        if (!phone || phone.length < 8) return alert("Số điện thoại không hợp lệ!");
        if (pwd.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự!");
        const supa = getSupabaseBrowser();
        if (!supa) return alert("Chưa cấu hình Supabase.");
        setLoginLoading(true);
        try {
            const email = `${phone}@phone.stayfit.app`;
            const { error } = await supa.auth.signInWithPassword({ email, password: pwd });
            if (error) {
                const up = await supa.auth.signUp({ email, password: pwd });
                if (up.error) throw up.error;
                if (!up.data.session) {
                    alert("Đã tạo tài khoản. Nếu chưa vào được, kiểm tra Supabase đã TẮT 'Confirm email'.");
                }
            }
            // Session effect tự nạp dữ liệu + vào app.
        } catch (e) { alert("❌ " + (e.message || "Lỗi đăng nhập")); }
        finally { setLoginLoading(false); }
    };

    const handleGoogleLogin = async () => {
        const supa = getSupabaseBrowser();
        if (!supa) return alert("Đăng nhập Google chưa được cấu hình (thiếu Supabase env).");
        await supa.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/auth/callback' },
        });
    };

    const handleLogout = async () => {
        const supa = getSupabaseBrowser();
        if (supa) { try { await supa.auth.signOut(); } catch (e) { /* noop */ } }
        setUserId(""); setPassword(""); dataLoadedRef.current = false;
        window.location.reload();
    };

    // Debounced persist khi state đổi (chỉ sau khi đã load xong).
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (!isClient) return;
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timeoutId = setTimeout(() => { persist(); }, 2000);
        return () => clearTimeout(timeoutId);
    }, [history, profile, customFoodList, deletedCommonFoods]);
    
    const calculatedTarget = useMemo(() => {
        let bmr = profile.gender === "male" 
            ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        return Math.round(bmr * profile.activity) + profile.goal;
    }, [profile]);

    const target = profile.isManualTarget ? profile.manualTargetKcal : calculatedTarget;
    // Tự động chốt sổ mục tiêu Kcal cho ngày hôm nay
    useEffect(() => {
        if (!isClient) return;
        const todayStr = formatDate(new Date());
        setTargetLog(prev => {
            if (prev[todayStr] !== target) {
                const newLog = { ...prev, [todayStr]: target };
                localStorage.setItem('stayfit_target_log', JSON.stringify(newLog));
                return newLog;
            }
            return prev;
        });
    }, [target, isClient]);
    const dailyLogRaw = history[currentDate] || [];
    const dailyLog = useMemo(() => {
        return [...dailyLogRaw].sort((a, b) => {
            const getWeight = (item) => {
                if (item.meal === "Bữa sáng") return 10;
                if (item.meal === "Bữa trưa") return 30;
                if (item.meal === "Bữa tối") return 50;
                if (item.meal === "Ăn vặt") {
                    // Tìm tất cả các bữa chính đã được nhập TRƯỚC thời điểm của món ăn vặt này
                    const mains = dailyLogRaw.filter(m => m.meal !== "Ăn vặt" && (m.timestamp || String(m.id)) <= (item.timestamp || String(item.id)));
                    if (mains.length === 0) return 20; // Nếu chưa có bữa chính nào, mặc định xếp sau Bữa sáng
                    
                    const lastMain = mains[mains.length - 1].meal;
                    if (lastMain === "Bữa sáng") return 20;
                    if (lastMain === "Bữa trưa") return 40;
                    if (lastMain === "Bữa tối") return 60;
                }
                return 70;
            };
            
            const wA = getWeight(a);
            const wB = getWeight(b);
            if (wA !== wB) return wA - wB; // Sắp xếp theo nhóm Bữa ăn
            
            // Nếu cùng một bữa, sắp xếp theo đúng thời gian nhập trước/sau
            return (a.timestamp || String(a.id)).localeCompare(b.timestamp || String(b.id));
        });
    }, [dailyLogRaw]);
    
    // R2: ký URL hiển thị tạm cho ảnh món (ngày đang xem) + avatar. Chỉ ký key chưa có.
    useEffect(() => {
        if (!password) return;
        const dayItems = history[currentDate] || [];
        const needed = new Set();
        for (const it of dayItems) if (it.imageKey && !imgUrls[it.imageKey]) needed.add(it.imageKey);
        if (profile.avatarKey && !imgUrls[profile.avatarKey]) needed.add(profile.avatarKey);
        if (needed.size === 0) return;
        let cancelled = false;
        signGets(password, [...needed])
            .then(urls => { if (!cancelled) setImgUrls(prev => ({ ...prev, ...urls })); })
            .catch(() => {});
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password, currentDate, history, profile.avatarKey]);

    const dailyKcal = Math.round(dailyLog.reduce((s, i) => s + (i.kcal || 0), 0) * 10) / 10;
    const dailyProtein = Math.round(dailyLog.reduce((s, i) => s + (i.protein || 0), 0) * 10) / 10;
    const dailyCarb = Math.round(dailyLog.reduce((s, i) => s + (i.carb || 0), 0) * 10) / 10;
    const dailyFat = Math.round(dailyLog.reduce((s, i) => s + (i.fat || 0), 0) * 10) / 10;
    
    const targetProtein = profile.isManualMacro ? (parseFloat(profile.manualProtein) || 0) : Math.round((target * 0.25 / 4) * 10) / 10;
    const targetCarb = profile.isManualMacro ? (parseFloat(profile.manualCarb) || 0) : Math.round((target * 0.50 / 4) * 10) / 10;
    const targetFat = profile.isManualMacro ? (parseFloat(profile.manualFat) || 0) : Math.round((target * 0.25 / 9) * 10) / 10;

    const mealBreakdown = useMemo(() => {
        return [ 
            { name: "Bữa sáng", icon: "☀️", color: "bg-clay" }, { name: "Bữa trưa", icon: "🌤️", color: "bg-sage" },
            { name: "Bữa tối", icon: "🌙", color: "bg-lilac" }, { name: "Ăn vặt", icon: "⭐", color: "bg-orange" } 
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

    const foodPickerFoods = useMemo(() => {
        const byName = new Map();
        allFoods.forEach(food => {
            const key = normalizeFoodLookup(food.name);
            if (!byName.has(key)) byName.set(key, food);
        });

        const groups = new Map();
        allFoods.forEach(food => {
            const aliasTarget = food.aliasOf ? byName.get(normalizeFoodLookup(food.aliasOf)) : null;
            const canonicalFood = aliasTarget || food;
            const groupKey = normalizeFoodGroupKey(canonicalFood.name);
            const searchableNames = [food.name, food.aliasOf, canonicalFood.name].filter(Boolean);

            if (!groups.has(groupKey)) {
                groups.set(groupKey, { food: canonicalFood, searchTextParts: [] });
            }

            const group = groups.get(groupKey);
            group.searchTextParts.push(...searchableNames);
        });

        return Array.from(groups.values()).map(group => ({
            ...group.food,
            normalizedName: normalizeFoodLookup(group.food.name),
            searchText: normalizeFoodLookup(group.searchTextParts.join(" ")),
        }));
    }, [allFoods]);
    
    const filteredFoods = useMemo(() => {
        if (!searchQuery.trim()) return foodPickerFoods.slice(0, 50);
        const query = normalizeFoodLookup(searchQuery);
        const tokens = query.split(' ').filter(Boolean);
        const scored = [];
        for (const f of foodPickerFoods) {
            const text = f.searchText;
            if (!tokens.every(t => text.includes(t))) continue;
            const name = f.normalizedName;
            let score = 0;
            if (name === query) score = 100;
            else if (name.startsWith(query)) score = 80;
            else if (text.startsWith(query)) score = 70;
            else if (name.includes(query)) score = 60;
            else score = 40;
            scored.push({ f, score });
        }
        scored.sort((a, b) => b.score - a.score || a.f.name.length - b.f.name.length);
        return scored.map(s => s.f).slice(0, 50);
    }, [searchQuery, foodPickerFoods]);

    const handleAddSelectedFood = () => {
        if (!selectedFood) return;
        const quantity = parseFloat(qty) || 0;
        const newItem = {
            name: selectedFood.name, quantity: quantity, unit: selectedFood.unit,
            kcal: calcMacro(selectedFood.kcal, selectedFood.per, quantity), protein: calcMacro(selectedFood.protein, selectedFood.per, quantity),
            carb: calcMacro(selectedFood.carb, selectedFood.per, quantity), fat: calcMacro(selectedFood.fat, selectedFood.per, quantity),
            meal: selectedMeal, id: crypto.randomUUID(), timestamp: generateUniqueTimestamp()
        };
        setHistory(prev => ({ ...prev, [currentDate]: [...(prev[currentDate] || []), newItem] }));
        setSelectedFood(null); setSearchQuery(""); setQty(1);
    };

    /* ───── GHÉP MÓN (tạo món từ nhiều nguyên liệu → quy về /100g) ───── */
    const recipeTotals = useMemo(() => {
        let kcal = 0, protein = 0, carb = 0, fat = 0, autoWeight = 0;
        for (const ing of recipe.ingredients) {
            kcal += calcMacro(ing.kcal, ing.per, ing.qty);
            protein += calcMacro(ing.protein, ing.per, ing.qty);
            carb += calcMacro(ing.carb, ing.per, ing.qty);
            fat += calcMacro(ing.fat, ing.per, ing.qty);
            autoWeight += unitToGrams(ing.qty, ing.unit);
        }
        return {
            kcal: Math.round(kcal * 10) / 10,
            protein: Math.round(protein * 10) / 10,
            carb: Math.round(carb * 10) / 10,
            fat: Math.round(fat * 10) / 10,
            autoWeight: Math.round(autoWeight),
        };
    }, [recipe.ingredients]);

    const recipeWeight = recipe.weightOverride != null ? recipe.weightOverride : recipeTotals.autoWeight;
    const recipePer100 = recipeWeight > 0 ? 100 / recipeWeight : 0;
    const recipePer100Macros = {
        kcal: Math.round(recipeTotals.kcal * recipePer100),
        protein: Math.round(recipeTotals.protein * recipePer100 * 10) / 10,
        carb: Math.round(recipeTotals.carb * recipePer100 * 10) / 10,
        fat: Math.round(recipeTotals.fat * recipePer100 * 10) / 10,
    };
    // Báo trùng tên ngay khi gõ (không đợi tới lúc bấm Lưu).
    const recipeNameTaken = recipe.name.trim() !== "" && allFoods.some(f => f.name.toLowerCase().trim() === recipe.name.trim().toLowerCase());

    const addRecipeIngredient = (food) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, {
                name: food.name, unit: food.unit, per: food.per,
                kcal: food.kcal, protein: food.protein, carb: food.carb, fat: food.fat,
                qty: food.per,
            }],
        }));
    };

    const updateRecipeIngredientQty = (idx, qty) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) => i === idx ? { ...ing, qty } : ing),
        }));
    };

    const removeRecipeIngredient = (idx) => {
        setRecipe(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== idx) }));
    };

    const saveRecipeToLibrary = () => {
        const name = recipe.name.trim();
        if (!name || recipe.ingredients.length === 0 || recipeWeight <= 0) return;
        if (allFoods.some(f => f.name.toLowerCase().trim() === name.toLowerCase())) {
            setConfirmModal({ isOpen: true, foodToDelete: null, alertMessage: "Món ăn này đã có sẵn!" });
            return;
        }
        const newFood = { name, unit: "g", per: 100, ...recipePer100Macros };
        setCustomFoodList(prev => [newFood, ...prev]);
        setRecipe({ name: "", ingredients: [], weightOverride: null });
        setSearchQuery("");
        setTab("quick");
    };

    /* ───── KIỂM TRA SẢN PHẨM (quét mã → tra dấu hiệu, KHÔNG khẳng định thật/giả) ───── */
    const handleBarcodeDetected = async (code) => {
        setBarcodeOpen(false);
        const raw = (code || "").trim();

        // B — QR chứa link (tem chống giả của hãng) → cho user mở trang xác thực.
        if (/^https?:\/\//i.test(raw)) {
            setBarcodeResult({ type: "qr", url: raw });
            return;
        }

        // Không phải mã vạch sản phẩm hợp lệ.
        if (!/^\d{6,14}$/.test(raw)) {
            setBarcodeResult({ type: "invalid", code: raw });
            return;
        }

        // A — mã vạch EAN/UPC: dấu hiệu + tra nhận dạng.
        const valid = isValidGtin(raw);
        const country = gs1Country(raw);
        setBarcodeLoading(true);
        let product = null;
        try {
            const res = await fetch(`/api/barcode?code=${raw}`);
            const data = await res.json();
            if (res.ok && data.found && data.product) product = data.product;
        } catch (e) {
            /* mạng lỗi → vẫn hiện dấu hiệu offline (check digit + nước) */
        } finally {
            setBarcodeLoading(false);
        }
        setBarcodeResult({ type: "barcode", code: raw, valid, country, product });
    };

    const handleConfirmDelete = () => {
        if (!confirmModal.foodToDelete) return;
        const foodName = confirmModal.foodToDelete.name;
        setCustomFoodList(prev => prev.filter(f => f.name !== foodName));
        if (COMMON_FOODS.some(f => f.name === foodName) && !deletedCommonFoods.includes(foodName)) {
            setDeletedCommonFoods(prev => [...prev, foodName]);
        }
        if (selectedFood && selectedFood.name === foodName) setSelectedFood(null);
        setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" });
    };

    /* ───── AI VISION SCAN HANDLERS ───── */
    const openScanModal = (mode = 'image') => {
        setScanMode(mode);
        setSelectedMeal(getMealByHour());
        setScanModalOpen(true);
    };

    const closeScanModal = () => {
        setScanModalOpen(false);
        setTimeout(() => {
            setScanState({ file: null, preview: null, loading: false, error: null, items: null });
            setScanMode('image');
            setScanText('');
            setScanDesc('');
            const suggestion = detectLibrarySuggestion();
            if (suggestion) setLibrarySuggestion(suggestion);
        }, 350);
    };

    const compressImage = (file, maxWidth = 1024, quality = 0.85) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const ratio = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                const newFile = new File([blob], file.name || "photo.jpg", { type: "image/jpeg" });
                const reader = new FileReader();
                reader.onload = (e) => resolve({ file: newFile, dataUrl: e.target.result });
                reader.readAsDataURL(blob);
            }, "image/jpeg", quality);
        };
        img.src = URL.createObjectURL(file);
    });

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleScanPick = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            setScanState(s => ({ ...s, error: "Ảnh quá lớn (max 8 MB)" }));
            return;
        }
        try {
            const compressed = await compressImage(file, 1024, 0.85);
            setScanState({ file: compressed.file, preview: compressed.dataUrl, loading: false, error: null, items: null });
        } catch (err) {
            setScanState(s => ({ ...s, error: "Không đọc được ảnh: " + err.message }));
        }
        // Reset input value để có thể chọn lại cùng file
        if (e.target) e.target.value = "";
    };

    const handleScanAnalyze = async () => {
        if (!scanState.file) return;
        setScanState(s => ({ ...s, loading: true, error: null }));
        try {
            const base64 = await fileToBase64(scanState.file);
            const libraryPayload = allFoods.map(f => ({
                name: f.name, unit: f.unit, per: f.per,
                kcal: f.kcal, protein: f.protein, carb: f.carb, fat: f.fat,
            }));
            const res = await fetch("/api/vision-analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId, password,
                    imageBase64: base64,
                    mimeType: scanState.file.type,
                    library: libraryPayload,
                    description: scanDesc.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Phân tích thất bại");

            const items = (data.items || []).map((it) => ({
                ...it,
                _checked: true,
                _qty: it.grams,
                // Image mode: AI không có context về giờ, đoán meal type từ loại món không tin được → luôn dùng getMealByHour() theo giờ thực.
                _meal: getMealByHour(),
                _editMode: false,
                _origName: it.name,
            }));
            setScanState(s => ({ ...s, loading: false, items }));
        } catch (err) {
            setScanState(s => ({ ...s, loading: false, error: err.message }));
        }
    };

    const handleScanReset = () => {
        setScanState({ file: null, preview: null, loading: false, error: null, items: null });
        setScanText('');
        setScanDesc('');
    };

    const handleTextAnalyze = async () => {
        if (!scanText.trim()) return;
        setScanState(s => ({ ...s, loading: true, error: null }));
        try {
            const libraryPayload = allFoods.map(f => ({
                name: f.name, unit: f.unit, per: f.per,
                kcal: f.kcal, protein: f.protein, carb: f.carb, fat: f.fat,
            }));
            const res = await fetch("/api/text-analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId, password,
                    text: scanText.trim(),
                    library: libraryPayload,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Phân tích thất bại");
            // Chỉ trust AI's meal_suggestion KHI user CHỦ ĐỘNG mention meal trong text.
            // Còn lại → dùng giờ thực (AI hay đoán sai dựa vào loại món, vd bò bít tết → "Bữa tối").
            const textMentionsMeal = mentionsMealInText(scanText);
            const items = (data.items || []).map((it) => ({
                ...it,
                _checked: true,
                _qty: it.grams,
                _meal: textMentionsMeal && MEAL_TYPES.includes(it.meal_suggestion)
                    ? it.meal_suggestion
                    : getMealByHour(),
                _editMode: false,
                _origName: it.name,
            }));
            setScanState(s => ({ ...s, loading: false, items }));
        } catch (err) {
            setScanState(s => ({ ...s, loading: false, error: err.message }));
        }
    };

    const updateScanItem = (idx, patch) => {
        setScanState(s => ({
            ...s,
            items: s.items.map((it, i) => i === idx ? { ...it, ...patch } : it),
        }));
    };

    const submitScanItemEdit = (idx) => {
        const item = scanState.items[idx];
        updateScanItem(idx, { _editMode: false });
        if (item.source === "library" && item.libraryName && item._origName !== item.name && userId && password) {
            const feedbackEntry = {
                timestamp: new Date().toISOString(),
                aiPredictedName: item.aiPredictedName,
                libraryMatchedName: item.libraryName,
                userCorrectedName: item.name,
                confidence: item.confidence,
                fuzzyMatched: item.fuzzyMatched,
                kcal: item.kcal,
                protein: item.protein,
                carb: item.carb,
                fat: item.fat,
            };
            // Optimistic update local cache để pattern detect kích ngay sau lần thứ 3
            setScanFeedbackCache(prev => {
                const next = [...prev, feedbackEntry];
                try {
                    localStorage.setItem('stayfit_scan_feedback', JSON.stringify({
                        data: next, ts: Date.now()
                    }));
                } catch (e) {}
                return next;
            });
            // Fire-and-forget → Supabase
            addScanFeedback(userId, feedbackEntry).catch(err => console.warn("Feedback log failed:", err));
        }
    };

    const addAllScannedItems = () => {
        const checked = (scanState.items || []).filter(it => it._checked);
        if (checked.length === 0) return;
        const baseTs = Date.now();
        const newEntries = checked.map((item, i) => {
            const quantity = parseFloat(item._qty) || 0;
            return {
                name: item.name,
                quantity,
                unit: item.unit,
                kcal: calcMacro(item.kcal, item.per, quantity),
                protein: calcMacro(item.protein, item.per, quantity),
                carb: calcMacro(item.carb, item.per, quantity),
                fat: calcMacro(item.fat, item.per, quantity),
                meal: item._meal,
                id: crypto.randomUUID(),
                timestamp: `${baseTs + i}-${Math.random().toString(36).slice(2, 7)}`,
            };
        });
        setHistory(prev => ({
            ...prev,
            [currentDate]: [...(prev[currentDate] || []), ...newEntries],
        }));

        // Ảnh món: chỉ khi quét bằng ảnh. Upload 1 lần lên R2, gắn imageKey vào các món vừa thêm.
        const photo = scanMode === 'image' ? scanState.file : null;
        if (photo && password) {
            const ids = newEntries.map(e => e.id);
            const day = currentDate;
            uploadImage(password, 'meal', photo)
                .then(key => setHistory(prev => ({
                    ...prev,
                    [day]: (prev[day] || []).map(it => ids.includes(it.id) ? { ...it, imageKey: key } : it),
                })))
                .catch(err => console.warn('Upload ảnh món thất bại:', err.message));
        }

        closeScanModal();
    };

    // Avatar: chọn ảnh → nén nhỏ → upload R2 → lưu avatarKey (persist tự lo).
    // Chọn/chụp ảnh → mở cropper (chưa upload).
    const handleAvatarPick = (e) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatarCropSrc(reader.result);
        reader.readAsDataURL(file);
    };

    // Sau khi crop xong → nén → upload R2 → lưu avatarKey.
    const finishAvatarCrop = async (blob) => {
        if (!blob || !password) { setAvatarCropSrc(null); return; }
        setAvatarBusy(true);
        try {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            const { file: compressed } = await compressImage(file, 256, 0.85);
            const key = await uploadImage(password, 'avatar', compressed);
            setProfile(prev => ({ ...prev, avatarKey: key }));
            const urls = await signGets(password, [key]);
            setImgUrls(prev => ({ ...prev, ...urls }));
        } catch (err) {
            console.warn('Upload avatar thất bại:', err.message);
        } finally {
            setAvatarBusy(false);
            setAvatarCropSrc(null);
        }
    };

    /* ───── LIBRARY SUGGESTION (auto-grow library từ feedback) ───── */
    const detectLibrarySuggestion = () => {
        const THRESHOLD = 3;
        const groups = new Map();
        for (const fb of scanFeedbackCache) {
            if (!fb.aiPredictedName || !fb.userCorrectedName) continue;
            if (fb.aiPredictedName.trim() === fb.userCorrectedName.trim()) continue;
            const key = `${fb.aiPredictedName}::${fb.userCorrectedName}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(fb);
        }
        const libraryNames = new Set(allFoods.map(f => f.name.toLowerCase()));
        for (const [key, entries] of groups) {
            if (entries.length < THRESHOLD) continue;
            const first = entries[0];
            if (libraryNames.has(first.userCorrectedName.toLowerCase())) continue;
            if (dismissedSuggestions.includes(key)) continue;
            // Trung bình macros từ các entry có macros > 0 (entry cũ A:G chưa có macros sẽ bị skip)
            const avg = {};
            for (const k of ['kcal', 'protein', 'carb', 'fat']) {
                const valid = entries.filter(e => Number(e[k]) > 0);
                avg[k] = valid.length > 0
                    ? Math.round(valid.reduce((s, e) => s + Number(e[k]), 0) / valid.length * 10) / 10
                    : 0;
            }
            return {
                key,
                aiPredictedName: first.aiPredictedName,
                libraryMatchedName: first.libraryMatchedName,
                userCorrectedName: first.userCorrectedName,
                count: entries.length,
                ...avg,
            };
        }
        return null;
    };

    const dismissSuggestion = () => {
        if (!librarySuggestion) return;
        setDismissedSuggestions(prev => [...prev, librarySuggestion.key]);
        setLibrarySuggestion(null);
    };

    useEffect(() => {
        if (librarySuggestion) {
            setSuggestionForm({
                name: librarySuggestion.userCorrectedName,
                per: 100,
                kcal: librarySuggestion.kcal,
                protein: librarySuggestion.protein,
                carb: librarySuggestion.carb,
                fat: librarySuggestion.fat,
            });
        }
    }, [librarySuggestion]);

    const addSuggestionToLibrary = (formValues) => {
        if (!librarySuggestion) return;
        const newFood = {
            name: (formValues.name || librarySuggestion.userCorrectedName).trim(),
            unit: "g",
            per: parseFloat(formValues.per) || 100,
            kcal: parseFloat(formValues.kcal) || 0,
            protein: parseFloat(formValues.protein) || 0,
            carb: parseFloat(formValues.carb) || 0,
            fat: parseFloat(formValues.fat) || 0,
        };
        if (!newFood.name) return;
        setCustomFoodList(prev => [newFood, ...prev.filter(f => f.name !== newFood.name)]);
        setDismissedSuggestions(prev => [...prev, librarySuggestion.key]);
        setLibrarySuggestion(null);
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
            meal: selectedMeal, id: crypto.randomUUID(), timestamp: generateUniqueTimestamp()
        };
        setHistory(prev => ({ ...prev, [currentDate]: [...(prev[currentDate] || []), newItem] }));

        let weightInGrams = q; let baseUnit = 'g';
        if (['kg'].includes(u)) { weightInGrams = q * 1000; } else if (['l', 'lít'].includes(u)) { weightInGrams = q * 1000; baseUnit = 'ml'; }
        else if (['ml'].includes(u)) { weightInGrams = q; baseUnit = 'ml'; } else if (['g', 'gram'].includes(u)) { weightInGrams = q; }
        else { weightInGrams = q * (UNIT_GRAM_WEIGHTS[u] || 100); }

        const factor100g = weightInGrams > 0 ? (100 / weightInGrams) : 1;
        setCustomFoodList(prev => [{
            name: foodName, unit: baseUnit, per: 100, kcal: Math.round(k * factor100g),
            protein: Math.round((p * factor100g) * 10) / 10, carb: Math.round((c * factor100g) * 10) / 10, fat: Math.round((f * factor100g) * 10) / 10,
        }, ...prev]);
        setCustomFood({ name: "", quantity: 1, unit: "g", kcal: "", protein: "", carb: "", fat: "" });
        setTab("quick");
    };

   const removeFood = async (id) => {
        const currentList = history[currentDate] || [];
        const itemToDelete = currentList.find(i => i.id === id);
        const itemIndex = currentList.findIndex(i => i.id === id);

        setHistory(prev => ({ ...prev, [currentDate]: currentList.filter(i => i.id !== id) }));
        
        // --- VẤN ĐỀ 1 & 2: HOÀN TÁC NHIỀU LẦN VÀ KHÔNG TỰ ẨN ---
        // Nhồi món vừa xóa vào mảng (Stack)
        setUndoStack(prev => [...prev, { item: itemToDelete, index: itemIndex }]);
        // persist (saveSnapshot reconcile) sẽ tự xóa trên Supabase.
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;

        const last = undoStack[undoStack.length - 1];

        // Undo cho bulk move (đổi bữa qua kéo-thả)
        if (last.type === 'move') {
            setHistory(prev => {
                const list = prev[last.date] || [];
                const restored = list.map(item => {
                    const moved = last.items.find(m => m.id === item.id);
                    return moved ? { ...item, meal: moved.oldMeal } : item;
                });
                return { ...prev, [last.date]: restored };
            });
            setUndoStack(prev => prev.slice(0, -1));
            return;
        }

        // Undo cho delete (giữ nguyên logic cũ)
        const restoredItem = last.item;
        setHistory(prev => {
            const currentList = prev[currentDate] || [];
            const newList = [...currentList];
            newList.splice(last.index, 0, restoredItem);
            return { ...prev, [currentDate]: newList };
        });
        setUndoStack(prev => prev.slice(0, -1));
    };

    // Bulk update meal — dùng cho kéo-thả nhiều món
    const bulkUpdateMeals = (ids, newMeal) => {
        const list = history[currentDate] || [];
        const movedItems = [];
        const updated = list.map(item => {
            if (ids.has(item.id) && item.meal !== newMeal) {
                movedItems.push({ id: item.id, oldMeal: item.meal });
                return { ...item, meal: newMeal };
            }
            return item;
        });
        if (movedItems.length === 0) return;
        setHistory(prev => ({ ...prev, [currentDate]: updated }));
        setUndoStack(s => [...s, { type: 'move', items: movedItems, date: currentDate }]);
    };

    const handleLongPress = (id) => {
        setSelectionMode(true);
        setSelectedItemIds(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const toggleItemSelected = (id) => {
        setSelectedItemIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            if (next.size === 0) setSelectionMode(false);
            return next;
        });
    };

    const toggleSelectAllInMeal = (mealName) => {
        const itemsInMeal = (history[currentDate] || []).filter(it => it.meal === mealName);
        if (itemsInMeal.length === 0) return;
        const allSelected = itemsInMeal.every(it => selectedItemIds.has(it.id));
        setSelectedItemIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                itemsInMeal.forEach(it => next.delete(it.id));
            } else {
                itemsInMeal.forEach(it => next.add(it.id));
            }
            if (next.size === 0) setSelectionMode(false);
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedItemIds(new Set());
        setSelectionMode(false);
        setOpenMoveMenu(null);
    };

    const bulkDeleteSelected = async () => {
        if (selectedItemIds.size === 0) return;
        // Xóa khỏi state; persist (saveSnapshot reconcile) sẽ tự xóa trên Supabase.
        setHistory(prev => ({ ...prev, [currentDate]: (prev[currentDate] || []).filter(i => !selectedItemIds.has(i.id)) }));
        clearSelection();
    };

    const applyDietMode = (mode) => {
        if (mode.id === 'custom') setProfile({...profile, macroDietMode: "Tự nhập tay (Custom)"});
        else setProfile({
            ...profile, macroDietMode: mode.name, manualProtein: Math.round((target * mode.pro) / 4), 
            manualCarb: Math.round((target * mode.carb) / 4), manualFat: Math.round((target * mode.fat) / 9)
        });
        setIsDietModalOpen(false);
    };

    const updateItemMeal = (id, newMeal) => {
        setHistory(prev => {
            const currentList = prev[currentDate] || [];
            return {
                ...prev,
                [currentDate]: currentList.map(item => item.id === id ? { ...item, meal: newMeal } : item)
            };
        });
    };

    // HÀM MỚI: Mở modal chỉnh sửa THƯ VIỆN món ăn
    const openLibraryEditModal = (food) => {
        setEditLibraryModal({ isOpen: true, item: food, originalName: food.name });
        setLibraryEditForm({
            name: food.name,
            unit: food.unit,
            per: food.per || 100, // Định lượng chuẩn mặc định là 100 nếu không có
            kcal: food.kcal,
            protein: food.protein,
            carb: food.carb,
            fat: food.fat
        });
    };

    // HÀM MỚI: Lưu thông tin sau khi chỉnh sửa vào THƯ VIỆN
    const saveLibraryEdit = () => {
        if (!libraryEditForm.name || libraryEditForm.kcal === "") {
            alert("Vui lòng nhập đủ tên và số Kcal.");
            return;
        }

        const oldName = editLibraryModal.originalName;
        const isCommon = COMMON_FOODS.some(f => f.name === oldName);

        // Xóa món cũ khỏi danh sách custom (nếu nó từng là món custom)
        let newCustomList = customFoodList.filter(f => f.name !== oldName);

        // Nếu món cũ là món mặc định, phải đưa nó vào danh sách bị xóa (để ẩn đi)
        if (isCommon && !deletedCommonFoods.includes(oldName)) {
            setDeletedCommonFoods(prev => [...prev, oldName]);
        }

        // Tạo món ăn mới đã được cập nhật thông số
        const updatedFood = {
            name: libraryEditForm.name.trim(),
            unit: libraryEditForm.unit,
            per: parseFloat(libraryEditForm.per) || 100,
            kcal: parseFloat(libraryEditForm.kcal) || 0,
            protein: parseFloat(libraryEditForm.protein) || 0,
            carb: parseFloat(libraryEditForm.carb) || 0,
            fat: parseFloat(libraryEditForm.fat) || 0
        };

        // Đẩy món đã sửa lên đầu danh sách Custom
        setCustomFoodList([updatedFood, ...newCustomList]);
        
        // Nếu người dùng đang bấm chọn đúng món đó thì cập nhật luôn thông tin hiển thị
        if (selectedFood && selectedFood.name === oldName) {
            setSelectedFood(updatedFood);
        }

        setEditLibraryModal({ isOpen: false, item: null, originalName: "" });
    };

    if (!isClient) return null;

    if (!userId || !password) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-[#D97757] dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-white relative overflow-hidden font-sans">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D97757] dark:bg-[#89F336] rounded-full blur-3xl opacity-50 dark:opacity-35 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7A3318] dark:bg-[#22C55E] rounded-full blur-3xl opacity-50 dark:opacity-30 translate-y-1/3 -translate-x-1/3"></div>
                <div className="bg-white/10 dark:bg-white/[0.04] p-8 rounded-[2.5rem] w-full backdrop-blur-xl border border-white/20 dark:border-white/10 text-center shadow-2xl relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter italic mb-2">STAYFIT</h1>
                    <p className="text-[11px] text-white/70 font-semibold mb-7">
                        <span className="dark:hidden">Đăng nhập để đồng bộ dữ liệu của bạn</span>
                        <span className="hidden dark:inline">Sẵn sàng cho buổi tập tiếp theo.</span>
                    </p>

                    {/* Google */}
                    {isSupabaseConfigured && (
                        <>
                            <button onClick={handleGoogleLogin} disabled={loginLoading} className="w-full py-3.5 bg-white text-[#2D2620] rounded-2xl font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition shadow-xl disabled:opacity-50">
                                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.5-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5c-.5.4 7-5 7-15 0-1.2-.1-2.4-.4-3.5z"/></svg>
                                Tiếp tục với Google
                            </button>
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-white/20" /><span className="text-[10px] text-white/50 font-bold uppercase">hoặc</span><div className="flex-1 h-px bg-white/20" />
                            </div>
                        </>
                    )}

                    {/* Số điện thoại */}
                    <div className="space-y-3">
                        <input type="tel" inputMode="numeric" value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} placeholder="Số điện thoại" className="w-full bg-white/20 text-white placeholder:text-white/60 p-4 rounded-2xl outline-none font-bold text-center focus:ring-2 focus:ring-white transition-all" />
                        <input type="password" value={phonePass} onChange={e=>setPhonePass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-white/20 text-white placeholder:text-white/60 p-4 rounded-2xl outline-none font-bold text-center focus:ring-2 focus:ring-white transition-all" onKeyDown={e => { if (e.key === 'Enter') handlePhoneAuth(); }} />
                    </div>
                    <button onClick={handlePhoneAuth} disabled={loginLoading} className="w-full mt-3 py-4 bg-white text-[#D97757] dark:bg-[#22C55E] dark:text-[#0A0A0A] rounded-2xl font-black uppercase tracking-widest active:scale-95 transition shadow-xl dark:shadow-[0_12px_30px_-8px_rgba(34,197,94,0.5)] disabled:opacity-50">{loginLoading ? "Đang kết nối..." : "Đăng ký / Đăng nhập"}</button>
                    <p className="text-[9px] text-white/50 font-bold mt-3 px-4 leading-relaxed">Chưa có tài khoản? Nhập SĐT + mật khẩu mới để tự động đăng ký.</p>
                </div>
            </div>
        );
    }

    // Lần đầu đăng nhập → onboarding wizard (đè lên mọi view).
    if (showOnboarding) {
        const suggestedNick = (displayName || "").split("@")[0] || "";
        return <OnboardingWizard initial={profile} suggestedNick={suggestedNick} onComplete={finishOnboarding} />;
    }

    if (view === "stats") {
        return <StatsView history={history} profile={profile} setProfile={setProfile} target={target} targetLog={targetLog} setView={setView} view={view} setCurrentDate={setCurrentDate} userId={userId} password={password} pendingChangeRef={pendingChangeRef} theme={theme} />;
    }
    
    if (view === "profile") {
        const heroName = (profile.nickname || "").trim();
        const userInitial = (heroName || displayName || "?").trim().charAt(0).toUpperCase();
        const avatarUrl = profile.avatarKey ? imgUrls[profile.avatarKey] : null;
        return (
            <div className="max-w-md mx-auto min-h-screen bg-cream pb-28 relative font-sans text-ink">
                {avatarCropSrc && (
                    <AvatarCropper
                        src={avatarCropSrc}
                        busy={avatarBusy}
                        onCancel={() => { if (!avatarBusy) setAvatarCropSrc(null); }}
                        onComplete={finishAvatarCrop}
                    />
                )}
                {/* Slim sticky header */}
                <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-cream-deep px-4 py-3 flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Cài đặt</span>
                        <p className="text-sm font-bold text-ink">Hồ sơ cá nhân</p>
                    </div>
                </header>

                <main className="p-4 space-y-5">
                    {/* PROFILE HERO — avatar + biệt danh + email */}
                    <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                        <div className="flex items-center gap-4">
                            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="group relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange to-orange-deep text-2xl font-bold text-onaccent shadow-soft active:scale-95 transition focus:outline-none focus-visible:outline-none"
                                aria-label="Đổi ảnh đại diện"
                            >
                                {avatarUrl
                                    ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={avatarUrl} alt="" className="h-full w-full object-cover" />)
                                    : userInitial}
                                <span className="absolute inset-x-0 bottom-0 grid place-items-center bg-black/45 py-0.5 opacity-0 transition group-hover:opacity-100">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </span>
                            </button>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-deep">Thành viên</span>
                                <h2 className="mt-0.5 text-[16px] font-bold tracking-tight text-ink truncate">{heroName || "Chưa đặt biệt danh"}</h2>
                                {displayName && <p className="mt-0.5 text-[11px] font-medium text-ink-muted truncate">{displayName}</p>}
                            </div>
                            <button onClick={handleLogout} className="shrink-0 self-start inline-flex items-center gap-1.5 rounded-full bg-cream-soft px-3 py-1.5 text-[11px] font-semibold text-ink-muted ring-1 hover:bg-cream-deep hover:text-ink active:scale-95 transition" aria-label="Đăng xuất">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                Đăng xuất
                            </button>
                        </div>
                        {/* Ô biệt danh — đổi tên hiển thị ở lời chào */}
                        <div className="mt-4">
                            <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Biệt danh</label>
                            <input
                                type="text" value={profile.nickname || ''} maxLength={40}
                                onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                                placeholder="Tên hiển thị (vd: Quý)"
                                className="w-full bg-cream-soft ring-1 p-3 rounded-2xl outline-none font-semibold text-[14px] text-ink focus:ring-2 focus:ring-orange/30 transition placeholder:text-ink-faint"
                            />
                        </div>
                        {/* GIAO DIỆN — nút icon chuyển sáng/tối (moon ↔ sun) */}
                        <div className="mt-4">
                            <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Giao diện</label>
                            <button
                                type="button"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="grid h-11 w-11 place-items-center rounded-2xl bg-cream-soft text-ink ring-1 shadow-soft hover:bg-cream-deep active:scale-95 transition-transform"
                                aria-label={theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
                                title={theme === 'dark' ? 'Giao diện tối · Nike' : 'Giao diện sáng'}
                            >
                                {theme === 'dark' ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* GIỚI TÍNH */}
                    <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center gap-3 mb-4">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lilac-soft text-xl">👤</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Giới tính</h3>
                            </div>
                        </header>
                        <div className="flex gap-1.5 p-1 bg-cream-soft rounded-2xl ring-1">
                            <button onClick={() => setProfile({...profile, gender: 'male'})} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition ${profile.gender==='male' ? 'bg-surface text-orange-deep shadow-soft ring-1' : 'text-ink-muted hover:text-ink'}`}>Nam</button>
                            <button onClick={() => setProfile({...profile, gender: 'female'})} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition ${profile.gender==='female' ? 'bg-surface text-orange-deep shadow-soft ring-1' : 'text-ink-muted hover:text-ink'}`}>Nữ</button>
                        </div>
                    </section>

                    {/* CHỈ SỐ CƠ THỂ */}
                    <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center gap-3 mb-4">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft text-xl">📏</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Chỉ số cơ thể</h3>
                            </div>
                        </header>
                        <div className="grid grid-cols-3 gap-2.5">
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Tuổi</label>
                                <div className="relative">
                                    <input type="number" value={profile.age} onChange={e=>setProfile({...profile, age:+e.target.value})} className="w-full bg-cream-soft ring-1 p-3 pr-7 rounded-2xl outline-none font-bold text-[14px] text-ink focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted">y</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Cân nặng</label>
                                <div className="relative">
                                    <input type="text" inputMode="decimal" pattern="[0-9]+([.,][0-9]+)?" value={profile.weight ?? ''} onChange={e=>setProfile({...profile, weight: parseFloat(String(e.target.value).replace(',', '.')) || 0})} className="w-full bg-cream-soft ring-1 p-3 pr-8 rounded-2xl outline-none font-bold text-[14px] text-ink focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted">kg</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Chiều cao</label>
                                <div className="relative">
                                    <input type="text" inputMode="decimal" pattern="[0-9]+([.,][0-9]+)?" value={profile.height ?? ''} onChange={e=>setProfile({...profile, height: parseFloat(String(e.target.value).replace(',', '.')) || 0})} className="w-full bg-cream-soft ring-1 p-3 pr-8 rounded-2xl outline-none font-bold text-[14px] text-ink focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted">cm</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* VẬN ĐỘNG + MỤC TIÊU */}
                    <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center gap-3 mb-4">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-clay-soft text-xl">🎯</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Lối sống</h3>
                            </div>
                        </header>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Mức độ vận động</label>
                                <div className="relative">
                                    <select value={profile.activity} onChange={e=>{ setProfile({...profile, activity:+e.target.value, isManualTarget: false}); }} className="w-full bg-cream-soft ring-1 p-3.5 pr-9 rounded-2xl font-semibold text-[13px] outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-orange/30 transition">
                                        {ACTIVITY_LEVELS.map(l => ( <option key={l.value} value={l.value}>{l.label}</option> ))}
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Mục tiêu cân nặng</label>
                                <div className="relative">
                                    <select value={profile.goal} onChange={e=>{ setProfile({...profile, goal:+e.target.value, isManualTarget: false}); }} className="w-full bg-cream-soft ring-1 p-3.5 pr-9 rounded-2xl font-semibold text-[13px] outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-orange/30 transition">
                                        {GOALS.map(l => ( <option key={l.value} value={l.value}>{l.label}</option> ))}
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CALO BUDGET — terracotta card thay vì dark */}
                    <section className="rounded-3xl bg-gradient-to-br from-orange to-orange-deep p-6 shadow-lift ring-1 ring-orange-deep/20 text-onaccent">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-onaccent/80">Năng lượng mỗi ngày</span>
                                <p className="mt-0.5 text-[11px] text-onaccent/70 font-medium">Cần khoảng</p>
                            </div>
                            <span className="text-3xl">🔥</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-1 mt-3">
                            <input type="number" value={target} onChange={e => { setProfile({ ...profile, isManualTarget: true, manualTargetKcal: parseInt(e.target.value) || 0 }); }} className="text-5xl font-bold tracking-tight bg-transparent text-center outline-none w-36 border-b-2 border-dashed border-onaccent/30 focus:border-onaccent/70 hover:border-onaccent/50 transition-colors tabular-nums text-onaccent" />
                            <span className="text-base font-medium text-onaccent/70 ml-1">kcal</span>
                        </div>
                        {profile.isManualTarget && (
                            <button onClick={() => setProfile({...profile, isManualTarget: false})} className="block mx-auto mt-3 text-[10px] text-onaccent/80 font-semibold uppercase tracking-wider bg-onaccent/15 hover:bg-onaccent/25 px-3 py-1.5 rounded-full transition tabular-nums">
                                ⟲ Trở về tự động ({calculatedTarget})
                            </button>
                        )}
                    </section>

                    {/* MACRO TÙY CHỈNH */}
                    <section className="rounded-3xl bg-surface p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-xl">🥑</span>
                                <div>
                                    <h3 className="text-[15px] font-bold tracking-tight text-ink">Tùy chỉnh Macro</h3>
                                </div>
                            </div>
                            <button onClick={() => { const nextState = !profile.isManualMacro; setProfile({...profile, isManualMacro: nextState}); if (nextState) setIsDietModalOpen(true); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ring-1 ${profile.isManualMacro ? 'bg-orange ring-orange-deep/20' : 'bg-cream-deep ring-cream-deep'}`} aria-label="Toggle macro tùy chỉnh">
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform shadow-soft ${profile.isManualMacro ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </header>

                        {profile.isManualMacro ? (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-3 bg-cream-soft ring-1 p-2.5 rounded-2xl">
                                    <span className="text-[11px] font-semibold text-ink ml-2 truncate">{profile.macroDietMode || "Tự nhập tay"}</span>
                                    <button onClick={() => setIsDietModalOpen(true)} className="text-[10px] font-semibold bg-surface px-3 py-1.5 rounded-full text-orange-deep ring-1 hover:bg-orange-soft transition active:scale-95 shrink-0">Đổi chế độ</button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep block mb-1 text-center">Protein</label>
                                        <div className="relative">
                                            <input type="number" value={profile.manualProtein} onChange={e => setProfile({...profile, manualProtein: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-cream-soft ring-1 py-2.5 pr-7 rounded-xl text-center font-bold text-[13px] outline-none focus:ring-2 focus:ring-sage/30 transition tabular-nums" />
                                            <span className="text-[9px] text-ink-muted absolute bottom-2.5 right-2.5 pointer-events-none font-medium">g</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep block mb-1 text-center">Carb</label>
                                        <div className="relative">
                                            <input type="number" value={profile.manualCarb} onChange={e => setProfile({...profile, manualCarb: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-cream-soft ring-1 py-2.5 pr-7 rounded-xl text-center font-bold text-[13px] outline-none focus:ring-2 focus:ring-clay/30 transition tabular-nums" />
                                            <span className="text-[9px] text-ink-muted absolute bottom-2.5 right-2.5 pointer-events-none font-medium">g</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep block mb-1 text-center">Fat</label>
                                        <div className="relative">
                                            <input type="number" value={profile.manualFat} onChange={e => setProfile({...profile, manualFat: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-cream-soft ring-1 py-2.5 pr-7 rounded-xl text-center font-bold text-[13px] outline-none focus:ring-2 focus:ring-lilac/30 transition tabular-nums" />
                                            <span className="text-[9px] text-ink-muted absolute bottom-2.5 right-2.5 pointer-events-none font-medium">g</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 opacity-60">
                                <div className="text-center bg-cream-soft rounded-xl py-2.5">
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep mb-0.5">Protein</p>
                                    <p className="text-[13px] font-bold tabular-nums text-ink">{Math.round((target * 0.25 / 4) * 10) / 10}<span className="text-[10px] text-ink-muted font-medium ml-0.5">g</span></p>
                                </div>
                                <div className="text-center bg-cream-soft rounded-xl py-2.5">
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep mb-0.5">Carb</p>
                                    <p className="text-[13px] font-bold tabular-nums text-ink">{Math.round((target * 0.50 / 4) * 10) / 10}<span className="text-[10px] text-ink-muted font-medium ml-0.5">g</span></p>
                                </div>
                                <div className="text-center bg-cream-soft rounded-xl py-2.5">
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep mb-0.5">Fat</p>
                                    <p className="text-[13px] font-bold tabular-nums text-ink">{Math.round((target * 0.25 / 9) * 10) / 10}<span className="text-[10px] text-ink-muted font-medium ml-0.5">g</span></p>
                                </div>
                            </div>
                        )}
                    </section>

                </main>

                <BottomNav view={view} setView={setView} />

                {/* DIET MODE MODAL */}
                {isDietModalOpen && (
                    <div className="fixed inset-0 bg-cream z-50 flex flex-col overflow-hidden max-w-md mx-auto animate-in slide-in-from-bottom-full duration-300">
                        <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm px-4 py-3 border-b border-cream-deep flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Macro</span>
                                <p className="text-sm font-bold text-ink">Chọn chế độ ăn</p>
                            </div>
                            <button onClick={() => setIsDietModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 text-ink-muted hover:bg-cream-soft hover:text-ink transition" aria-label="Đóng">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar pb-10">
                            {DIET_MODES.map((cat, idx) => (
                                <div key={idx}>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-deep mb-2.5 ml-1">{cat.category}</h4>
                                    <div className="space-y-2">
                                        {cat.items.map(mode => (
                                            <button key={mode.id} onClick={() => applyDietMode(mode)} className={`w-full text-left p-4 rounded-2xl transition active:scale-[0.98] shadow-soft ring-1 ${profile.macroDietMode === mode.name ? 'bg-orange-soft ring-orange/40' : 'bg-surface hover:ring-orange/20 hover:bg-cream-soft'}`}>
                                                <div className="flex justify-between items-center gap-2 mb-1">
                                                    <span className="text-[14px] font-bold text-ink tracking-tight">{mode.name}</span>
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider bg-cream-soft text-ink-muted px-2 py-1 rounded-lg shrink-0">{mode.label}</span>
                                                </div>
                                                <p className="text-[11px] text-ink-muted leading-relaxed">{mode.desc}</p>
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
            <div className="max-w-md mx-auto min-h-screen bg-cream pb-28 relative font-sans text-ink">
                {/* DATE NAV — slim sticky bar */}
                <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-cream-deep px-4 py-3 flex justify-between items-center">
                    <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()-1); setCurrentDate(formatDate(d)); }} className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-orange-soft hover:text-orange-deep transition" aria-label="Ngày trước">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 19l-7-7 7-7v14z"/></svg>
                    </button>
                    <div className="text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                            {currentDate === formatDate(new Date()) ? "Hôm nay" : "Ngày"}
                        </span>
                        <p className="text-sm font-bold text-ink tabular-nums">{currentDate}</p>
                    </div>
                    <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()+1); setCurrentDate(formatDate(d)); }} className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-orange-soft hover:text-orange-deep transition" aria-label="Ngày sau">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5l7 7-7 7V5z"/></svg>
                    </button>
                </header>

                <main className="p-4 space-y-5">
                    {/* GREETING */}
                    <GreetingHeader userName={profile.nickname?.trim() || "bạn"} avatarUrl={profile.avatarKey ? imgUrls[profile.avatarKey] : null} />

                    {/* CALORIE HERO — vòng tròn + hàng 2 cột (Đã nạp / Còn dư) + 3 macro bar */}
                    <DashboardCard tone="white" padding="lg" className="overflow-hidden">
                        {/* Ring zone */}
                        <div className="flex justify-center">
                            <CalorieCircle consumed={dailyKcal} target={target} />
                        </div>

                        {/* Data row — Đã nạp / Còn dư (hoặc Vượt) */}
                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-cream-deep/50 pt-4">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Đã nạp</span>
                                <p className="mt-1.5 flex items-baseline gap-1">
                                    <span className="text-[22px] font-extrabold leading-none tracking-tight text-ink tabular-nums">{Math.round(dailyKcal).toLocaleString("vi-VN")}</span>
                                    <span className="text-[11px] font-medium text-ink-faint tabular-nums">/ {Number(target).toLocaleString("vi-VN")} kcal</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${dailyKcal > target ? "text-red-500" : "text-orange-deep"}`}>
                                    {dailyKcal > target ? "Vượt" : "Còn dư"}
                                </span>
                                <p className="mt-1.5 flex items-baseline justify-end gap-1">
                                    <span className={`text-[22px] font-extrabold leading-none tracking-tight tabular-nums ${dailyKcal > target ? "text-red-500" : "text-orange-deep"}`}>
                                        {dailyKcal > target
                                            ? `+${Math.round(dailyKcal - target).toLocaleString("vi-VN")}`
                                            : Math.max(0, Math.round(target - dailyKcal)).toLocaleString("vi-VN")}
                                    </span>
                                    <span className="text-[11px] font-medium text-ink-faint tabular-nums">kcal</span>
                                </p>
                            </div>
                        </div>

                        {/* Macro zone — 3 thanh ngang */}
                        <div className="mt-4 flex gap-4 border-t border-cream-deep/50 pt-4">
                            <MacroBar kind="protein" value={dailyProtein} target={targetProtein} />
                            <MacroBar kind="carb"    value={dailyCarb}    target={targetCarb} />
                            <MacroBar kind="fat"     value={dailyFat}     target={targetFat} />
                        </div>
                    </DashboardCard>

                    <section id="add-food-section" className="rounded-3xl bg-surface p-5 shadow-soft ring-1 scroll-mt-20 md:p-6">
                        {/* Header — icon-chip pattern giống FoodLogSection */}
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-orange-deep">
                                    <IconPlus />
                                </span>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink leading-none">Thêm món</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* AI scan icon button (camera → mở tab Quét ảnh) */}
                                <button
                                    type="button"
                                    onClick={() => openScanModal('image')}
                                    className="grid h-9 w-9 place-items-center rounded-full bg-orange text-onaccent transition hover:bg-orange-deep active:scale-95 shadow-soft"
                                    aria-label="Quét ảnh món ăn bằng AI"
                                    title="Quét ảnh ✨"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                </button>
                                {/* AI text describe icon button (pencil → mở tab Mô tả) */}
                                <button
                                    type="button"
                                    onClick={() => openScanModal('text')}
                                    className="grid h-9 w-9 place-items-center rounded-full bg-orange text-onaccent transition hover:bg-orange-deep active:scale-95 shadow-soft"
                                    aria-label="Mô tả bữa ăn bằng AI"
                                    title="Mô tả ✨"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9"/>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                </button>
                                {/* Kiểm tra sản phẩm (quét mã → tra dấu hiệu thật/giả) */}
                                <button
                                    type="button"
                                    onClick={() => setBarcodeOpen(true)}
                                    className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream transition hover:bg-ink/85 active:scale-95 shadow-soft"
                                    aria-label="Kiểm tra sản phẩm bằng mã vạch"
                                    title="Kiểm tra sản phẩm"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 5v14M7.5 5v14M12 5v14M16.5 5v14M21 5v14"/>
                                    </svg>
                                </button>
                                <div className="relative">
                                    <select value={selectedMeal} onChange={e=>setSelectedMeal(e.target.value)} className="appearance-none bg-cream-soft hover:bg-cream-deep text-[11px] font-semibold text-ink py-2 pl-3.5 pr-9 rounded-full outline-none cursor-pointer ring-1 focus:ring-2 focus:ring-orange/30 transition">
                                        {MEAL_TYPES.map(m => ( <option key={m} value={m}>{m}</option> ))}
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </header>

                        {/* Tabs */}
                        <div className="mt-5 flex gap-1 p-1 bg-cream-soft rounded-2xl">
                            <button onClick={() => setTab("quick")} className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition ${tab === "quick" ? "bg-surface text-orange-deep shadow-soft ring-1" : "text-ink-muted hover:text-ink"}`}>Chọn nhanh</button>
                            <button onClick={() => setTab("custom")} className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition ${tab === "custom" ? "bg-surface text-orange-deep shadow-soft ring-1" : "text-ink-muted hover:text-ink"}`}>Nhập tay</button>
                            <button onClick={() => setTab("recipe")} className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition ${tab === "recipe" ? "bg-surface text-orange-deep shadow-soft ring-1" : "text-ink-muted hover:text-ink"}`}>Ghép món</button>
                        </div>

                        {tab === "quick" ? (
                            <div className="mt-4">
                                {/* Search */}
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"><IconSearch /></span>
                                    <input type="text" placeholder="Tìm món ăn..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-cream-soft ring-1 rounded-2xl py-3 pl-10 pr-4 text-[13px] font-medium outline-none focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition" />
                                </div>

                                {/* Food grid */}
                                <div className="mt-3 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar pb-1">
                                    {filteredFoods.map((f, idx) => (
                                        <div key={f.name + idx} className="relative group">
                                            <button onClick={() => { setSelectedFood(f); setQty(suggestQty(history, f.name, f.unit) ?? f.per); }} className={`w-full p-3.5 pr-11 rounded-2xl text-left transition ring-1 ${selectedFood?.name === f.name ? "bg-orange-soft ring-orange/30" : "bg-cream-soft ring-transparent hover:ring-cream-deep"} active:scale-[0.98]`}>
                                                <p className="truncate text-[11px] font-semibold tracking-tight text-ink mb-0.5">{f.name}</p>
                                                <p className="text-[12px] font-bold text-ink tabular-nums">{f.kcal} <span className="text-[9px] font-medium text-ink-muted">kcal/{f.per}{f.unit}</span></p>
                                            </button>
                                            <div className="absolute right-1 top-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); openLibraryEditModal(f); }} className="p-1.5 text-ink-faint hover:text-orange hover:bg-surface rounded-lg transition" aria-label="Sửa món"><IconEdit /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, foodToDelete: f, alertMessage: "" }); }} className="p-1.5 text-ink-faint hover:text-orange-deep hover:bg-surface rounded-lg transition" aria-label="Xóa món"><IconTrash /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredFoods.length === 0 && (
                                        <p className="col-span-2 text-center py-6 text-ink-muted text-[12px] italic">Không tìm thấy món ăn</p>
                                    )}
                                </div>

                                {/* Selected preview */}
                                {selectedFood && (() => {
                                    let weightInGrams = qty; const u = selectedFood.unit.toLowerCase();
                                    if (['kg', 'l', 'lít'].includes(u)) { weightInGrams = qty * 1000; }
                                    else if (['ml', 'g', 'gram'].includes(u)) { weightInGrams = qty; }
                                    else { weightInGrams = qty * (UNIT_GRAM_WEIGHTS[u] || 100); }

                                    const totalKcal = calcMacro(selectedFood.kcal, selectedFood.per, qty);
                                    const totalPro = calcMacro(selectedFood.protein, selectedFood.per, qty);
                                    const totalCarb = calcMacro(selectedFood.carb, selectedFood.per, qty);
                                    const totalFat = calcMacro(selectedFood.fat, selectedFood.per, qty);
                                    const projectedKcal = Math.round((dailyKcal + totalKcal) * 10) / 10;
                                    const projectedPro = Math.round((dailyProtein + totalPro) * 10) / 10;
                                    const projectedCarb = Math.round((dailyCarb + totalCarb) * 10) / 10;
                                    const projectedFat = Math.round((dailyFat + totalFat) * 10) / 10;

                                    return (
                                        <div className="mt-4 pt-4 border-t border-cream-deep/50 animate-in slide-in-from-top-2">
                                            <div className="rounded-2xl bg-cream-soft ring-1 p-4 mb-3">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="min-w-0 flex-1 pr-3">
                                                        <h5 className="text-[14px] font-bold tracking-tight text-ink truncate">{selectedFood.name}</h5>
                                                        <p className="text-[11px] text-ink-muted font-medium tabular-nums mt-0.5">{qty} {selectedFood.unit} · ~{Math.round(weightInGrams)}g</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-2xl font-bold text-orange-deep leading-none tabular-nums">{totalKcal}</p>
                                                        <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-wider mt-1">kcal</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-1.5">
                                                    <div className="flex-1 text-center bg-surface rounded-xl py-2 px-2 ring-1">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep">Protein</p>
                                                        <p className="text-[12px] font-bold text-ink tabular-nums mt-0.5">{totalPro}g</p>
                                                        <p className="text-[9px] text-ink-muted tabular-nums mt-1 pt-1 border-t border-cream-deep/40">{projectedPro}g</p>
                                                    </div>
                                                    <div className="flex-1 text-center bg-surface rounded-xl py-2 px-2 ring-1">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep">Carb</p>
                                                        <p className="text-[12px] font-bold text-ink tabular-nums mt-0.5">{totalCarb}g</p>
                                                        <p className="text-[9px] text-ink-muted tabular-nums mt-1 pt-1 border-t border-cream-deep/40">{projectedCarb}g</p>
                                                    </div>
                                                    <div className="flex-1 text-center bg-surface rounded-xl py-2 px-2 ring-1">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep">Fat</p>
                                                        <p className="text-[12px] font-bold text-ink tabular-nums mt-0.5">{totalFat}g</p>
                                                        <p className="text-[9px] text-ink-muted tabular-nums mt-1 pt-1 border-t border-cream-deep/40">{projectedFat}g</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chip chọn nhanh khối lượng — bấm để đổi, macro tự nhân theo */}
                                            {(() => {
                                                const u = (selectedFood.unit || "g").toLowerCase();
                                                const isMass = u === "g" || u === "ml";
                                                const presets = isMass ? [50, 100, 150, 200, 250] : [1, 2, 3];
                                                const suggested = suggestQty(history, selectedFood.name, selectedFood.unit);
                                                const showSuggestChip = suggested != null && !presets.includes(suggested);
                                                return (
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {showSuggestChip && (
                                                            <button key="suggested" onClick={() => setQty(suggested)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 transition active:scale-95 ${qty === suggested ? "bg-orange text-onaccent ring-orange-deep/20" : "bg-cream-soft text-ink-muted ring-cream-deep hover:text-ink"}`}>
                                                                ★ {suggested}{isMass ? selectedFood.unit : ""}
                                                            </button>
                                                        )}
                                                        {presets.map(v => (
                                                            <button key={v} onClick={() => setQty(v)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 transition active:scale-95 ${qty === v ? "bg-orange text-onaccent ring-orange-deep/20" : "bg-cream-soft text-ink-muted ring-cream-deep hover:text-ink"}`}>
                                                                {v}{isMass ? selectedFood.unit : ""}
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            <div className="flex items-end gap-2">
                                                <div className="w-24">
                                                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Số lượng ({selectedFood.unit})</label>
                                                    <input type="number" value={qty} step="any" min="0.1" onChange={e => setQty(parseFloat(e.target.value) || 0)} className="w-full bg-cream-soft ring-1 text-ink p-2.5 rounded-xl text-[14px] outline-none font-bold text-center focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                                </div>
                                                <button onClick={() => handleAddSelectedFood()} className="flex-1 h-11 bg-orange text-onaccent rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition hover:bg-orange-deep shadow-soft ring-1 ring-orange-deep/20">
                                                    Ghi vào nhật ký <IconPlus />
                                                </button>
                                                <button onClick={() => { setSelectedFood(null); setQty(1); }} className="grid place-items-center h-11 w-11 text-ink-faint hover:text-orange-deep bg-cream-soft ring-1 rounded-xl transition" aria-label="Hủy">
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : tab === "custom" ? (
                            <div className="mt-4 space-y-2.5">
                                <input placeholder="Tên món ăn (vd: Gà rán...)" value={customFood.name} onChange={e => setCustomFood(p=>({...p, name:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition" />
                                <div className="grid grid-cols-2 gap-2.5">
                                    <input type="number" placeholder="Số lượng" value={customFood.quantity} onChange={e => setCustomFood(p=>({...p, quantity:e.target.value}))} className="bg-cream-soft ring-1 p-3.5 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition tabular-nums" />
                                    <div className="relative">
                                        <select value={customFood.unit} onChange={e => setCustomFood(p=>({...p, unit:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 pr-9 rounded-2xl text-[13px] outline-none font-semibold cursor-pointer appearance-none focus:ring-2 focus:ring-orange/30 transition">
                                            <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="cái">cái</option><option value="chiếc">chiếc</option><option value="bát">bát</option><option value="tô">tô</option><option value="đĩa">đĩa</option><option value="cuốn">cuốn</option><option value="ổ">ổ</option><option value="suất">suất</option><option value="gói">gói</option><option value="miếng">miếng</option><option value="ly">ly</option><option value="quả">quả</option>
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="relative"><input type="number" placeholder="Kcal" value={customFood.kcal} onChange={e => setCustomFood(p=>({...p, kcal:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 pr-12 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition tabular-nums" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-orange uppercase tracking-wider">kcal</span></div>
                                    <div className="relative"><input type="number" placeholder="Protein" value={customFood.protein} onChange={e => setCustomFood(p=>({...p, protein:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 pr-12 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-sage/30 placeholder:text-ink-faint transition tabular-nums" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-sage-deep uppercase tracking-wider">Pro</span></div>
                                    <div className="relative"><input type="number" placeholder="Carb" value={customFood.carb} onChange={e => setCustomFood(p=>({...p, carb:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 pr-12 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-clay/30 placeholder:text-ink-faint transition tabular-nums" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-clay-deep uppercase tracking-wider">Carb</span></div>
                                    <div className="relative"><input type="number" placeholder="Fat" value={customFood.fat} onChange={e => setCustomFood(p=>({...p, fat:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 pr-12 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-lilac/30 placeholder:text-ink-faint transition tabular-nums" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-lilac-deep uppercase tracking-wider">Fat</span></div>
                                </div>
                                {customFood.name.trim() !== "" && parseFloat(customFood.kcal) > 0 && (
                                    <button onClick={addCustom} className="w-full bg-orange text-onaccent p-3.5 rounded-2xl font-bold text-[13px] mt-3 active:scale-95 transition shadow-soft ring-1 ring-orange-deep/20 hover:bg-orange-deep animate-in slide-in-from-bottom-2 fade-in duration-300">
                                        Xác nhận thêm
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {/* Tên món ghép */}
                                <input
                                    placeholder="Tên món (vd: Bánh yến mạch...)"
                                    value={recipe.name}
                                    onChange={e => setRecipe(p => ({ ...p, name: e.target.value }))}
                                    className={`w-full bg-cream-soft p-3.5 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 placeholder:text-ink-faint transition ring-1 ${recipeNameTaken ? "ring-red-300 focus:ring-red-300/60" : "focus:ring-orange/30"}`}
                                />
                                {recipeNameTaken && (
                                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 -mt-1 ml-1">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        Đã có món tên này trong thư viện
                                    </p>
                                )}

                                {/* Tìm + thêm nguyên liệu */}
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"><IconSearch /></span>
                                    <input type="text" placeholder="Thêm nguyên liệu từ thư viện..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-cream-soft ring-1 rounded-2xl py-3 pl-10 pr-4 text-[13px] font-medium outline-none focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition" />
                                </div>
                                {searchQuery.trim() && (
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                                        {filteredFoods.map((f, idx) => (
                                            <button key={f.name + idx} onClick={() => addRecipeIngredient(f)} className="p-3 rounded-2xl text-left transition ring-1 bg-cream-soft ring-transparent hover:ring-cream-deep active:scale-[0.98]">
                                                <p className="truncate text-[11px] font-semibold tracking-tight text-ink mb-0.5">{f.name}</p>
                                                <p className="text-[11px] font-bold text-ink tabular-nums">{f.kcal} <span className="text-[9px] font-medium text-ink-muted">kcal/{f.per}{f.unit}</span></p>
                                            </button>
                                        ))}
                                        {filteredFoods.length === 0 && <p className="col-span-2 text-center py-4 text-ink-muted text-[12px] italic">Không tìm thấy món ăn</p>}
                                    </div>
                                )}

                                {/* Danh sách nguyên liệu đã thêm */}
                                {recipe.ingredients.length === 0 ? (
                                    <p className="text-center py-6 text-ink-muted text-[12px] italic">Tìm và thêm nguyên liệu để ghép thành món mới</p>
                                ) : (
                                    <div className="space-y-2">
                                        {recipe.ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-cream-soft ring-1 rounded-2xl p-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[12px] font-semibold text-ink">{ing.name}</p>
                                                    <p className="text-[10px] text-ink-muted tabular-nums">{calcMacro(ing.kcal, ing.per, ing.qty)} kcal</p>
                                                </div>
                                                <input type="number" value={ing.qty} step="any" min="0" onChange={e => updateRecipeIngredientQty(idx, parseFloat(e.target.value) || 0)} className="w-16 bg-surface ring-1 p-2 rounded-xl text-[13px] outline-none font-bold text-center focus:ring-2 focus:ring-orange/30 tabular-nums" />
                                                <span className="text-[10px] font-semibold text-ink-muted w-9 shrink-0">{ing.unit}</span>
                                                <button onClick={() => removeRecipeIngredient(idx)} className="grid place-items-center h-8 w-8 text-ink-faint hover:text-orange-deep rounded-lg transition shrink-0" aria-label="Xóa nguyên liệu"><IconTrash /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tổng + quy về /100g */}
                                {recipe.ingredients.length > 0 && (
                                    <div className="rounded-2xl bg-cream-soft ring-1 p-4 space-y-3">
                                        {/* Khối lượng món (sửa được) */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-semibold text-ink-muted">Khối lượng món (g)</span>
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={Math.round(recipeWeight)} step="any" min="1" onChange={e => setRecipe(p => ({ ...p, weightOverride: parseFloat(e.target.value) || 0 }))} className="w-20 bg-surface ring-1 p-2 rounded-xl text-[13px] outline-none font-bold text-center focus:ring-2 focus:ring-orange/30 tabular-nums" />
                                                {recipe.weightOverride != null && (
                                                    <button onClick={() => setRecipe(p => ({ ...p, weightOverride: null }))} className="text-[10px] font-semibold text-orange-deep hover:underline whitespace-nowrap">Auto ({recipeTotals.autoWeight}g)</button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bảng Tổng + /100g */}
                                        <div className="rounded-xl bg-surface ring-1 overflow-hidden">
                                            <div className="grid grid-cols-5 text-center text-[9px] font-semibold uppercase tracking-wider py-1.5 bg-cream-soft/60">
                                                <span></span><span className="text-ink-muted">Kcal</span><span className="text-sage-deep">Pro</span><span className="text-clay-deep">Carb</span><span className="text-lilac-deep">Fat</span>
                                            </div>
                                            <div className="grid grid-cols-5 text-center items-center py-2">
                                                <span className="text-[10px] font-semibold text-ink-muted">Tổng</span>
                                                <span className="text-[13px] font-bold text-ink tabular-nums">{recipeTotals.kcal}</span>
                                                <span className="text-[12px] font-semibold text-ink tabular-nums">{recipeTotals.protein}</span>
                                                <span className="text-[12px] font-semibold text-ink tabular-nums">{recipeTotals.carb}</span>
                                                <span className="text-[12px] font-semibold text-ink tabular-nums">{recipeTotals.fat}</span>
                                            </div>
                                            <div className="grid grid-cols-5 text-center items-center py-2 border-t border-cream-deep/40 bg-orange-soft/30">
                                                <span className="text-[10px] font-semibold text-orange-deep">/100g</span>
                                                <span className="text-[13px] font-bold text-orange-deep tabular-nums">{recipePer100Macros.kcal}</span>
                                                <span className="text-[12px] font-semibold text-ink tabular-nums">{recipePer100Macros.protein}</span>
                                                <span className="text-[12px] font-semibold text-ink tabular-nums">{recipePer100Macros.carb}</span>
                                                <span className="text-[12px] font-semibold text-ink tabular-nums">{recipePer100Macros.fat}</span>
                                            </div>
                                        </div>

                                        {/* Lưu */}
                                        {recipe.name.trim() !== "" && (
                                            <button onClick={saveRecipeToLibrary} disabled={recipeNameTaken} className={`w-full p-3.5 rounded-2xl font-bold text-[13px] transition shadow-soft ring-1 ${recipeNameTaken ? "bg-cream-deep text-ink-faint ring-cream-deep cursor-not-allowed" : "bg-orange text-onaccent ring-orange-deep/20 hover:bg-orange-deep active:scale-95"}`}>
                                                {recipeNameTaken ? "Đổi tên khác để lưu" : "Lưu vào thư viện"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 4 MEAL SECTIONS — dùng FoodLogSection từ dashboard, có DnD */}
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between px-1">
                            <h2 className="text-[15px] font-bold tracking-tight text-ink">Nhật ký bữa ăn</h2>
                            {undoStack.length > 0 && (
                                <button onClick={handleUndo} className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-deep hover:bg-orange-soft px-3 py-1 rounded-full transition">
                                    <IconUndo /> Hoàn tác
                                </button>
                            )}
                        </div>

                        {selectionMode && (
                            <div className="flex items-center justify-between rounded-full bg-orange-soft px-4 py-2 ring-1 ring-orange-deep/30 animate-in slide-in-from-top-2 fade-in duration-200">
                                <span className="text-[12px] font-bold text-orange-deep">
                                    Đã chọn {selectedItemIds.size} món
                                </span>
                                <div className="flex items-center gap-3">
                                    {selectedItemIds.size > 0 && (
                                        <button
                                            onClick={bulkDeleteSelected}
                                            className="text-[11px] font-semibold text-red-500 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                    <button
                                        onClick={clearSelection}
                                        className="text-[11px] font-semibold text-orange-deep hover:underline"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}

                        <DndContext
                            sensors={journalSensors}
                            collisionDetection={closestCenter}
                            onDragStart={(e) => setActiveDragId(e.active.id)}
                            onDragMove={(e) => {
                                const isOver = e.delta.x > 120;
                                if (isOver !== dragOverDelete) setDragOverDelete(isOver);
                            }}
                            onDragEnd={async (e) => {
                                setActiveDragId(null);
                                setDragOverDelete(false);
                                const { active, over, delta } = e;
                                if (delta.x > 120) {
                                    if (selectedItemIds.has(active.id) && selectedItemIds.size > 0) {
                                        await bulkDeleteSelected();
                                    } else {
                                        removeFood(active.id);
                                    }
                                    return;
                                }
                                if (!over) return;
                                const targetMeal = over.id;
                                const ids = selectedItemIds.has(active.id)
                                    ? selectedItemIds
                                    : new Set([active.id]);
                                bulkUpdateMeals(ids, targetMeal);
                                clearSelection();
                            }}
                            onDragCancel={() => { setActiveDragId(null); setDragOverDelete(false); }}
                        >
                            {MEAL_TYPES.map((meal, i) => (
                                <div key={meal} className="animate-fade-rise" style={{ animationDelay: `${i * 70}ms` }}>
                                    <FoodLogSection
                                        mealName={meal}
                                        items={dailyLog.filter(it => it.meal === meal)}
                                        thumbUrls={imgUrls}
                                        onViewImage={setLightboxUrl}
                                        onAdd={(m) => {
                                            setSelectedMeal(m);
                                            if (typeof document !== "undefined") {
                                                document.getElementById("add-food-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }
                                        }}
                                        onRemove={removeFood}
                                        selectedItemIds={selectedItemIds}
                                        selectionMode={selectionMode}
                                        onLongPress={handleLongPress}
                                        onToggleSelect={toggleItemSelected}
                                        onToggleSelectAll={toggleSelectAllInMeal}
                                        mealTypes={MEAL_TYPES}
                                        moveMenuOpen={openMoveMenu === meal}
                                        onToggleMoveMenu={() => setOpenMoveMenu(prev => prev === meal ? null : meal)}
                                        onCloseMoveMenu={() => setOpenMoveMenu(null)}
                                        onBulkMove={(targetMeal) => {
                                            bulkUpdateMeals(selectedItemIds, targetMeal);
                                            clearSelection();
                                        }}
                                    />
                                </div>
                            ))}

                            <DragOverlay dropAnimation={null}>
                                {activeDragId ? (() => {
                                    const dragged = dailyLog.find(it => it.id === activeDragId);
                                    if (!dragged) return null;
                                    const count = selectedItemIds.has(activeDragId) ? selectedItemIds.size : 1;
                                    return dragOverDelete ? (
                                        <div className="rounded-2xl bg-red-50 px-4 py-3 shadow-lift ring-2 ring-red-300/60 cursor-grabbing">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold text-red-500">Thả để xóa</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl bg-surface px-4 py-3 shadow-lift ring-2 ring-orange-deep/40 cursor-grabbing">
                                            <div className="flex items-center gap-2">
                                                <span className="grid h-6 min-w-6 px-2 place-items-center rounded-full bg-orange-deep text-[11px] font-bold text-onaccent tabular-nums">
                                                    {count}
                                                </span>
                                                <span className="text-[13px] font-semibold text-ink truncate max-w-[200px]">
                                                    {count > 1 ? `${dragged.name} +${count - 1}` : dragged.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })() : null}
                            </DragOverlay>
                        </DndContext>

                        {dailyLog.length === 0 && (
                            <p className="text-center text-ink-faint text-[11px] uppercase font-semibold italic py-6 border border-dashed border-cream-deep rounded-3xl tracking-wider">
                                Khi nào sẵn sàng, ghi món vào nhé
                            </p>
                        )}
                    </div>

                    {/* --- SCANNER MÃ VẠCH --- */}
                    {barcodeOpen && (
                        <BarcodeScanner onDetect={handleBarcodeDetected} onClose={() => setBarcodeOpen(false)} />
                    )}

                    {/* --- ĐANG TRA CỨU SAU KHI QUÉT --- */}
                    {barcodeLoading && (
                        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center max-w-md mx-auto animate-in fade-in duration-150">
                            <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface px-8 py-7 shadow-2xl ring-1">
                                <svg className="animate-spin text-orange" width="30" height="30" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-90" d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <p className="text-[13px] font-bold text-ink">Đang kiểm tra sản phẩm…</p>
                            </div>
                        </div>
                    )}

                    {/* --- KẾT QUẢ KIỂM TRA SẢN PHẨM --- */}
                    {barcodeResult && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setBarcodeResult(null)}>
                            <div className="bg-surface rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[15px] font-bold tracking-tight text-ink">Kiểm tra sản phẩm</h3>
                                    <button onClick={() => setBarcodeResult(null)} className="grid h-8 w-8 place-items-center rounded-full bg-cream-soft ring-1 text-ink-muted hover:text-ink transition" aria-label="Đóng">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>

                                {barcodeResult.type === "qr" ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 rounded-2xl bg-sage-soft ring-1 ring-sage/30 p-4">
                                            <span className="text-xl">🔗</span>
                                            <p className="text-[12px] font-semibold text-sage-deep leading-relaxed">Đây là mã QR / tem chống giả. Mở liên kết để xác thực trên trang của nhà sản xuất.</p>
                                        </div>
                                        <p className="text-[11px] text-ink-muted break-all bg-cream-soft rounded-xl p-3 ring-1">{barcodeResult.url}</p>
                                        <a href={barcodeResult.url} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-orange text-onaccent p-3.5 rounded-2xl font-bold text-[13px] active:scale-95 transition hover:bg-orange-deep shadow-soft">
                                            Mở trang xác thực
                                        </a>
                                        <p className="text-[10px] text-ink-faint text-center italic px-2">Chỉ mở nếu bạn tin tưởng nguồn. Trang xác thực phải là tên miền chính thức của hãng.</p>
                                    </div>
                                ) : barcodeResult.type === "invalid" ? (
                                    <div className="rounded-2xl bg-orange-soft ring-1 ring-orange/30 p-4">
                                        <p className="text-[13px] font-bold text-orange-deep mb-1">Không nhận dạng được mã</p>
                                        <p className="text-[12px] text-ink-muted leading-relaxed break-all">Nội dung quét: {barcodeResult.code || "(trống)"} — không phải mã vạch sản phẩm hay liên kết xác thực.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Dấu hiệu mã */}
                                        <div className="rounded-2xl bg-cream-soft ring-1 p-4 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Mã vạch</span>
                                                <span className="text-[13px] font-bold text-ink tabular-nums">{barcodeResult.code}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Hợp lệ (check digit)</span>
                                                <span className={`text-[12px] font-bold ${barcodeResult.valid ? "text-sage-deep" : "text-orange-deep"}`}>
                                                    {barcodeResult.valid ? "✓ Hợp lệ" : "✗ Không hợp lệ"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Nước đăng ký mã</span>
                                                <span className="text-[12px] font-bold text-ink">{barcodeResult.country || "—"}</span>
                                            </div>
                                        </div>

                                        {/* Sản phẩm đăng ký trong CSDL */}
                                        <div className="rounded-2xl bg-surface ring-1 p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-2">Sản phẩm đăng ký (cơ sở dữ liệu mở)</p>
                                            {barcodeResult.product ? (
                                                <div className="flex items-center gap-3">
                                                    {barcodeResult.product.image && (
                                                        <img src={barcodeResult.product.image} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-bold text-ink truncate">{barcodeResult.product.name}</p>
                                                        {barcodeResult.product.brand && <p className="text-[11px] text-ink-muted truncate">{barcodeResult.product.brand}</p>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-[12px] text-ink-muted italic">Không có trong cơ sở dữ liệu — chưa thể đối chiếu tên/thương hiệu.</p>
                                            )}
                                            <p className="text-[10px] text-ink-faint mt-2 leading-relaxed">So tên/thương hiệu trên với sản phẩm bạn đang cầm. Nếu lệch → dấu hiệu đáng ngờ.</p>
                                        </div>

                                        {/* Cảnh báo bắt buộc */}
                                        <div className="rounded-2xl bg-orange-soft ring-1 ring-orange/30 p-4">
                                            <p className="text-[11px] font-semibold text-orange-deep leading-relaxed">
                                                ⚠ Đây chỉ là <span className="font-bold">thông tin mã vạch</span>, KHÔNG khẳng định hàng thật/giả — hàng giả có thể in y mã. Để chắc chắn: kiểm tra <span className="font-bold">tem chống giả của hãng</span>, bao bì, hóa đơn và nơi mua.
                                            </p>
                                        </div>

                                        {/* Tra sâu hơn */}
                                        <div className="flex gap-2">
                                            <a href={`https://www.gs1.org/services/verified-by-gs1`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-cream-soft ring-1 text-ink p-2.5 rounded-xl font-semibold text-[11px] hover:bg-cream-deep transition">Verified by GS1</a>
                                            <a href={`https://icheck.com.vn`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-cream-soft ring-1 text-ink p-2.5 rounded-xl font-semibold text-[11px] hover:bg-cream-deep transition">iCheck</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* LIGHTBOX — xem ảnh món phóng to */}
                    {lightboxUrl && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                            onClick={() => setLightboxUrl(null)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lightboxUrl} alt="Ảnh món" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" />
                            <button
                                onClick={() => setLightboxUrl(null)}
                                className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-ink shadow-lift active:scale-95"
                                aria-label="Đóng"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                    )}

                    {/* --- MODAL QUÉT ẢNH MÓN ĂN BẰNG AI --- */}
                    {scanModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                            <div className="bg-surface rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-[16px] font-bold text-ink tracking-tight">
                                        {scanMode === 'image' ? '📷 Quét ảnh món ăn ✨' : '✍️ Mô tả bữa ăn ✨'}
                                    </h3>
                                    <button onClick={closeScanModal} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep active:scale-95 transition" aria-label="Đóng">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>

                                {!scanState.preview && !scanState.items ? (
                                    scanMode === 'image' ? (
                                        /* STEP 1a: Image mode — chưa chọn ảnh */
                                        <div className="space-y-3">
                                            <label className="block">
                                                <input type="file" accept="image/*" capture="environment" onChange={handleScanPick} className="hidden" />
                                                <span className="block w-full p-5 rounded-2xl bg-orange-soft text-orange-deep text-center font-semibold cursor-pointer hover:bg-orange-soft/80 transition flex items-center justify-center gap-2">
                                                    📷 Chụp ảnh món ăn
                                                </span>
                                            </label>
                                            <label className="block">
                                                <input type="file" accept="image/*" onChange={handleScanPick} className="hidden" />
                                                <span className="block w-full p-5 rounded-2xl bg-cream-soft text-ink text-center font-semibold cursor-pointer hover:bg-cream-deep transition flex items-center justify-center gap-2">
                                                    🖼 Chọn từ thư viện
                                                </span>
                                            </label>
                                            <p className="text-[12px] text-ink-faint text-center italic px-4 mt-4">
                                                AI ước lượng món ăn bày biện. Với sản phẩm đóng gói, chụp rõ <span className="font-semibold text-ink-muted">bảng thành phần dinh dưỡng</span> để lấy đúng số nhà sản xuất công bố.
                                            </p>
                                            {scanState.error && <p className="text-[12px] text-orange-deep text-center mt-2">{scanState.error}</p>}
                                        </div>
                                    ) : (
                                        /* STEP 1b: Text mode — gõ mô tả */
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                {TEXT_SUGGESTIONS.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setScanText(s)}
                                                        className="w-full text-left bg-cream-soft rounded-2xl p-3.5 text-[12px] text-ink-muted hover:bg-cream-deep transition leading-relaxed"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-ink-faint text-center italic">
                                                Bấm 1 gợi ý để điền nhanh, hoặc gõ mô tả của bạn
                                            </p>
                                            <textarea
                                                value={scanText}
                                                onChange={e => setScanText(e.target.value)}
                                                placeholder="Bạn đã ăn gì? VD: 150g cơm với 100g ức gà luộc..."
                                                rows={3}
                                                maxLength={1000}
                                                className="w-full bg-cream-soft p-3.5 rounded-2xl text-[13px] outline-none resize-none focus:ring-2 focus:ring-orange/30"
                                            />
                                            <button
                                                onClick={handleTextAnalyze}
                                                disabled={!scanText.trim() || scanState.loading}
                                                className="w-full h-12 bg-orange text-onaccent rounded-xl font-bold disabled:opacity-50 transition hover:bg-orange-deep flex items-center justify-center gap-2"
                                            >
                                                {scanState.loading ? (
                                                    <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Đang phân tích...</>
                                                ) : "✨ Phân tích bằng AI"}
                                            </button>
                                            {scanState.error && <p className="text-[12px] text-orange-deep text-center">{scanState.error}</p>}
                                        </div>
                                    )
                                ) : !scanState.items ? (
                                    /* STEP 2: Có ảnh, chưa analyze */
                                    <div className="space-y-3">
                                        <img src={scanState.preview} alt="Món vừa chọn" className="w-full max-h-72 object-cover rounded-2xl ring-1" />
                                        <div>
                                            <textarea
                                                value={scanDesc}
                                                onChange={e => setScanDesc(e.target.value)}
                                                placeholder="Mô tả món (không bắt buộc) — giúp AI nhận diện chính xác hơn. VD: phở bò tái, bánh mì thịt nướng..."
                                                rows={2}
                                                maxLength={300}
                                                className="w-full bg-cream-soft ring-1 p-3 rounded-2xl text-[12px] outline-none resize-none focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleScanAnalyze}
                                                disabled={scanState.loading}
                                                className="flex-1 h-12 bg-orange text-onaccent rounded-xl font-bold disabled:opacity-50 transition hover:bg-orange-deep flex items-center justify-center gap-2"
                                            >
                                                {scanState.loading ? (
                                                    <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Đang phân tích...</>
                                                ) : "✨ Phân tích bằng AI"}
                                            </button>
                                            <button
                                                onClick={handleScanReset}
                                                disabled={scanState.loading}
                                                className="grid place-items-center h-12 w-12 text-ink-faint bg-cream-soft rounded-xl hover:bg-cream-deep transition disabled:opacity-50"
                                                aria-label="Chọn ảnh khác"
                                            >
                                                <IconTrash />
                                            </button>
                                        </div>
                                        {scanState.error && <p className="text-[12px] text-orange-deep text-center">{scanState.error}</p>}
                                    </div>
                                ) : (() => {
                                    /* STEP 3: Đã có items — render list multi-item */
                                    const items = scanState.items;
                                    if (items.length === 0) {
                                        return (
                                            <div className="space-y-3 text-center">
                                                <p className="text-[13px] text-ink-muted italic py-4">Không nhận diện được món nào trong ảnh.</p>
                                                <button onClick={handleScanReset} className="w-full h-12 bg-cream-soft text-ink rounded-xl font-semibold">
                                                    Thử ảnh khác
                                                </button>
                                            </div>
                                        );
                                    }
                                    const checkedCount = items.filter(it => it._checked).length;
                                    return (
                                        <div className="space-y-3">
                                            {scanState.preview && (
                                                <img src={scanState.preview} alt="Ảnh đã quét" className="w-full max-h-36 object-cover rounded-2xl ring-1" />
                                            )}
                                            <p className="text-[11px] text-ink-muted text-center">
                                                Phát hiện <span className="font-semibold text-ink">{items.length}</span> món · bỏ chọn món không muốn ghi
                                            </p>

                                            {items.map((item, idx) => {
                                                const baseGrams = item.per || 1;
                                                const q = parseFloat(item._qty) || 0;
                                                const factor = q / baseGrams;
                                                const scaled = {
                                                    kcal:    Math.round(item.kcal * factor * 10) / 10,
                                                    protein: Math.round(item.protein * factor * 10) / 10,
                                                    carb:    Math.round(item.carb * factor * 10) / 10,
                                                    fat:     Math.round(item.fat * factor * 10) / 10,
                                                };
                                                const showFuzzyHint = item.source === "library" && item.libraryName && item.aiPredictedName && item.aiPredictedName !== item.libraryName;
                                                return (
                                                    <div key={idx} className={`rounded-2xl ring-1 p-4 relative transition ${item._checked ? "bg-cream-soft" : "bg-cream-soft/40 opacity-60"}`}>
                                                        {/* Badge top-left */}
                                                        {!item._editMode && (
                                                            item.source === "library" ? (
                                                                <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-soft text-sage-deep ring-1 ring-sage/30">
                                                                    📚 Thư viện
                                                                </span>
                                                            ) : item.source === "label" ? (
                                                                <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-mist-soft text-mist-deep ring-1 ring-mist/30">
                                                                    🏷️ Từ nhãn SP
                                                                </span>
                                                            ) : (
                                                                <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-clay-soft text-clay-deep ring-1 ring-clay/30">
                                                                    ✨ AI ước tính
                                                                </span>
                                                            )
                                                        )}
                                                        {/* Toggle chọn/bỏ — checked: trash (loại khỏi danh sách); unchecked: plus (thêm lại) */}
                                                        {!item._editMode && (
                                                            <button
                                                                onClick={() => updateScanItem(idx, { _checked: !item._checked })}
                                                                className={`absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full transition shadow-sm ${item._checked ? "bg-orange text-onaccent hover:bg-orange-deep" : "bg-surface text-ink-muted ring-1 ring-cream-deep hover:text-orange-deep hover:ring-orange/40"}`}
                                                                aria-label={item._checked ? "Bỏ chọn món này" : "Thêm món này lại"}
                                                                title={item._checked ? "Bỏ chọn" : "Thêm lại"}
                                                            >
                                                                {item._checked ? <IconTrash /> : <IconPlus />}
                                                            </button>
                                                        )}
                                                        {/* Edit pencil — dưới checkbox */}
                                                        {!item._editMode && item._checked && (
                                                            <button
                                                                onClick={() => updateScanItem(idx, { _editMode: true })}
                                                                className="absolute top-12 right-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-surface text-orange-deep ring-1 ring-orange/30 hover:bg-orange-soft transition shadow-sm"
                                                                aria-label="Chỉnh sửa"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                            </button>
                                                        )}

                                                        {item._editMode ? (
                                                            <div className="space-y-2.5">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider">Tên món</label>
                                                                        <button
                                                                            onClick={() => submitScanItemEdit(idx)}
                                                                            className="text-[11px] font-semibold text-orange-deep hover:underline inline-flex items-center gap-1"
                                                                        >
                                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                                            Xong
                                                                        </button>
                                                                    </div>
                                                                    <input type="text" value={item.name} onChange={e => updateScanItem(idx, { name: e.target.value })} className="w-full bg-surface p-2.5 rounded-xl text-[13px] font-semibold outline-none focus:ring-2 focus:ring-orange/30" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Khẩu phần (g/ml)</label>
                                                                        <input type="number" value={item.per} step="any" min="1" onChange={e => updateScanItem(idx, { per: parseFloat(e.target.value) || 1 })} className="w-full bg-surface p-2.5 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Kcal / khẩu phần</label>
                                                                        <input type="number" value={item.kcal} step="any" min="0" onChange={e => updateScanItem(idx, { kcal: parseFloat(e.target.value) || 0 })} className="w-full bg-surface p-2.5 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep block mb-1 text-center">Protein</label>
                                                                        <input type="number" value={item.protein} step="any" min="0" onChange={e => updateScanItem(idx, { protein: parseFloat(e.target.value) || 0 })} className="w-full bg-surface p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-sage/30" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep block mb-1 text-center">Carb</label>
                                                                        <input type="number" value={item.carb} step="any" min="0" onChange={e => updateScanItem(idx, { carb: parseFloat(e.target.value) || 0 })} className="w-full bg-surface p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-clay/30" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep block mb-1 text-center">Fat</label>
                                                                        <input type="number" value={item.fat} step="any" min="0" onChange={e => updateScanItem(idx, { fat: parseFloat(e.target.value) || 0 })} className="w-full bg-surface p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-lilac/30" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex justify-between items-start mb-3 gap-3 pr-10 pt-7">
                                                                    <div className="min-w-0 flex-1">
                                                                        <h5 className="text-[15px] font-bold tracking-tight text-ink truncate">{item.name}</h5>
                                                                        <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
                                                                            Khẩu phần ~{item.per}{(item.unit === "g" || item.unit === "ml") ? item.unit : ` ${item.unit}`}
                                                                            {showFuzzyHint && (
                                                                                <span className="text-sage-deep font-medium"> · Khớp với "{item.libraryName}"</span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <p className="text-3xl font-bold text-orange-deep tabular-nums leading-none">{scaled.kcal}</p>
                                                                        <p className="text-[10px] text-ink-muted uppercase tracking-wider mt-1">kcal</p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-1.5">
                                                                    <div className="text-center bg-surface rounded-xl py-2 ring-1">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep">Protein</p>
                                                                        <p className="text-[13px] font-bold tabular-nums mt-0.5">{scaled.protein}g</p>
                                                                    </div>
                                                                    <div className="text-center bg-surface rounded-xl py-2 ring-1">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep">Carb</p>
                                                                        <p className="text-[13px] font-bold tabular-nums mt-0.5">{scaled.carb}g</p>
                                                                    </div>
                                                                    <div className="text-center bg-surface rounded-xl py-2 ring-1">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep">Fat</p>
                                                                        <p className="text-[13px] font-bold tabular-nums mt-0.5">{scaled.fat}g</p>
                                                                    </div>
                                                                </div>
                                                                {item._checked && (
                                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                                        <div>
                                                                            <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Bữa</label>
                                                                            <div className="relative">
                                                                                <select value={item._meal} onChange={e => updateScanItem(idx, { _meal: e.target.value })} className="w-full bg-surface p-2 pr-8 rounded-xl text-[12px] font-semibold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-orange/30">
                                                                                    {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                                                                                </select>
                                                                                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Số lượng ({item.unit || "g"})</label>
                                                                            <input type="number" value={item._qty} step="any" min="0" onChange={e => updateScanItem(idx, { _qty: parseFloat(e.target.value) || 0 })} className="w-full bg-surface p-2 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {item.note && item._checked && (
                                                                    <div className="mt-3 pt-3 border-t border-cream-deep/50">
                                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1">Bạn có biết?</p>
                                                                        <p className="text-[11px] text-ink leading-relaxed">{String(item.note).replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, "")}</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {scanMode === 'image' && (
                                                <div className="rounded-2xl bg-cream-soft ring-1 p-3.5 space-y-2.5">
                                                    <p className="text-[11px] font-semibold text-ink-muted">Chưa đúng món? Mô tả lại để nhận diện chính xác hơn:</p>
                                                    <textarea
                                                        value={scanDesc}
                                                        onChange={e => setScanDesc(e.target.value)}
                                                        placeholder="VD: đây là bún chả Hà Nội, có chả viên và nước chấm..."
                                                        rows={2}
                                                        maxLength={300}
                                                        className="w-full bg-surface ring-1 p-3 rounded-xl text-[12px] outline-none resize-none focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition"
                                                    />
                                                    <button
                                                        onClick={handleScanAnalyze}
                                                        disabled={scanState.loading || !scanDesc.trim()}
                                                        className="w-full h-10 bg-ink text-cream rounded-xl font-bold text-[12px] transition hover:bg-ink/85 disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {scanState.loading ? (
                                                            <><span className="inline-block w-3.5 h-3.5 border-2 border-cream border-t-transparent rounded-full animate-spin"/> Đang phân tích lại...</>
                                                        ) : "↻ Phân tích lại với mô tả"}
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={handleScanReset}
                                                    className="px-4 h-12 text-ink bg-cream-soft rounded-xl font-semibold text-[13px] transition hover:bg-cream-deep"
                                                >
                                                    {scanMode === 'image' ? 'Chụp lại' : 'Nhập lại'}
                                                </button>
                                                <button
                                                    onClick={addAllScannedItems}
                                                    disabled={checkedCount === 0}
                                                    className="flex-1 h-12 bg-orange text-onaccent rounded-xl font-bold text-[13px] transition hover:bg-orange-deep shadow-soft flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Thêm {checkedCount} món <IconPlus />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* --- MODAL CHỈNH SỬA THƯ VIỆN MÓN ĂN --- */}
                    {editLibraryModal.isOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-surface rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
                                 <button onClick={() => setEditLibraryModal({ isOpen: false, item: null, originalName: "" })} className="absolute top-4 right-4 text-ink-muted hover:text-ink w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-deep transition-colors font-black">✕</button>
                                <h3 className="text-sm font-black text-ink mb-4 uppercase tracking-widest text-center">Sửa thư viện món</h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-black text-ink-muted uppercase block mb-1">Tên món</label>
                                        <input type="text" value={libraryEditForm.name} onChange={e => setLibraryEditForm({...libraryEditForm, name: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                         <div>
                                            <label className="text-[10px] font-black text-ink-muted uppercase block mb-1">Định lượng (per)</label>
                                            <input type="number" step="any" value={libraryEditForm.per} onChange={e => setLibraryEditForm({...libraryEditForm, per: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange/20" />
                                         </div>
                                         <div>
                                            <label className="text-[10px] font-black text-ink-muted uppercase block mb-1">Đơn vị</label>
                                            <select value={libraryEditForm.unit} onChange={e => setLibraryEditForm({...libraryEditForm, unit: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange/20 appearance-none cursor-pointer">
                                                <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="cái">cái</option><option value="chiếc">chiếc</option><option value="bát">bát</option><option value="tô">tô</option><option value="đĩa">đĩa</option><option value="cuốn">cuốn</option><option value="ổ">ổ</option><option value="suất">suất</option><option value="gói">gói</option><option value="miếng">miếng</option><option value="ly">ly</option><option value="quả">quả</option>
                                            </select>
                                         </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-orange-400 uppercase block mb-1">Kcal</label>
                                            <input type="number" step="any" value={libraryEditForm.kcal} onChange={e => setLibraryEditForm({...libraryEditForm, kcal: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange-500/20" />
                                        </div>
                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-orange uppercase block mb-1">Protein</label>
                                            <input type="number" step="any" value={libraryEditForm.protein} onChange={e => setLibraryEditForm({...libraryEditForm, protein: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange/20" />
                                        </div>
                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-mist uppercase block mb-1">Carb</label>
                                            <input type="number" step="any" value={libraryEditForm.carb} onChange={e => setLibraryEditForm({...libraryEditForm, carb: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-mist-deep/20" />
                                        </div>
                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-clay uppercase block mb-1">Fat</label>
                                            <input type="number" step="any" value={libraryEditForm.fat} onChange={e => setLibraryEditForm({...libraryEditForm, fat: e.target.value})} className="w-full bg-cream-soft p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-clay/20" />
                                        </div>
                                    </div>
                                    <button onClick={saveLibraryEdit} className="w-full py-3.5 bg-orange text-onaccent rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-soft active:scale-95 transition-all mt-4">Lưu vào thư viện</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-surface rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
                                {confirmModal.alertMessage ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-4"><span className="font-black text-xl">!</span></div>
                                        <h3 className="text-sm font-black text-ink mb-2 uppercase tracking-widest">Thông báo</h3>
                                        <p className="text-xs text-ink-muted mb-6 font-medium leading-relaxed">{confirmModal.alertMessage}</p>
                                        <button onClick={() => setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" })} className="w-full py-3.5 bg-ink text-cream rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Đã hiểu</button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-orange-soft text-orange-deep flex items-center justify-center mx-auto mb-4"><IconTrash /></div>
                                        <h3 className="text-sm font-black text-ink mb-2 uppercase tracking-widest">Xác nhận xóa</h3>
                                        <p className="text-xs text-ink-muted mb-6 font-medium leading-relaxed">Bạn có chắc muốn xóa <span className="font-black text-ink">"{confirmModal.foodToDelete?.name}"</span>?</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" })} className="flex-1 py-3.5 bg-cream-deep text-ink rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Hủy</button>
                                            <button onClick={handleConfirmDelete} className="flex-1 py-3.5 bg-orange-deep text-onaccent rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-soft active:scale-95 transition-all">Xóa Món</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- MODAL GỢI Ý MỞ RỘNG THƯ VIỆN (từ ScanFeedback patterns) --- */}
                    {librarySuggestion && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-surface rounded-[2rem] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                                <div className="text-center mb-3">
                                    <span className="inline-block px-3 py-1 rounded-full bg-sage-soft text-sage-deep text-[9px] font-bold uppercase tracking-wider">
                                        💡 Gợi ý mở rộng thư viện
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-ink text-center mb-2">
                                    Thêm "{librarySuggestion.userCorrectedName}" vào thư viện?
                                </h3>
                                <p className="text-[11px] text-ink-muted text-center mb-4 leading-relaxed">
                                    Bạn đã sửa <span className="font-semibold text-ink">"{librarySuggestion.libraryMatchedName}"</span> → <span className="font-semibold text-ink">"{librarySuggestion.userCorrectedName}"</span> <strong className="text-orange-deep">{librarySuggestion.count} lần</strong>. Thêm vào thư viện để lần sau AI nhận đúng luôn.
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div>
                                        <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Tên món</label>
                                        <input type="text" value={suggestionForm.name} onChange={e => setSuggestionForm(s => ({ ...s, name: e.target.value }))} className="w-full bg-cream-soft p-2.5 rounded-xl text-[13px] font-semibold outline-none focus:ring-2 focus:ring-orange/30" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Khẩu phần (g)</label>
                                            <input type="number" value={suggestionForm.per} step="any" min="1" onChange={e => setSuggestionForm(s => ({ ...s, per: parseFloat(e.target.value) || 1 }))} className="w-full bg-cream-soft p-2.5 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Kcal / khẩu phần</label>
                                            <input type="number" value={suggestionForm.kcal} step="any" min="0" onChange={e => setSuggestionForm(s => ({ ...s, kcal: parseFloat(e.target.value) || 0 }))} className="w-full bg-cream-soft p-2.5 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep block mb-1 text-center">Protein</label>
                                            <input type="number" value={suggestionForm.protein} step="any" min="0" onChange={e => setSuggestionForm(s => ({ ...s, protein: parseFloat(e.target.value) || 0 }))} className="w-full bg-cream-soft p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-sage/30" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep block mb-1 text-center">Carb</label>
                                            <input type="number" value={suggestionForm.carb} step="any" min="0" onChange={e => setSuggestionForm(s => ({ ...s, carb: parseFloat(e.target.value) || 0 }))} className="w-full bg-cream-soft p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-clay/30" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep block mb-1 text-center">Fat</label>
                                            <input type="number" value={suggestionForm.fat} step="any" min="0" onChange={e => setSuggestionForm(s => ({ ...s, fat: parseFloat(e.target.value) || 0 }))} className="w-full bg-cream-soft p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-lilac/30" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={dismissSuggestion} className="flex-1 py-3 bg-cream-deep text-ink rounded-xl font-bold text-[11px] uppercase tracking-wider active:scale-95 transition">
                                        Bỏ qua
                                    </button>
                                    <button onClick={() => addSuggestionToLibrary(suggestionForm)} disabled={!suggestionForm.name.trim()} className="flex-1 py-3 bg-orange text-onaccent rounded-xl font-bold text-[11px] uppercase tracking-wider active:scale-95 transition disabled:opacity-50">
                                        Thêm vào thư viện
                                    </button>
                                </div>
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

/* ────────────────────────────────────────────────────────────── */
/*  HELPER COMPONENTS — dùng trong dashboard layout của Nhật ký   */
/* ────────────────────────────────────────────────────────────── */

function MindfulCard() {
    const [breathing, setBreathing] = useState(false);
    return (
        <>
            <DashboardCard tone="sage" padding="lg">
                <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-xl shadow-soft animate-gentle-pulse" style={{ animationDuration: "6s" }}>🧘</span>
                    <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-deep">Mindful</span>
                        <h3 className="mt-1 text-[15px] font-bold tracking-tight text-ink">Thư giãn 2 phút</h3>
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.</p>
                        <button type="button" onClick={() => setBreathing(true)} className="mt-3 rounded-full bg-surface px-4 py-1.5 text-[11px] font-semibold text-sage-deep ring-1 ring-sage/15 transition hover:bg-sage hover:text-white">Bắt đầu thở</button>
                    </div>
                </div>
            </DashboardCard>
            {breathing && <BreathingTimer onClose={() => setBreathing(false)} />}
        </>
    );
}
