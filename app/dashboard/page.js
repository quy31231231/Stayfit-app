"use client";

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy ngày hiện tại tự động
  const targetDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const userId = localStorage.getItem('stayfit_userid');
    const password = localStorage.getItem('stayfit_password');

    if (!userId) {
      setError("Vui lòng đăng nhập từ trang chủ trước.");
      setIsLoading(false);
      return;
    }

    fetch(`/api/sync?userId=${userId}&password=${password}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfile(data.profile);
        setHistory(data.history);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu trực tiếp từ Server...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</div>;

  const dayData = history?.[targetDate] || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Bảng điều khiển StayFit - Dashboard (Admin)</h1>

      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Thông tin cá nhân (Profile)</h2>
        <p>Giới tính: {profile?.gender}</p>
        <p>Tuổi: {profile?.age}</p>
        <p>Chiều cao: {profile?.height} cm</p>
        <p>Cân nặng: {profile?.weight} kg</p>
      </section>

      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Lịch sử ăn uống ngày hôm nay ({targetDate})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên thực phẩm</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Bữa ăn</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Số lượng</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Calo (kcal)</th>
            </tr>
          </thead>
          <tbody>
            {dayData.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>Chưa có dữ liệu ăn uống hôm nay.</td></tr>
            ) : (
              dayData.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.meal}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity} {item.unit}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.kcal}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}