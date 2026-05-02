async function saveToSheets(item, date, meal) {
  try {
    await fetch("/api/save-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        meal,
        name: item.name,
        quantity: item.quantity || "1 phần",
        kcal: item.kcal,
        protein: item.protein || 0,
        carb: item.carb || 0,
        fat: item.fat || 0,
      }),
    });
  } catch (err) {
    console.warn("Lỗi ghi Sheets:", err);
  }
}
