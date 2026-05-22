"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import DashboardCard from './dashboard/_components/DashboardCard';
import CalorieCircle from './dashboard/_components/CalorieCircle';
import MacroDonut from './dashboard/_components/MacroDonut';
import FoodLogSection from './dashboard/_components/FoodLogSection';
import GreetingHeader from './dashboard/_components/GreetingHeader';
import BreathingTimer from './dashboard/_components/BreathingTimer';

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
// --- DỮ LIỆU CƠ BẢN ---
const COMMON_FOODS = [
    { name: "Tỏi", unit: "g", per: 100, kcal: 149, carb: 33, fat: 0.5, protein: 6.4 },
    { name: "Hành tây", unit: "g", per: 100, kcal: 40, carb: 9, fat: 0.1, protein: 1.1 },
    { name: "Cà chua", unit: "g", per: 100, kcal: 18, carb: 3.9, fat: 0.2, protein: 0.9 },
    { name: "Khoai tây", unit: "g", per: 100, kcal: 77, carb: 17, fat: 0.1, protein: 2 },
    { name: "Cà rốt", unit: "g", per: 100, kcal: 41, carb: 10, fat: 0.2, protein: 0.9 },
    { name: "Rau cải xanh", unit: "g", per: 100, kcal: 25, carb: 3.6, fat: 0.4, protein: 2.2 },
    { name: "Bông cải xanh", unit: "g", per: 100, kcal: 34, carb: 7, fat: 0.4, protein: 2.8 },
    { name: "Đậu hũ", unit: "g", per: 100, kcal: 76, carb: 1.9, fat: 4.8, protein: 8 },
    { name: "Trứng gà sống", unit: "g", per: 100, kcal: 143, carb: 1, fat: 10, protein: 13 },
    { name: "Trứng gà luộc", unit: "g", per: 100, kcal: 155, carb: 1, fat: 11, protein: 13 },
    { name: "Trứng gà rán", unit: "g", per: 100, kcal: 196, carb: 1, fat: 15, protein: 14 },
    { name: "Trứng gà omelet", unit: "g", per: 100, kcal: 157, carb: 1, fat: 12, protein: 11 },
    { name: "Trứng gà kho, rim", unit: "g", per: 100, kcal: 142, carb: 1, fat: 10, protein: 13 },
    { name: "Trứng gà bác", unit: "g", per: 100, kcal: 167, carb: 2, fat: 12, protein: 11 },
    { name: "Trứng gà sống, lòng trắng", unit: "g", per: 100, kcal: 47, carb: 1, fat: 0, protein: 10 },
    { name: "Trứng gà sống, lòng đỏ", unit: "g", per: 100, kcal: 317, carb: 4, fat: 27, protein: 16 },
    { name: "Trứng vịt lộn", unit: "g", per: 100, kcal: 226, carb: 1, fat: 12, protein: 17 },
    { name: "Trứng vịt sống", unit: "g", per: 100, kcal: 185, carb: 1, fat: 14, protein: 13 },
    { name: "Trứng ngỗng sống", unit: "g", per: 100, kcal: 185, carb: 1, fat: 13, protein: 14 },
    { name: "Trứng chim cút sống", unit: "g", per: 100, kcal: 158, carb: 0, fat: 11, protein: 13 },
    { name: "Trứng gà tây", unit: "g", per: 100, kcal: 171, carb: 1, fat: 12, protein: 12 },
    { name: "Ba chỉ / ba rọi (Việt)", unit: "g", per: 100, kcal: 260, carb: 0, fat: 21.5, protein: 16.5 },
    { name: "Ba chỉ / ba rọi (nước ngoài)", unit: "g", per: 100, kcal: 518, carb: 0, fat: 53, protein: 9 },
    { name: "Thắt thăn lợn (nạc)", unit: "g", per: 100, kcal: 143, carb: 0, fat: 6, protein: 21 },
    { name: "Thắt thăn lợn (nạc và mỡ)", unit: "g", per: 100, kcal: 198, carb: 0, fat: 13, protein: 20 },
    { name: "Thịt vai (nạc)", unit: "g", per: 100, kcal: 148, carb: 0, fat: 7, protein: 20 },
    { name: "Thịt vai (nạc và mỡ)", unit: "g", per: 100, kcal: 236, carb: 0, fat: 18, protein: 17 },
    { name: "Thịt chân lợn (nạc)", unit: "g", per: 100, kcal: 136, carb: 0, fat: 5.5, protein: 20.5 },
    { name: "Thịt chân lợn (nạc và mỡ)", unit: "g", per: 100, kcal: 245, carb: 0, fat: 19, protein: 17.5 },
    { name: "Thịt chân lợn (nạc - phần phi)", unit: "g", per: 100, kcal: 137, carb: 0, fat: 5, protein: 21 },
    { name: "Thịt chân lợn (nạc và mỡ - phần phi)", unit: "g", per: 100, kcal: 222, carb: 0, fat: 16, protein: 19 },
    { name: "Thịt sườn (nạc và mỡ)", unit: "g", per: 100, kcal: 277, carb: 0, fat: 23, protein: 15.5 },
    { name: "Móng lợn", unit: "g", per: 100, kcal: 212, carb: 0, fat: 13, protein: 23 },
    { name: "Óc lợn", unit: "g", per: 100, kcal: 127, carb: 0, fat: 9, protein: 10 },
    { name: "Tai lợn", unit: "g", per: 100, kcal: 234, carb: 1, fat: 15, protein: 22 },
    { name: "Tim lợn", unit: "g", per: 100, kcal: 118, carb: 1, fat: 4, protein: 17 },
    { name: "Thịt má lợn", unit: "g", per: 100, kcal: 655, carb: 0, fat: 70, protein: 6 },
    { name: "Mỡ lá lợn", unit: "g", per: 100, kcal: 857, carb: 0, fat: 94, protein: 2 },
    { name: "Thận lợn", unit: "g", per: 100, kcal: 100, carb: 0, fat: 3, protein: 16 },
    { name: "Gan lợn", unit: "g", per: 100, kcal: 134, carb: 2, fat: 4, protein: 21 },
    { name: "Phổi lợn", unit: "g", per: 100, kcal: 85, carb: 0, fat: 3, protein: 14 },   
    { name: "Lá lách", unit: "g", per: 100, kcal: 100, carb: 0, fat: 3, protein: 18 },  
    { name: "Dạ dày lợn", unit: "g", per: 100, kcal: 159, carb: 0, fat: 10, protein: 17 },     
    { name: "Đuôi lợn", unit: "g", per: 100, kcal: 378, carb: 0, fat: 33, protein: 18 },
    { name: "Lưỡi lợn", unit: "g", per: 100, kcal: 225, carb: 0, fat: 17, protein: 16 },
    { name: "Ruột non", unit: "g", per: 100, kcal: 182, carb: 0, fat: 17, protein: 8 },
    { name: "Đùi gà, thịt", unit: "g", per: 100, kcal: 119, carb: 0, fat: 4, protein: 20 },
    { name: "Đùi gà, thịt và da", unit: "g", per: 100, kcal: 211, carb: 0, fat: 15, protein: 17 },
    { name: "Cánh gà, thịt", unit: "g", per: 100, kcal: 126, carb: 0, fat: 4, protein: 22 },
    { name: "Cánh gà, thịt và da", unit: "g", per: 100, kcal: 222, carb: 0, fat: 16, protein: 18 },
    { name: "Cẳng gà, thịt", unit: "g", per: 100, kcal: 119, carb: 0, fat: 3, protein: 21 },
    { name: "Cẳng gà, thịt và da", unit: "g", per: 100, kcal: 161, carb: 0, fat: 9, protein: 19 },
    { name: "Chân gà, thịt", unit: "g", per: 100, kcal: 120, carb: 0, fat: 4, protein: 20 },
    { name: "Chân gà, thịt và da", unit: "g", per: 100, kcal: 187, carb: 0, fat: 12, protein: 18 },
    { name: "Cổ gà, thịt", unit: "g", per: 100, kcal: 154, carb: 0, fat: 9, protein: 18 },
    { name: "Cổ gà, thịt và da", unit: "g", per: 100, kcal: 297, carb: 0, fat: 26, protein: 14 },
    { name: "Ức gà, thịt", unit: "g", per: 100, kcal: 110, carb: 0, fat: 1, protein: 23 },
    { name: "Ức gà, thịt và da", unit: "g", per: 100, kcal: 172, carb: 0, fat: 9, protein: 21 },
    { name: "Lưng gà, thịt", unit: "g", per: 100, kcal: 137, carb: 0, fat: 6, protein: 20 },
    { name: "Lưng gà, thịt và mỡ", unit: "g", per: 100, kcal: 319, carb: 0, fat: 29, protein: 14 },
    { name: "Tim gà", unit: "g", per: 100, kcal: 153, carb: 1, fat: 9, protein: 16 },
    { name: "Gan gà", unit: "g", per: 100, kcal: 116, carb: 0, fat: 5, protein: 17 },
    { name: "Thịt gà xay", unit: "g", per: 100, kcal: 143, carb: 0, fat: 8, protein: 17 },
    { name: "Da gà", unit: "g", per: 100, kcal: 349, carb: 0, fat: 32, protein: 13 },
    { name: "Vịt nuôi, thịt", unit: "g", per: 100, kcal: 132, carb: 0, fat: 6, protein: 18 },
    { name: "Vịt nuôi, thịt và da", unit: "g", per: 100, kcal: 404, carb: 0, fat: 39, protein: 11 },
    { name: "Vịt hoang dã, thịt và da", unit: "g", per: 100, kcal: 211, carb: 0, fat: 15, protein: 17 },
    { name: "Gan vịt", unit: "g", per: 100, kcal: 136, carb: 4, fat: 5, protein: 19 },
    { name: "Thịt thăn bò (phần nạc)", unit: "g", per: 100, kcal: 142, carb: 0, fat: 6, protein: 21 },
    { name: "Thịt bò tươi (cả con - cả nạc)", unit: "g", per: 100, kcal: 278, carb: 0, fat: 22.5, protein: 17.5 },
    { name: "Thịt ức bò (phần nạc)", unit: "g", per: 100, kcal: 155, carb: 0, fat: 7, protein: 21 },
    { name: "Thịt ức bò (nạc và mỡ)", unit: "g", per: 100, kcal: 251, carb: 0, fat: 19, protein: 18.5 },
    { name: "Sườn bò (nạc và mỡ)", unit: "g", per: 100, kcal: 306, carb: 0, fat: 26, protein: 17 },
    { name: "Bắp bò", unit: "g", per: 100, kcal: 201, carb: 0, fat: 6, protein: 34 },
    { name: "Lưỡi bò", unit: "g", per: 100, kcal: 224, carb: 4, fat: 16, protein: 15 },
    { name: "Dạ dày bò", unit: "g", per: 100, kcal: 85, carb: 0, fat: 3.5, protein: 12.5 },
    { name: "Mỡ bò", unit: "g", per: 100, kcal: 854, carb: 0, fat: 94, protein: 2 },
    { name: "Phổi bò", unit: "g", per: 100, kcal: 92, carb: 0, fat: 3, protein: 16 },
    { name: "Gan bò", unit: "g", per: 100, kcal: 135, carb: 4, fat: 4, protein: 20 },
    { name: "Thận bò", unit: "g", per: 100, kcal: 103, carb: 0, fat: 3, protein: 18 },
    { name: "Tim bò", unit: "g", per: 100, kcal: 112, carb: 0, fat: 3.5, protein: 18 },
    { name: "Óc bò", unit: "g", per: 100, kcal: 143, carb: 1, fat: 11, protein: 11 },
    { name: "Gạo trắng (sống)", unit: "g", per: 100, kcal: 360, carb: 79, fat: 0.7, protein: 7 },
    { name: "Cơm trắng (chín)", unit: "g", per: 100, kcal: 130, carb: 28, fat: 0.3, protein: 2.7 },
    { name: "Bún tươi", unit: "g", per: 100, kcal: 109, carb: 24, fat: 0.2, protein: 2 },
    { name: "Phở (bánh)", unit: "g", per: 100, kcal: 108, carb: 24, fat: 0.2, protein: 2.2 },
    { name: "Phở bò (1 tô lớn)", unit: "tô", per: 1, kcal: 500, carb: 60, fat: 12, protein: 28 },
    { name: "Bún bò Huế", unit: "tô", per: 1, kcal: 480, carb: 58, fat: 14, protein: 25 },
    { name: "Cơm tấm sườn bì", unit: "đĩa", per: 1, kcal: 650, carb: 75, fat: 22, protein: 35 },
    { name: "Bánh mì thịt", unit: "ổ", per: 1, kcal: 380, carb: 48, fat: 12, protein: 18 },
    { name: "Bún chả", unit: "suất", per: 1, kcal: 520, carb: 55, fat: 18, protein: 30 },
    { name: "Cá chép", unit: "g", per: 100, kcal: 127, carb: 0, fat: 5.5, protein: 18 },
    { name: "Cá đối", unit: "g", per: 100, kcal: 117, carb: 0, fat: 4, protein: 19 },
    { name: "Cá thu đại tây dương", unit: "g", per: 100, kcal: 205, carb: 0, fat: 14, protein: 19 },
    { name: "Cá thu thái bình dương", unit: "g", per: 100, kcal: 158, carb: 0, fat: 8, protein: 20 },
    { name: "Cá thu tây ban nha", unit: "g", per: 100, kcal: 139, carb: 0, fat: 6, protein: 19 },
    { name: "Cá thu vua", unit: "g", per: 100, kcal: 105, carb: 0, fat: 2, protein: 20 },
    { name: "Cá rô phi", unit: "g", per: 100, kcal: 96, carb: 0, fat: 2, protein: 20 },
    { name: "Cá nục", unit: "g", per: 100, kcal: 114, carb: 0.5, fat: 7, protein: 24 },
    { name: "Cá Tra/basa", unit: "g", per: 100, kcal: 147.5, carb: 0, fat: 5, protein: 25.5 }, 
    { name: "Cá mè", unit: "g", per: 100, kcal: 127, carb: 0, fat: 6, protein: 18 },
    { name: "Cá chim", unit: "g", per: 100, kcal: 146, carb: 0, fat: 8, protein: 17 },
    { name: "Cá mú", unit: "g", per: 100, kcal: 92, carb: 0, fat: 1, protein: 19 },
    { name: "Cá cơm", unit: "g", per: 100, kcal: 131, carb: 0, fat: 4.8, protein: 20.4 },
    { name: "Lươn, cá chình", unit: "g", per: 100, kcal: 184, carb: 0, fat: 12, protein: 19 },
    { name: "Trứng cá", unit: "g", per: 100, kcal: 252, carb: 4, fat: 18, protein: 25 },
    { name: "Tôm", unit: "g", per: 100, kcal: 100, carb: 0, fat: 0, protein: 16 },
    { name: "Tôm hùm phương bắc", unit: "g", per: 100, kcal: 90, carb: 0.7, fat: 0.7, protein: 19 },
    { name: "Tôm hùm gai", unit: "g", per: 100, kcal: 112, carb: 2.4, fat: 1.5, protein: 20.5 },
    { name: "Cua biển (xanh)", unit: "g", per: 100, kcal: 87, carb: 0, fat: 2, protein: 18 },
    { name: "Cua vua Alaska", unit: "g", per: 100, kcal: 84, carb: 0, fat: 0.6, protein: 18 },
    { name: "Cua nữ hoàng", unit: "g", per: 100, kcal: 91, carb: 0, fat: 1, protein: 19 },
    { name: "Mực ống", unit: "g", per: 100, kcal: 93, carb: 3.5, fat: 0, protein: 14 },
    { name: "Mực nang", unit: "g", per: 100, kcal: 79, carb: 1.2, fat: 1.2, protein: 16.5 },
    { name: "Ốc", unit: "g", per: 100, kcal: 89, carb: 3.5, fat: 0, protein: 18 },
    { name: "Hến", unit: "g", per: 100, kcal: 86, carb: 4, fat: 2, protein: 12 },
    { name: "Sò", unit: "g", per: 100, kcal: 79, carb: 5, fat: 0, protein: 13 },
    { name: "Nghêu", unit: "g", per: 100, kcal: 74, carb: 3, fat: 1, protein: 13 },
    { name: "Bí đao", unit: "g", per: 100, kcal: 14, carb: 3, fat: 0, protein: 0 },
    { name: "Bí xanh (mùa hè)", unit: "g", per: 100, kcal: 16, carb: 3, fat: 0, protein: 1 },
    { name: "Bí xanh (baby)", unit: "g", per: 100, kcal: 21, carb: 3, fat: 0, protein: 3 },
    { name: "Bưởi", unit: "g", per: 100, kcal: 38, carb: 10, fat: 0, protein: 1 },
    { name: "Bưởi chùm", unit: "g", per: 100, kcal: 33, carb: 8, fat: 0, protein: 1 },
    { name: "Bắp ngô ngọt", unit: "g", per: 100, kcal: 86, carb: 19, fat: 1, protein: 3 },
    { name: "Bầu", unit: "g", per: 100, kcal: 20, carb: 4, fat: 0, protein: 1 },
    { name: "Bông hẹ", unit: "g", per: 100, kcal: 30, carb: 4, fat: 1, protein: 3 },
    { name: "Củ hành", unit: "g", per: 100, kcal: 40, carb: 9, fat: 0, protein: 1 },
    { name: "Cần tây", unit: "g", per: 100, kcal: 16, carb: 4, fat: 0, protein: 1 },
    { name: "Cây bạc hà lục", unit: "g", per: 100, kcal: 44, carb: 8, fat: 1, protein: 3 },
    { name: "Cây bạc hà cay", unit: "g", per: 100, kcal: 70, carb: 15, fat: 1, protein: 4 },
    { name: "Củ diếp xoắn", unit: "g", per: 100, kcal: 73, carb: 18, fat: 0, protein: 1 },
    { name: "Cải thìa", unit: "g", per: 100, kcal: 9, carb: 2, fat: 0, protein: 1 },
    { name: "Cải bắp", unit: "g", per: 100, kcal: 25, carb: 6, fat: 0, protein: 1 },
    { name: "Cải thảo", unit: "g", per: 100, kcal: 16, carb: 3, fat: 0, protein: 1 },
    { name: "Cải xoong / xà lách xoong", unit: "g", per: 100, kcal: 11, carb: 1, fat: 0, protein: 2 },
    { name: "Cải cúc / rau tần ô", unit: "g", per: 100, kcal: 24, carb: 3, fat: 1, protein: 3 },
    { name: "Cải xoăn Kale", unit: "g", per: 100, kcal: 49, carb: 10.5, fat: 0, protein: 3 },
    { name: "Cải ngồng / cải rổ", unit: "g", per: 100, kcal: 22, carb: 4, fat: 1, protein: 1 },
    { name: "Cải xanh turnips", unit: "g", per: 100, kcal: 32, carb: 7, fat: 0, protein: 1 },
    { name: "Cà tím", unit: "g", per: 100, kcal: 24, carb: 6, fat: 0, protein: 1 },
    { name: "Cây đại hoàng", unit: "g", per: 100, kcal: 21, carb: 5, fat: 0, protein: 0.8 },
    { name: "Cây atisô", unit: "g", per: 100, kcal: 47, carb: 11, fat: 0, protein: 3 },
    { name: "Củ đậu", unit: "g", per: 100, kcal: 38, carb: 9, fat: 0, protein: 0.8 },
    { name: "Cà chua xanh", unit: "g", per: 100, kcal: 23, carb: 5, fat: 0, protein: 1 },
    { name: "Cà chua vàng / cam", unit: "g", per: 100, kcal: 15, carb: 3, fat: 0, protein: 1 },
    { name: "Củ cải trắng", unit: "g", per: 100, kcal: 14, carb: 3, fat: 0, protein: 1 },
    { name: "Chanh (quả)", unit: "g", per: 100, kcal: 30, carb: 11, fat: 0, protein: 1 },
    { name: "Chanh dây", unit: "g", per: 100, kcal: 97, carb: 23, fat: 1, protein: 2 },
    { name: "Cam (quả)", unit: "g", per: 100, kcal: 47, carb: 12, fat: 0, protein: 1 },
    { name: "Chuối", unit: "g", per: 100, kcal: 89, carb: 23, fat: 0, protein: 1 },
    { name: "Chôm chôm", unit: "g", per: 100, kcal: 82, carb: 21, fat: 0, protein: 1 },
    { name: "Củ nghệ (gia vị)", unit: "g", per: 100, kcal: 354, carb: 65, fat: 10, protein: 8 },
    { name: "Củ dền", unit: "g", per: 100, kcal: 43, carb: 10, fat: 0, protein: 2 },
    { name: "Cà rốt", unit: "g", per: 100, kcal: 41, carb: 10, fat: 0, protein: 1 },
    { name: "Củ từ", unit: "g", per: 100, kcal: 118, carb: 28, fat: 0, protein: 2 },
    { name: "Dọc mùng", unit: "g", per: 100, kcal: 14, carb: 3.8, fat: 0, protein: 0.25 },
    { name: "Dưa cải bệ", unit: "g", per: 100, kcal: 17, carb: 4.5, fat: 0, protein: 2 },
    { name: "Dưa chuột gọt vỏ", unit: "g", per: 100, kcal: 12, carb: 2, fat: 0, protein: 1 },
    { name: "Dưa chuột có vỏ", unit: "g", per: 100, kcal: 15, carb: 4, fat: 0, protein: 1 },
    { name: "Dứa", unit: "g", per: 100, kcal: 50, carb: 13, fat: 0, protein: 1 },
    { name: "Dưa hấu", unit: "g", per: 100, kcal: 30, carb: 8, fat: 0, protein: 1 },
    { name: "Dưa vàng (casaba)", unit: "g", per: 100, kcal: 28, carb: 7, fat: 0, protein: 1 },
    { name: "Dưa lưới (honeydew)", unit: "g", per: 100, kcal: 36, carb: 9, fat: 0, protein: 1 },
    { name: "Dưa ruột vàng (cantaloupe)", unit: "g", per: 100, kcal: 34, carb: 9, fat: 0, protein: 1 },
    { name: "Dừa, cùi", unit: "g", per: 100, kcal: 354, carb: 15, fat: 33, protein: 3 },
    { name: "Dừa, nước", unit: "g", per: 100, kcal: 19, carb: 4, fat: 0, protein: 1 },
    { name: "Dưa gang", unit: "g", per: 100, kcal: 28, carb: 7, fat: 0, protein: 1 },
    { name: "Diếp Lô Lô", unit: "g", per: 100, kcal: 12, carb: 3, fat: 0, protein: 1.5 },
    { name: "Dâu tây", unit: "g", per: 100, kcal: 32, carb: 8, fat: 0, protein: 1 },
    { name: "Dưa cải bắp", unit: "g", per: 100, kcal: 25, carb: 5, fat: 0, protein: 1 },
    { name: "Đậu phộng, lạc sống", unit: "g", per: 100, kcal: 567, carb: 16, fat: 49, protein: 26 },
    { name: "Đậu nành (xanh)", unit: "g", per: 100, kcal: 147, carb: 11, fat: 7, protein: 13 },
    { name: "Đậu cô ve / đậu đũa", unit: "g", per: 100, kcal: 31, carb: 7, fat: 0, protein: 2 },
    { name: "Đậu / đỗ đen", unit: "g", per: 100, kcal: 341, carb: 62, fat: 1, protein: 22 },
    { name: "Đậu / đỗ đỏ", unit: "g", per: 100, kcal: 337, carb: 61, fat: 1, protein: 23 },
    { name: "Đậu / đỗ xanh", unit: "g", per: 100, kcal: 347, carb: 63, fat: 1, protein: 24 },
    { name: "Đậu / đỗ trắng nhỏ", unit: "g", per: 100, kcal: 336, carb: 62, fat: 1, protein: 21 },
    { name: "Đậu / đỗ trắng", unit: "g", per: 100, kcal: 333, carb: 60, fat: 1, protein: 23 },
    { name: "Đậu rồng (hạt)", unit: "g", per: 100, kcal: 409, carb: 42, fat: 16, protein: 30 },
    { name: "Đậu rồng (lá)", unit: "g", per: 100, kcal: 74, carb: 14, fat: 1, protein: 6 },
    { name: "Đậu phụ lụa mềm", unit: "g", per: 100, kcal: 55, carb: 3, fat: 3, protein: 5 },
    { name: "Đậu phụ lụa rắn", unit: "g", per: 100, kcal: 62, carb: 2, fat: 3, protein: 7 },
    { name: "Đậu phụ okara", unit: "g", per: 100, kcal: 77, carb: 13, fat: 2, protein: 3 },
    { name: "Đậu phụ rán", unit: "g", per: 100, kcal: 271, carb: 10, fat: 20, protein: 17 },
    { name: "Đu đủ", unit: "g", per: 100, kcal: 39, carb: 10, fat: 0, protein: 1 },
    { name: "Giá đỗ", unit: "g", per: 100, kcal: 44, carb: 7.5, fat: 0, protein: 5.5 },
    { name: "Gừng", unit: "g", per: 100, kcal: 80, carb: 18, fat: 1, protein: 2 },
    { name: "Gạo nâu / gạo lức", unit: "g", per: 100, kcal: 370, carb: 77, fat: 3, protein: 8 },
    { name: "Gạo nếp", unit: "g", per: 100, kcal: 370, carb: 82, fat: 1, protein: 7 },
    { name: "Gạo trắng", unit: "g", per: 100, kcal: 360, carb: 79, fat: 1, protein: 6 },
    { name: "Húng quế", unit: "g", per: 100, kcal: 23, carb: 3, fat: 1, protein: 3 },
    { name: "Hoa chuối", unit: "g", per: 100, kcal: 20, carb: 5.5, fat: 0, protein: 1.5 },
    { name: "Hẹ lá", unit: "g", per: 100, kcal: 16, carb: 3, fat: 0, protein: 2 },
    { name: "Hồng xiêm / Sa bô chê", unit: "g", per: 100, kcal: 83, carb: 20, fat: 1, protein: 0 },
    { name: "Hành lá", unit: "g", per: 100, kcal: 3, carb: 7, fat: 0, protein: 2 },
    { name: "Hạt điều", unit: "g", per: 100, kcal: 553, carb: 33, fat: 44, protein: 8 },
    { name: "Hạnh nhân", unit: "g", per: 100, kcal: 575, carb: 22, fat: 49, protein: 21 },
    { name: "Hạt sen", unit: "g", per: 100, kcal: 89, carb: 17, fat: 1, protein: 4 },
    { name: "Hạt hướng dương (phơi khô)", unit: "g", per: 100, kcal: 584, carb: 20, fat: 51, protein: 21 },
    { name: "Hột é", unit: "g", per: 100, kcal: 490, carb: 44, fat: 31, protein: 16 },
    { name: "Khoai sọ", unit: "g", per: 100, kcal: 112, carb: 26, fat: 0, protein: 1 },
    { name: "Khế", unit: "g", per: 100, kcal: 31, carb: 7, fat: 0, protein: 1 },
    { name: "Khổ qua (quả)", unit: "g", per: 100, kcal: 17, carb: 4, fat: 0, protein: 1 },
    { name: "Khổ qua (lá)", unit: "g", per: 100, kcal: 30, carb: 3, fat: 1, protein: 5 },
    { name: "Kiwi", unit: "g", per: 100, kcal: 61, carb: 15, fat: 1, protein: 1 },
    { name: "Khoai tây", unit: "g", per: 100, kcal: 77, carb: 18, fat: 0, protein: 2 },
    { name: "Khoai lang", unit: "g", per: 100, kcal: 86, carb: 20, fat: 0, protein: 2 },
    { name: "Lá diếp xoắn", unit: "g", per: 100, kcal: 23, carb: 5, fat: 0, protein: 2 },
    { name: "Lê", unit: "g", per: 100, kcal: 42, carb: 11, fat: 0, protein: 0 },
    { name: "Lạc", unit: "g", per: 100, kcal: 567, carb: 16, fat: 49, protein: 26 },
    { name: "Me chua", unit: "g", per: 100, kcal: 27, carb: 7, fat: 0, protein: 2 },
    { name: "Mướp", unit: "g", per: 100, kcal: 16, carb: 3.5, fat: 0, protein: 1 },
    { name: "Mướp tây / đậu bắp", unit: "g", per: 100, kcal: 31, carb: 7, fat: 0, protein: 2 },
    { name: "Măng tre", unit: "g", per: 100, kcal: 14, carb: 6, fat: 0, protein: 2 },
    { name: "Mít", unit: "g", per: 100, kcal: 94, carb: 24, fat: 0, protein: 1 },
    { name: "Măng tây", unit: "g", per: 100, kcal: 20, carb: 4, fat: 0, protein: 2 },
    { name: "Mận", unit: "g", per: 100, kcal: 46, carb: 11, fat: 0, protein: 1 },
    { name: "Mộc nhĩ", unit: "g", per: 100, kcal: 312, carb: 72, fat: 0, protein: 11 },
    { name: "Ngó sen", unit: "g", per: 100, kcal: 74, carb: 17.2, fat: 0.1, protein: 2.6 },
    { name: "Nấm thường tươi", unit: "g", per: 100, kcal: 35, carb: 5.7, fat: 0.8, protein: 4.6 },
    { name: "Nấm mỡ", unit: "g", per: 100, kcal: 33, carb: 4.5, fat: 0.3, protein: 4 },
    { name: "Nấm rơm", unit: "g", per: 100, kcal: 31, carb: 4.5, fat: 0.3, protein: 4 },
    { name: "Nấm hương tươi", unit: "g", per: 100, kcal: 40, carb: 6, fat: 0.5, protein: 5.5 },
    { name: "Ngải cứu", unit: "g", per: 100, kcal: 55, carb: 8, fat: 0, protein: 5 },
    { name: "Ngọn xu xu", unit: "g", per: 100, kcal: 18, carb: 6, fat: 0.4, protein: 0.3 },
    { name: "Nho", unit: "g", per: 100, kcal: 69, carb: 18, fat: 0, protein: 1 },
    { name: "Nước chanh", unit: "g", per: 100, kcal: 25, carb: 9, fat: 0, protein: 0 },
    { name: "Nước cam", unit: "g", per: 100, kcal: 45, carb: 10, fat: 0, protein: 1 },
    { name: "Ớt xanh", unit: "g", per: 100, kcal: 40, carb: 9, fat: 0, protein: 2 },
    { name: "Ớt xanh ngọt", unit: "g", per: 100, kcal: 20, carb: 5, fat: 0, protein: 1 },
    { name: "Ớt đỏ ngọt", unit: "g", per: 100, kcal: 31, carb: 6, fat: 0, protein: 1 },
    { name: "Ớt vàng ngọt", unit: "g", per: 100, kcal: 27, carb: 6, fat: 0, protein: 1 },
    { name: "Ớt phơi khô", unit: "g", per: 100, kcal: 324, carb: 70, fat: 6, protein: 11 },
    { name: "Ổi", unit: "g", per: 100, kcal: 68, carb: 14, fat: 1, protein: 3 },
    { name: "Quả bí ngô (pumpkin)", unit: "g", per: 100, kcal: 26, carb: 6, fat: 0, protein: 1 },
    { name: "Quả bí đỏ (acorn squash)", unit: "g", per: 100, kcal: 40, carb: 10, fat: 0, protein: 1 },
    { name: "Quả bí đỏ (butternut squash)", unit: "g", per: 100, kcal: 45, carb: 12, fat: 0, protein: 1 },
    { name: "Quả na", unit: "g", per: 100, kcal: 101, carb: 25, fat: 1, protein: 2 },
    { name: "Quả nhãn", unit: "g", per: 100, kcal: 60, carb: 15, fat: 0, protein: 1 },
    { name: "Quả bơ", unit: "g", per: 100, kcal: 160, carb: 9, fat: 15, protein: 2 },
    { name: "Quất / trái tắc", unit: "g", per: 100, kcal: 71, carb: 16, fat: 1, protein: 2 },
    { name: "Quả đào", unit: "g", per: 100, kcal: 39, carb: 10, fat: 0, protein: 1 },
    { name: "Quả quýt", unit: "g", per: 100, kcal: 53, carb: 13, fat: 0, protein: 1 },
    { name: "Quả hồng (khô/ngọt)", unit: "g", per: 100, kcal: 127, carb: 33, fat: 0, protein: 1 },
    { name: "Quả lựu", unit: "g", per: 100, kcal: 83, carb: 19, fat: 1, protein: 2 },
    { name: "Quả hồng (tươi)", unit: "g", per: 100, kcal: 70, carb: 19, fat: 0, protein: 1 },
    { name: "Quả hồng bì", unit: "g", per: 100, kcal: 35, carb: 10, fat: 0, protein: 2 },
    { name: "Rau muống", unit: "g", per: 100, kcal: 30, carb: 3.5, fat: 0, protein: 3 },
    { name: "Rau đay", unit: "g", per: 100, kcal: 25, carb: 5, fat: 0, protein: 2.8 },
    { name: "Rau mồng tơi", unit: "g", per: 100, kcal: 14, carb: 4, fat: 0, protein: 2 },
    { name: "Rau ngót", unit: "g", per: 100, kcal: 36, carb: 6, fat: 0, protein: 5.3 },
    { name: "Rau bí", unit: "g", per: 100, kcal: 18, carb: 3.5, fat: 0, protein: 2.7 },
    { name: "Rau húng", unit: "g", per: 100, kcal: 18, carb: 5.5, fat: 0, protein: 2.2 },
    { name: "Rau khoai lang", unit: "g", per: 100, kcal: 22, carb: 4, fat: 0, protein: 2.6 },
    { name: "Rau kinh giới", unit: "g", per: 100, kcal: 23, carb: 6.5, fat: 0, protein: 2.7 },
    { name: "Rau ngổ", unit: "g", per: 100, kcal: 16, carb: 4.5, fat: 0, protein: 1.5 },
    { name: "Rau diếp xanh (xà lách xanh)", unit: "g", per: 100, kcal: 15, carb: 3, fat: 0, protein: 0 },
    { name: "Rau diếp đỏ (xà lách đỏ)", unit: "g", per: 100, kcal: 16, carb: 2, fat: 0, protein: 1 },
    { name: "Rau mùi tây (ngò tây)", unit: "g", per: 100, kcal: 36, carb: 6, fat: 1, protein: 3 },
    { name: "Rau bina (bó xôi)", unit: "g", per: 100, kcal: 23, carb: 4, fat: 0, protein: 3 },
    { name: "Rau thì là", unit: "g", per: 100, kcal: 43, carb: 7, fat: 1, protein: 3 },
    { name: "Rong biển/thạch trắng agar tươi", unit: "g", per: 100, kcal: 26, carb: 7, fat: 0, protein: 1 },
    { name: "Rong biển agar khô", unit: "g", per: 100, kcal: 306, carb: 81, fat: 0, protein: 6 },
    { name: "Rong biển xoắn ốc tươi", unit: "g", per: 100, kcal: 26, carb: 2, fat: 0, protein: 6 },
    { name: "Rong biển xoắn ốc khô", unit: "g", per: 100, kcal: 290, carb: 24, fat: 8, protein: 57 },
    { name: "Rong biển kelp (tảo biển) tươi", unit: "g", per: 100, kcal: 43, carb: 10, fat: 1, protein: 2 },
    { name: "Rong biển laver (đỏ) tươi", unit: "g", per: 100, kcal: 35, carb: 5, fat: 0, protein: 6 },
    { name: "Rong biển irishmoss tươi", unit: "g", per: 100, kcal: 49, carb: 12, fat: 0, protein: 2 },
    { name: "Rau dền", unit: "g", per: 100, kcal: 23, carb: 4, fat: 0, protein: 2 },
    { name: "Su su/Xu xu", unit: "g", per: 100, kcal: 19, carb: 5, fat: 0, protein: 1 },
    { name: "Su hào", unit: "g", per: 100, kcal: 27, carb: 6, fat: 0, protein: 2 },
    { name: "Sả", unit: "g", per: 100, kcal: 99, carb: 25, fat: 0, protein: 1.5 },
    { name: "Súp lơ", unit: "g", per: 100, kcal: 25, carb: 5, fat: 0, protein: 2 },
    { name: "Sầu riêng", unit: "g", per: 100, kcal: 147, carb: 27, fat: 5, protein: 1 },
    { name: "Tỏi tây", unit: "g", per: 100, kcal: 61, carb: 14, fat: 0, protein: 1 },
    { name: "Trái cóc", unit: "g", per: 100, kcal: 57, carb: 13, fat: 1, protein: 1 },
    { name: "Thanh long", unit: "g", per: 100, kcal: 60, carb: 9, fat: 1.5, protein: 2 },
    { name: "Tía tô", unit: "g", per: 100, kcal: 26, carb: 7, fat: 0, protein: 3 },
    { name: "Vải", unit: "g", per: 100, kcal: 66, carb: 17, fat: 0, protein: 1 },
    { name: "Vải khô", unit: "g", per: 100, kcal: 277, carb: 71, fat: 1, protein: 4 },
    { name: "Xà lách búp Mỹ", unit: "g", per: 100, kcal: 14, carb: 3, fat: 0, protein: 1 },
    { name: "Yến mạch", unit: "g", per: 100, kcal: 389, carb: 66, fat: 7, protein: 17 },
    { name: "Bánh mì đen", unit: "g", per: 100, kcal: 250, carb: 48, fat: 3, protein: 9 }
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
    const vietnamDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return `${vietnamDate.getFullYear()}-${String(vietnamDate.getMonth() + 1).padStart(2, '0')}-${String(vietnamDate.getDate()).padStart(2, '0')}`;
};
const calcMacro = (val, per, q) => Math.round((val / per) * q * 10) / 10;

