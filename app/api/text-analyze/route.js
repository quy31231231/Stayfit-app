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

function buildTextPrompt(libraryListStr, userText) {
  const libraryBlock = libraryListStr
    ? `═══════════════════════════════════════════════════════════════
THƯ VIỆN MÓN CỦA USER (ưu tiên match nếu có)
═══════════════════════════════════════════════════════════════

${libraryListStr}

QUY TRÌNH MATCH (cho TỪNG món):
- Nếu món user nhắc tới KHỚP với 1 entry → "matched": true, "name" = EXACT tên từ thư viện.
- Nếu KHÔNG khớp → "matched": false, "name" = tên tự đặt.

`
    : "";

  return `Bạn là chuyên gia dinh dưỡng. User mô tả bữa ăn bằng tiếng Việt. Nhiệm vụ: parse text ra danh sách món + khẩu phần + macros.

MÔ TẢ CỦA USER:
"""
${userText}
"""

${libraryBlock}QUY TRÌNH:
1. Đọc kỹ text, xác định TẤT CẢ món ăn/đồ uống user nhắc (tối đa 5 món).
2. Ước lượng khẩu phần (grams) cho từng món:
   - Nếu user nói rõ số liệu ("150g bò", "200ml sữa", "2 quả trứng") → dùng chính xác (2 quả trứng ~ 100g)
   - Nếu user nói chung ("1 bát salad", "ít rau") → ước lượng grams hợp lý (1 bát salad ~ 150g, "ít" ~ 50g)
   - Vật chứa tham khảo: bát cơm ~150-250g, tô phở ~600g, đĩa ~300-500g, ly nước ~200ml, hộp sữa ~180-1000ml
3. So tên với THƯ VIỆN (nếu có). Match exact nếu trùng/rất gần.
4. LUÔN trả đầy đủ kcal/protein/carb/fat per khẩu phần PARSE ĐƯỢC (KHÔNG phải per 100g).
5. Nếu user mention meal type ("bữa sáng tôi ăn..."), set meal_suggestion theo đó cho TẤT CẢ items.
6. confidence cao (0.85+) nếu user nói rõ tên + khẩu phần; thấp (0.5-0.7) nếu mơ hồ.

TRẢ VỀ CHỈ JSON (không markdown):

{
  "found": true,
  "items": [
    {
      "matched": true|false,
      "name": "<tên>",
      "qty": <grams>,
      "grams": <grams>,
      "kcal": <số>,
      "protein": <số>,
      "carb": <số>,
      "fat": <số>,
      "confidence": 0.0-1.0,
      "meal_suggestion": "Bữa sáng|Bữa trưa|Bữa tối|Ăn vặt",
      "note": "<lời khen hoặc Bạn-có-biết, 15-30 từ>"
    }
  ]
}

Nếu text không có món ăn nào → { "found": false, "items": [] }

QUY TẮC:
- "note" KHÔNG nhắc gram/kcal. Là lời khen ấm áp HOẶC fact "Bạn có biết?" về món. KHÔNG dùng dấu ngoặc kép.
- KHÔNG bịa tên không có trong thư viện cho "matched": true.
- "confidence":
  - 0.85-0.95: user nói rõ tên + khối lượng cụ thể
  - 0.65-0.84: user nói tên rõ nhưng khẩu phần mơ hồ
  - 0.4-0.64: text mơ hồ, ước lượng nhiều`;
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
    const { userId, password, text, library: rawLibrary = [] } = await req.json();

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

    // 2. Validate text
    if (!text || typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "Mô tả không được trống" }, { status: 400 });
    }
    const cleanText = text.trim().slice(0, 1000);

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

    const prompt = buildTextPrompt(libraryListStr, cleanText);

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
        result = await model.generateContent(prompt);
        usedModel = modelName;
        break;
      } catch (err) {
        lastError = err;
        const msg = String(err.message || "");
        if (msg.includes("prepayment credits are depleted")) {
          console.error(`[text-analyze] Project hết credit, dừng thử`);
          break;
        }
        if (msg.includes("404") || msg.includes("not found") || msg.includes("limit: 0")) {
          console.warn(`[text-analyze] Model ${modelName} không khả dụng, thử model kế...`);
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
        userMessage = "Tài khoản Google của bạn đã hết credit. Tạo API key mới tại https://aistudio.google.com/apikey.";
        statusCode = 402;
      } else if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("403")) {
        userMessage = "API key không hợp lệ.";
        statusCode = 401;
      } else if (errMsg.includes("404") || errMsg.includes("not found")) {
        userMessage = "Không tìm thấy model AI khả dụng.";
      } else {
        userMessage = `Không gọi được Gemini API: ${errMsg.slice(0, 200)}`;
      }
      console.error("[text-analyze] Toàn bộ models fail:", errMsg);
      return Response.json({ error: userMessage }, { status: statusCode });
    }

    console.log(`[text-analyze] Đã dùng model: ${usedModel}`);

    const rawText = result.response.text();
    const finishReason = result.response?.candidates?.[0]?.finishReason;

    let cleanResp = rawText.trim();
    if (cleanResp.startsWith("```")) {
      cleanResp = cleanResp.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
    }
    const jsonStart = cleanResp.indexOf("{");
    const jsonEnd = cleanResp.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      cleanResp = cleanResp.slice(jsonStart, jsonEnd + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanResp);
    } catch (e) {
      console.error("[text-analyze] Parse error. finishReason:", finishReason, " | Raw:", rawText.slice(0, 500));
      const hint = finishReason === "MAX_TOKENS"
        ? "AI trả response quá dài. Thử mô tả ngắn gọn hơn."
        : "AI trả về không đúng định dạng. Vui lòng thử lại.";
      return Response.json({ error: hint }, { status: 502 });
    }

    if (!parsed.found) {
      return Response.json({ error: "Không tìm thấy món ăn nào trong mô tả của bạn." }, { status: 422 });
    }

    const safeNum = (v, fallback = 0) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : fallback;
    };
    const MEAL_TYPES = ["Bữa sáng", "Bữa trưa", "Bữa tối", "Ăn vặt"];
    const FUZZY_THRESHOLD_EXPLICIT = 0.7;
    const FUZZY_THRESHOLD_IMPLICIT = 0.85;
    const MIN_CONFIDENCE = 0.5;

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    if (rawItems.length === 0) {
      return Response.json({ error: "Không tìm thấy món ăn nào trong mô tả." }, { status: 422 });
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
          const m = fuzzyMatch(name, library, FUZZY_THRESHOLD_IMPLICIT);
          if (m) {
            libEntry = m.entry;
            fuzzyUsed = true;
          }
        }
      }

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
    console.error("[text-analyze]", err);
    return Response.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
