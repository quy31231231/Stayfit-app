// Các chế độ ăn (tỉ lệ macro) cho modal chọn chế độ dinh dưỡng.
export const DIET_MODES = [
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
