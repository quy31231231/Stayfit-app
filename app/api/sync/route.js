import { google } from "googleapis";
import crypto from "crypto";

// [SECURITY] Hash password bằng SHA-256
function hashPassword(password) {
  if (!password) return "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

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

export async function POST(req) {
  const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) return Response.json({ error: "Missing SPREADSHEET_ID" }, { status: 400 });

  const sheets = await getSheets();
  const { action, userId, password, profile, history, weightLog } = await req.json();

  // === UPLOAD DỮ LIỆU TỪ APP LÊN SHEETS ===
  if (action === "upload") {
    if (!userId) return Response.json({ error: "Không tìm thấy UserID" }, { status: 400 });

    try {
      const hashedPassword = hashPassword(password);

      // 1. KIỂM TRA MẬT KHẨU & CẬP NHẬT PROFILE
      const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:J" });
      const profileRows = profileRes.data.values || [];
      const profileIndex = profileRows.findIndex(row => row[0] === userId);

      if (profileIndex !== -1) {
        const storedPass = profileRows[profileIndex][9];
        if (storedPass && storedPass !== hashedPassword) {
          return Response.json({ error: "Sai mật khẩu bảo mật!" }, { status: 401 });
        }
      }

      const newProfileRow = [
        userId, profile.gender || "", profile.age || "", profile.height || "", profile.weight || "", 
        profile.activity || "", profile.goal || "", profile.manualTargetKcal || "", 
        new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }), 
        hashedPassword
      ];

      if (profileIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Profile!A${profileIndex + 1}`, valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] }
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID, range: "Profile!A:J", valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] }
        });
      }

      // 2. SYNC LỊCH SỬ THỰC ĐƠN
      if (history && typeof history === 'object') {
        // [PERF] Fetch toàn bộ history của user 1 lần duy nhất (thay vì fetch lại cho mỗi meal)
        const existingRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `History!A:K`,
        });
        const existingRows = existingRes.data.values || [];
        // [DEDUP] Tạo Set tổ hợp userId+timestamp để check O(1) và không nhầm giữa user khác nhau
        const existingKeys = new Set(
          existingRows
            .filter(row => row[0] === userId && row[10])
            .map(row => `${row[0]}::${row[10]}`)
        );

        for (const [date, meals] of Object.entries(history)) {
          if (Array.isArray(meals)) {
            for (const meal of meals) {
              const key = `${userId}::${meal.timestamp}`;
              if (!existingKeys.has(key)) {
                await sheets.spreadsheets.values.append({
                  spreadsheetId: SHEET_ID,
                  range: "History!A:K", // ✅ Đúng với 11 cột (A→K)
                  valueInputOption: "USER_ENTERED",
                  requestBody: {
                    values: [[
                      userId, date, meal.meal, meal.name, meal.quantity,
                      meal.unit, meal.kcal, meal.protein, meal.carb, meal.fat,
                      meal.timestamp
                    ]]
                  }
                });
                // Thêm key vào Set ngay để tránh trùng trong cùng batch sync
                existingKeys.add(key);
              }
            }
          }
        }
      }

      // 3. SYNC CÂN NẶNG
      if (weightLog && typeof weightLog === 'object') {
        // Get existing weight data to check for duplicates
        const weightRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Weight!A:C" });
        const weightRows = weightRes.data.values || [];
        
        for (const [date, weight] of Object.entries(weightLog)) {
          // Check if weight entry for this date already exists
          const exists = weightRows.some(row => row[0] === userId && row[1] === date);
          
          if (!exists) {
            await sheets.spreadsheets.values.append({
              spreadsheetId: SHEET_ID, range: "Weight!A:C", valueInputOption: "USER_ENTERED",
              requestBody: { values: [[userId, date, weight]] }
            });
          }
        }
      }

      return Response.json({ status: "upload_success" });

    } catch (err) {
      console.error(err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET(req) {
  const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) return Response.json({ error: "Missing SPREADSHEET_ID" }, { status: 400 });

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const password = searchParams.get("password");

    if (!userId || !password) {
      return Response.json({ error: "Missing userId or password" }, { status: 400 });
    }

    const sheets = await getSheets();
    const hashedPassword = hashPassword(password);

    // 1. LẤY PROFILE
    const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:J" });
    const profileRows = profileRes.data.values || [];
    const profileRow = profileRows.find(row => row[0] === userId);

    if (!profileRow) {
      return Response.json({ error: "User không tồn tại" }, { status: 404 });
    }

    const storedPass = profileRow[9];
    if (storedPass && storedPass !== hashedPassword) {
      return Response.json({ error: "Sai mật khẩu" }, { status: 401 });
    }

    const profile = {
      gender: profileRow[1] || "male",
      age: parseInt(profileRow[2]) || 25,
      height: parseInt(profileRow[3]) || 165,
      weight: parseInt(profileRow[4]) || 60,
      activity: parseFloat(profileRow[5]) || 1.375,
      goal: parseInt(profileRow[6]) || 0,
      manualTargetKcal: profileRow[7] ? parseInt(profileRow[7]) : null,
    };

    // 2. LẤY LỊCH SỬ
    const historyRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "History!A:K" });
    const historyRows = historyRes.data.values || [];
    const history = {};

    historyRows.slice(1).forEach(row => {
      // Skip only completely empty rows
      if (!row || row.length === 0 || !row[0] || !row[1]) return;
      
      if (row[0] === userId) {
        const date = row[1];
        const meal = {
          meal: row[2] || "",
          name: row[3] || "",
          quantity: parseFloat(row[4]) || 0,
          unit: row[5] || "g",
          kcal: parseFloat(row[6]) || 0,
          protein: parseFloat(row[7]) || 0,
          carb: parseFloat(row[8]) || 0,
          fat: parseFloat(row[9]) || 0,
          timestamp: row[10] || `${date}-${Date.now()}`, // Generate timestamp if missing
          id: row[10] || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        if (!history[date]) history[date] = [];
        history[date].push(meal);
      }
    });

    // 3. LẤY CÂN NẶNG
    const weightRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Weight!A:C" });
    const weightRows = weightRes.data.values || [];
    const weightLog = {};

    weightRows.slice(1).forEach(row => {
      if (row[0] === userId) {
        weightLog[row[1]] = parseFloat(row[2]);
      }
    });

    return Response.json({ profile, history, weightLog });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) return Response.json({ error: "Missing SPREADSHEET_ID" }, { status: 400 });

  try {
    const { userId, password, timestamp } = await req.json();

    if (!userId || !password || !timestamp) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sheets = await getSheets();
    const hashedPassword = hashPassword(password);

    // Verify password
    const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:J" });
    const profileRows = profileRes.data.values || [];
    const profileRow = profileRows.find(row => row[0] === userId);

    if (!profileRow || (profileRow[9] && profileRow[9] !== hashedPassword)) {
      return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Delete from History - clear the row (safer than deleting dimension)
    const historyRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "History!A:K" });
    const historyRows = historyRes.data.values || [];
    const deleteRowIndex = historyRows.findIndex(row => row && row[0] === userId && row[10] === timestamp);

    if (deleteRowIndex !== -1) {
      // Clear all values in the row but keep the row structure intact
      await sheets.spreadsheets.values.batchClear({
        spreadsheetId: SHEET_ID,
        requestBody: {
          ranges: [`History!A${deleteRowIndex + 1}:K${deleteRowIndex + 1}`]
        }
      });
    }

    return Response.json({ status: "deleted" });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}