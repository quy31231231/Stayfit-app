import { kv } from '@vercel/kv';

export default async function DashboardPage() {
  // 1. Gọi dữ liệu từ database dựa trên Key
  const profile = await kv.get('stayfit_profile');
  const history = await kv.get('stayfit_history');

  // Kiểm tra nếu không có dữ liệu
  if (!profile || !history) {
    return <div>Đang tải dữ liệu hoặc không tìm thấy dữ liệu...</div>;
  }

  // 2. Lấy dữ liệu của ngày cụ thể từ Key 'stayfit_history'
  // (Dựa trên hình image_a5cc7b.png của bạn có ngày 2026-05-02)
  const targetDate = "2026-05-02";
  const dayData = history[targetDate] || [];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bảng điều khiển StayFit</h1>

      {/* HIỂN THỊ DỮ LIỆU TỪ KEY: stayfit_profile */}
      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>Thông tin cá nhân (Profile)</h2>
        <p>Giới tính: {profile.gender}</p>
        <p>Tuổi: {profile.age}</p>
        <p>Chiều cao: {profile.height} cm</p>
        <p>Cân nặng: {profile.weight} kg</p>
      </section>

      {/* HIỂN THỊ DỮ LIỆU TỪ KEY: stayfit_history */}
      <section style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>Lịch sử ăn uống ngày {targetDate}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tên thực phẩm</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Số lượng</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Calo (kcal)</th>
            </tr>
          </thead>
          <tbody>
            {dayData.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity} {item.unit}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.kcal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
