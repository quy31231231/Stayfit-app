import { google } from "googleapis";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

const VISION_PROMPT = `Bạn là chuyên gia dinh dưỡng. Phân tích ảnh món ăn và trả về JSON.

Nếu ảnh có món ăn rõ ràng: ước lượng tên món (tiếng Việt), khối lượng (gram),
calo và macro dinh dưỡng cho khẩu phần trong ảnh.
Nếu không có món ăn: trả về { "found": false }.

Trả về CHỈ JSON (không markdown, không giải thích):
{
  "found": true,
  "name": "Tên món bằng tiếng Việt (vd: Phở bò, Cơm tấm sườn bì, Bánh mì thịt)",
  "grams": 350,
  "kcal": 480,
  "protein": 25,
  "carb": 60,
  "fat": 12,
  "confidence": 0.85,
  "meal_suggestion": "Bữa trưa",
  "note": "Ghi chú ngắn (tuỳ chọn)"
}

Quy tắc:
- "grams" là khối lượng ước tính của toàn bộ khẩu phần trong ảnh.
- "kcal", "protein", "carb", "fat" là TỔNG cho khẩu phần đó (KHÔNG phải per 100g).
- "confidence" 0-1 (0.9 = chắc chắn, 0.5 = phân vân).
- "meal_suggestion" chỉ chọn 1 trong: "Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt".
- Nếu có nhiều món trong ảnh, mô tả món chính (lớn nhất / nổi bật nhất).`;

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
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req) {
  try {
    const { userId, password, imageBase64, mimeType } = await req.json();

    // 1. Auth
    if (!userId || !password) {
      return Response.json({ error: "Thiếu thông tin xác thực" }, { status: 401 });
    }
    const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
    if (!SHEET_ID) {
      return Response.json({ error: "Server chưa cấu hình SPREADSHEET_ID" }, { status: 500 });
    }
    const sheets = await getSheets();
    const profileRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Profile!A:J" });
    const profileRows = profileRes.data.values || [];
    const profileRow = profileRows.find((r) => r[0] === userId);
    if (!profileRow) {
      return Response.json({ error: "User không tồn tại" }, { status: 404 });
    }
    if (profileRow[9] && profileRow[9] !== hashPassword(password)) {
      return Response.json({ error: "Sai mật khẩu" }, { status: 401 });
    }

    // 2. Validate image
    if (!imageBase64 || !mimeType || !mimeType.startsWith("image/")) {
      return Response.json({ error: "Ảnh không hợp lệ" }, { status: 400 });
    }
    if (imageBase64.length > 6_000_000) {
      return Response.json({ error: "Ảnh quá lớn (max 4.5 MB)" }, { status: 400 });
    }

    // 3. Call Gemini
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Server chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Ưu tiên model nhẹ/rẻ trước (cheaper = free tier friendly hơn)
    const MODELS_TO_TRY = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL]
      : [
          "gemini-2.5-flash-lite",   // Lite — free tier rộng nhất
          "gemini-2.0-flash-lite",
          "gemini-1.5-flash-8b",     // 8B small model
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash-latest",
        ];

    let result, lastError, usedModel;
    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });
        result = await model.generateContent([
          VISION_PROMPT,
          { inlineData: { data: imageBase64, mimeType } },
        ]);
        usedModel = modelName;
        break;
      } catch (err) {
        lastError = err;
        const msg = String(err.message || "");
        // 404 / not found / quota=0 → thử model kế
        // 429 prepayment depleted → fail toàn bộ project, không cần thử tiếp
        if (msg.includes("prepayment credits are depleted")) {
          console.error(`[vision-analyze] Project hết credit, dừng thử`);
          break;
        }
        if (msg.includes("404") || msg.includes("not found") || msg.includes("limit: 0")) {
          console.warn(`[vision-analyze] Model ${modelName} không khả dụng, thử model kế...`);
          continue;
        }
        // Lỗi khác (network, parse) → throw ngay
        throw err;
      }
    }

    if (!result) {
      const errMsg = String(lastError?.message || "");
      let userMessage;
      let statusCode = 502;

      if (errMsg.includes("prepayment credits are depleted") || errMsg.includes("billing")) {
        userMessage = "Tài khoản Google của bạn đã hết credit thanh toán. Vui lòng tạo API key mới từ project FREE tại https://aistudio.google.com/apikey (chọn 'Create API key in new project').";
        statusCode = 402;
      } else if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("403")) {
        userMessage = "API key không hợp lệ. Kiểm tra lại GEMINI_API_KEY trên Vercel.";
        statusCode = 401;
      } else if (errMsg.includes("404") || errMsg.includes("not found")) {
        userMessage = "Không tìm thấy model AI khả dụng cho account của bạn. Tạo API key mới tại https://aistudio.google.com/apikey.";
      } else {
        userMessage = `Không gọi được Gemini API: ${errMsg.slice(0, 200)}`;
      }

      console.error("[vision-analyze] Toàn bộ models fail:", errMsg);
      return Response.json({ error: userMessage }, { status: statusCode });
    }

    console.log(`[vision-analyze] Đã dùng model: ${usedModel}`);

    const text = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("[vision-analyze] Parse error:", text.slice(0, 200));
      return Response.json({ error: "AI trả về không đúng định dạng" }, { status: 502 });
    }

    if (!parsed.found) {
      return Response.json({ error: "Không nhận diện được món ăn trong ảnh" }, { status: 422 });
    }

    // 4. Sanitize
    const safeNum = (v, fallback = 0) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : fallback;
    };
    const MEAL_TYPES = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
    const mealSuggestion = MEAL_TYPES.includes(parsed.meal_suggestion) ? parsed.meal_suggestion : null;

    return Response.json({
      found: true,
      name: String(parsed.name || "Món không xác định").slice(0, 100),
      grams: Math.max(1, safeNum(parsed.grams, 100)),
      kcal: safeNum(parsed.kcal),
      protein: safeNum(parsed.protein),
      carb: safeNum(parsed.carb),
      fat: safeNum(parsed.fat),
      confidence: Math.min(1, Math.max(0, safeNum(parsed.confidence, 0.5))),
      meal_suggestion: mealSuggestion,
      note: parsed.note ? String(parsed.note).slice(0, 200) : null,
    });
  } catch (err) {
    console.error("[vision-analyze]", err);
    return Response.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
