import { google } from "googleapis";
import crypto from "crypto";

// Parse decimal an toàn dù Sheets trả number (UNFORMATTED) hoặc string "81,4" (locale VN).
const safeFloat = (v) => {
  if (typeof v === 'number') return v;
  if (v == null || v === '') return NaN;
  return parseFloat(String(v).replace(',', '.'));
};
const safeInt = (v) => {
  if (typeof v === 'number') return Math.trunc(v);
  if (v == null || v === '') return NaN;
  return parseInt(String(v).replace(',', '.'), 10);
};

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

// Get sheet ID by sheet name
async function getSheetIdByName(sheets, spreadsheetId, sheetName) {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

export async function POST(req) {
  const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) return Response.json({ error: "Missing SPREADSHEET_ID" }, { status: 400 });

  const sheets = await getSheets();
  const body = await req.json();
  const { action, userId, password, profile, history, weightLog, customFoods, deletedCommonFoods } = body;

  // === LOG FEEDBACK KHI USER SỬA MÓN ĐÃ LIBRARY-MATCH ===
  if (action === "scan_feedback") {
    if (!userId || !password) {
      return Response.json({ error: "Missing credentials" }, { status: 400 });
    }
    try {
      const hashedPassword = hashPassword(password);
      const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:J" });
      const profileRows = profileRes.data.values || [];
      const profileRow = profileRows.find((r) => r[0] === userId);
      if (!profileRow) return Response.json({ error: "User không tồn tại" }, { status: 404 });
      if (profileRow[9] && profileRow[9] !== hashedPassword) {
        return Response.json({ error: "Sai mật khẩu" }, { status: 401 });
      }
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "ScanFeedback!A:K",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            userId,
            body.timestamp || new Date().toISOString(),
            body.aiPredictedName || "",
            body.libraryMatchedName || "",
            body.userCorrectedName || "",
            String(body.confidence ?? ""),
            body.fuzzyMatched ? "1" : "0",
            String(body.kcal ?? ""),
            String(body.protein ?? ""),
            String(body.carb ?? ""),
            String(body.fat ?? ""),
          ]],
        },
      });
      return Response.json({ ok: true });
    } catch (err) {
      console.error("[scan_feedback]", err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // === UPLOAD DỮ LIỆU TỪ APP LÊN SHEETS ===
  if (action === "upload") {
    if (!userId) return Response.json({ error: "Không tìm thấy UserID" }, { status: 400 });

    try {
      const hashedPassword = hashPassword(password);

      // 1. KIỂM TRA MẬT KHẨU & CẬP NHẬT PROFILE — UNFORMATTED_VALUE (đến cột N)
      const profileRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Profile!A:N",
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      });
      const profileRows = profileRes.data.values || [];
      const profileIndex = profileRows.findIndex(row => row[0] === userId);

      if (profileIndex !== -1) {
        const storedPass = profileRows[profileIndex][9];
        if (storedPass && storedPass !== hashedPassword) {
          return Response.json({ error: "Sai mật khẩu bảo mật!" }, { status: 401 });
        }
      }

      // Nếu client không gửi customFoods/deletedCommonFoods, giữ nguyên giá trị cũ trong Sheets
      const existingCustomFoods = profileIndex !== -1 ? (profileRows[profileIndex][10] || "") : "";
      const existingDeletedCommon = profileIndex !== -1 ? (profileRows[profileIndex][11] || "") : "";
      const existingStartWeight = profileIndex !== -1 ? (profileRows[profileIndex][12] || "") : "";
      const existingTargetWeight = profileIndex !== -1 ? (profileRows[profileIndex][13] || "") : "";
      const customFoodsJson = Array.isArray(customFoods) ? JSON.stringify(customFoods) : existingCustomFoods;
      const deletedCommonJson = Array.isArray(deletedCommonFoods) ? JSON.stringify(deletedCommonFoods) : existingDeletedCommon;
      const startWeightVal = (profile.startWeight ?? null) !== null ? profile.startWeight : existingStartWeight;
      const targetWeightVal = (profile.targetWeight ?? null) !== null ? profile.targetWeight : existingTargetWeight;

      const newProfileRow = [
        userId, profile.gender || "", profile.age || "", profile.height || "", profile.weight || "",
        profile.activity || "", profile.goal || "", profile.manualTargetKcal || "",
        new Date().toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }),
        hashedPassword,
        customFoodsJson,
        deletedCommonJson,
        startWeightVal,
        targetWeightVal
      ];

      if (profileIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Profile!A${profileIndex + 1}:N${profileIndex + 1}`, valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] }
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID, range: "Profile!A:N", valueInputOption: "USER_ENTERED",
          requestBody: { values: [newProfileRow] }
        });
      }

      // 2. SYNC LỊCH SỬ THỰC ĐƠN — UNFORMATTED_VALUE
      if (history && typeof history === 'object') {
        const existingRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `History!A:K`,
          valueRenderOption: "UNFORMATTED_VALUE",
          dateTimeRenderOption: "FORMATTED_STRING",
        });
        const existingRows = existingRes.data.values || [];

        const existingMap = new Map();
        existingRows.forEach((row, index) => {
          if (row[0] === userId && row[10] != null && row[10] !== "") {
            existingMap.set(`${row[0]}::${String(row[10])}`, { row, index });
          }
        });

        const rowsToAppend = [];

        for (const [date, meals] of Object.entries(history)) {
          if (Array.isArray(meals)) {
            for (const meal of meals) {
              const key = `${userId}::${String(meal.timestamp)}`;

              if (existingMap.has(key)) {
                const { row, index } = existingMap.get(key);

                const currentMeal = row[2];
                const currentName = row[3];
                const currentQty = safeFloat(row[4]);
                const currentUnit = row[5];
                const currentKcal = safeFloat(row[6]);
                const currentPro = safeFloat(row[7]);
                const currentCarb = safeFloat(row[8]);
                const currentFat = safeFloat(row[9]);

                const isChanged = 
                    currentMeal !== meal.meal ||
                    currentName !== meal.name ||
                    currentQty !== meal.quantity ||
                    currentUnit !== meal.unit ||
                    currentKcal !== meal.kcal ||
                    currentPro !== meal.protein ||
                    currentCarb !== meal.carb ||
                    currentFat !== meal.fat;

                if (isChanged) {
                  // Cập nhật nguyên một dải từ C (Meal) đến J (Fat)
                  await sheets.spreadsheets.values.update({
                    spreadsheetId: SHEET_ID,
                    range: `History!C${index + 1}:J${index + 1}`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: { values: [[
                        meal.meal, meal.name, meal.quantity, meal.unit, 
                        meal.kcal, meal.protein, meal.carb, meal.fat
                    ]] }
                  });
                  // Cập nhật lại row trong bộ nhớ
                  row[2] = meal.meal;
                  row[3] = meal.name;
                  row[4] = meal.quantity;
                  row[5] = meal.unit;
                  row[6] = meal.kcal;
                  row[7] = meal.protein;
                  row[8] = meal.carb;
                  row[9] = meal.fat;
                }
              } else {
                // NẾU LÀ MÓN MỚI TOANH: Đưa vào mảng chờ (chưa gửi ngay)
                rowsToAppend.push([
                  userId, date, meal.meal, meal.name, meal.quantity,
                  meal.unit, meal.kcal, meal.protein, meal.carb, meal.fat,
                  meal.timestamp
                ]);
                existingMap.set(key, { row: [], index: -1 }); // Đánh dấu để tránh trùng
              }
            }
          }
        }

        // BATCH APPEND: LƯU TẤT CẢ MÓN MỚI CÙNG 1 LÚC (Nhanh và chống trùng tuyệt đối)
        if (rowsToAppend.length > 0) {
          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "History!A:K",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: rowsToAppend }
          });
        }
      }

      // 3. SYNC CÂN NẶNG — DEDUPE + UPSERT
      // Mỗi (userId, date) chỉ giữ 1 row. Nếu phát hiện duplicates → delete hết + append fresh.
      if (weightLog && typeof weightLog === 'object') {
        const weightRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: "Weight!A:C",
          valueRenderOption: "UNFORMATTED_VALUE",
          dateTimeRenderOption: "FORMATTED_STRING",
        });
        const weightRows = weightRes.data.values || [];
        let weightSheetId = null;

        const rowsToAppend = [];
        const deleteRanges = [];

        for (const [date, weight] of Object.entries(weightLog)) {
          const existingIndices = [];
          weightRows.forEach((row, idx) => {
            if (idx === 0) return; // skip header (nếu có)
            if (row[0] === userId && String(row[1]) === date) {
              existingIndices.push(idx);
            }
          });

          if (existingIndices.length === 0) {
            // Chưa có → append mới
            rowsToAppend.push([userId, date, weight]);
          } else if (existingIndices.length === 1) {
            // Đúng 1 row → update in-place nếu value khác
            const idx = existingIndices[0];
            const existingWeight = safeFloat(weightRows[idx][2]);
            if (existingWeight !== Number(weight)) {
              await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `Weight!A${idx + 1}:C${idx + 1}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [[userId, date, weight]] }
              });
            }
          } else {
            // Có DUPLICATES — đánh dấu xóa hết + append 1 row mới
            existingIndices.forEach(idx => {
              deleteRanges.push({ startIndex: idx, endIndex: idx + 1 });
            });
            rowsToAppend.push([userId, date, weight]);
          }
        }

        // Execute deletes (descending order để giữ indices của các row chưa xóa)
        if (deleteRanges.length > 0) {
          weightSheetId = await getSheetIdByName(sheets, SHEET_ID, "Weight");
          if (weightSheetId != null) {
            const requests = deleteRanges
              .sort((a, b) => b.startIndex - a.startIndex)
              .map(r => ({
                deleteDimension: {
                  range: {
                    sheetId: weightSheetId,
                    dimension: "ROWS",
                    startIndex: r.startIndex,
                    endIndex: r.endIndex,
                  }
                }
              }));
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: SHEET_ID,
              requestBody: { requests }
            });
          }
        }

        // Batch append all new rows
        if (rowsToAppend.length > 0) {
          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "Weight!A:C",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: rowsToAppend }
          });
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

    // 1. LẤY PROFILE — UNFORMATTED_VALUE để bypass locale formatting (vd VN trả "81,4" thay vì 81.4)
    const profileRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Profile!A:N",
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
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
      age: safeInt(profileRow[2]) || 25,
      height: safeFloat(profileRow[3]) || 165,
      weight: safeFloat(profileRow[4]) || 60,
      activity: safeFloat(profileRow[5]) || 1.375,
      goal: safeInt(profileRow[6]) || 0,
      manualTargetKcal: profileRow[7] != null && profileRow[7] !== "" ? safeInt(profileRow[7]) : null,
    };
    // Chỉ thêm startWeight/targetWeight nếu có giá trị (tránh overwrite local state với null)
    if (profileRow[12] != null && profileRow[12] !== "") profile.startWeight = safeFloat(profileRow[12]);
    if (profileRow[13] != null && profileRow[13] !== "") profile.targetWeight = safeFloat(profileRow[13]);

    let customFoods = null;
    let deletedCommonFoods = null;
    try { if (profileRow[10]) customFoods = JSON.parse(profileRow[10]); } catch (e) {}
    try { if (profileRow[11]) deletedCommonFoods = JSON.parse(profileRow[11]); } catch (e) {}

    // 2. LẤY LỊCH SỬ — UNFORMATTED_VALUE
    const historyRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "History!A:K",
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    const historyRows = historyRes.data.values || [];
    const history = {};

    historyRows.slice(1).forEach(row => {
      if (!row || row.length === 0 || !row[0] || row[1] == null) return;

      if (row[0] === userId) {
        const date = String(row[1]);
        const tsRaw = row[10];
        const ts = tsRaw != null && tsRaw !== "" ? String(tsRaw) : `${date}-${Date.now()}`;
        const meal = {
          meal: row[2] || "",
          name: row[3] || "",
          quantity: safeFloat(row[4]) || 0,
          unit: row[5] || "g",
          kcal: safeFloat(row[6]) || 0,
          protein: safeFloat(row[7]) || 0,
          carb: safeFloat(row[8]) || 0,
          fat: safeFloat(row[9]) || 0,
          timestamp: ts,
          id: ts,
        };
        if (!history[date]) history[date] = [];
        history[date].push(meal);
      }
    });

    // 3. LẤY CÂN NẶNG — UNFORMATTED_VALUE
    const weightRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Weight!A:C",
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    const weightRows = weightRes.data.values || [];
    const weightLog = {};

    weightRows.slice(1).forEach(row => {
      if (row[0] === userId && row[1] != null) {
        weightLog[String(row[1])] = safeFloat(row[2]);
      }
    });

    // 4. LẤY SCAN FEEDBACK — UNFORMATTED_VALUE
    let scanFeedback = [];
    try {
      const fbRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "ScanFeedback!A:K",
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      });
      const fbRows = fbRes.data.values || [];
      scanFeedback = fbRows.slice(1)
        .filter(row => row && row[0] === userId && row[2] && row[4])
        .slice(-200)
        .map(row => ({
          timestamp: row[1] != null ? String(row[1]) : "",
          aiPredictedName: row[2] || "",
          libraryMatchedName: row[3] || "",
          userCorrectedName: row[4] || "",
          confidence: safeFloat(row[5]) || 0,
          fuzzyMatched: row[6] === "1" || row[6] === 1,
          kcal: safeFloat(row[7]) || 0,
          protein: safeFloat(row[8]) || 0,
          carb: safeFloat(row[9]) || 0,
          fat: safeFloat(row[10]) || 0,
        }));
    } catch (e) {
      console.warn("[sync GET] ScanFeedback fetch failed:", e.message);
    }

    return Response.json({ profile, history, weightLog, customFoods, deletedCommonFoods, scanFeedback });

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

    // Verify password (UNFORMATTED_VALUE để password hash text giữ nguyên kiểu)
    const profileRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Profile!A:L",
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    const profileRows = profileRes.data.values || [];
    const profileRow = profileRows.find(row => row[0] === userId);

    if (!profileRow || (profileRow[9] && profileRow[9] !== hashedPassword)) {
      return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Delete from History - find row index and delete it (UNFORMATTED_VALUE để compare timestamp đúng kiểu)
    const historyRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "History!A:K",
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    const historyRows = historyRes.data.values || [];
    const deleteRowIndex = historyRows.findIndex(row => row && row[0] === userId && row[10] != null && String(row[10]) === String(timestamp));

    if (deleteRowIndex !== -1) {
      // Get the correct sheet ID for History sheet
      const historySheetId = await getSheetIdByName(sheets, SHEET_ID, "History");
      
      if (historySheetId !== null) {
        // Properly delete the row by removing the dimension
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: historySheetId,
                    dimension: "ROWS",
                    startIndex: deleteRowIndex,
                    endIndex: deleteRowIndex + 1
                  }
                }
              }
            ]
          }
        });
      }
    }

    return Response.json({ status: "deleted" });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}