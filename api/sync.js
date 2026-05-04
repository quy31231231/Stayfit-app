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
  
  // === 1. UPLOAD DỮ LIỆU TỪ APP LÊN SHEETS ===
  if (req.method === "POST" && req.body.action === "upload") {
    const { userId, password, profile, history, weightLog } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Không tìm thấy UserID" });
    }

    try {
      // 1.1 KIỂM TRA MẬT KHẨU & CẬP NHẬT PROFILE
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
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [newProfileRow] },
        });
      }
      
      // 1.2 CẬP NHẬT HISTORY (Chỉ Append dòng mới, Dedup bằng Timestamp)
      const historyRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "History!A:K" 
      });
      const allHistoryRows = historyRes.data.values || [];

      const existingTimestamps = new Set(
        allHistoryRows
          .filter(row => row[0] === userId)
          .map(row => row[10]) 
      );

      let newHistoryRows = [];
      if (history) {
        newHistoryRows = Object.entries(history).flatMap(([date, items]) =>
          items
            .filter(item => {
              const ts = item.timestamp || "";
              return ts && !existingTimestamps.has(ts); 
            })
            .map(item => {
              const ts = item.timestamp || new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
              return [userId, date, item.meal, item.name, item.quantity, item.unit, item.kcal, item.protein, item.carb, item.fat, ts];
            })
        );
      }

      newHistoryRows.sort((a, b) => new Date(a[10]) - new Date(b[10]));

      if (newHistoryRows.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "History!A:K",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: newHistoryRows },
        });
      }

      // 1.3 CẬP NHẬT WEIGHTLOG (Upsert theo ngày)
      const weightRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "WeightLog!A:D" 
      });
      const allWeightRows = weightRes.data.values || [];

      const existingWeightDates = new Map(
        allWeightRows
          .map((row, i) => row[0] === userId ? [row[1], i + 1] : null) 
          .filter(Boolean)
      );

      if (weightLog) {
        for (const [date, weight] of Object.entries(weightLog)) {
          const newRow = [userId, date, weight, new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })];
          
          if (existingWeightDates.has(date)) {
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
              insertDataOption: "INSERT_ROWS",
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
  
  // === 2. TẢI DỮ LIỆU TỪ SHEETS VỀ APP ===
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

  // === 3. XÓA MỘT MÓN ĂN KHỎI HISTORY TRÊN SHEETS ===
  if (req.method === "DELETE") {
    const { userId, password, timestamp } = req.body;
    
    if (!userId || !timestamp) {
      return res.status(400).json({ error: "Thiếu userId hoặc timestamp" });
    }
    
    try {
      // Xác thực lại password
      const profileRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: "Profile!A:J" 
      });
      const profileRow = profileRes.data.values?.find(row => row[0] === userId);
      if (profileRow && profileRow[9] && profileRow[9] !== password) {
         return res.status(401).json({ error: "Sai mật khẩu bảo mật!" });
      }

      const historyRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "History!A:K",
      });
      const rows = historyRes.data.values || [];
      
      // Tìm index dòng khớp userId (cột 0) + timestamp (cột 10)
      const rowIndex = rows.findIndex(row => row[0] === userId && row[10] === timestamp);
      
      if (rowIndex === -1) {
        return res.status(404).json({ error: "Không tìm thấy dòng cần xóa trên Sheets" });
      }
      
      // Lấy ID nội bộ của sheet "History"
      const metaRes = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const historySheet = metaRes.data.sheets.find(s => s.properties.title === "History");
      const sheetId = historySheet.properties.sheetId;
      
      // Thực thi lệnh xóa dòng
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex, 
                endIndex: rowIndex + 1,
              },
            },
          }],
        },
      });
      
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Lỗi xóa dòng:", err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}