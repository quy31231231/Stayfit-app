import { google } from "googleapis";

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
  if (!SHEET_ID) {
    return res.status(400).json({ error: "Missing SPREADSHEET_ID" });
  }

  const sheets = await getSheets();
  
  // === UPLOAD DỮ LIỆU TỪ APP LÊN SHEETS ===
  if (req.method === "POST" && req.body.action === "upload") {
    const { userId, password, profile, history, weightLog } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Không tìm thấy UserID" });
    }

    try {
      // 1. KIỂM TRA MẬT KHẨU & CẬP NHẬT PROFILE
      const profileRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "Profile!A:J" 
      });
      const profileRows = profileRes.data.values || [];
      const profileIndex = profileRows.findIndex(row => row[0] === userId);

      if (profileIndex !== -1) {
        const storedPass = profileRows[profileIndex][9];
        if (storedPass && storedPass !== password) {
          return res.status(401).json({ error: "Sai mật khẩu bảo mật!" });
        }
      }

      const newProfileRow = [
        userId, 
        profile.gender || "", 
        profile.age || "", 
        profile.height || "",
        profile.weight || "", 
        profile.activity || "", 
        profile.goal || "",
        profile.manualTargetKcal || "", 
        new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }), 
        password || ""
      ];

      if (profileIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Profile!A${profileIndex + 1}:J${profileIndex + 1}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "Profile!A:J",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] },
        });
      }
      
      // ✅ FIX: CẬP NHẬT HISTORY - chỉ APPEND dòng mới, không xóa
      const historyRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "History!A:K" 
      });
      const allHistoryRows = historyRes.data.values || [];

      // Tập hợp tất cả timestamp đã có của user này → dùng để dedup
      const existingTimestamps = new Set(
        allHistoryRows
          .filter(row => row[0] === userId)
          .map(row => row[10]) // cột K = timestamp
      );

      // Chỉ lấy các dòng thực sự mới (chưa có timestamp trên sheet)
      let newHistoryRows = [];
      if (history) {
        newHistoryRows = Object.entries(history).flatMap(([date, items]) =>
          items
            .filter(item => {
              const ts = item.timestamp || "";
              return ts && !existingTimestamps.has(ts); // bỏ qua nếu đã tồn tại
            })
            .map(item => {
              const ts = item.timestamp || new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
              return [userId, date, item.meal, item.name, item.quantity, item.unit, item.kcal, item.protein, item.carb, item.fat, ts];
            })
        );
      }

      // Sắp xếp theo timestamp trước khi append
      newHistoryRows.sort((a, b) => new Date(a[10]) - new Date(b[10]));

      // Chỉ append dòng mới — KHÔNG clear, KHÔNG rewrite
      if (newHistoryRows.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "History!A:K",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: newHistoryRows },
        });
      }

      // ✅ FIX: CẬP NHẬT WEIGHTLOG - upsert theo ngày
      const weightRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "WeightLog!A:D" 
      });
      const allWeightRows = weightRes.data.values || [];

      // Map ngày → row index (để update đúng dòng nếu đã có)
      const existingWeightDates = new Map(
        allWeightRows
          .map((row, i) => row[0] === userId ? [row[1], i + 1] : null) // 1-indexed
          .filter(Boolean)
      );

      if (weightLog) {
        for (const [date, weight] of Object.entries(weightLog)) {
          const newRow = [userId, date, weight, new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })];
          
          if (existingWeightDates.has(date)) {
            // Cập nhật đúng dòng đó thay vì xóa tất cả
            const rowNum = existingWeightDates.get(date);
            await sheets.spreadsheets.values.update({
              spreadsheetId: SHEET_ID,
              range: `WeightLog!A${rowNum}:D${rowNum}`,
              valueInputOption: "USER_ENTERED",
              requestBody: { values: [newRow] },
            });
          } else {
            await sheets.spreadsheets.values.append({
              spreadsheetId: SHEET_ID,
              range: "WeightLog!A:D",
              valueInputOption: "USER_ENTERED",
              requestBody: { values: [newRow] },
            });
          }
        }
      }
      
      return res.status(200).json({ success: true });
      
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  // === TẢI DỮ LIỆU TỪ SHEETS VỀ APP ===
  if (req.method === "GET") {
    const { userId, password } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId" });
    }
    
    try {
      const profileRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "Profile!A:J" 
      });
      const profileRow = profileRes.data.values?.find(row => row[0] === userId);
      
      if (profileRow) {
          const storedPass = profileRow[9]; 
          if (storedPass && storedPass !== password) {
              return res.status(401).json({ error: "Sai mật khẩu!" });
          }
      }

      const profile = profileRow ? {
        gender: profileRow[1], 
        age: parseInt(profileRow[2]), 
        height: parseInt(profileRow[3]),
        weight: parseFloat(profileRow[4]), 
        activity: parseFloat(profileRow[5]), 
        goal: parseInt(profileRow[6]),
        manualTargetKcal: profileRow[7] ? parseInt(profileRow[7]) : null,
      } : null;
      
      const historyRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "History!A:K" 
      });
      const history = {};
      
      historyRes.data.values?.filter(row => row[0] === userId).forEach(row => {
        const date = row[1];
        if (!history[date]) {
          history[date] = [];
        }
        
        history[date].push({
          meal: row[2], 
          name: row[3], 
          quantity: parseFloat(row[4]), 
          unit: row[5],
          kcal: parseFloat(row[6]), 
          protein: parseFloat(row[7]), 
          carb: parseFloat(row[8]),
          fat: parseFloat(row[9]), 
          timestamp: row[10] || new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }),
          id: Date.now() + Math.random(), 
        });
      });

      const weightRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "WeightLog!A:D" 
      });
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
