"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Khởi tạo Plugin DataLabels
Chart.register(ChartDataLabels);

// --- ICONS (SVG) ---
// ... (Giữ nguyên các icon cũ)
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>);

// ... (Giữ nguyên COMMON_FOODS, ACTIVITY_LEVELS, GOALS, MEAL_TYPES, DIET_MODES, formatDate, calcMacro, generateUniqueTimestamp, removeAccents) ...

export default function App() {
    // ... (Giữ nguyên các state cũ)
    const [editModal, setEditModal] = useState({ isOpen: false, item: null });
    const [editForm, setEditForm] = useState({ name: "", quantity: "", unit: "g", kcal: "", protein: "", carb: "", fat: "" });

    // ... (Giữ nguyên các useEffect và các hàm cũ như syncToCloud, syncFromCloud, handleLogin, saveWeight, deleteWeight, v.v...)

    const openEditModal = (item) => {
        setEditModal({ isOpen: true, item: item });
        setEditForm({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            kcal: item.kcal,
            protein: item.protein,
            carb: item.carb,
            fat: item.fat
        });
    };

    const saveEditedItem = () => {
        if (!editForm.name || !editForm.kcal) {
            alert("Vui lòng nhập đủ tên và số Kcal.");
            return;
        }

        const idToUpdate = editModal.item.id;
        const updatedItem = {
            ...editModal.item,
            name: editForm.name,
            quantity: parseFloat(editForm.quantity) || 1,
            unit: editForm.unit,
            kcal: parseFloat(editForm.kcal) || 0,
            protein: parseFloat(editForm.protein) || 0,
            carb: parseFloat(editForm.carb) || 0,
            fat: parseFloat(editForm.fat) || 0
        };

        // Cập nhật State cục bộ
        setHistory(prev => {
            const currentList = prev[currentDate] || [];
            return {
                ...prev,
                [currentDate]: currentList.map(item => item.id === idToUpdate ? updatedItem : item)
            };
        });

        // Đóng modal
        setEditModal({ isOpen: false, item: null });
    };

    // ... (Giữ nguyên các hàm updateItemMeal, removeFood, handleConfirmDelete, applyDietMode) ...

    if (view === "journal") {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-28 animate-in fade-in duration-300 relative font-sans text-slate-800">
                {/* ... (Giữ nguyên Header, Summary và Section thêm món) ... */}

                <div className="space-y-3 pb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Danh sách nạp vào</h3>
                    {dailyLog.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-50 border-l-4 border-l-emerald-400 animate-in slide-in-from-left duration-300 group">
                            <div className="flex-1 pr-3">
                                {/* ... (Phần Select Meal Type) ... */}
                                <div className="flex items-center gap-2 mb-1.5">
                                    <p className="text-xs font-bold text-slate-800 uppercase truncate">{item.name} &mdash; {item.quantity}{item.unit}</p>
                                    {/* NÚT CHỈNH SỬA MỚI */}
                                    <button onClick={() => openEditModal(item)} className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-md transition-colors">
                                        <IconEdit />
                                    </button>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 flex-wrap"><span className="text-orange-500 font-black">{item.kcal} kcal</span><span className="text-slate-200">|</span> P: {item.protein}g <span className="text-slate-200">|</span> C: {item.carb}g <span className="text-slate-200">|</span> F: {item.fat}g</p>
                            </div>
                            <div className="flex items-center"><button onClick={() => removeFood(item.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2 bg-slate-50 rounded-xl group-hover:bg-red-50"><IconTrash /></button></div>
                        </div>
                    ))}
                    {dailyLog.length === 0 && ( <p className="text-center text-slate-300 text-[10px] uppercase font-bold italic py-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] tracking-[0.2em]">Danh sách trống</p> )}
                </div>

                {/* --- MODAL CHỈNH SỬA MÓN ĂN --- */}
                {editModal.isOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
                             <button onClick={() => setEditModal({ isOpen: false, item: null })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
                            <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest text-center">Chỉnh sửa món ăn</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Tên món</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Số lượng</label>
                                        <input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" />
                                     </div>
                                     <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Đơn vị</label>
                                        <select value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20">
                                            <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="lít">lít</option><option value="phần">phần</option><option value="ly">ly</option><option value="tô">tô</option><option value="quả">quả</option>
                                        </select>
                                     </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative group">
                                        <label className="text-[10px] font-black text-orange-400 uppercase block mb-1">Kcal</label>
                                        <input type="number" value={editForm.kcal} onChange={e => setEditForm({...editForm, kcal: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-orange-500/20" />
                                    </div>
                                    <div className="relative group">
                                        <label className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Protein</label>
                                        <input type="number" value={editForm.protein} onChange={e => setEditForm({...editForm, protein: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-emerald-500/20" />
                                    </div>
                                    <div className="relative group">
                                        <label className="text-[10px] font-black text-blue-400 uppercase block mb-1">Carb</label>
                                        <input type="number" value={editForm.carb} onChange={e => setEditForm({...editForm, carb: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="relative group">
                                        <label className="text-[10px] font-black text-yellow-400 uppercase block mb-1">Fat</label>
                                        <input type="number" value={editForm.fat} onChange={e => setEditForm({...editForm, fat: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-yellow-500/20" />
                                    </div>
                                </div>
                                <button onClick={saveEditedItem} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all mt-4">Lưu thay đổi</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ... (Giữ nguyên Confirm Modal và BottomNav) ... */}
            </div>
        );
    }
}