const generateUniqueTimestamp = () => {
  const now = new Date();
  const svSE = now.toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  const rand = Math.random().toString(36).slice(2, 7);
  return `${svSE}.${ms}-${rand}`;
};
const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

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
                <div className={`h-full ${colorClass} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}

function StatsView({ history, profile, setProfile, target, targetLog, setView, view, setCurrentDate }) {
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
        Chart.defaults.font.family = "'Inter', sans-serif"; Chart.defaults.color = '#7A7066';

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

        if (kcalChartInstance.current) kcalChartInstance.current.destroy();
        if (kcalChartRef.current) {
            const ctx = kcalChartRef.current.getContext('2d');
            const labels = currentChartDates.map(d => getWeekLabel(d));
            
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
                        { type: 'line', label: 'Tổng', data: dataTotal, stack: 'lineTotal', borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, datalabels: { align: 'end', anchor: 'end', color: '#6B95AB', font: { weight: 'black', size: 9 }, formatter: (val) => val > 0 ? val : '' } },
                        { type: 'line', label: 'Mục tiêu', data: targetLine, stack: 'lineTarget', borderColor: '#B8AFA4', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0, datalabels: { display: false } },
                        
                        // Gắn chung stack 'bars' cho 4 bữa ăn để chúng tự động xếp chồng lên nhau
                        { type: 'bar', label: 'Bữa sáng', data: dataBreakfast, stack: 'bars', backgroundColor: '#C49A4A', datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa trưa', data: dataLunch, stack: 'bars', backgroundColor: '#5F8266', datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa tối', data: dataDinner, stack: 'bars', backgroundColor: '#9B8AB8', datalabels: { display: false } },
                        { type: 'bar', label: 'Ăn vặt', data: dataSnack, stack: 'bars', backgroundColor: '#D97757', datalabels: { display: false }, borderRadius: { topLeft: 4, topRight: 4 } }
                    ]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    plugins: { 
                        legend: { display: false }, 
                        // Bật tính năng Hiện thông tin khi Hover
                        tooltip: { 
                            enabled: true,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#2D2620',
                            bodyColor: '#2D2620',
                            borderColor: '#EBE3D2',
                            borderWidth: 1,
                            padding: 10,
                            boxPadding: 4,
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            callbacks: {
                                label: function(context) {
                                    // Không hiển thị popup cho đường Mục tiêu, Tổng và các bữa 0 Kcal
                                    if (context.dataset.label === 'Mục tiêu' || context.dataset.label === 'Tổng' || context.parsed.y === 0) return null;
                                    return ` ${context.dataset.label}: ${context.parsed.y} kcal`;
                                }
                            }
                        } 
                    }, 
                    scales: { 
                        x: { stacked: true, display: true, grid: { color: '#F4EFE6', drawBorder: false }, ticks: { font: { weight: 'bold', size: 9 } } },
                        y: { stacked: true, display: true, beginAtZero: true, grid: { color: '#F4EFE6', drawBorder: false }, ticks: { display: false } } 
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

           macroChartInstance.current = new Chart(ctx, { 
                type: 'line', 
                data: { labels: labels, datasets: [
                    { label: 'Protein', data: dataProtein, borderColor: '#D97757', backgroundColor: '#D97757', borderWidth: 2, tension: 0.4, pointRadius: 3, datalabels: { display: false } }, 
                    { label: 'Carb', data: dataCarb, borderColor: '#6B95AB', backgroundColor: '#6B95AB', borderWidth: 2, tension: 0.4, pointRadius: 3, datalabels: { display: false } },
                    { label: 'Fat', data: dataFat, borderColor: '#C49A4A', backgroundColor: '#C49A4A', borderWidth: 2, tension: 0.4, pointRadius: 3, datalabels: { display: false } }
                ]},
                options: { 
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25, bottom: 15 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 10, font: {size: 10, weight: 'bold'} } }, tooltip: { enabled: false } }, 
                    scales: { y: { display: true, beginAtZero: true, grid: { color: '#F4EFE6', drawBorder: false }, ticks: { display: false } }, x: { display: true, grid: { color: '#F4EFE6', drawBorder: false }, ticks: { font: { weight: 'bold', size: 9 } } } } 
                } 
            });
        }
        
        return () => { 
            if (weightChartInstance.current) weightChartInstance.current.destroy(); 
            if (kcalChartInstance.current) kcalChartInstance.current.destroy(); 
            if (macroChartInstance.current) macroChartInstance.current.destroy(); 
        };
    }, [history, weightLog, target, targetLog, currentChartDates]);

    const sortedDates = Object.keys(weightLog).sort((a, b) => new Date(b) - new Date(a));

    const latestWeight = sortedDates.length > 0 ? weightLog[sortedDates[0]] : null;

    return (
        <div className="min-h-screen bg-cream pb-28 animate-in fade-in duration-300 text-ink" style={{ fontFamily: WARM_FONT, letterSpacing: "-0.005em" }}>
            {/* Slim sticky header */}
            <header className="sticky top-0 z-30 backdrop-blur-md border-b border-ink/[0.08] px-5" style={{ background: "rgba(251, 248, 242, 0.85)" }}>
                <div className="max-w-md md:max-w-2xl mx-auto py-3 text-center">
                    <span style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted">Tổng quan</span>
                    <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }} className="text-ink">Thống kê & Biểu đồ</p>
                </div>
            </header>

            <main>
                {/* HERO TILE — intro */}
                <Tile tone="cream" className="text-center">
                    <Eyebrow accent="orange-deep">Hành trình</Eyebrow>
                    <HeroDisplay>
                        {latestWeight ? `${latestWeight} kg.` : "Hiểu cơ thể qua thời gian."}
                    </HeroDisplay>
                    <Lead className="mt-3 text-ink-muted">
                        {latestWeight ? "Tiếp tục lắng nghe — mỗi con số là một câu chuyện." : "Ghi lại con số đầu tiên để bắt đầu hành trình."}
                    </Lead>
                </Tile>

                {/* WHITE TILE — Cập nhật cân nặng */}
                <Tile tone="white">
                    <div className="text-center mb-8">
                        <Eyebrow accent="orange-deep">⚖️ Cân nặng</Eyebrow>
                        <Display>Ghi lại để theo dõi.</Display>
                    </div>

                    <div className="flex items-center bg-cream-soft p-1.5 rounded-full mb-5 ring-1 ring-ink/[0.08] focus-within:ring-2 focus-within:ring-orange-deep/30 transition">
                        <div className="relative flex items-center pl-1">
                            <svg className="w-4 h-4 text-orange-deep absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <input type="date" value={weightDate} max={todayStr} onChange={e=>setWeightDate(e.target.value)} className="w-[120px] bg-transparent py-2.5 pl-9 pr-1 outline-none text-ink cursor-pointer tabular-nums [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em" }} />
                        </div>
                        <div className="w-px h-6 bg-ink/[0.1] mx-1 shrink-0"/>
                        <input type="number" value={weightInput} onChange={e=>setWeightInput(e.target.value)} step="0.1" placeholder={weightLog[weightDate] ? `Đã ghi: ${weightLog[weightDate]}kg` : "Số kg..."} className="flex-1 bg-transparent p-2.5 outline-none text-ink placeholder:text-ink-faint min-w-[60px] tabular-nums" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }} />
                        <PillButton onClick={saveWeight} className="shrink-0">Ghi</PillButton>
                    </div>

                    <p style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted mb-3 px-1">Lịch sử gần nhất</p>
                    <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1.5">
                        {sortedDates.length === 0 ? (
                            <p className="text-center text-ink-faint italic py-6" style={{ fontSize: 13 }}>Chưa có bản ghi</p>
                        ) : (
                            sortedDates.slice(0, 14).map(date => (
                                <div key={date} className="flex justify-between items-center px-3 py-2.5 bg-cream-soft rounded-2xl ring-1 ring-ink/[0.06] group">
                                    <div className="flex items-center gap-3">
                                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }} className="text-ink-muted uppercase">{getWeekLabel(date)}/{date.split('-')[0]}</span>
                                        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }} className="text-ink">{weightLog[date]}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 2 }} className="text-ink-muted">kg</span></span>
                                    </div>
                                    <button onClick={() => deleteWeight(date)} className="p-1.5 text-ink-faint hover:text-orange-deep rounded-lg transition opacity-0 group-hover:opacity-100" aria-label="Xóa"><IconTrash /></button>
                                </div>
                            ))
                        )}
                    </div>
                </Tile>

                {/* DARK TILE — Biểu đồ cân nặng (chart on light card centered, dark frame around) */}
                <Tile tone="espresso">
                    <div className="text-center mb-8">
                        <Eyebrow accent="on-dark">📈 Biểu đồ</Eyebrow>
                        <Display className="text-white">Cân nặng qua 14 ngày.</Display>
                        {sortedDates.length === 0 && (
                            <p style={{ ...T_LEAD, color: "rgba(255,255,255,0.7)" }} className="mt-3">
                                Ghi cân nặng để xem biểu đồ.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-5 ring-1 ring-white/10 relative">
                        {sortedDates.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-3xl z-10">
                                <p style={{ fontSize: 13 }} className="text-ink-muted italic">Chưa có dữ liệu</p>
                            </div>
                        )}
                        <div className="h-48 relative w-full"><canvas ref={weightChartRef}></canvas></div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-5 flex justify-between items-center gap-2">
                        <button onClick={() => setChartOffset(p => p + 1)} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition" style={{ fontSize: 12, fontWeight: 500 }}>‹ Trước</button>
                        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.7)" }} className="uppercase">
                            {getWeekLabel(currentChartDates[0])} – {getWeekLabel(currentChartDates[currentChartDates.length-1])}
                        </span>
                        <button onClick={() => setChartOffset(p => Math.max(0, p - 1))} disabled={chartOffset === 0} className={`px-3 py-2 rounded-full transition ${chartOffset === 0 ? 'text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`} style={{ fontSize: 12, fontWeight: 500 }}>Sau ›</button>
                    </div>
                </Tile>

                {/* LIGHT TILE — Năng lượng đã nạp */}
                <Tile tone="cream">
                    <div className="text-center mb-8">
                        <Eyebrow accent="clay-deep">🔥 Năng lượng</Eyebrow>
                        <Display>Đã nạp theo từng bữa.</Display>
                        <Lead className="mt-3 text-ink-muted">Chạm vào cột để xem chi tiết ngày đó.</Lead>
                    </div>
                    <div className="bg-white rounded-3xl p-5 ring-1 ring-ink/[0.08]">
                        <div className="h-48 relative w-full"><canvas ref={kcalChartRef}></canvas></div>
                    </div>
                </Tile>

                {/* LIGHT TILE — Macro chart */}
                <Tile tone="white">
                    <div className="text-center mb-8">
                        <Eyebrow accent="lilac-deep">🥗 Macro</Eyebrow>
                        <Display>Protein · Carb · Fat.</Display>
                        <Lead className="mt-3 text-ink-muted">Xu hướng ba chất chính theo thời gian.</Lead>
                    </div>
                    <div className="bg-cream-soft rounded-3xl p-5 ring-1 ring-ink/[0.06]">
                        <div className="h-48 relative w-full"><canvas ref={macroChartRef}></canvas></div>
                    </div>
                </Tile>
            </main>
            <BottomNav view={view} setView={setView} />
        </div>
    );
}

