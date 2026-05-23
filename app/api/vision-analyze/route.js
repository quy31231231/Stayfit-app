import { google } from "googleapis";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Diacritic-strip + lowercase + collapse whitespace, for fuzzy comparison.
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

// 0.0-1.0 similarity score. Exact > substring > token-Jaccard.
function fuzzyScore(query, target) {
  const q = normalize(query);
  const t = normalize(target);
  if (!q || !t) return 0;
  if (q === t) return 1.0;
  if (t.includes(q) || q.includes(t)) return 0.85;
  const qTokens = new Set(q.split(" ").filter(Boolean));
  const tTokens = new Set(t.split(" ").filter(Boolean));
  if (qTokens.size === 0 || tTokens.size === 0) return 0;
  const intersection = [...qTokens].filter((x) => tTokens.has(x)).length;
  const union = new Set([...qTokens, ...tTokens]).size;
  return intersection / union;
}

function fuzzyMatch(query, library, threshold = 0.7) {
  let best = null;
  let bestScore = 0;
  for (const entry of library) {
    const score = fuzzyScore(query, entry.name);
    if (score > bestScore && score >= threshold) {
      best = entry;
      bestScore = score;
    }
  }
  return best ? { entry: best, score: bestScore } : null;
}

function buildPrompt(libraryListStr) {
  const libraryBlock = libraryListStr
    ? `═══════════════════════════════════════════════════════════════
THƯ VIỆN MÓN CỦA USER (ưu tiên match nếu có)
═══════════════════════════════════════════════════════════════

${libraryListStr}

QUY TRÌNH MATCH (cho TỪNG món):
- Sau khi nhận diện món + ước lượng khẩu phần, SO tên món với THƯ VIỆN trên.
- Nếu món trong ảnh KHỚP với 1 entry → "matched": true, "name" = EXACT tên từ thư viện (copy-paste).
- Nếu KHÔNG có entry nào khớp đủ tin cậy → "matched": false, "name" = tên tự đặt.

`
    : "";

  return `Bạn là chuyên gia dinh dưỡng có kiến thức sâu về món ăn Việt Nam và quốc tế.

NHIỆM VỤ: Quan sát ảnh, nhận diện TẤT CẢ món ăn/đồ uống thấy được (tối đa 5 món), ước lượng khẩu phần và macro cho TỪNG món.

KHÔNG ĐỌC nhãn dinh dưỡng (kể cả khi thấy). LUÔN ước lượng dựa trên KÍCH THƯỚC THẤY được.

═══════════════════════════════════════════════════════════════
QUY TRÌNH BẮT BUỘC
═══════════════════════════════════════════════════════════════

【BƯỚC 1】 NHẬN DIỆN TẤT CẢ MÓN TRONG ẢNH
- Liệt kê tối đa 5 món (ưu tiên món lớn nhất/rõ nhất nếu nhiều hơn).
- Mỗi món xác định tên cụ thể (vd: phở bò tái, cơm trắng, canh chua cá).
- Nếu là tô/đĩa hỗn hợp KHÔNG tách (vd cơm tấm có cơm + sườn + bì + chả) → coi là 1 món "Cơm tấm sườn bì chả".

【BƯỚC 2】 ƯỚC LƯỢNG KÍCH THƯỚC TỪNG MÓN
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

${libraryBlock}【BƯỚC 3】 TRA DỮ LIỆU DINH DƯỠNG (LUÔN trả macros cho mọi món)
Dùng kiến thức của bạn về món Việt + USDA. LUÔN trả kcal/protein/carb/fat cho từng món, dù matched=true hay false.
TỔNG = (giá trị per 100g/ml) × (grams ước tính / 100)

═══════════════════════════════════════════════════════════════
TRẢ VỀ CHỈ JSON (không markdown, không text thừa)
═══════════════════════════════════════════════════════════════

{
  "found": true,
  "items": [
    {
      "matched": true,
      "name": "<tên EXACT từ thư viện hoặc tên tự đặt>",
      "qty": 50,
      "grams": 50,
      "kcal": 89,
      "protein": 1.1,
      "carb": 22.8,
      "fat": 0.3,
      "confidence": 0.85,
      "meal_suggestion": "Bữa trưa",
      "note": "<lời khen hoặc Bạn-có-biết, 15-30 từ>"
    }
  ]
}

Nếu không có món nào trong ảnh: { "found": false, "items": [] }

═══════════════════════════════════════════════════════════════
QUY TẮC QUAN TRỌNG
═══════════════════════════════════════════════════════════════

1. TỐI ĐA 5 món/ảnh. Nếu ảnh có nhiều hơn, chọn 5 món LỚN NHẤT.
2. LUÔN trả đầy đủ kcal/protein/carb/fat cho TỪNG món (dù matched hay không).
3. "matched": true CHỈ KHI tên trùng/rất gần entry thư viện. Tên matched=true PHẢI là 1 entry có trong thư viện.
4. "qty" cho matched=true: số đơn vị thấy theo "per" + "unit" của entry (VD: entry "Tỏi" per 100g, thấy 50g → qty=50; entry "Phở bò (1 tô)" thấy 1 tô → qty=1).
5. "grams" cho matched=false: gram ước tính.
6. LUÔN ước lượng từ ảnh, KHÔNG đọc nhãn dinh dưỡng.
7. "note" KHÔNG giải thích cách ước lượng. Viết 1 câu (15-30 từ) ẤM ÁP về món:
   - Lời khen tích cực ("Lựa chọn rất tốt cho..."), HOẶC
   - Fact "Bạn có biết?" thú vị về món.
   KHÔNG nhắc gram, kcal, vật chứa, "ước lượng". Tiếng Việt tự nhiên. KHÔNG dùng dấu ngoặc kép.
8. "confidence":
   - 0.85-0.95: thấy rõ + match chắc
   - 0.65-0.84: thấy được nhưng không hoàn hảo
   - 0.4-0.64: ảnh mờ, góc xấu, hoặc món không quen → confidence thấp
9. "meal_suggestion": "Bữa sáng" | "Bữa trưa" | "Bữa tối" | "Ăn vặt".
10. Nếu KHÔNG có thức ăn/đồ uống nào trong ảnh → { "found": false, "items": [] }.`;
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
    const FUZZY_THRESHOLD_EXPLICIT = 0.7; // AI nói matched=true → cho fuzzy nới hơn
    const FUZZY_THRESHOLD_IMPLICIT = 0.85; // AI nói matched=false → ngưỡng cao hơn để tránh false-positive
    const MIN_CONFIDENCE = 0.5;

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    if (rawItems.length === 0) {
      return Response.json({ error: "Không nhận diện được món ăn trong ảnh" }, { status: 422 });
    }

    const results = rawItems.slice(0, 5).map((item) => {
      const name = typeof item.name === "string" ? item.name.trim().slice(0, 100) : "";
      const confidence = Math.min(1, Math.max(0, safeNum(item.confidence, 0.5)));
      const mealSuggestion = MEAL_TYPES.includes(item.meal_suggestion) ? item.meal_suggestion : null;
      const note = item.note ? String(item.note).slice(0, 300) : null;

      let libEntry = null;
      let fuzzyUsed = false;

      if (name && library.length > 0) {
        if (item.matched === true) {
          libEntry = library.find((f) => f.name === name);
          if (!libEntry) {
            const m = fuzzyMatch(name, library, FUZZY_THRESHOLD_EXPLICIT);
            if (m) {
              libEntry = m.entry;
              fuzzyUsed = true;
            }
          }
        } else {
          // matched=false: vẫn thử fuzzy với ngưỡng cao
          const m = fuzzyMatch(name, library, FUZZY_THRESHOLD_IMPLICIT);
          if (m) {
            libEntry = m.entry;
            fuzzyUsed = true;
          }
        }
      }

      // Confidence threshold: revert sang estimate
      if (libEntry && confidence < MIN_CONFIDENCE) {
        libEntry = null;
        fuzzyUsed = false;
      }

      if (libEntry) {
        const qty = Math.max(0.1, safeNum(item.qty, libEntry.per));
        return {
          source: "library",
          matched: true,
          name: libEntry.name,
          aiPredictedName: name,
          libraryName: libEntry.name,
          fuzzyMatched: fuzzyUsed,
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
        };
      }

      const grams = Math.max(1, safeNum(item.grams, 100));
      return {
        source: "estimate",
        matched: false,
        name: name || "Món không xác định",
        aiPredictedName: name,
        libraryName: null,
        fuzzyMatched: false,
        unit: "g",
        per: grams,
        grams,
        kcal: safeNum(item.kcal),
        protein: safeNum(item.protein),
        carb: safeNum(item.carb),
        fat: safeNum(item.fat),
        confidence,
        meal_suggestion: mealSuggestion,
        note,
      };
    });

    return Response.json({ found: true, items: results });
  } catch (err) {
    console.error("[vision-analyze]", err);
    return Response.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
