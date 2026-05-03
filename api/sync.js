const { google } = require("googleapis");

// Khởi tạo Google Sheets client
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export default async function handler(req, res) {
  const sheets = await getSheets();
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  
  // === UPLOAD DỮ LIỆU TỪ APP LÊN SHEETS ===
  if (req.method === "POST" && req.body.action === "upload") {
    const { userId, profile, history, weightLog } = req.body;
    
    try {
      // Cập nhật profile
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "Profile!A2",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            userId,
            profile.gender,
            profile.age,
            profile.height,
            profile.weight,
            profile.activity,
            profile.goal,
            profile.manualTargetKcal || "",
            new Date().toISOString()
          ]],
        },
      });
      
      // Cập nhật history (ghi đè toàn bộ)
      const historyRows = Object.entries(history).flatMap(([date, items]) =>
        items.map(item => [
          userId, date, item.meal, item.name, item.quantity,
          item.unit, item.kcal, item.protein, item.carb, item.fat,
          new Date().toISOString()
        ])
      );
      
      // Xóa dữ liệu cũ của user này trước
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: "History!A2:K1000",
      });
      
      // Ghi dữ liệu mới
      if (historyRows.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "History!A2",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: historyRows },
        });
      }
      
      return res.status(200).json({ success: true, message: "Uploaded" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  // === TẾT DỮ LIỆU TỪ SHEETS VỀ APP ===
  if (req.method === "GET") {
    const { userId } = req.query;
    
    try {
      // Lấy profile
      const profileRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Profile!A2:I100",
      });
      
      const profileRow = profileRes.data.values?.find(row => row[0] === userId);
      const profile = profileRow ? {
        gender: profileRow[1],
        age: parseInt(profileRow[2]),
        height: parseInt(profileRow[3]),
        weight: parseFloat(profileRow[4]),
        activity: parseFloat(profileRow[5]),
        goal: parseInt(profileRow[6]),
        manualTargetKcal: profileRow[7] ? parseInt(profileRow[7]) : null,
      } : null;
      
      // Lấy history
      const historyRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "History!A2:K10000",
      });
      
      const history = {};
      historyRes.data.values?.filter(row => row[0] === userId).forEach(row => {
        const date = row[1];
        if (!history[date]) history[date] = [];
        history[date].push({
          meal: row[2],
          name: row[3],
          quantity: parseFloat(row[4]),
          unit: row[5],
          kcal: parseFloat(row[6]),
          protein: parseFloat(row[7]),
          carb: parseFloat(row[8]),
          fat: parseFloat(row[9]),
          id: Date.now() + Math.random(), // Generate ID
        });
      });
      
      return res.status(200).json({ profile, history });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}