function BottomNav({view, setView}) {
    const items = [
        { key: "journal", label: "Nhật ký", Icon: IconJournal },
        { key: "stats",   label: "Thống kê", Icon: IconStats },
        { key: "profile", label: "Hồ sơ",   Icon: IconUser },
    ];
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40"
            style={{
                fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif`,
                background: "rgba(251, 248, 242, 0.92)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                borderTop: "1px solid rgba(45, 38, 32, 0.08)",
            }}
        >
            <div className="max-w-md md:max-w-2xl mx-auto px-2 py-2 flex justify-around items-center">
                {items.map(({ key, label, Icon }) => {
                    const active = view === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setView(key)}
                            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition active:scale-[0.97] ${active ? "text-orange-deep" : "text-ink-muted hover:text-ink"}`}
                            style={{ minWidth: 80 }}
                        >
                            <span className={`transition ${active ? "scale-110" : ""}`}><Icon /></span>
                            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, letterSpacing: "-0.005em" }}>{label}</span>
                        </button>
                    );
                })}
            </div>
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
    
    // NÂNG CẤP: State cho chức năng chỉnh sửa món ăn TẠI THƯ VIỆN CHỌN NHANH
    const [editLibraryModal, setEditLibraryModal] = useState({ isOpen: false, item: null, originalName: "" });
    const [libraryEditForm, setLibraryEditForm] = useState({ name: "", unit: "g", per: 100, kcal: "", protein: "", carb: "", fat: "" });
    const [targetLog, setTargetLog] = useState({}); // Lưu lịch sử mục tiêu theo ngày

    // ---> DÁN 4 DÒNG ĐÓ VÀO ĐÂY <---
    const [undoStack, setUndoStack] = useState([]); // Mảng chứa Lịch sử các món đã xóa
    useEffect(() => { setUndoStack([]); }, [currentDate]); // Đổi ngày thì dọn sạch thùng rác
    // -------------------------------

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
            const tl = localStorage.getItem('stayfit_target_log'); if(tl) setTargetLog(JSON.parse(tl));
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
                else setSelectedMeal("Ăn vặt");
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

    // Mốc thời gian pull gần nhất — dùng để skip push echo ngay sau khi pull
    const lastPullAtRef = useRef(0);
    // Cờ chống chạy đồng thời nhiều syncFromCloud
    const pullingRef = useRef(false);

    const syncToCloud = async () => {
        if (!userId || !password) return;
        // Tránh push echo: nếu vừa pull xong dưới 1.5s thì bỏ qua (state đổi do pull, không phải user)
        if (Date.now() - lastPullAtRef.current < 1500) return;
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
                    customFoods: customFoodList,
                    deletedCommonFoods: deletedCommonFoods,
                }),
            });
        } catch (err) { console.error("Lỗi lưu ngầm:", err.message); }
    };

    const syncFromCloud = async () => {
        if (!userId || !password) return;
        if (pullingRef.current) return;
        pullingRef.current = true;
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
            if (Array.isArray(data.customFoods)) setCustomFoodList(data.customFoods);
            if (Array.isArray(data.deletedCommonFoods)) setDeletedCommonFoods(data.deletedCommonFoods);

            lastPullAtRef.current = Date.now();

            // Chỉ reload đúng 1 lần khi đăng nhập lần đầu trong session (để re-init biểu đồ, v.v.)
            if (!sessionStorage.getItem(`sync_done_${userId}`)) {
                sessionStorage.setItem(`sync_done_${userId}`, 'true');
                window.location.reload();
            }
        } catch (err) { console.error("Lỗi tải ngầm:", err.message); }
        finally { pullingRef.current = false; }
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
            if (Array.isArray(data.customFoods)) localStorage.setItem('stayfit_custom_foods', JSON.stringify(data.customFoods));
            if (Array.isArray(data.deletedCommonFoods)) localStorage.setItem('stayfit_deleted_common', JSON.stringify(data.deletedCommonFoods));
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
    }, [history, profile, customFoodList, deletedCommonFoods]);

    // Auto-PULL: khi tab hiển thị trở lại, khi window focus, và polling 30s
    useEffect(() => {
        if (!isClient || !userId || !password) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                syncToCloud();
            } else if (document.visibilityState === 'visible') {
                syncFromCloud();
            }
        };
        const handleFocus = () => { syncFromCloud(); };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        // Polling mỗi 30s khi tab đang hiển thị
        const pollId = setInterval(() => {
            if (document.visibilityState === 'visible') syncFromCloud();
        }, 30000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(pollId);
        };
    }, [isClient, userId, password]);
    
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
            meal: selectedMeal, id: Date.now(), timestamp: generateUniqueTimestamp()
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
            meal: selectedMeal, id: Date.now(), timestamp: generateUniqueTimestamp()
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
        const currentList = history[currentDate] || [];
        const itemToDelete = currentList.find(i => i.id === id);
        const itemIndex = currentList.findIndex(i => i.id === id);

        setHistory(prev => ({ ...prev, [currentDate]: currentList.filter(i => i.id !== id) }));
        
        // --- VẤN ĐỀ 1 & 2: HOÀN TÁC NHIỀU LẦN VÀ KHÔNG TỰ ẨN ---
        // Nhồi món vừa xóa vào mảng (Stack)
        setUndoStack(prev => [...prev, { item: itemToDelete, index: itemIndex }]);

        if (itemToDelete && itemToDelete.timestamp && userId && password) {
            try {
                await fetch("/api/sync", {
                    method: "DELETE", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, password, timestamp: itemToDelete.timestamp }),
                });
            } catch (err) { console.error("Lỗi xóa:", err); }
        }
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        
        const lastDeleted = undoStack[undoStack.length - 1];
        
        // SỬA LỖI Ở ĐÂY: Trả lại nguyên vẹn món ăn gốc, KHÔNG tạo Timestamp mới nữa
        const restoredItem = lastDeleted.item;
        
        setHistory(prev => {
            const currentList = prev[currentDate] || [];
            const newList = [...currentList]; 
            // Chèn lại món ăn vào đúng vị trí cũ
            newList.splice(lastDeleted.index, 0, restoredItem);
            return { ...prev, [currentDate]: newList };
        });
        
        setUndoStack(prev => prev.slice(0, -1));
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
            <div className="min-h-screen bg-cream text-ink flex flex-col" style={{ fontFamily: WARM_FONT, letterSpacing: "-0.005em" }}>
                {/* HERO TILE — login */}
                <section className="flex-1 flex flex-col justify-center px-5 md:px-8 py-16 md:py-20">
                    <div className="mx-auto max-w-sm w-full text-center">
                        <div className="flex justify-center mb-8">
                            <span
                                className="grid h-20 w-20 place-items-center rounded-3xl text-3xl font-bold text-white"
                                style={{
                                    background: "linear-gradient(135deg, #E89B7B 0%, #D97757 100%)",
                                    filter: "drop-shadow(rgba(45,38,32,0.18) 3px 5px 30px)",
                                    letterSpacing: "-0.02em",
                                }}
                            >S</span>
                        </div>
                        <Eyebrow accent="orange-deep">StayFit · stayfit.id.vn</Eyebrow>
                        <HeroDisplay>Bắt đầu nuôi dưỡng.</HeroDisplay>
                        <Lead className="mt-3 text-ink-muted">Nhật ký calo &amp; sức khỏe đồng bộ liền mạch.</Lead>

                        <div className="mt-10 space-y-3 text-left">
                            <div>
                                <label style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted block mb-2 ml-1">Tên ID</label>
                                <input
                                    type="text"
                                    value={inputUser}
                                    onChange={e=>setInputUser(e.target.value)}
                                    placeholder="vd: quy2026"
                                    className="w-full bg-white ring-1 ring-ink/[0.08] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-deep/30 placeholder:text-ink-faint transition text-ink"
                                    style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}
                                />
                            </div>
                            <div>
                                <label style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted block mb-2 ml-1">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={inputPass}
                                    onChange={e=>setInputPass(e.target.value)}
                                    placeholder="••••••"
                                    className="w-full bg-white ring-1 ring-ink/[0.08] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-deep/30 placeholder:text-ink-faint transition text-ink"
                                    style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <PillButton onClick={handleLogin} disabled={loginLoading} className="w-full">
                                {loginLoading ? "Đang kết nối…" : "Đăng nhập"}
                            </PillButton>
                        </div>

                        <p style={{ fontSize: 12, lineHeight: 1.5, letterSpacing: "-0.005em" }} className="mt-5 text-ink-muted">
                            Chưa có tài khoản? Nhập ID &amp; mật khẩu mới để tự động đăng ký.
                        </p>
                    </div>
                </section>

                {/* PARCHMENT FOOTER */}
                <footer style={{ background: "#F4EFE6", borderTop: "1px solid rgba(45,38,32,0.08)" }} className="px-5 md:px-8 py-8 text-center">
                    <p style={{ fontSize: 12, letterSpacing: "-0.005em" }} className="text-ink-muted">© 2026 StayFit · Đồng hành cùng bạn</p>
                </footer>
            </div>
        );
    }

    if (view === "stats") {
        return <StatsView history={history} profile={profile} setProfile={setProfile} target={target} targetLog={targetLog} setView={setView} view={view} setCurrentDate={setCurrentDate} />;
    }
    
    if (view === "profile") {
        const userInitial = (userId || "?").trim().charAt(0).toUpperCase();
        return (
            <div className="min-h-screen bg-cream pb-28 animate-in fade-in duration-500 text-ink" style={{ fontFamily: WARM_FONT, letterSpacing: "-0.005em" }}>
                {/* Slim sticky header */}
                <header className="sticky top-0 z-30 backdrop-blur-md border-b border-ink/[0.08] px-5" style={{ background: "rgba(251, 248, 242, 0.85)" }}>
                    <div className="max-w-md md:max-w-2xl mx-auto py-3 text-center">
                        <span style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted">Cài đặt</span>
                        <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }} className="text-ink">Hồ sơ cá nhân</p>
                    </div>
                </header>

                <main>
                    {/* HERO TILE — avatar + tagline */}
                    <Tile tone="cream" className="text-center">
                        <div className="flex justify-center mb-6">
                            <span
                                className="grid h-24 w-24 place-items-center rounded-full text-3xl font-bold text-white"
                                style={{
                                    background: "linear-gradient(135deg, #E89B7B 0%, #D97757 100%)",
                                    filter: "drop-shadow(rgba(45,38,32,0.18) 3px 5px 30px)",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                {userInitial}
                            </span>
                        </div>
                        <Eyebrow accent="orange-deep">Thành viên</Eyebrow>
                        <HeroDisplay>{userId || "Khách"}</HeroDisplay>
                        <Lead className="mt-3 text-ink-muted">Lắng nghe cơ thể, nuôi dưỡng nhẹ nhàng.</Lead>
                    </Tile>

                    {/* WHITE TILE — Giới tính */}
                    <Tile tone="white">
                        <div className="text-center mb-8">
                            <Eyebrow accent="lilac-deep">👤 Giới tính</Eyebrow>
                            <Display>Cơ thể bạn nói gì?</Display>
                            <Lead className="mt-3 text-ink-muted">Để tính nhu cầu năng lượng chính xác hơn.</Lead>
                        </div>
                        <div className="flex gap-2 p-1.5 bg-cream-soft rounded-full ring-1 ring-ink/[0.06] max-w-sm mx-auto">
                            <button onClick={() => setProfile({...profile, gender: 'male'})} className={`flex-1 py-3 rounded-full transition active:scale-[0.97] ${profile.gender==='male' ? 'bg-white text-orange-deep ring-1 ring-ink/[0.08] shadow-soft' : 'text-ink-muted'}`} style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em" }}>Nam</button>
                            <button onClick={() => setProfile({...profile, gender: 'female'})} className={`flex-1 py-3 rounded-full transition active:scale-[0.97] ${profile.gender==='female' ? 'bg-white text-orange-deep ring-1 ring-ink/[0.08] shadow-soft' : 'text-ink-muted'}`} style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em" }}>Nữ</button>
                        </div>
                    </Tile>

                    {/* CREAM TILE — Chỉ số cơ thể */}
                    <Tile tone="cream">
                        <div className="text-center mb-8">
                            <Eyebrow accent="sage-deep">📏 Chỉ số cơ thể</Eyebrow>
                            <Display>Tuổi · Cân nặng · Chiều cao.</Display>
                            <Lead className="mt-3 text-ink-muted">Ba con số tạo nền cho mọi tính toán.</Lead>
                        </div>
                        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                            {[
                                { key: "age",    label: "Tuổi",      unit: "y",  value: profile.age,    setter: (v) => setProfile({...profile, age: +v}) },
                                { key: "weight", label: "Cân nặng",  unit: "kg", value: profile.weight, setter: (v) => setProfile({...profile, weight: +v}) },
                                { key: "height", label: "Chiều cao", unit: "cm", value: profile.height, setter: (v) => setProfile({...profile, height: +v}) },
                            ].map((f) => (
                                <div key={f.key} className="bg-white rounded-2xl ring-1 ring-ink/[0.08] p-4">
                                    <p style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted text-center mb-2">{f.label}</p>
                                    <div className="relative flex items-baseline justify-center gap-1">
                                        <input type="number" value={f.value} onChange={e => f.setter(e.target.value)} className="w-full bg-transparent text-center outline-none text-ink focus:ring-0 tabular-nums" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em" }} />
                                    </div>
                                    <p style={{ fontSize: 11, fontWeight: 500 }} className="text-ink-muted text-center mt-1">{f.unit}</p>
                                </div>
                            ))}
                        </div>
                    </Tile>

                    {/* WHITE TILE — Lối sống */}
                    <Tile tone="white">
                        <div className="text-center mb-8">
                            <Eyebrow accent="clay-deep">🎯 Lối sống</Eyebrow>
                            <Display>Vận động & hướng đi.</Display>
                            <Lead className="mt-3 text-ink-muted">Hai lựa chọn xác định ngân sách calo của bạn.</Lead>
                        </div>
                        <div className="space-y-3 max-w-md mx-auto">
                            <div>
                                <label style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted block mb-2 ml-1">Mức độ vận động</label>
                                <div className="relative">
                                    <select value={profile.activity} onChange={e=>{ setProfile({...profile, activity:+e.target.value, isManualTarget: false}); }} className="w-full bg-cream-soft ring-1 ring-ink/[0.08] p-4 pr-10 rounded-2xl outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-orange-deep/30 transition text-ink" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}>
                                        {ACTIVITY_LEVELS.map(l => ( <option key={l.value} value={l.value}>{l.label}</option> ))}
                                    </select>
                                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                            <div>
                                <label style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted block mb-2 ml-1">Mục tiêu cân nặng</label>
                                <div className="relative">
                                    <select value={profile.goal} onChange={e=>{ setProfile({...profile, goal:+e.target.value, isManualTarget: false}); }} className="w-full bg-cream-soft ring-1 ring-ink/[0.08] p-4 pr-10 rounded-2xl outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-orange-deep/30 transition text-ink" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}>
                                        {GOALS.map(l => ( <option key={l.value} value={l.value}>{l.label}</option> ))}
                                    </select>
                                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </div>
                    </Tile>

                    {/* DARK TILE — Calo budget (hero number on espresso) */}
                    <Tile tone="espresso" className="text-center">
                        <Eyebrow accent="on-dark">🔥 Năng lượng mỗi ngày</Eyebrow>
                        <Display className="text-white">Cần khoảng.</Display>
                        <p style={{ ...T_LEAD, color: "rgba(255,255,255,0.7)" }} className="mt-3">
                            Số calo cơ thể bạn cần để duy trì hành trình.
                        </p>

                        <div className="mt-10 flex items-baseline justify-center gap-2">
                            <input
                                type="number"
                                value={target}
                                onChange={e => { setProfile({ ...profile, isManualTarget: true, manualTargetKcal: parseInt(e.target.value) || 0 }); }}
                                className="bg-transparent text-center outline-none w-48 border-b-2 border-dashed transition-colors tabular-nums"
                                style={{
                                    fontSize: "clamp(56px, 14vw, 80px)",
                                    fontWeight: 600,
                                    letterSpacing: "-0.04em",
                                    color: "#E89B7B",
                                    borderColor: "rgba(232, 155, 123, 0.3)",
                                    lineHeight: 1,
                                }}
                            />
                            <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>kcal</span>
                        </div>

                        {profile.isManualTarget && (
                            <button
                                onClick={() => setProfile({...profile, isManualTarget: false})}
                                className="mt-6 bg-white/10 hover:bg-white/20 transition rounded-full"
                                style={{ padding: "8px 16px", fontSize: 12, fontWeight: 500, color: "#E89B7B", letterSpacing: "-0.005em", fontVariantNumeric: "tabular-nums" }}
                            >
                                ⟲ Trở về tự động ({calculatedTarget})
                            </button>
                        )}
                    </Tile>

                    {/* WHITE TILE — Macro tùy chỉnh */}
                    <Tile tone="white">
                        <div className="flex items-start justify-between gap-4 mb-8 max-w-md mx-auto">
                            <div className="text-left">
                                <Eyebrow accent="orange-deep">🥑 Macro</Eyebrow>
                                <Display>{profile.isManualMacro ? "Tự cân chỉnh." : "Theo tỉ lệ chuẩn."}</Display>
                            </div>
                            <button onClick={() => { const nextState = !profile.isManualMacro; setProfile({...profile, isManualMacro: nextState}); if (nextState) setIsDietModalOpen(true); }} className={`relative inline-flex h-7 w-12 items-center rounded-full transition shrink-0 ring-1 ${profile.isManualMacro ? 'bg-orange ring-orange-deep/20' : 'bg-cream-deep ring-cream-deep'}`} aria-label="Toggle macro">
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition shadow-soft ${profile.isManualMacro ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="max-w-md mx-auto">
                            {profile.isManualMacro ? (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-4 bg-cream-soft ring-1 ring-ink/[0.06] p-3 rounded-2xl">
                                        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em" }} className="text-ink truncate">{profile.macroDietMode || "Tự nhập tay"}</span>
                                        <button onClick={() => setIsDietModalOpen(true)} className="bg-white px-3 py-1.5 rounded-full text-orange-deep ring-1 ring-ink/[0.08] hover:bg-orange-soft transition active:scale-95 shrink-0" style={{ fontSize: 11, fontWeight: 500 }}>Đổi chế độ</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {[
                                            { key: "manualProtein", label: "Protein", accent: "#5F8266", ring: "sage" },
                                            { key: "manualCarb",    label: "Carb",    accent: "#C49A4A", ring: "clay" },
                                            { key: "manualFat",     label: "Fat",     accent: "#9B8AB8", ring: "lilac" },
                                        ].map(m => (
                                            <div key={m.key} className="bg-cream-soft ring-1 ring-ink/[0.06] rounded-2xl p-3">
                                                <p style={{ ...T_EYEBROW, fontSize: 9, color: m.accent }} className="text-center mb-1.5">{m.label}</p>
                                                <div className="relative flex items-baseline justify-center gap-0.5">
                                                    <input type="number" value={profile[m.key]} onChange={e => setProfile({...profile, [m.key]: e.target.value, macroDietMode: "Tự nhập tay (Custom)"})} className="w-full bg-transparent text-center outline-none text-ink tabular-nums" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.025em" }} />
                                                </div>
                                                <p style={{ fontSize: 10, fontWeight: 500 }} className="text-center text-ink-muted mt-0.5">g</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2.5 opacity-70">
                                    {[
                                        { label: "Protein", accent: "#5F8266", value: Math.round((target * 0.25 / 4) * 10) / 10 },
                                        { label: "Carb",    accent: "#C49A4A", value: Math.round((target * 0.50 / 4) * 10) / 10 },
                                        { label: "Fat",     accent: "#9B8AB8", value: Math.round((target * 0.25 / 9) * 10) / 10 },
                                    ].map(m => (
                                        <div key={m.label} className="bg-cream-soft rounded-2xl p-3 text-center">
                                            <p style={{ ...T_EYEBROW, fontSize: 9, color: m.accent }} className="mb-1.5">{m.label}</p>
                                            <p style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }} className="text-ink">{m.value}<span style={{ fontSize: 11, fontWeight: 400 }} className="text-ink-muted ml-0.5">g</span></p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tile>

                    {/* CREAM-SOFT TILE — Action buttons */}
                    <Tile tone="creamSoft" className="text-center">
                        <div className="max-w-md mx-auto space-y-3">
                            <PillButton onClick={() => setView("journal")} className="w-full">Quay lại nhật ký</PillButton>
                            <button
                                onClick={() => { setUserId(""); setPassword(""); localStorage.removeItem('stayfit_userid'); localStorage.removeItem('stayfit_password'); }}
                                className="block w-full text-ink-muted hover:text-orange-deep transition py-2"
                                style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em" }}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </Tile>
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
                            <button onClick={() => setIsDietModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-cream-deep/60 text-ink-muted hover:bg-cream-soft hover:text-ink transition" aria-label="Đóng">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar pb-10">
                            {DIET_MODES.map((cat, idx) => (
                                <div key={idx}>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-deep mb-2.5 ml-1">{cat.category}</h4>
                                    <div className="space-y-2">
                                        {cat.items.map(mode => (
                                            <button key={mode.id} onClick={() => applyDietMode(mode)} className={`w-full text-left p-4 rounded-2xl transition active:scale-[0.98] shadow-soft ring-1 ${profile.macroDietMode === mode.name ? 'bg-orange-soft ring-orange/40' : 'bg-white ring-cream-deep/60 hover:ring-orange/20 hover:bg-cream-soft'}`}>
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
        const now = new Date();
        const greet = timeGreeting(now.getHours());
        const quote = WELLNESS_QUOTES[Math.floor(now.getTime() / 3600000) % WELLNESS_QUOTES.length];
        const isToday = currentDate === formatDate(new Date());
        const remaining = Math.max(0, Math.round(target - dailyKcal));
        const MEAL_ICONS = { "Bữa sáng": "☀️", "Bữa trưa": "🌤", "Bữa tối": "🌙", "Ăn vặt": "⭐" };
        const MEAL_ACCENTS = { "Bữa sáng": "#C49A4A", "Bữa trưa": "#5F8266", "Bữa tối": "#9B8AB8", "Ăn vặt": "#D97757" };
        const scrollToPicker = () => {
            if (typeof document !== "undefined") {
                document.getElementById("add-food-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        return (
            <div className="min-h-screen bg-cream pb-28 animate-in fade-in duration-300 text-ink" style={{ fontFamily: WARM_FONT, letterSpacing: "-0.005em" }}>
                {/* DATE NAV — slim sticky frosted */}
                <header className="sticky top-0 z-30 backdrop-blur-md border-b border-ink/[0.08] px-5" style={{ background: "rgba(251, 248, 242, 0.85)" }}>
                    <div className="max-w-md md:max-w-2xl mx-auto py-3 flex justify-between items-center">
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()-1); setCurrentDate(formatDate(d)); }} className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-cream-soft hover:text-orange-deep transition" aria-label="Ngày trước">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 19l-7-7 7-7v14z"/></svg>
                        </button>
                        <div className="text-center">
                            <span style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted">{isToday ? "Hôm nay" : "Ngày"}</span>
                            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }} className="text-ink tabular-nums">{currentDate}</p>
                        </div>
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()+1); setCurrentDate(formatDate(d)); }} className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-cream-soft hover:text-orange-deep transition" aria-label="Ngày sau">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5l7 7-7 7V5z"/></svg>
                        </button>
                    </div>
                </header>

                <main>
                    {/* ───── HERO TILE — cream, calorie ring as "the product" ───── */}
                    <Tile tone="cream" className="text-center">
                        <Eyebrow accent="orange-deep">{greet}{userId ? `, ${userId}` : ""}</Eyebrow>
                        <HeroDisplay>
                            {isToday ? `Còn dư ${remaining.toLocaleString("vi-VN")} kcal.` : `Đã nạp ${Math.round(dailyKcal).toLocaleString("vi-VN")} kcal.`}
                        </HeroDisplay>
                        <Lead className="mt-3 text-ink-muted">{quote}</Lead>

                        <div className="mt-6 flex flex-wrap gap-3 justify-center">
                            <PillButton onClick={scrollToPicker}>Thêm món</PillButton>
                            {!isToday && (
                                <PillButton variant="ghost" onClick={() => setCurrentDate(formatDate(new Date()))}>Về hôm nay</PillButton>
                            )}
                        </div>

                        <div className="mt-14 flex justify-center">
                            <CalorieRingWarm consumed={dailyKcal} target={target} />
                        </div>
                    </Tile>

                    {/* ───── DARK TILE — espresso, dinh dưỡng ───── */}
                    <Tile tone="espresso" className="text-center">
                        <Eyebrow accent="on-dark">Dinh dưỡng</Eyebrow>
                        <Display className="text-white">Cân đối là một dạng chăm sóc.</Display>
                        <Lead className="mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>Theo dõi ba chất chính qua ngày.</Lead>

                        <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
                            <MacroBlockWarm label="Protein" value={dailyProtein} target={targetProtein} accent="#A8C09A" />
                            <MacroBlockWarm label="Carb"    value={dailyCarb}    target={targetCarb}    accent="#E8C892" />
                            <MacroBlockWarm label="Fat"     value={dailyFat}     target={targetFat}     accent="#C8B6E2" />
                        </div>

                        <div className="mt-10 flex items-center justify-center gap-2 text-[13px] tabular-nums" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "-0.005em" }}>
                            <span>Cần {Number(target).toLocaleString("vi-VN")}</span>
                            <span className="text-white/30">·</span>
                            <span>Đã nạp {Math.round(dailyKcal).toLocaleString("vi-VN")}</span>
                            <span className="text-white/30">·</span>
                            <span className="text-[#E89B7B] font-semibold">Còn dư {remaining.toLocaleString("vi-VN")}</span>
                        </div>
                    </Tile>

                    {/* ───── LIGHT TILE — white, add food picker ───── */}
                    <section id="add-food-section" className={`bg-white scroll-mt-20 ${SECTION_PY} px-5 md:px-8`}>
                        <div className="mx-auto max-w-md md:max-w-2xl">
                            <div className="text-center mb-10">
                                <Eyebrow accent="orange-deep">Thêm món</Eyebrow>
                                <Display>Vào {selectedMeal.toLowerCase()}.</Display>
                                <Lead className="mt-3 text-ink-muted">Tìm món có sẵn hoặc nhập tay.</Lead>
                            </div>

                            {/* Meal selector + tabs */}
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                {MEAL_TYPES.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMeal(m)}
                                        className="rounded-full transition active:scale-[0.97]"
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            letterSpacing: "-0.005em",
                                            background: selectedMeal === m ? "#D97757" : "#F4EFE6",
                                            color: selectedMeal === m ? "#fff" : "#2D2620",
                                            boxShadow: selectedMeal === m ? "inset 0 0 0 1px rgba(122,51,24,0.2)" : "inset 0 0 0 1px rgba(45,38,32,0.08)",
                                        }}
                                    >
                                        {MEAL_ICONS[m]} {m}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-1 p-1 bg-cream-soft rounded-full ring-1 ring-ink/[0.06]">
                                <button onClick={() => setTab("quick")} className={`flex-1 py-2.5 rounded-full transition ${tab === "quick" ? "bg-white text-orange-deep ring-1 ring-ink/[0.08] shadow-soft" : "text-ink-muted"}`} style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em" }}>Chọn nhanh</button>
                                <button onClick={() => setTab("custom")} className={`flex-1 py-2.5 rounded-full transition ${tab === "custom" ? "bg-white text-orange-deep ring-1 ring-ink/[0.08] shadow-soft" : "text-ink-muted"}`} style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em" }}>Nhập tay</button>
                            </div>

                            {tab === "quick" ? (
                                <div className="mt-5">
                                    {/* Search — pill shape */}
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"><IconSearch /></span>
                                        <input
                                            type="text"
                                            placeholder="Tìm món ăn..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full bg-white ring-1 ring-ink/[0.08] rounded-full py-3 pl-11 pr-5 outline-none focus:ring-2 focus:ring-orange-deep/30 placeholder:text-ink-faint transition"
                                            style={{ fontSize: 15, letterSpacing: "-0.005em" }}
                                        />
                                    </div>

                                    {/* Food grid — utility cards on cream-soft */}
                                    <div className="mt-4 grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto no-scrollbar pb-1">
                                        {filteredFoods.map((f, idx) => (
                                            <div key={f.name + idx} className="relative group">
                                                <button
                                                    onClick={() => { setSelectedFood(f); setQty(f.per); }}
                                                    className={`w-full p-4 pr-11 rounded-2xl text-left transition ring-1 ${selectedFood?.name === f.name ? "bg-orange-soft ring-orange-deep/30" : "bg-cream-soft ring-ink/[0.06] hover:ring-ink/[0.14]"} active:scale-[0.98]`}
                                                >
                                                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.005em" }} className="truncate text-ink mb-1">{f.name}</p>
                                                    <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }} className="text-ink">
                                                        {f.kcal}<span style={{ fontSize: 11, fontWeight: 400 }} className="text-ink-muted ml-1">kcal/{f.per}{f.unit}</span>
                                                    </p>
                                                </button>
                                                <div className="absolute right-1 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); openLibraryEditModal(f); }} className="p-1.5 text-ink-faint hover:text-orange-deep hover:bg-white rounded-lg transition" aria-label="Sửa"><IconEdit /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, foodToDelete: f, alertMessage: "" }); }} className="p-1.5 text-ink-faint hover:text-orange-deep hover:bg-white rounded-lg transition" aria-label="Xóa"><IconTrash /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredFoods.length === 0 && (
                                            <p className="col-span-2 text-center py-8 text-ink-muted text-[13px] italic">Không tìm thấy món ăn</p>
                                        )}
                                    </div>

                                    {/* Selected food preview */}
                                    {selectedFood && (() => {
                                        let weightInGrams = qty; const u = selectedFood.unit.toLowerCase();
                                        if (['kg', 'l', 'lít'].includes(u)) { weightInGrams = qty * 1000; }
                                        else if (['ml', 'g', 'gram'].includes(u)) { weightInGrams = qty; }
                                        else { const mockWeights = { 'tô': 400, 'ly': 250, 'quả': 100 }; weightInGrams = qty * (mockWeights[u] || 100); }

                                        const totalKcal = calcMacro(selectedFood.kcal, selectedFood.per, qty);
                                        const totalPro = calcMacro(selectedFood.protein, selectedFood.per, qty);
                                        const totalCarb = calcMacro(selectedFood.carb, selectedFood.per, qty);
                                        const totalFat = calcMacro(selectedFood.fat, selectedFood.per, qty);

                                        return (
                                            <div className="mt-6 pt-5 border-t border-ink/[0.08] animate-in slide-in-from-top-2">
                                                <div className="rounded-2xl bg-cream-soft ring-1 ring-ink/[0.06] p-5 mb-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="min-w-0 flex-1 pr-3">
                                                            <h5 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }} className="text-ink truncate">{selectedFood.name}</h5>
                                                            <p style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }} className="text-ink-muted mt-0.5">{qty} {selectedFood.unit} · ~{Math.round(weightInGrams)}g</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }} className="text-orange-deep">{totalKcal}</p>
                                                            <p style={{ ...T_EYEBROW, fontSize: 10 }} className="text-ink-muted mt-1">kcal</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="text-center bg-white rounded-xl py-2 ring-1 ring-ink/[0.06]">
                                                            <p style={{ ...T_EYEBROW, fontSize: 9 }} className="text-sage-deep">Protein</p>
                                                            <p style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }} className="text-ink mt-1">{totalPro}g</p>
                                                        </div>
                                                        <div className="text-center bg-white rounded-xl py-2 ring-1 ring-ink/[0.06]">
                                                            <p style={{ ...T_EYEBROW, fontSize: 9 }} className="text-clay-deep">Carb</p>
                                                            <p style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }} className="text-ink mt-1">{totalCarb}g</p>
                                                        </div>
                                                        <div className="text-center bg-white rounded-xl py-2 ring-1 ring-ink/[0.06]">
                                                            <p style={{ ...T_EYEBROW, fontSize: 9 }} className="text-lilac-deep">Fat</p>
                                                            <p style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }} className="text-ink mt-1">{totalFat}g</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24">
                                                        <label style={{ ...T_EYEBROW, fontSize: 9 }} className="text-ink-muted block mb-1.5">Số lượng</label>
                                                        <input type="number" value={qty} step="any" min="0.1" onChange={e => setQty(parseFloat(e.target.value) || 0)} className="w-full bg-cream-soft ring-1 ring-ink/[0.08] p-2.5 rounded-xl outline-none text-center focus:ring-2 focus:ring-orange-deep/30 transition tabular-nums" style={{ fontSize: 14, fontWeight: 600 }} />
                                                    </div>
                                                    <PillButton onClick={() => handleAddSelectedFood()} className="flex-1 mt-[22px]">Ghi vào nhật ký</PillButton>
                                                    <button onClick={() => { setSelectedFood(null); setQty(1); }} className="grid place-items-center h-11 w-11 mt-[22px] text-ink-faint hover:text-orange-deep bg-cream-soft ring-1 ring-ink/[0.08] rounded-full transition" aria-label="Hủy"><IconTrash /></button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    <input placeholder="Tên món (vd: Gà rán...)" value={customFood.name} onChange={e => setCustomFood(p=>({...p, name:e.target.value}))} className="w-full bg-cream-soft ring-1 ring-ink/[0.08] p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-deep/30 placeholder:text-ink-faint transition" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Số lượng" value={customFood.quantity} onChange={e => setCustomFood(p=>({...p, quantity:e.target.value}))} className="bg-cream-soft ring-1 ring-ink/[0.08] p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-deep/30 placeholder:text-ink-faint transition tabular-nums" style={{ fontSize: 15, fontWeight: 500 }} />
                                        <div className="relative">
                                            <select value={customFood.unit} onChange={e => setCustomFood(p=>({...p, unit:e.target.value}))} className="w-full bg-cream-soft ring-1 ring-ink/[0.08] p-3.5 pr-9 rounded-2xl outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-orange-deep/30 transition" style={{ fontSize: 15, fontWeight: 500 }}>
                                                <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="ly">ly</option><option value="tô">tô</option><option value="quả">quả</option>
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { key: "kcal",    label: "kcal", accent: "#D97757" },
                                            { key: "protein", label: "Pro",  accent: "#5F8266" },
                                            { key: "carb",    label: "Carb", accent: "#C49A4A" },
                                            { key: "fat",     label: "Fat",  accent: "#9B8AB8" },
                                        ].map(field => (
                                            <div key={field.key} className="relative">
                                                <input type="number" placeholder={field.key === "kcal" ? "Kcal" : field.label === "Pro" ? "Protein" : field.label} value={customFood[field.key]} onChange={e => setCustomFood(p=>({...p, [field.key]:e.target.value}))} className="w-full bg-cream-soft ring-1 ring-ink/[0.08] p-3.5 pr-12 rounded-2xl outline-none font-semibold focus:ring-2 placeholder:text-ink-faint transition tabular-nums" style={{ fontSize: 15, "--tw-ring-color": `${field.accent}4D` }} />
                                                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: field.accent }} className="absolute right-3 top-1/2 -translate-y-1/2">{field.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {customFood.name.trim() !== "" && parseFloat(customFood.kcal) > 0 && (
                                        <PillButton onClick={addCustom} className="w-full mt-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            Xác nhận thêm
                                        </PillButton>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ───── LIGHT TILE — cream, meal log ───── */}
                    <Tile tone="cream">
                        <div className="text-center mb-10">
                            <Eyebrow accent="orange-deep">Nhật ký bữa ăn</Eyebrow>
                            <Display>Ghi từng món, thấy cả ngày.</Display>
                            <Lead className="mt-3 text-ink-muted">
                                {dailyLog.length === 0 ? "Khi nào sẵn sàng, ghi món vào nhé." : `${dailyLog.length} món · ${Math.round(dailyKcal).toLocaleString("vi-VN")} kcal hôm nay.`}
                            </Lead>
                            {undoStack.length > 0 && (
                                <div className="mt-4">
                                    <PillButton variant="ghost" onClick={handleUndo}>↶ Hoàn tác</PillButton>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MEAL_TYPES.map((meal, i) => (
                                <div key={meal} className="animate-fade-rise" style={{ animationDelay: `${i * 70}ms` }}>
                                    <MealUtilityCard
                                        meal={meal}
                                        icon={MEAL_ICONS[meal]}
                                        accent={MEAL_ACCENTS[meal]}
                                        items={dailyLog.filter(it => it.meal === meal)}
                                        onAdd={(m) => { setSelectedMeal(m); scrollToPicker(); }}
                                        onRemove={removeFood}
                                    />
                                </div>
                            ))}
                        </div>
                    </Tile>

                    {/* ───── MINDFUL TILE ───── */}
                    <MindfulSection />



                    {/* --- MODAL CHỈNH SỬA THƯ VIỆN MÓN ĂN --- */}
                    {editLibraryModal.isOpen && (
                        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
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
                                                <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="ly">ly</option><option value="tô">tô</option><option value="quả">quả</option>
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
                                    <button onClick={saveLibraryEdit} className="w-full py-3.5 bg-orange text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-soft active:scale-95 transition-all mt-4">Lưu vào thư viện</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
                                {confirmModal.alertMessage ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-4"><span className="font-black text-xl">!</span></div>
                                        <h3 className="text-sm font-black text-ink mb-2 uppercase tracking-widest">Thông báo</h3>
                                        <p className="text-xs text-ink-muted mb-6 font-medium leading-relaxed">{confirmModal.alertMessage}</p>
                                        <button onClick={() => setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" })} className="w-full py-3.5 bg-ink text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Đã hiểu</button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-orange-soft text-orange-deep flex items-center justify-center mx-auto mb-4"><IconTrash /></div>
                                        <h3 className="text-sm font-black text-ink mb-2 uppercase tracking-widest">Xác nhận xóa</h3>
                                        <p className="text-xs text-ink-muted mb-6 font-medium leading-relaxed">Bạn có chắc muốn xóa <span className="font-black text-ink">"{confirmModal.foodToDelete?.name}"</span>?</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirmModal({ isOpen: false, foodToDelete: null, alertMessage: "" })} className="flex-1 py-3.5 bg-cream-deep text-ink rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Hủy</button>
                                            <button onClick={handleConfirmDelete} className="flex-1 py-3.5 bg-orange-deep text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-soft active:scale-95 transition-all">Xóa Món</button>
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

/* ────────────────────────────────────────────────────────────── */
/*  APPLE-QUIET × WARM PALETTE — Helpers                          */
/* ────────────────────────────────────────────────────────────── */

const WARM_FONT = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif`;

// Typography tokens (inline để precise letter-spacing)
const T_EYEBROW    = { fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", lineHeight: 1.4 };
const T_HERO       = { fontSize: "clamp(34px, 8vw, 48px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.028em" };
const T_DISPLAY    = { fontSize: "clamp(26px, 6vw, 36px)", fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.022em" };
const T_LEAD       = { fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: "-0.01em" };
const T_BODY       = { fontSize: 15, fontWeight: 400, lineHeight: 1.5, letterSpacing: "-0.005em" };
const T_CAPTION    = { fontSize: 13, fontWeight: 400, lineHeight: 1.43, letterSpacing: "-0.01em" };

// Section padding token
const SECTION_PY   = "py-16 md:py-20";

// Reusable section wrapper — full-bleed tile with center container
function Tile({ tone = "cream", children, className = "" }) {
    const toneClass = {
        cream:     "bg-cream",
        white:     "bg-white",
        creamSoft: "bg-cream-soft",
        espresso:  "bg-ink text-white",
        forest:    "text-white",
    }[tone] || "bg-cream";
    const inlineBg = tone === "forest" ? { background: "#2D4632" } : {};

    return (
        <section className={`${toneClass} ${SECTION_PY} px-5 md:px-8 ${className}`} style={inlineBg}>
            <div className="mx-auto max-w-md md:max-w-2xl">{children}</div>
        </section>
    );
}

function Eyebrow({ children, accent = "orange-deep", className = "" }) {
    const colorClass = {
        "orange-deep": "text-orange-deep",
        "sage-deep":   "text-sage-deep",
        "clay-deep":   "text-clay-deep",
        "lilac-deep":  "text-lilac-deep",
        "muted":       "text-ink-muted",
        "on-dark":     "text-[#E89B7B]",
    }[accent];
    return <p style={T_EYEBROW} className={`m-0 mb-3 ${colorClass} ${className}`}>{children}</p>;
}

function Display({ as: Tag = "h2", children, className = "" }) {
    return <Tag style={T_DISPLAY} className={`m-0 ${className}`}>{children}</Tag>;
}

function HeroDisplay({ children, className = "" }) {
    return <h1 style={T_HERO} className={`m-0 ${className}`}>{children}</h1>;
}

function Lead({ children, className = "" }) {
    return <p style={T_LEAD} className={`m-0 ${className}`}>{children}</p>;
}

function PillButton({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) {
    const baseStyle = {
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        lineHeight: 1.24,
        padding: "11px 22px",
    };
    const variants = {
        primary: "bg-orange text-white hover:bg-orange-deep ring-1 ring-orange-deep/10 shadow-soft",
        ghost:   "bg-transparent text-orange-deep ring-1 ring-orange-deep/40 hover:bg-orange-soft",
        dark:    "bg-white text-ink ring-1 ring-cream-deep/60 hover:bg-cream-soft",
        onDark:  "bg-white text-ink hover:bg-cream-soft",
        ghostOnDark: "bg-transparent text-[#E89B7B] ring-1 ring-white/30 hover:bg-white/10",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={baseStyle}
            className={`inline-flex items-center justify-center rounded-full transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

// Inline link styled as Apple text-link
function TextLink({ children, onClick, onDark = false, className = "" }) {
    const color = onDark ? "#E89B7B" : "#7A3318";
    return (
        <button
            type="button"
            onClick={onClick}
            style={{ color, fontSize: 15, letterSpacing: "-0.01em", fontWeight: 500 }}
            className={`hover:underline transition ${className}`}
        >
            {children}
        </button>
    );
}

// Big calorie ring — "the product" với 1 product-shadow duy nhất
function CalorieRingWarm({ consumed, target, size = 280 }) {
    const stroke = 20;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const ratio = Math.min(1, target > 0 ? consumed / target : 0);
    const offset = c * (1 - ratio);
    const remaining = Math.max(0, target - consumed);
    const fmt = (n) => Math.round(n).toLocaleString("vi-VN");

    return (
        <div
            className="relative inline-flex items-center justify-center"
            style={{
                width: size,
                height: size,
                filter: "drop-shadow(rgba(45, 38, 32, 0.18) 3px 5px 30px)",
            }}
        >
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id="ringWarmJournal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E89B7B"/>
                        <stop offset="100%" stopColor="#D97757"/>
                    </linearGradient>
                </defs>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EBE3D2" strokeWidth={stroke}/>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ringWarmJournal)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s ease-out" }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span style={{ fontSize: "clamp(40px, 10vw, 56px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }} className="text-ink">{fmt(remaining)}</span>
                <span style={{ fontSize: 13, letterSpacing: "-0.005em", fontVariantNumeric: "tabular-nums" }} className="mt-2 text-ink-muted">kcal còn dư</span>
                <span style={{ fontSize: 11, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }} className="mt-1 uppercase text-ink-faint">{fmt(consumed)} / {fmt(target)}</span>
            </div>
        </div>
    );
}

// Macro block trên dark tile
function MacroBlockWarm({ label, value, target, accent }) {
    const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return (
        <div className="text-center">
            <p style={{ ...T_EYEBROW, color: accent }} className="m-0 mb-3">{label}</p>
            <p style={{ fontSize: "clamp(32px, 8vw, 44px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }} className="m-0 text-white">
                {Math.round(value)}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginLeft: 4, fontWeight: 400 }}>g</span>
            </p>
            <p style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }} className="mt-2 text-white/60">{Math.round(target)}g · {pct}%</p>
            <div className="mx-auto mt-3 h-[3px] max-w-[160px] overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: accent }}/>
            </div>
        </div>
    );
}

// Meal utility card (hairline border, no shadow)
function MealUtilityCard({ meal, items, icon, onAdd, onRemove, accent }) {
    const totalKcal = items.reduce((s, i) => s + (i.kcal || 0), 0);
    const isEmpty = items.length === 0;
    return (
        <div className="bg-white rounded-[18px] ring-1 ring-ink/[0.08] p-5 md:p-6 flex flex-col gap-3 transition hover:ring-ink/[0.16]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{icon}</span>
                    <div className="min-w-0">
                        <p style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }} className="m-0 text-ink truncate">{meal}</p>
                        <p style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }} className="m-0 mt-0.5 text-ink-muted">
                            {isEmpty ? "Chưa có món" : `${items.length} món`}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onAdd?.(meal)}
                    aria-label={`Thêm ${meal}`}
                    className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink ring-1 ring-cream-deep/60 hover:bg-orange hover:text-white hover:ring-orange transition shrink-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
            </div>

            {!isEmpty && (
                <>
                    <div className="flex items-baseline gap-1.5">
                        <span style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }} className="text-ink">{Math.round(totalKcal)}</span>
                        <span style={{ fontSize: 14 }} className="text-ink-muted">kcal</span>
                    </div>
                    <div className="space-y-1.5 mt-1">
                        {items.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between gap-2 py-1">
                                <div className="min-w-0 flex-1">
                                    <p style={{ fontSize: 14, fontWeight: 500 }} className="m-0 truncate text-ink">{item.name}</p>
                                    <p style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }} className="m-0 mt-0.5 text-ink-muted">
                                        {item.quantity}{item.unit} · {Math.round(item.protein)}P / {Math.round(item.carb)}C / {Math.round(item.fat)}F
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }} className="text-ink">{Math.round(item.kcal)}</span>
                                    <button onClick={() => onRemove(item.id)} aria-label="Xóa" className="text-ink-faint hover:text-orange-deep opacity-0 group-hover:opacity-100 transition p-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {isEmpty && (
                <button
                    onClick={() => onAdd?.(meal)}
                    className="mt-1 w-full text-left"
                    style={{ fontSize: 15, color: accent, fontWeight: 500, letterSpacing: "-0.01em" }}
                >
                    Ghi món cho {meal.toLowerCase()} ›
                </button>
            )}
        </div>
    );
}

