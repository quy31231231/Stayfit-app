// 1. Hàm gửi dữ liệu lên Google Sheets thông qua API trung gian
async function saveToSheets(item, date, meal) {
  try {
    const response = await fetch("/api/save-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date, // Ngày người dùng chọn
        meal: meal, // Bữa ăn (Sáng/Trưa/Chiều...)
        name: item.name,
        quantity: item.quantity || "1 phần",
        kcal: item.kcal,
        protein: item.protein || 0,
        carb: item.carb || 0,
        fat: item.fat || 0,
      }),
    });

    if (response.ok) {
      console.log("Đã lưu vào Google Sheets thành công!");
    } else {
      console.warn("Lưu thất bại, mã lỗi:", response.status);
    }
  } catch (err) {
    console.error("Lỗi kết nối API:", err);
  }
}

// 2. Hàm xử lý thêm món ăn (giả sử cấu trúc hàm addFood của bạn)
function addFood(item) {
  // Lấy dữ liệu ngày tháng hiện tại hoặc từ giao diện StayFit
  const selectedDate = new Date().toLocaleDateString("vi-VN"); 
  const currentMeal = "Bữa ăn"; // Bạn có thể thay đổi tùy logic ứng dụng

  // --- LOGIC HIỂN THỊ TRÊN GIAO DIỆN CỦA BẠN ---
  console.log("Đang thêm món vào giao diện:", item.name);

  // --- GỌI HÀM LƯU VÀO GOOGLE SHEETS ---
  saveToSheets(item, selectedDate, currentMeal);
}
