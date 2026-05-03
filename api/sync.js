import { google } from "googleapis";

// Khởi tạo Google Sheets client
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export default async function handler(req, res) {
  const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) return res.status(400).json({ error: "Missing SPREADSHEET_ID" });

  const sheets = await getSheets();
  
  // === UPLOAD DỮ LIỆU TỪ APP LÊN SHEETS (HỖ TRỢ ĐA NGƯỜI DÚNG) ===
  if (req.method === "POST" && req.body.action === "upload") {
    const { userId, profile, history, weightLog } = req.body;
    if (!userId) return res.status(400).json({ error: "Không tìm thấy UserID" });

    try {
      // ----------------------------------------------------
      // 1. CẬP NHẬT PROFILE (Tìm đúng dòng của User để sửa)
      // ----------------------------------------------------
      const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:I" });
      const profileRows = profileRes.data.values || [];
      const profileIndex = profileRows.findIndex(row => row[0] === userId); // Tìm xem user này nằm ở dòng nào

      const newProfileRow = [
        userId, profile.gender || "", profile.age || "", profile.height || "",
        profile.weight || "", profile.activity || "", profile.goal || "",
        profile.manualTargetKcal || "", new Date().toISOString()
      ];

      if (profileIndex !== -1) {
        // Đã có user này -> Cập nhật đúng dòng đó
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Profile!A${profileIndex + 1}:I${profileIndex + 1}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] },
        });
      } else {
        // User mới -> Thêm dòng mới xuống cuối bảng
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "Profile!A:I",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] },
        });
      }
      
      // ----------------------------------------------------
      // 2. CẬP NHẬT HISTORY (Giữ nguyên lịch sử của user khác)
      // ----------------------------------------------------
      const historyRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "History!A:K" });
      const allHistoryRows = historyRes.data.values || [];
      
      // Lấy dòng tiêu đề (Dòng 1)
      const headerHistory = allHistoryRows.length > 0 && allHistoryRows[0][0] === "UserID" ? [allHistoryRows[0]] : [];
      
      // LỌC: CHỈ GIỮ LẠI DỮ LIỆU CỦA CÁC USER KHÁC
      const otherUsersHistory = allHistoryRows.filter((row, i) => (i > 0 || row[0] !== "UserID") && row[0] !== userId);

      let currentUserHistoryRows = [];
      if (history) {
        currentUserHistoryRows = Object.entries(history).flatMap(([date, items]) =>
          items.map(item => [
            userId, date, item.meal, item.name, item.quantity,
            item.unit, item.kcal, item.protein, item.carb, item.fat,
            new Date().toISOString()
          ])
        );
      }

      // Gộp dòng tiêu đề + Lịch sử người khác + Lịch sử mới của người hiện tại
      const combinedHistory = [...headerHistory, ...otherUsersHistory, ...currentUserHistoryRows];

      // Xóa trang và ghi lại toàn bộ
      await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: "History!A:K" });
      if (combinedHistory.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: "History!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: combinedHistory },
        });
      }

      // ----------------------------------------------------
      // 3. CẬP NHẬT WEIGHTLOG (Giữ nguyên cân nặng của user khác)
      // ----------------------------------------------------
      const weightRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "WeightLog!A:D" });
      const allWeightRows = weightRes.data.values || [];
      
      const headerWeight = allWeightRows.length > 0 && allWeightRows[0][0] === "UserID" ? [allWeightRows[0]] : [];
      const otherUsersWeight = allWeightRows.filter((row, i) => (i > 0 || row[0] !== "UserID") && row[0] !== userId);

      let currentUserWeightRows = [];
      if (weightLog) {
         currentUserWeightRows = Object.entries(weightLog).map(([date, weight]) => [
            userId, date, weight, new Date().toISOString()
         ]);
      }

      const combinedWeight = [...headerWeight, ...otherUsersWeight, ...currentUserWeightRows];

      await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: "WeightLog!A:D" });
      if (combinedWeight.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: "WeightLog!A1",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: combinedWeight },
        });
      }
      
      return res.status(200).json({ success: true, message: "Đã đồng bộ đa người dùng thành công!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  // === TẢI DỮ LIỆU TỪ SHEETS VỀ APP (Giữ nguyên vì đoạn này đã chuẩn rồi) ===
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Thiếu userId" });
    
    try {
      const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:I" });
      const profileRow = profileRes.data.values?.find(row => row[0] === userId);
      const profile = profileRow ? {
        gender: profileRow[1], age: parseInt(profileRow[2]), height: parseInt(profileRow[3]),
        weight: parseFloat(profileRow[4]), activity: parseFloat(profileRow[5]), goal: parseInt(profileRow[6]),
        manualTargetKcal: profileRow[7] ? parseInt(profileRow[7]) : null,
      } : null;
      
      const historyRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "History!A:K" });
      const history = {};
      historyRes.data.values?.filter(row => row[0] === userId).forEach(row => {
        const date = row[1];
        if (!history[date]) history[date] = [];
        history[date].push({
          meal: row[2], name: row[3], quantity: parseFloat(row[4]), unit: row[5],
          kcal: parseFloat(row[6]), protein: parseFloat(row[7]), carb: parseFloat(row[8]),
          fat: parseFloat(row[9]), id: Date.now() + Math.random(), 
        });
      });

      const weightRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "WeightLog!A:D" });
      const weightLog = {};
      weightRes.data.values?.filter(row => row[0] === userId).forEach(row => {
        const date = row[1];
        weightLog[date] = parseFloat(row[2]);
      });
      
      return res.status(200).json({ profile, history, weightLog });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}
