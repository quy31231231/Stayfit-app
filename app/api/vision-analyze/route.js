import { google } from "googleapis";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildPrompt(libraryListStr) {
  const libraryBlock = libraryListStr
    ? `═══════════════════════════════════════════════════════════════
THƯ VIỆN MÓN CỦA USER (ưu tiên match nếu có)
═══════════════════════════════════════════════════════════════

${libraryListStr}

QUY TRÌNH MATCH:
- Sau khi nhận diện món + ước lượng khẩu phần, SO tên món với THƯ VIỆN trên.
- Nếu món trong ảnh KHỚP với 1 entry (cùng món hoặc rất gần) → trả "matched": true.
  • "name" = EXACT tên từ thư viện (copy-paste từng ký tự, KHÔNG SỬA, KHÔNG dịch).
  • "qty" = số đơn vị thấy trong ảnh, tính theo "per" + "unit" của entry đó.
     VD: entry "Tỏi" (per: 100 g) thấy 50g → qty = 50
     VD: entry "Phở bò (1 tô lớn)" (per: 1 tô) thấy 1 tô đầy → qty = 1
     VD: entry "Phở bò (1 tô lớn)" thấy tô đầy hơn (cỡ XL) → qty = 1.3
  • KHÔNG trả kcal/protein/carb/fat khi matched=true (server tự lookup).
- Nếu KHÔNG có entry nào khớp đủ tin cậy (confidence match < 0.7) → trả "matched": false và estimate đầy đủ kcal/macro.

`
    : "";

  return `Bạn là chuyên gia dinh dưỡng có kiến thức sâu về món ăn Việt Nam và quốc tế.

NHIỆM VỤ: Quan sát ảnh và (a) nhận diện món + (b) ước lượng khẩu phần. Sau đó hoặc match với thư viện của user, hoặc tự ước lượng kcal/macro.

KHÔNG ĐỌC nhãn dinh dưỡng (kể cả khi thấy). LUÔN ước lượng dựa trên KÍCH THƯỚC THẤY được.

═══════════════════════════════════════════════════════════════
QUY TRÌNH BẮT BUỘC
═══════════════════════════════════════════════════════════════

【BƯỚC 1】 NHẬN DIỆN MÓN ĂN
- Xác định tên cụ thể (vd: phở bò tái, cơm tấm sườn nướng bì chả, sữa yến mạch trong ly thủy tinh)
- Liệt kê các thành phần chính nếu là món hỗn hợp

【BƯỚC 2】 ƯỚC LƯỢNG KÍCH THƯỚC KHẨU PHẦN
Dùng vật chứa làm thước đo, tham khảo bảng dưới:

  VẬT CHỨA RẮN (thức ăn):
  - Đĩa nhỏ Việt: đường kính ~18-20cm, chứa ~300-400g
  - Đĩa lớn Việt: đường kính ~22-25cm, chứa ~400-600g
  - Đĩa Western: đường kính ~28cm, chứa ~500-700g
  - Tô phở (tô lớn): đường kính ~20cm, chứa 600-800ml/g
  - Tô bún/canh (tô nhỏ): chứa ~400-500ml/g
  - Bát cơm: chứa ~150-250g cơm
  - Khay cơm tấm: chứa ~400-500g (cơm + thịt + đồ ăn kèm)

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
  - Quả trứng gà: ~50-55g
  - Lát bánh mì sandwich: ~25-30g

Mô tả vật chứa thấy trong ảnh và mức độ đầy (đầy / 3/4 / nửa / ít).

${libraryBlock}【BƯỚC 3】 TRA DỮ LIỆU DINH DƯỠNG (chỉ dùng khi matched=false)
Dùng kiến thức của bạn về món Việt + USDA + dữ liệu dinh dưỡng quốc tế.
TỔNG = (giá trị per 100g/ml) × (grams ước tính / 100)

═══════════════════════════════════════════════════════════════
TRẢ VỀ CHỈ JSON (không markdown, không text thừa)
═══════════════════════════════════════════════════════════════

Trường hợp MATCHED (có entry phù hợp trong thư viện):
{
  "found": true,
  "matched": true,
  "name": "<tên EXACT copy-paste từ thư viện>",
  "qty": 50,
  "confidence": 0.85,
  "meal_suggestion": "Bữa trưa",
  "note": "<lời khen hoặc Bạn-có-biết, 15-30 từ>"
}

Trường hợp KHÔNG matched (không có entry nào phù hợp):
{
  "found": true,
  "matched": false,
  "name": "<tên tự đặt>",
  "grams": 250,
  "kcal": 138,
  "protein": 2.0,
  "carb": 18.3,
  "fat": 5.8,
  "confidence": 0.75,
  "meal_suggestion": "Ăn vặt",
  "note": "<lời khen hoặc Bạn-có-biết>"
}

═══════════════════════════════════════════════════════════════
QUY TẮC QUAN TRỌNG
═══════════════════════════════════════════════════════════════

1. Ưu tiên matched=true khi tên match có confidence ≥ 0.7. Nếu nghi ngờ → matched=false.
2. KHÔNG BAO GIỜ bịa tên không có trong thư viện cho "matched": true. Tên PHẢI là 1 trong các entry liệt kê ở trên.
3. LUÔN ước lượng từ ảnh, KHÔNG đọc nhãn dinh dưỡng.
4. "note" KHÔNG giải thích cách ước lượng. Viết 1 câu (15-30 từ) ẤM ÁP về món:
   - Lời khen tích cực ("Lựa chọn rất tốt cho...", "Món này giúp..."), HOẶC
   - Fact "Bạn có biết?" thú vị về dinh dưỡng/văn hóa/lịch sử món đó.
   KHÔNG nhắc gram, kcal, vật chứa, "ước lượng". Văn phong thân thiện, tiếng Việt tự nhiên. KHÔNG dùng dấu ngoặc kép ở đầu/cuối câu.
5. "confidence":
   - 0.85-0.95: thấy rõ vật chứa + thức ăn + ước lượng chắc
   - 0.65-0.84: thấy được nhưng góc/ánh sáng không hoàn hảo
   - 0.4-0.64: ảnh mờ, góc xấu, hoặc món không quen
6. "meal_suggestion": "Bữa sáng" | "Bữa trưa" | "Bữa tối" | "Ăn vặt".
7. Nếu KHÔNG có thức ăn/đồ uống trong ảnh → { "found": false }.`;
}

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
    const { userId, password, imageBase64, mimeType, library: rawLibrary = [] } = await req.json();

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

    // 3. Sanitize library
    const library = Array.isArray(rawLibrary)
      ? rawLibrary
          .filter(
            (f) =>
              f &&
              typeof f.name === "string" &&
              f.name.trim() &&
              typeof f.unit === "string" &&
              Number.isFinite(Number(f.per)) &&
              Number(f.per) > 0
          )
          .slice(0, 600)
      : [];

    const libraryListStr = library
      .map((f) => `- "${f.name}" (per: ${f.per} ${f.unit})`)
      .join("\n");

    const prompt = buildPrompt(libraryListStr);

    // 4. Call Gemini
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Server chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const MODELS_TO_TRY = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL]
      : [
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-2.5-flash-lite",
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
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
        });
        result = await model.generateContent([
          prompt,
          { inlineData: { data: imageBase64, mimeType } },
        ]);
        usedModel = modelName;
        break;
      } catch (err) {
        lastError = err;
        const msg = String(err.message || "");
        if (msg.includes("prepayment credits are depleted")) {
          console.error(`[vision-analyze] Project hết credit, dừng thử`);
          break;
        }
        if (msg.includes("404") || msg.includes("not found") || msg.includes("limit: 0")) {
          console.warn(`[vision-analyze] Model ${modelName} không khả dụng, thử model kế...`);
          continue;
        }
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

    const safeNum = (v, fallback = 0) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : fallback;
    };
    const MEAL_TYPES = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
    const mealSuggestion = MEAL_TYPES.includes(parsed.meal_suggestion) ? parsed.meal_suggestion : null;
    const note = parsed.note ? String(parsed.note).slice(0, 300) : null;
    const confidence = Math.min(1, Math.max(0, safeNum(parsed.confidence, 0.5)));

    // 5. MATCHED path — lookup library entry
    if (parsed.matched === true && typeof parsed.name === "string" && parsed.name.trim()) {
      const libEntry = library.find((f) => f.name === parsed.name);
      if (libEntry) {
        const qty = Math.max(0.1, safeNum(parsed.qty, libEntry.per));
        return Response.json({
          found: true,
          source: "library",
          matched: true,
          name: libEntry.name,
          unit: libEntry.unit,
          per: Number(libEntry.per),
          grams: qty,
          kcal: safeNum(libEntry.kcal),
          protein: safeNum(libEntry.protein),
          carb: safeNum(libEntry.carb),
          fat: safeNum(libEntry.fat),
          confidence,
          meal_suggestion: mealSuggestion,
          note,
        });
      }
      // Hallucination: matched=true nhưng name không có trong library
      console.warn(`[vision-analyze] Hallucination: "${parsed.name}" không có trong library`);
      return Response.json(
        { error: "AI phân tích chưa chuẩn, vui lòng thử lại." },
        { status: 502 }
      );
    }

    // 6. ESTIMATE path
    const grams = Math.max(1, safeNum(parsed.grams, 100));
    return Response.json({
      found: true,
      source: "estimate",
      matched: false,
      name: String(parsed.name || "Món không xác định").slice(0, 100),
      unit: "g",
      per: grams,
      grams,
      kcal: safeNum(parsed.kcal),
      protein: safeNum(parsed.protein),
      carb: safeNum(parsed.carb),
      fat: safeNum(parsed.fat),
      confidence,
      meal_suggestion: mealSuggestion,
      note,
    });
  } catch (err) {
    console.error("[vision-analyze]", err);
    return Response.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
