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

function StatsView({ history, profile, setProfile, target, targetLog, setView, view, setCurrentDate, userId, password, pendingChangeRef }) {
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
        const inputVal = parseFloat(weightInput);
        if (!inputVal || inputVal <= 0) return alert("Vui lòng nhập số kg hợp lệ!");
        const newLog = { ...weightLog, [weightDate]: inputVal };
        setWeightLog(newLog);
        localStorage.setItem('stayfit_weight_log', JSON.stringify(newLog));

        // Set pendingChangeRef IMMEDIATELY để chặn bất kỳ pull nào đang chạy
        if (pendingChangeRef) pendingChangeRef.current = true;

        // Tính profile mới và cập nhật state
        const newProfile = { ...profile, weight: inputVal };
        setProfile(newProfile);
        setWeightInput("");

        // Push trực tiếp lên server NGAY thay vì chờ debounce 2.5s
        // — loại bỏ race window với pull
        if (userId && password) {
            try {
                const profileToSave = { ...newProfile };
                if (!profileToSave.isManualTarget) profileToSave.manualTargetKcal = "";
                if (!profileToSave.isManualMacro) {
                    profileToSave.manualProtein = ""; profileToSave.manualCarb = ""; profileToSave.manualFat = ""; profileToSave.macroDietMode = "";
                }
                await fetch("/api/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "upload",
                        userId, password,
                        profile: profileToSave,
                        weightLog: newLog,
                    }),
                });
                if (pendingChangeRef) pendingChangeRef.current = false;
            } catch (err) {
                console.error("Lỗi lưu cân nặng ngay:", err.message);
            }
        }
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
                        { type: 'line', label: 'Tổng', data: dataTotal, stack: 'lineTotal', borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: false, datalabels: { align: 'end', anchor: 'end', color: '#2D2620', font: { weight: '600', size: 10 }, formatter: (val) => val > 0 ? val.toLocaleString('vi-VN') : '' } },
                        { type: 'line', label: 'Mục tiêu', data: targetLine, stack: 'lineTarget', borderColor: '#B8AFA4', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false, tension: 0, datalabels: { display: false } },

                        // 4 bữa ăn — pastel match meal accent của journal, đậm hơn 1 notch
                        { type: 'bar', label: 'Bữa sáng', data: dataBreakfast, stack: 'bars', backgroundColor: '#DCBE85', borderWidth: 0, borderRadius: 4, datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa trưa', data: dataLunch, stack: 'bars', backgroundColor: '#A8C29D', borderWidth: 0, borderRadius: 4, datalabels: { display: false } },
                        { type: 'bar', label: 'Bữa tối', data: dataDinner, stack: 'bars', backgroundColor: '#C0AFD3', borderWidth: 0, borderRadius: 4, datalabels: { display: false } },
                        { type: 'bar', label: 'Ăn vặt', data: dataSnack, stack: 'bars', backgroundColor: '#ECA890', borderWidth: 0, borderRadius: 4, datalabels: { display: false } }
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
                        x: { stacked: true, display: true, grid: { display: false, drawBorder: false }, ticks: { font: { weight: '500', size: 10 }, color: '#7A7066' } },
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

           macroChartInstance.current = new Chart(ctx, {
                type: 'line',
                data: { labels: labels, datasets: [
                    { label: 'Protein', data: dataProtein, borderColor: '#7E9D88', backgroundColor: '#7E9D88', borderWidth: 2.5, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, datalabels: { display: false } },
                    { label: 'Carb',    data: dataCarb,    borderColor: '#CFA75A', backgroundColor: '#CFA75A', borderWidth: 2.5, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, datalabels: { display: false } },
                    { label: 'Fat',     data: dataFat,     borderColor: '#A998C0', backgroundColor: '#A998C0', borderWidth: 2.5, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, datalabels: { display: false } }
                ]},
                options: {
                    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25, bottom: 15 } },
                    onClick: handleChartClick, onHover: handleChartHover,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11, weight: '500' }, color: '#2D2620', padding: 12 } },
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
                        x: { display: true, grid: { display: false, drawBorder: false }, ticks: { font: { weight: '500', size: 10 }, color: '#7A7066' } }
                    }
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

    return (
        <div className="max-w-md mx-auto min-h-screen bg-cream pb-28 animate-in fade-in duration-300 relative text-ink">
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
                        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6 relative">
                            <header className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-xl">⚖️</span>
                                    <div>
                                        <h3 className="text-[15px] font-bold tracking-tight text-ink">Tiến trình cân nặng</h3>
                                        <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Theo dõi hành trình của bạn</p>
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
                                            <div className="absolute right-0 top-11 z-40 w-60 bg-white rounded-2xl shadow-lift ring-1 py-1.5 overflow-hidden">
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
                                        backgroundImage: 'repeating-linear-gradient(135deg, #F4EFE6 0 8px, #EBE3D2 8px 16px)',
                                    }}
                                >
                                    {hasGoal && progressPct > 0 && (
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full transition-all"
                                            style={{
                                                width: `${progressPct}%`,
                                                backgroundImage: 'repeating-linear-gradient(135deg, #D97757 0 8px, #C56A4A 8px 16px)',
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
                                        Chưa đặt mục tiêu — bấm <span className="font-semibold">⋯</span> để bắt đầu
                                    </p>
                                )}
                            </div>
                        </section>
                    );
                })()}

                {/* MODAL: GHI LẠI CÂN NẶNG */}
                {weightModal === "log" && (
                    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[16px] font-bold text-ink tracking-tight">Ghi lại cân nặng</h3>
                                <button onClick={() => setWeightModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep transition" aria-label="Đóng">
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
                                    className="w-full h-12 bg-orange text-white rounded-2xl font-bold text-[14px] transition hover:bg-orange-deep shadow-soft mt-2"
                                >
                                    Lưu cân nặng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: CHỈNH SỬA MỤC TIÊU */}
                {weightModal === "goal" && (
                    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[16px] font-bold text-ink tracking-tight">Chỉnh sửa mục tiêu</h3>
                                <button onClick={() => setWeightModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep transition" aria-label="Đóng">
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
                                    onClick={async () => {
                                        const start = parseFloat(goalDraft.start);
                                        const tgt = parseFloat(goalDraft.target);
                                        if (!start || !tgt || start <= 0 || tgt <= 0) { alert("Vui lòng nhập số kg hợp lệ!"); return; }
                                        if (pendingChangeRef) pendingChangeRef.current = true;
                                        const newProfile = { ...profile, startWeight: start, targetWeight: tgt };
                                        setProfile(newProfile);
                                        setWeightModal(null);
                                        // Push goal NGAY để không bị pull overwrite
                                        if (userId && password) {
                                            try {
                                                const profileToSave = { ...newProfile };
                                                if (!profileToSave.isManualTarget) profileToSave.manualTargetKcal = "";
                                                if (!profileToSave.isManualMacro) {
                                                    profileToSave.manualProtein = ""; profileToSave.manualCarb = ""; profileToSave.manualFat = ""; profileToSave.macroDietMode = "";
                                                }
                                                await fetch("/api/sync", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ action: "upload", userId, password, profile: profileToSave }),
                                                });
                                                if (pendingChangeRef) pendingChangeRef.current = false;
                                            } catch (err) {
                                                console.error("Lỗi lưu mục tiêu:", err.message);
                                            }
                                        }
                                    }}
                                    className="w-full h-12 bg-orange text-white rounded-2xl font-bold text-[14px] transition hover:bg-orange-deep shadow-soft mt-2"
                                >
                                    Lưu mục tiêu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: LỊCH SỬ CÂN NẶNG */}
                {weightModal === "history" && (
                    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[16px] font-bold text-ink tracking-tight">Lịch sử cân nặng</h3>
                                <button onClick={() => setWeightModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep transition" aria-label="Đóng">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar bg-cream-soft rounded-2xl p-2 ring-1">
                                {sortedDates.length === 0 ? (
                                    <p className="text-center text-ink-faint text-[12px] italic font-medium py-8">Chưa có bản ghi nào</p>
                                ) : (
                                    sortedDates.map(date => (
                                        <div key={date} className="flex justify-between items-center p-3 bg-white rounded-xl mb-1.5 last:mb-0 ring-1 ring-cream-deep/40">
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
                <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 relative md:p-6">
                    <header className="flex items-center gap-3 mb-4">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft text-xl">📈</span>
                        <div>
                            <h3 className="text-[15px] font-bold tracking-tight text-ink">Biểu đồ cân nặng</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-ink-muted">14 ngày gần nhất</p>
                        </div>
                    </header>
                    {sortedDates.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-3xl z-10">
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
                        { color: "bg-sage",     flex: 6.5, label: "Khỏe mạnh",  range: "18.5–24.9", dot: "bg-sage" },
                        { color: "bg-orange",   flex: 5,   label: "Thừa cân",   range: "25.0–29.9", dot: "bg-orange" },
                        { color: "bg-rose-500", flex: 10,  label: "Béo phì",    range: ">30.0",     dot: "bg-rose-500" },
                    ];

                    return (
                        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                            <header className="flex items-center gap-3 mb-4">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mist-soft text-xl">⚖️</span>
                                <div>
                                    <h3 className="text-[15px] font-bold tracking-tight text-ink">Chỉ số BMI của bạn</h3>
                                    <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Tính từ cân nặng và chiều cao hiện tại</p>
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
                <div className="flex justify-between items-center bg-white p-1.5 rounded-2xl shadow-soft ring-1 sticky top-[64px] z-10">
                    <button onClick={() => setChartOffset(p => p + 1)} className="px-3 py-2 bg-cream-soft hover:bg-orange-soft hover:text-orange-deep text-ink-muted rounded-xl text-[11px] font-semibold transition">‹ 14 ngày trước</button>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted text-center px-2 tabular-nums">
                        {getWeekLabel(currentChartDates[0])} – {getWeekLabel(currentChartDates[currentChartDates.length-1])}
                    </span>
                    <button onClick={() => setChartOffset(p => Math.max(0, p - 1))} disabled={chartOffset === 0} className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition ${chartOffset === 0 ? 'text-cream-deep cursor-not-allowed' : 'bg-cream-soft hover:bg-orange-soft hover:text-orange-deep text-ink-muted'}`}>Tiếp ›</button>
                </div>

                {/* KCAL CHART */}
                <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                    <header className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-clay-soft text-xl">🔥</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Năng lượng đã nạp</h3>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Theo bữa ăn mỗi ngày</p>
                            </div>
                        </div>
                        <span className="text-[10px] text-ink-faint italic shrink-0">nhấn để xem</span>
                    </header>
                    <div className="h-48 relative w-full"><canvas ref={kcalChartRef}></canvas></div>
                </section>

                {/* MACRO CHART */}
                <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                    <header className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lilac-soft text-xl">🥗</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Protein · Carb · Fat</h3>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Xu hướng macro</p>
                            </div>
                        </div>
                        <span className="text-[10px] text-ink-faint italic shrink-0">nhấn để xem</span>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-cream-deep p-4 z-40 flex justify-around items-center rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] max-w-md mx-auto">
            <button onClick={() => setView("journal")} className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/3 ${view==='journal' ? 'text-orange scale-110 font-black':'text-ink-faint opacity-60'}`}>
                <IconJournal /><span className="text-[9px] uppercase font-bold tracking-tighter">Nhật ký</span>
            </button>
            <button onClick={() => setView("stats")} className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/3 ${view==='stats' ? 'text-orange scale-110 font-black':'text-ink-faint opacity-60'}`}>
                <IconStats /><span className="text-[9px] uppercase font-bold tracking-tighter">Thống kê</span>
            </button>
            <button onClick={() => setView("profile")} className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/3 ${view==='profile' ? 'text-orange scale-110 font-black':'text-ink-faint opacity-60'}`}>
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

    // AI Vision scan state
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [scanState, setScanState] = useState({
        file: null,
        preview: null,
        loading: false,
        error: null,
        items: null,
    });
    const [scanFeedbackCache, setScanFeedbackCache] = useState([]);
    const [dismissedSuggestions, setDismissedSuggestions] = useState([]);
    const [librarySuggestion, setLibrarySuggestion] = useState(null);
    const [suggestionForm, setSuggestionForm] = useState({ name: "", per: 100, kcal: 0, protein: 0, carb: 0, fat: 0 });
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
            localStorage.setItem('stayfit_dismissed_suggestions', JSON.stringify(dismissedSuggestions));
            if (view !== "profile" && userId) localStorage.setItem('stayfit_setup', 'done');
        }
    }, [profile, history, customFoodList, deletedCommonFoods, dismissedSuggestions, view, userId, isClient]);

    // Mốc thời gian pull gần nhất — dùng để skip push echo ngay sau khi pull
    const lastPullAtRef = useRef(0);
    // Cờ chống chạy đồng thời nhiều syncFromCloud
    const pullingRef = useRef(false);
    // Cờ báo có thay đổi local chưa push lên server (chống pull overwrite changes pending)
    const pendingChangeRef = useRef(false);

    const syncToCloud = async () => {
        if (!userId || !password) return;
        // Tránh push echo: nếu vừa pull xong dưới 1.5s thì bỏ qua (state đổi do pull, không phải user)
        if (Date.now() - lastPullAtRef.current < 1500) {
            pendingChangeRef.current = false;
            return;
        }
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
            pendingChangeRef.current = false;
        } catch (err) { console.error("Lỗi lưu ngầm:", err.message); }
    };

    const syncFromCloud = async () => {
        if (!userId || !password) return;
        if (pullingRef.current) return;
        // Có thay đổi local chưa kịp push → bỏ qua pull để tránh overwrite mất dữ liệu user
        if (pendingChangeRef.current) return;
        pullingRef.current = true;
        try {
            const res = await fetch(`/api/sync?userId=${userId}&password=${password}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (Object.keys(data).length === 0 || (!data.profile && !data.history)) return;

            // Re-check sau khi GET xong: nếu user đã save trong lúc fetch, bỏ qua merge để giữ data local
            if (pendingChangeRef.current) return;

            if (data.profile) {
                data.profile.isManualTarget = typeof data.profile.manualTargetKcal === 'number' && !isNaN(data.profile.manualTargetKcal);
                if (!data.profile.isManualTarget) data.profile.manualTargetKcal = 2000;
                data.profile.isManualMacro = profile.isManualMacro || false;
                data.profile.manualProtein = profile.manualProtein || 125;
                data.profile.manualCarb = profile.manualCarb || 250;
                data.profile.manualFat = profile.manualFat || 55;
                data.profile.macroDietMode = profile.macroDietMode || "Tiêu chuẩn (Standard)";
                setProfile(prev => {
                    // Nếu có pending change vào phút chót thì giữ nguyên prev
                    if (pendingChangeRef.current) return prev;
                    return { ...prev, ...data.profile };
                });
            }
            if (data.history) setHistory(data.history);
            if (data.weightLog) localStorage.setItem("stayfit_weight_log", JSON.stringify(data.weightLog));
            if (Array.isArray(data.customFoods)) setCustomFoodList(data.customFoods);
            if (Array.isArray(data.deletedCommonFoods)) setDeletedCommonFoods(data.deletedCommonFoods);
            if (Array.isArray(data.scanFeedback)) {
                setScanFeedbackCache(data.scanFeedback);
                localStorage.setItem('stayfit_scan_feedback', JSON.stringify({
                    data: data.scanFeedback, ts: Date.now()
                }));
            }

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
        // Đánh dấu có thay đổi local đang chờ push → chặn pull cho đến khi push xong
        pendingChangeRef.current = true;
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
    const openScanModal = () => setScanModalOpen(true);

    const closeScanModal = () => {
        setScanModalOpen(false);
        setTimeout(() => {
            setScanState({ file: null, preview: null, loading: false, error: null, items: null });
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
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Phân tích thất bại");

            const items = (data.items || []).map((it) => ({
                ...it,
                _checked: true,
                _qty: it.grams,
                _meal: MEAL_TYPES.includes(it.meal_suggestion) ? it.meal_suggestion : selectedMeal,
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
            // Fire-and-forget POST sang Sheets
            fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "scan_feedback", userId, password, ...feedbackEntry }),
            }).catch(err => console.warn("Feedback log failed:", err));
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
                id: baseTs + i,
                timestamp: `${baseTs + i}-${Math.random().toString(36).slice(2, 7)}`,
            };
        });
        setHistory(prev => ({
            ...prev,
            [currentDate]: [...(prev[currentDate] || []), ...newEntries],
        }));
        closeScanModal();
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
            <div className="max-w-md mx-auto min-h-screen bg-orange flex flex-col items-center justify-center p-8 text-white relative overflow-hidden font-sans">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-deep rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
                <div className="bg-white/10 p-8 rounded-[2.5rem] w-full backdrop-blur-xl border border-white/20 text-center shadow-2xl relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter italic mb-8">STAYFIT</h1>
                    <div className="space-y-3 mb-6">
                        <input type="text" value={inputUser} onChange={e=>setInputUser(e.target.value)} placeholder="Tên ID (vd: quy2026)" className="w-full bg-white/20 text-white placeholder:text-white/60 p-4 rounded-2xl outline-none font-bold text-center focus:ring-2 focus:ring-white transition-all" />
                        <input type="password" value={inputPass} onChange={e=>setInputPass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-white/20 text-white placeholder:text-white/60 p-4 rounded-2xl outline-none font-bold text-center focus:ring-2 focus:ring-white transition-all" onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
                    </div>
                    <button onClick={handleLogin} disabled={loginLoading} className="w-full py-4 bg-white text-orange rounded-2xl font-black uppercase tracking-widest hover:scale-95 transition-all shadow-xl disabled:opacity-50">{loginLoading ? "Đang kết nối..." : "Đăng Nhập"}</button>
                    <p className="text-[9px] text-white/50 font-bold mt-4 px-4 leading-relaxed">Nếu chưa có tài khoản, hãy nhập ID & Mật khẩu mới để tự động đăng ký.</p>
                </div>
            </div>
        );
    }

    if (view === "stats") {
        return <StatsView history={history} profile={profile} setProfile={setProfile} target={target} targetLog={targetLog} setView={setView} view={view} setCurrentDate={setCurrentDate} userId={userId} password={password} pendingChangeRef={pendingChangeRef} />;
    }
    
    if (view === "profile") {
        const userInitial = (userId || "?").trim().charAt(0).toUpperCase();
        return (
            <div className="max-w-md mx-auto min-h-screen bg-cream pb-28 animate-in fade-in duration-500 relative font-sans text-ink">
                {/* Slim sticky header */}
                <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-cream-deep px-4 py-3 flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Cài đặt</span>
                        <p className="text-sm font-bold text-ink">Hồ sơ cá nhân</p>
                    </div>
                </header>

                <main className="p-4 space-y-5">
                    {/* PROFILE HERO — avatar + ID */}
                    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                        <div className="flex items-center gap-4">
                            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange to-orange-deep text-2xl font-bold text-white shadow-soft">
                                {userInitial}
                            </span>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-deep">Thành viên</span>
                                <h2 className="mt-0.5 text-[16px] font-bold tracking-tight text-ink truncate">{userId || "Khách"}</h2>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Lắng nghe cơ thể, nuôi dưỡng nhẹ nhàng</p>
                            </div>
                        </div>
                    </section>

                    {/* GIỚI TÍNH */}
                    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center gap-3 mb-4">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lilac-soft text-xl">👤</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Giới tính</h3>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Để tính BMR chính xác</p>
                            </div>
                        </header>
                        <div className="flex gap-1.5 p-1 bg-cream-soft rounded-2xl ring-1">
                            <button onClick={() => setProfile({...profile, gender: 'male'})} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition ${profile.gender==='male' ? 'bg-white text-orange-deep shadow-soft ring-1' : 'text-ink-muted hover:text-ink'}`}>Nam</button>
                            <button onClick={() => setProfile({...profile, gender: 'female'})} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition ${profile.gender==='female' ? 'bg-white text-orange-deep shadow-soft ring-1' : 'text-ink-muted hover:text-ink'}`}>Nữ</button>
                        </div>
                    </section>

                    {/* CHỈ SỐ CƠ THỂ */}
                    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center gap-3 mb-4">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft text-xl">📏</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Chỉ số cơ thể</h3>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Tuổi · Cân nặng · Chiều cao</p>
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
                                    <input type="number" value={profile.weight} onChange={e=>setProfile({...profile, weight:+e.target.value})} className="w-full bg-cream-soft ring-1 p-3 pr-8 rounded-2xl outline-none font-bold text-[14px] text-ink focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted">kg</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Chiều cao</label>
                                <div className="relative">
                                    <input type="number" value={profile.height} onChange={e=>setProfile({...profile, height:+e.target.value})} className="w-full bg-cream-soft ring-1 p-3 pr-8 rounded-2xl outline-none font-bold text-[14px] text-ink focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted">cm</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* VẬN ĐỘNG + MỤC TIÊU */}
                    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center gap-3 mb-4">
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-clay-soft text-xl">🎯</span>
                            <div>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink">Lối sống</h3>
                                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">Mức vận động & hướng đi</p>
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
                    <section className="rounded-3xl bg-gradient-to-br from-orange to-orange-deep p-6 shadow-lift ring-1 ring-orange-deep/20 text-white">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">Năng lượng mỗi ngày</span>
                                <p className="mt-0.5 text-[11px] text-white/70 font-medium">Cần khoảng</p>
                            </div>
                            <span className="text-3xl">🔥</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-1 mt-3">
                            <input type="number" value={target} onChange={e => { setProfile({ ...profile, isManualTarget: true, manualTargetKcal: parseInt(e.target.value) || 0 }); }} className="text-5xl font-bold tracking-tight bg-transparent text-center outline-none w-36 border-b-2 border-dashed border-white/30 focus:border-white/70 hover:border-white/50 transition-colors tabular-nums text-white" />
                            <span className="text-base font-medium text-white/70 ml-1">kcal</span>
                        </div>
                        {profile.isManualTarget && (
                            <button onClick={() => setProfile({...profile, isManualTarget: false})} className="block mx-auto mt-3 text-[10px] text-white/80 font-semibold uppercase tracking-wider bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition tabular-nums">
                                ⟲ Trở về tự động ({calculatedTarget})
                            </button>
                        )}
                    </section>

                    {/* MACRO TÙY CHỈNH */}
                    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 md:p-6">
                        <header className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-xl">🥑</span>
                                <div>
                                    <h3 className="text-[15px] font-bold tracking-tight text-ink">Tùy chỉnh Macro</h3>
                                    <p className="mt-0.5 text-[11px] font-medium text-ink-muted">{profile.isManualMacro ? "Đang tùy chỉnh tay" : "Theo tỉ lệ mặc định"}</p>
                                </div>
                            </div>
                            <button onClick={() => { const nextState = !profile.isManualMacro; setProfile({...profile, isManualMacro: nextState}); if (nextState) setIsDietModalOpen(true); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ring-1 ${profile.isManualMacro ? 'bg-orange ring-orange-deep/20' : 'bg-cream-deep ring-cream-deep'}`} aria-label="Toggle macro tùy chỉnh">
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-soft ${profile.isManualMacro ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </header>

                        {profile.isManualMacro ? (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-3 bg-cream-soft ring-1 p-2.5 rounded-2xl">
                                    <span className="text-[11px] font-semibold text-ink ml-2 truncate">{profile.macroDietMode || "Tự nhập tay"}</span>
                                    <button onClick={() => setIsDietModalOpen(true)} className="text-[10px] font-semibold bg-white px-3 py-1.5 rounded-full text-orange-deep ring-1 hover:bg-orange-soft transition active:scale-95 shrink-0">Đổi chế độ</button>
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

                    {/* ACTION BUTTONS */}
                    <div className="space-y-2.5">
                        <button onClick={() => setView("journal")} className="w-full py-4 bg-orange text-white rounded-2xl font-bold text-[14px] shadow-soft ring-1 ring-orange-deep/20 hover:bg-orange-deep active:scale-95 transition">
                            Quay lại nhật ký
                        </button>
                        <button onClick={() => { setUserId(""); setPassword(""); localStorage.removeItem('stayfit_userid'); localStorage.removeItem('stayfit_password'); }} className="w-full py-3 bg-cream-soft text-ink-muted rounded-2xl font-semibold text-[12px] ring-1 hover:bg-cream-deep hover:text-ink active:scale-95 transition">
                            Đăng xuất
                        </button>
                    </div>
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
                            <button onClick={() => setIsDietModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 text-ink-muted hover:bg-cream-soft hover:text-ink transition" aria-label="Đóng">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar pb-10">
                            {DIET_MODES.map((cat, idx) => (
                                <div key={idx}>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-deep mb-2.5 ml-1">{cat.category}</h4>
                                    <div className="space-y-2">
                                        {cat.items.map(mode => (
                                            <button key={mode.id} onClick={() => applyDietMode(mode)} className={`w-full text-left p-4 rounded-2xl transition active:scale-[0.98] shadow-soft ring-1 ${profile.macroDietMode === mode.name ? 'bg-orange-soft ring-orange/40' : 'bg-white hover:ring-orange/20 hover:bg-cream-soft'}`}>
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
            <div className="max-w-md mx-auto min-h-screen bg-cream pb-28 animate-in fade-in duration-300 relative font-sans text-ink">
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
                    <GreetingHeader userName={userId || "bạn"} />

                    {/* CALORIE HERO — vòng tròn + 3 macro donuts + Eq row */}
                    <DashboardCard tone="white" padding="lg" className="overflow-hidden">
                        <div className="flex flex-col items-center gap-6">
                            <CalorieCircle consumed={dailyKcal} target={target} />
                            <div className="grid grid-cols-3 gap-3 w-full">
                                <MacroDonut kind="protein" value={dailyProtein} target={targetProtein} />
                                <MacroDonut kind="carb"    value={dailyCarb}    target={targetCarb} />
                                <MacroDonut kind="fat"     value={dailyFat}     target={targetFat} />
                            </div>
                        </div>

                        <div className="mt-6 flex items-stretch gap-1 border-t border-cream-deep/50 pt-5 text-center">
                            <EqCell label="Cần khoảng" value={Number(target).toLocaleString("vi-VN")} tone="neutral" />
                            <span className="flex items-center text-sm font-light text-ink-faint shrink-0 px-0.5">−</span>
                            <EqCell label="Đã nạp" value={Math.round(dailyKcal).toLocaleString("vi-VN")} tone="sage" />
                            <span className="flex items-center text-sm font-light text-ink-faint shrink-0 px-0.5">=</span>
                            <EqCell label="Còn dư" value={Math.max(0, Math.round(target - dailyKcal)).toLocaleString("vi-VN")} tone="orange" highlight />
                        </div>
                    </DashboardCard>

                    <section id="add-food-section" className="rounded-3xl bg-white p-5 shadow-soft ring-1 scroll-mt-20 md:p-6">
                        {/* Header — icon-chip pattern giống FoodLogSection */}
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-soft text-orange-deep">
                                    <IconPlus />
                                </span>
                                <h3 className="text-[15px] font-bold tracking-tight text-ink leading-none">Thêm món</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* AI scan icon button */}
                                <button
                                    type="button"
                                    onClick={openScanModal}
                                    className="grid h-9 w-9 place-items-center rounded-full bg-orange text-white transition hover:bg-orange-deep active:scale-95 shadow-soft"
                                    aria-label="Quét ảnh món ăn bằng AI"
                                    title="Quét ảnh món ăn ✨"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
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
                            <button onClick={() => setTab("quick")} className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition ${tab === "quick" ? "bg-white text-orange-deep shadow-soft ring-1" : "text-ink-muted hover:text-ink"}`}>Chọn nhanh</button>
                            <button onClick={() => setTab("custom")} className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition ${tab === "custom" ? "bg-white text-orange-deep shadow-soft ring-1" : "text-ink-muted hover:text-ink"}`}>Nhập tay</button>
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
                                            <button onClick={() => { setSelectedFood(f); setQty(f.per); }} className={`w-full p-3.5 pr-11 rounded-2xl text-left transition ring-1 ${selectedFood?.name === f.name ? "bg-orange-soft ring-orange/30" : "bg-cream-soft ring-transparent hover:ring-cream-deep"} active:scale-[0.98]`}>
                                                <p className="truncate text-[11px] font-semibold tracking-tight text-ink mb-0.5">{f.name}</p>
                                                <p className="text-[12px] font-bold text-ink tabular-nums">{f.kcal} <span className="text-[9px] font-medium text-ink-muted">kcal/{f.per}{f.unit}</span></p>
                                            </button>
                                            <div className="absolute right-1 top-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); openLibraryEditModal(f); }} className="p-1.5 text-ink-faint hover:text-orange hover:bg-white rounded-lg transition" aria-label="Sửa món"><IconEdit /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, foodToDelete: f, alertMessage: "" }); }} className="p-1.5 text-ink-faint hover:text-orange-deep hover:bg-white rounded-lg transition" aria-label="Xóa món"><IconTrash /></button>
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
                                    else { const mockWeights = { 'tô': 400, 'ly': 250, 'quả': 100 }; weightInGrams = qty * (mockWeights[u] || 100); }

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
                                                    <div className="flex-1 text-center bg-white rounded-xl py-2 px-2 ring-1">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep">Protein</p>
                                                        <p className="text-[12px] font-bold text-ink tabular-nums mt-0.5">{totalPro}g</p>
                                                        <p className="text-[9px] text-ink-muted tabular-nums mt-1 pt-1 border-t border-cream-deep/40">{projectedPro}g</p>
                                                    </div>
                                                    <div className="flex-1 text-center bg-white rounded-xl py-2 px-2 ring-1">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep">Carb</p>
                                                        <p className="text-[12px] font-bold text-ink tabular-nums mt-0.5">{totalCarb}g</p>
                                                        <p className="text-[9px] text-ink-muted tabular-nums mt-1 pt-1 border-t border-cream-deep/40">{projectedCarb}g</p>
                                                    </div>
                                                    <div className="flex-1 text-center bg-white rounded-xl py-2 px-2 ring-1">
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep">Fat</p>
                                                        <p className="text-[12px] font-bold text-ink tabular-nums mt-0.5">{totalFat}g</p>
                                                        <p className="text-[9px] text-ink-muted tabular-nums mt-1 pt-1 border-t border-cream-deep/40">{projectedFat}g</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-end gap-2">
                                                <div className="w-20">
                                                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Số lượng</label>
                                                    <input type="number" value={qty} step="any" min="0.1" onChange={e => setQty(parseFloat(e.target.value) || 0)} className="w-full bg-cream-soft ring-1 text-ink p-2.5 rounded-xl text-[14px] outline-none font-bold text-center focus:ring-2 focus:ring-orange/30 transition tabular-nums" />
                                                </div>
                                                <button onClick={() => handleAddSelectedFood()} className="flex-1 h-11 bg-orange text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition hover:bg-orange-deep shadow-soft ring-1 ring-orange-deep/20">
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
                        ) : (
                            <div className="mt-4 space-y-2.5">
                                <input placeholder="Tên món ăn (vd: Gà rán...)" value={customFood.name} onChange={e => setCustomFood(p=>({...p, name:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition" />
                                <div className="grid grid-cols-2 gap-2.5">
                                    <input type="number" placeholder="Số lượng" value={customFood.quantity} onChange={e => setCustomFood(p=>({...p, quantity:e.target.value}))} className="bg-cream-soft ring-1 p-3.5 rounded-2xl text-[13px] outline-none font-semibold focus:ring-2 focus:ring-orange/30 placeholder:text-ink-faint transition tabular-nums" />
                                    <div className="relative">
                                        <select value={customFood.unit} onChange={e => setCustomFood(p=>({...p, unit:e.target.value}))} className="w-full bg-cream-soft ring-1 p-3.5 pr-9 rounded-2xl text-[13px] outline-none font-semibold cursor-pointer appearance-none focus:ring-2 focus:ring-orange/30 transition">
                                            <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="ly">ly</option><option value="tô">tô</option><option value="quả">quả</option>
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
                                    <button onClick={addCustom} className="w-full bg-orange text-white p-3.5 rounded-2xl font-bold text-[13px] mt-3 active:scale-95 transition shadow-soft ring-1 ring-orange-deep/20 hover:bg-orange-deep animate-in slide-in-from-bottom-2 fade-in duration-300">
                                        Xác nhận thêm
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 4 MEAL SECTIONS — dùng FoodLogSection từ dashboard */}
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between px-1">
                            <h2 className="text-[15px] font-bold tracking-tight text-ink">Nhật ký bữa ăn</h2>
                            {undoStack.length > 0 && (
                                <button onClick={handleUndo} className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-deep hover:bg-orange-soft px-3 py-1 rounded-full transition">
                                    <IconUndo /> Hoàn tác
                                </button>
                            )}
                        </div>
                        {MEAL_TYPES.map((meal, i) => (
                            <div key={meal} className="animate-fade-rise" style={{ animationDelay: `${i * 70}ms` }}>
                                <FoodLogSection
                                    mealName={meal}
                                    items={dailyLog.filter(it => it.meal === meal)}
                                    onAdd={(m) => {
                                        setSelectedMeal(m);
                                        if (typeof document !== "undefined") {
                                            document.getElementById("add-food-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }
                                    }}
                                    onRemove={removeFood}
                                />
                            </div>
                        ))}
                        {dailyLog.length === 0 && (
                            <p className="text-center text-ink-faint text-[11px] uppercase font-semibold italic py-6 border border-dashed border-cream-deep rounded-3xl tracking-wider">
                                Khi nào sẵn sàng, ghi món vào nhé
                            </p>
                        )}
                    </div>

                    {/* --- MODAL QUÉT ẢNH MÓN ĂN BẰNG AI --- */}
                    {scanModalOpen && (
                        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-[16px] font-bold text-ink tracking-tight">Quét ảnh món ăn ✨</h3>
                                    <button onClick={closeScanModal} className="grid h-9 w-9 place-items-center rounded-full bg-cream-soft text-ink-muted hover:bg-cream-deep transition" aria-label="Đóng">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>

                                {!scanState.preview ? (
                                    /* STEP 1: Chưa chọn ảnh */
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
                                            AI sẽ ước lượng tên món, khối lượng, kcal và macro dinh dưỡng trong ảnh.
                                        </p>
                                        {scanState.error && <p className="text-[12px] text-orange-deep text-center mt-2">{scanState.error}</p>}
                                    </div>
                                ) : !scanState.items ? (
                                    /* STEP 2: Có ảnh, chưa analyze */
                                    <div className="space-y-3">
                                        <img src={scanState.preview} alt="Món vừa chọn" className="w-full max-h-72 object-cover rounded-2xl ring-1" />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleScanAnalyze}
                                                disabled={scanState.loading}
                                                className="flex-1 h-12 bg-orange text-white rounded-xl font-bold disabled:opacity-50 transition hover:bg-orange-deep flex items-center justify-center gap-2"
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
                                            <img src={scanState.preview} alt="Ảnh đã quét" className="w-full max-h-36 object-cover rounded-2xl ring-1" />
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
                                                                className={`absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full transition shadow-sm ${item._checked ? "bg-orange text-white hover:bg-orange-deep" : "bg-white text-ink-muted ring-1 ring-cream-deep hover:text-orange-deep hover:ring-orange/40"}`}
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
                                                                className="absolute top-12 right-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-white text-orange-deep ring-1 ring-orange/30 hover:bg-orange-soft transition shadow-sm"
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
                                                                    <input type="text" value={item.name} onChange={e => updateScanItem(idx, { name: e.target.value })} className="w-full bg-white p-2.5 rounded-xl text-[13px] font-semibold outline-none focus:ring-2 focus:ring-orange/30" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Khẩu phần (g/ml)</label>
                                                                        <input type="number" value={item.per} step="any" min="1" onChange={e => updateScanItem(idx, { per: parseFloat(e.target.value) || 1 })} className="w-full bg-white p-2.5 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Kcal / khẩu phần</label>
                                                                        <input type="number" value={item.kcal} step="any" min="0" onChange={e => updateScanItem(idx, { kcal: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2.5 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep block mb-1 text-center">Protein</label>
                                                                        <input type="number" value={item.protein} step="any" min="0" onChange={e => updateScanItem(idx, { protein: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-sage/30" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep block mb-1 text-center">Carb</label>
                                                                        <input type="number" value={item.carb} step="any" min="0" onChange={e => updateScanItem(idx, { carb: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-clay/30" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep block mb-1 text-center">Fat</label>
                                                                        <input type="number" value={item.fat} step="any" min="0" onChange={e => updateScanItem(idx, { fat: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 rounded-xl text-[12px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-lilac/30" />
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
                                                                    <div className="text-center bg-white rounded-xl py-2 ring-1">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-sage-deep">Protein</p>
                                                                        <p className="text-[13px] font-bold tabular-nums mt-0.5">{scaled.protein}g</p>
                                                                    </div>
                                                                    <div className="text-center bg-white rounded-xl py-2 ring-1">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-clay-deep">Carb</p>
                                                                        <p className="text-[13px] font-bold tabular-nums mt-0.5">{scaled.carb}g</p>
                                                                    </div>
                                                                    <div className="text-center bg-white rounded-xl py-2 ring-1">
                                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-lilac-deep">Fat</p>
                                                                        <p className="text-[13px] font-bold tabular-nums mt-0.5">{scaled.fat}g</p>
                                                                    </div>
                                                                </div>
                                                                {item._checked && (
                                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                                        <div>
                                                                            <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Bữa</label>
                                                                            <div className="relative">
                                                                                <select value={item._meal} onChange={e => updateScanItem(idx, { _meal: e.target.value })} className="w-full bg-white p-2 pr-8 rounded-xl text-[12px] font-semibold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-orange/30">
                                                                                    {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                                                                                </select>
                                                                                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">Số lượng ({item.unit || "g"})</label>
                                                                            <input type="number" value={item._qty} step="any" min="0" onChange={e => updateScanItem(idx, { _qty: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 rounded-xl text-[13px] font-bold text-center outline-none tabular-nums focus:ring-2 focus:ring-orange/30" />
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

                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={handleScanReset}
                                                    className="px-4 h-12 text-ink bg-cream-soft rounded-xl font-semibold text-[13px] transition hover:bg-cream-deep"
                                                >
                                                    Chụp lại
                                                </button>
                                                <button
                                                    onClick={addAllScannedItems}
                                                    disabled={checkedCount === 0}
                                                    className="flex-1 h-12 bg-orange text-white rounded-xl font-bold text-[13px] transition hover:bg-orange-deep shadow-soft flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* --- MODAL GỢI Ý MỞ RỘNG THƯ VIỆN (từ ScanFeedback patterns) --- */}
                    {librarySuggestion && (
                        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
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
                                    <button onClick={() => addSuggestionToLibrary(suggestionForm)} disabled={!suggestionForm.name.trim()} className="flex-1 py-3 bg-orange text-white rounded-xl font-bold text-[11px] uppercase tracking-wider active:scale-95 transition disabled:opacity-50">
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

function EqCell({ label, value, tone = "neutral", highlight = false }) {
    const toneClass = {
        neutral: "bg-cream-soft text-ink",
        sage:    "bg-sage-soft text-sage-deep",
        clay:    "bg-clay-soft text-clay-deep",
        orange:  "bg-orange text-white shadow-soft ring-1 ring-orange-deep/20",
    }[tone];

    return (
        <div className={`flex-1 min-w-0 rounded-2xl py-2.5 px-1 ${toneClass}`}>
            <p className="text-base font-bold leading-none tracking-tight tabular-nums">{value}</p>
            <p className={`mt-1 text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap ${highlight ? "text-white/80" : "opacity-70"}`}>{label}</p>
        </div>
    );
}

function MindfulCard() {
    const [breathing, setBreathing] = useState(false);
    return (
        <>
            <DashboardCard tone="sage" padding="lg">
                <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-soft animate-gentle-pulse" style={{ animationDuration: "6s" }}>🧘</span>
                    <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-deep">Mindful</span>
                        <h3 className="mt-1 text-[15px] font-bold tracking-tight text-ink">Thư giãn 2 phút</h3>
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">Hít sâu, thở chậm. Sức khoẻ tinh thần cũng quan trọng như dinh dưỡng.</p>
                        <button type="button" onClick={() => setBreathing(true)} className="mt-3 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-sage-deep ring-1 ring-sage/15 transition hover:bg-sage hover:text-white">Bắt đầu thở</button>
                    </div>
                </div>
            </DashboardCard>
            {breathing && <BreathingTimer onClose={() => setBreathing(false)} />}
        </>
    );
}