import { google } from "googleapis";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

const VISION_PROMPT = `Bạn là chuyên gia dinh dưỡng có kiến thức sâu về món ăn Việt Nam và quốc tế.

NHIỆM VỤ: Quan sát ảnh và **ước lượng tổng dinh dưỡng** (kcal, protein, carb, fat) cho TOÀN BỘ khẩu phần thức ăn/đồ uống thấy trong ảnh.

KHÔNG ĐỌC nhãn dinh dưỡng (kể cả khi thấy). LUÔN ước lượng dựa trên KÍCH THƯỚC THẤY được.

═══════════════════════════════════════════════════════════════
QUY TRÌNH 4 BƯỚC — bắt buộc thực hiện trước khi trả JSON
═══════════════════════════════════════════════════════════════

【BƯỚC 1】 NHẬN DIỆN MÓN ĂN
- Xác định tên cụ thể (vd: phở bò tái, cơm tấm sườn nướng bì chả, sữa yến mạch trong ly thủy tinh)
- Liệt kê các thành phần chính nếu là món hỗn hợp

【BƯỚC 2】 ƯỚC LƯỢNG KÍCH THƯỚC KHẨU PHẦN (cực kỳ quan trọng)
Dùng vật chứa làm thước đo, tham khảo bảng dưới:

  VẬT CHỨA RẮN (thức ăn):
  - Đĩa nhỏ Việt: đường kính ~18-20cm, chứa ~300-400g
  - Đĩa lớn Việt: đường kính ~22-25cm, chứa ~400-600g
  - Đĩa Western: đường kính ~28cm, chứa ~500-700g
  - Tô phở (tô lớn): đường kính ~20cm, chứa 600-800ml/g
  - Tô bún/canh (tô nhỏ): chứa ~400-500ml/g
  - Bát cơm: chứa ~150-250g cơm
  - Khay com tấm: chứa ~400-500g (cơm + thịt + đồ ăn kèm)

  VẬT CHỨA LỎNG (đồ uống):
  - Ly nước thủy tinh thường: 200-300ml
  - Ly cà phê take-away: 350-500ml
  - Cốc espresso: 30-50ml
  - Cốc capuccino/latte: 200-300ml
  - Chai nước 500ml, lon nước 330ml, lon bia 330-500ml
  - Bình thủy: 1000-1500ml
  - Hộp sữa nhỏ: 110-180ml; hộp lớn: 1000ml

  VẬT THAM CHIẾU KHÁC:
  - Muỗng canh: ~15ml; muỗng cà phê: ~5ml
  - Đũa Việt: dài ~25cm
  - Tay người trung bình: lòng bàn tay ~10-12cm
  - Quả trứng gà: ~50-55g
  - Lát bánh mì sandwich: ~25-30g

Mô tả vật chứa thấy trong ảnh và mức độ đầy (đầy / 3/4 / nửa / ít).
Cuối bước này: ước tính KHỐI LƯỢNG/THỂ TÍCH tổng = ? gram (hoặc ml cho lỏng, vẫn ghi vào "grams")

【BƯỚC 3】 TRA DỮ LIỆU DINH DƯỠNG CHUẨN per 100g/ml
Tham khảo (dùng kiến thức của bạn về món Việt + USDA + dữ liệu dinh dưỡng quốc tế):

  CƠ BẢN VIỆT NAM (per 100g):
  - Cơm trắng: 130 kcal, 2.7P, 28C, 0.3F
  - Phở bò (cả nước): ~50 kcal, 3P, 6C, 1F
  - Bún bò Huế: ~60 kcal, 3.5P, 7C, 1.5F
  - Bánh mì thịt: ~250 kcal, 10P, 35C, 8F
  - Ức gà luộc: 165 kcal, 31P, 0C, 3.6F
  - Thịt heo nạc: 150 kcal, 22P, 0C, 6F
  - Rau xào: 60 kcal, 2P, 6C, 3F

  ĐỒ UỐNG (per 100ml):
  - Sữa tươi nguyên kem: ~62 kcal, 3.3P, 4.9C, 3.4F
  - Sữa tươi không đường: ~42 kcal, 3.4P, 5C, 1F
  - Sữa yến mạch nguyên bản: ~50-65 kcal, 0.6-1P, 6.5-8C, 1.5-3F
  - Sữa hạnh nhân không đường: ~17 kcal, 0.5P, 0.3C, 1.5F
  - Cà phê đen: ~2 kcal/100ml; cà phê sữa: ~70 kcal/100ml
  - Trà sữa trân châu: ~80-120 kcal/100ml tùy thành phần
  - Nước cam vắt: 45 kcal, 1P, 10C, 0F

(Dùng kiến thức của bạn nếu món không có trong danh sách trên — nhưng phải dựa trên dữ liệu thực tế, không bịa)

【BƯỚC 4】 TÍNH TỔNG cho khẩu phần
TỔNG = (giá trị per 100) × (grams ước tính / 100)

VD: Thấy 1 ly thủy tinh chứa ~250ml sữa yến mạch nguyên bản
→ kcal = 55 × 2.5 = 138
→ protein = 0.8 × 2.5 = 2.0
→ carb = 7.3 × 2.5 = 18.3
→ fat = 2.3 × 2.5 = 5.8

═══════════════════════════════════════════════════════════════
TRẢ VỀ CHỈ JSON (không markdown, không text thừa)
═══════════════════════════════════════════════════════════════

{
  "found": true,
  "name": "Sữa yến mạch trong ly thủy tinh",
  "grams": 250,
  "kcal": 138,
  "protein": 2.0,
  "carb": 18.3,
  "fat": 5.8,
  "confidence": 0.75,
  "meal_suggestion": "Ăn vặt",
  "note": "Thấy 1 ly thủy tinh cao ~12cm chứa khoảng 250ml sữa yến mạch (đầy ~90%). Tính theo chuẩn 55 kcal/100ml. Nếu lượng thực khác ~250ml, hãy chỉnh 'Số lượng' bên dưới.",
  "source": "estimate"
}

═══════════════════════════════════════════════════════════════
QUY TẮC QUAN TRỌNG
═══════════════════════════════════════════════════════════════

1. LUÔN ước lượng từ ảnh, KHÔNG đọc nhãn dinh dưỡng (bỏ qua nhãn).
2. "grams" = TỔNG khẩu phần ước tính (gram cho rắn, ml cho lỏng).
3. "kcal/protein/carb/fat" = TỔNG cho khẩu phần đó (đã nhân với grams/100).
4. "note" PHẢI giải thích cách ước lượng (vật chứa nào, đầy bao nhiêu, theo chuẩn nào).
5. "confidence":
   - 0.85-0.95: thấy rõ vật chứa + thức ăn + ước lượng chắc
   - 0.65-0.84: thấy được nhưng góc/ánh sáng không hoàn hảo
   - 0.4-0.64: ảnh mờ, góc xấu, hoặc món không quen
6. "meal_suggestion": "Bữa sáng" | "Bữa trưa" | "Bữa tối" | "Ăn vặt".
7. Nếu KHÔNG có thức ăn/đồ uống trong ảnh → { "found": false }.
8. "source" luôn là "estimate".`;

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
    // Ưu tiên model vision tốt hơn cho portion estimation accuracy
    // (Pro/2.5-flash có reasoning tốt hơn lite/8b cho task này)
    const MODELS_TO_TRY = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL]
      : [
          "gemini-2.5-flash",          // Best balance accuracy/cost
          "gemini-2.0-flash",
          "gemini-2.5-flash-lite",     // Fallback rẻ
          "gemini-2.0-flash-lite",
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash-8b",
        ];

    let result, lastError, usedModel;
    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,          // thấp hơn → ổn định hơn
            topP: 0.8,
            maxOutputTokens: 2048,     // đủ chỗ cho reasoning + JSON
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
      note: parsed.note ? String(parsed.note).slice(0, 300) : null,
      source: parsed.source === "label" ? "label" : "estimate",
    });
  } catch (err) {
    console.error("[vision-analyze]", err);
    return Response.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