// MindfulCard — apple-quiet treatment
function MindfulSection() {
    const [breathing, setBreathing] = useState(false);
    return (
        <>
            <Tile tone="creamSoft" className="text-center">
                <Eyebrow accent="sage-deep">Mindful</Eyebrow>
                <Display>Thư giãn hai phút.</Display>
                <Lead className="mt-3 text-ink-muted">Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.</Lead>
                <div className="mt-10 flex justify-center">
                    <div
                        className="grid h-40 w-40 place-items-center rounded-full text-5xl animate-gentle-pulse"
                        style={{
                            background: "radial-gradient(circle, #A8C09A, #5F8266)",
                            filter: "drop-shadow(rgba(45,38,32,0.18) 3px 5px 30px)",
                            animationDuration: "6s",
                        }}
                    >🧘</div>
                </div>
                <div className="mt-10">
                    <PillButton variant="ghost" onClick={() => setBreathing(true)}>Bắt đầu thở</PillButton>
                </div>
            </Tile>
            {breathing && <BreathingTimer onClose={() => setBreathing(false)} />}
        </>
    );
}

// Helper for greeting in journal hero
function timeGreeting(hour) {
    if (hour >= 5 && hour < 11) return "Chào buổi sáng";
    if (hour >= 11 && hour < 14) return "Chào buổi trưa";
    if (hour >= 14 && hour < 18) return "Chào buổi chiều";
    if (hour >= 18 && hour < 22) return "Chào buổi tối";
    return "Đêm an lành";
}

const WELLNESS_QUOTES = [
    "Cơ thể bạn đang lắng nghe — hãy nuôi dưỡng nó nhẹ nhàng.",
    "Mỗi bữa ăn là một cách nói cảm ơn với cơ thể.",
    "Bạn không cần hoàn hảo, chỉ cần có mặt.",
    "Một ngụm nước cũng là chăm sóc.",
    "Cân bằng quan trọng hơn kỷ luật.",
    "Lắng nghe đói no — cơ thể biết điều nó cần.",
    "Bước nhỏ mỗi ngày tạo nên thay đổi lớn.",
];