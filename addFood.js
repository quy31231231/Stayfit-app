// ==========================================
// FILE: addFood.js
// ==========================================

// 1. Hàm gửi dữ liệu lên Google Sheets thông qua API trung gian (Vercel)
async function saveToSheets(item, date, meal) {
  try {
    const response = await fetch("/api/save-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date,
        meal: meal,
        name: item.name,
        quantity: item.quantity || "1 phần",
        kcal: item.kcal,
        protein: item.protein || 0,
        carb: item.carb || 0,
        fat: item.fat || 0,
      }),
    });

    if (response.ok) {
      console.log("✅ Đã lưu dữ liệu vào Google Sheets thành công!");
      // Bỏ comment dòng dưới nếu bạn muốn hiện thông báo popup trên web
      // alert("Đã thêm " + item.name + " vào nhật ký dinh dưỡng!");
    } else {
      console.warn("⚠️ Lưu thất bại, mã lỗi API:", response.status);
    }
  } catch (err) {
    console.error("❌ Lỗi kết nối đến máy chủ:", err);
  }
}

// 2. Hàm xử lý sự kiện khi người dùng bấm nút thêm món ăn
function addFood(item, mealType = "Bữa chính") {
  // Lấy ngày hiện tại theo giờ Việt Nam
  const selectedDate = new Date().toLocaleDateString("vi-VN"); 
  
  // Sử dụng meal type được truyền vào hoặc mặc định là "Bữa chính"
  const currentMeal = mealType;

  console.log("Đang xử lý thêm món:", item.name, "- Bữa:", currentMeal);

  // Kích hoạt tiến trình lưu ngầm vào Google Sheets
  saveToSheets(item, selectedDate, currentMeal);
}
