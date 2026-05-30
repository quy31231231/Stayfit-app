import { google } from "googleapis";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifySupabaseToken } from "../../../lib/supabase/verify";

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

function buildPrompt(libraryListStr, description) {
  const libraryBlock = libraryListStr
    ? `═══════════════════════════════════════════════════════════════
THƯ VIỆN MÓN CỦA USER (chỉ dùng match cho MÓN BÀY BIỆN — LOẠI B)
═══════════════════════════════════════════════════════════════

${libraryListStr}

QUY TRÌNH MATCH (chỉ cho LOẠI B):
- Sau khi nhận diện món + ước lượng khẩu phần, SO tên với THƯ VIỆN trên.
- Nếu KHỚP 1 entry → "matched": true, "name" = EXACT tên từ thư viện (copy-paste).
- Nếu KHÔNG khớp đủ tin cậy → "matched": false, "name" = tên tự đặt.

`
    : "";

  const descBlock = description
    ? `═══════════════════════════════════════════════════════════════
NGƯỜI DÙNG MÔ TẢ MÓN (ƯU TIÊN để nhận diện đúng)
═══════════════════════════════════════════════════════════════
"${description}"

- Người dùng biết rõ món của họ → ƯU TIÊN dùng mô tả này để NHẬN DIỆN & ĐẶT TÊN món.
- Nếu mô tả nêu rõ tên/thành phần → bám theo, đừng đoán món khác.
- Chỉ bỏ qua mô tả nếu nó RÕ RÀNG không khớp thứ thấy trong ảnh.
- Vẫn ƯỚC LƯỢNG khẩu phần/khối lượng từ ẢNH (mô tả chỉ giúp định danh).

`
    : "";

  return `Bạn là chuyên gia dinh dưỡng, vừa GIỎI nhận diện món ăn bày biện, vừa ĐỌC NHÃN dinh dưỡng sản phẩm đóng gói TỐT.

${descBlock}NHIỆM VỤ: Quan sát ảnh, nhận diện tối đa 5 vật phẩm ăn/uống. Với MỖI vật, phân loại LOẠI A hoặc LOẠI B rồi xử lý tương ứng.

═══════════════════════════════════════════════════════════════
LOẠI A — SẢN PHẨM ĐÓNG GÓI CÓ NHÃN DINH DƯỠNG
═══════════════════════════════════════════════════════════════
(hộp sữa, gói snack/bánh, chai/lon nước, thanh protein, hộp sữa chua... có bảng "Nutrition Facts" / "Giá trị dinh dưỡng" / "Thông tin dinh dưỡng")

→ ƯU TIÊN ĐỌC NHÃN, lấy ĐÚNG số nhà sản xuất công bố (KHÔNG tự ước lượng):
1. "name" = tên sản phẩm kèm thương hiệu (vd: "Sữa tươi tiệt trùng có đường (Vinamilk)", "Snack khoai tây vị tảo biển (Lay's)").
2. Đọc bảng dinh dưỡng → tính giá trị TRÊN 100g (đồ uống thì /100ml):
   - Nhãn có sẵn cột /100g hoặc /100ml → dùng trực tiếp.
   - Nhãn chỉ ghi /khẩu phần (per serving) → quy đổi: per100 = (giá trị mỗi serving) ÷ (số gram/ml mỗi serving) × 100.
   - Năng lượng ghi kJ → kcal = kJ ÷ 4.184.
3. "source": "label". kcal/protein/carb/fat = giá trị TRÊN 100g/100ml.
   "liquid": true nếu là ĐỒ UỐNG (sữa, nước, nước ngọt... → đơn vị ml); false nếu sản phẩm RẮN (snack, bánh... → g).
4. "grams" = khối lượng 1 khẩu phần hoặc cả gói/chai (đọc/ước từ nhãn, vd 240ml, Net 65g); không rõ thì để 100.
5. "confidence" 0.9+ nếu đọc rõ nhãn; 0.6-0.8 nếu nhãn hơi mờ.
6. KHÔNG match thư viện cho LOẠI A — số trên nhãn là chuẩn nhất.

═══════════════════════════════════════════════════════════════
LOẠI B — MÓN ĂN / ĐỒ UỐNG BÀY BIỆN (KHÔNG có nhãn)
═══════════════════════════════════════════════════════════════
(phở, cơm, đĩa thức ăn, trái cây, ly nước tự pha...)

→ ƯỚC LƯỢNG theo KÍCH THƯỚC thấy được. Dùng vật chứa làm thước đo:
  RẮN: đĩa nhỏ VN ~300-400g; đĩa lớn ~400-600g; tô phở ~600-800g; tô bún/canh ~400-500g; bát cơm ~150-250g; khay cơm tấm ~400-500g.
  LỎNG: ly thủy tinh 200-300ml; ly take-away 350-500ml; lon 330ml; chai 500ml; hộp sữa nhỏ 110-180ml; bình 1000-1500ml.
  THAM CHIẾU: trứng gà ~50g; lát sandwich ~25-30g; muỗng canh ~15ml.

- "source": "food". kcal/protein/carb/fat = macro CHO CẢ KHẨU PHẦN thấy được (KHÔNG phải /100g). "grams" = gram ước tính.
- Tô/đĩa hỗn hợp không tách được (cơm tấm sườn bì chả) → coi là 1 món.

${libraryBlock}═══════════════════════════════════════════════════════════════
TRẢ VỀ CHỈ JSON (không markdown, không text thừa)
═══════════════════════════════════════════════════════════════

{
  "found": true,
  "items": [
    {
      "source": "label" | "food",
      "liquid": true | false,
      "matched": true | false,
      "name": "<A: tên sản phẩm + brand | B: tên EXACT thư viện hoặc tự đặt>",
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

Nếu không có gì ăn/uống trong ảnh: { "found": false, "items": [] }

═══════════════════════════════════════════════════════════════
QUY TẮC QUAN TRỌNG
═══════════════════════════════════════════════════════════════
1. TỐI ĐA 5 vật/ảnh. Nhiều hơn thì chọn 5 cái lớn/rõ nhất.
2. LUÔN trả đầy đủ kcal/protein/carb/fat cho TỪNG vật.
3. ⚠ source "label" → macro là TRÊN 100g/100ml. source "food" → macro là CHO CẢ KHẨU PHẦN. ĐỪNG nhầm 2 loại này.
4. "matched": true CHỈ cho source "food", và CHỈ KHI tên trùng/rất gần 1 entry thư viện.
5. "qty" (food matched=true): số đơn vị theo per+unit của entry (entry "Tỏi" per 100g, thấy 50g → qty=50; "Phở bò (1 tô)" thấy 1 tô → qty=1). "(5 chiếc/cái)" trong tên = mô tả khẩu phần chuẩn.
6. "note" KHÔNG nhắc gram/kcal/cách ước lượng. 1 câu (15-30 từ) ấm áp: lời khen HOẶC fact "Bạn có biết?". Tiếng Việt tự nhiên, KHÔNG dùng dấu ngoặc kép.
7. "confidence": 0.85-0.95 rõ+chắc; 0.65-0.84 thấy được; 0.4-0.64 mờ/khó.
8. "meal_suggestion": "Bữa sáng" | "Bữa trưa" | "Bữa tối" | "Ăn vặt".
9. Nếu KHÔNG có thức ăn/đồ uống nào trong ảnh → { "found": false, "items": [] }.`;
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
    const { password, imageBase64, mimeType, library: rawLibrary = [], description: rawDesc = "" } = await req.json();

    // 1. Auth — xác thực Supabase access token (client gửi qua `password`)
    const authUser = await verifySupabaseToken(password);
    if (!authUser) {
      return Response.json({ error: "Phiên đăng nhập không hợp lệ" }, { status: 401 });
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
          .slice(0, 1000)
      : [];

    const libraryListStr = library
      .map((f) => `- "${f.name}" (per: ${f.per} ${f.unit})`)
      .join("\n");

    const description = typeof rawDesc === "string" ? rawDesc.trim().slice(0, 300) : "";
    const prompt = buildPrompt(libraryListStr, description);

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
            maxOutputTokens: 4096,
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
        if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota")) {
          console.warn(`[vision-analyze] Model ${modelName} hết quota, thử model kế...`);
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
      } else if (errMsg.includes("429") || errMsg.includes("Too Many Requests") || errMsg.includes("quota")) {
        userMessage = "Tất cả model Gemini đều đã hết quota hôm nay (free tier: 20 lượt/ngày/model). Hãy đợi đến mai hoặc tạo API key MỚI từ Google AI Studio (project mới có quota riêng): https://aistudio.google.com/apikey";
        statusCode = 429;
      } else if (errMsg.includes("404") || errMsg.includes("not found")) {
        userMessage = "Không tìm thấy model AI khả dụng cho account của bạn. Tạo API key mới tại https://aistudio.google.com/apikey.";
      } else {
        userMessage = `Không gọi được Gemini API: ${errMsg.slice(0, 200)}`;
      }

      console.error("[vision-analyze] Toàn bộ models fail:", errMsg);
      return Response.json({ error: userMessage }, { status: statusCode });
    }

    console.log(`[vision-analyze] Đã dùng model: ${usedModel}`);

    const rawText = result.response.text();
    const finishReason = result.response?.candidates?.[0]?.finishReason;

    // Strip markdown code fences (defensive — responseMimeType=application/json should prevent this, but vài model vẫn wrap).
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
    }
    // Extract JSON object if có text thừa ngoài JSON.
    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      cleanText = cleanText.slice(jsonStart, jsonEnd + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error(
        "[vision-analyze] Parse error. finishReason:", finishReason,
        " | Raw text (500 chars):", rawText.slice(0, 500)
      );
      const hint = finishReason === "MAX_TOKENS"
        ? "AI trả response quá dài, hệ thống không parse được. Thử chụp ít món hơn hoặc thử lại."
        : "AI trả về không đúng định dạng. Vui lòng thử lại.";
      return Response.json({ error: hint }, { status: 502 });
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

      // LOẠI A — đọc nhãn sản phẩm đóng gói: macro là /100g/100ml (số nhà sản xuất công bố).
      if (item.source === "label") {
        const servingG = Math.max(1, safeNum(item.grams, 100));
        return {
          source: "label",
          matched: false,
          name: name || "Sản phẩm đóng gói",
          aiPredictedName: name,
          libraryName: null,
          fuzzyMatched: false,
          unit: item.liquid === true ? "ml" : "g",
          per: 100,
          grams: servingG,
          kcal: safeNum(item.kcal),
          protein: safeNum(item.protein),
          carb: safeNum(item.carb),
          fat: safeNum(item.fat),
          confidence,
          meal_suggestion: mealSuggestion,
          note,
        };
      }

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
