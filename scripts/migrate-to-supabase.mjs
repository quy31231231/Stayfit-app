// ============================================================================
// Di trú dữ liệu Google Sheets → Supabase (chạy 1 lần).
//
// Đọc data của 1 userId cũ trong Sheets → ghi vào Supabase dưới 1 tài khoản auth.
// Dùng SERVICE ROLE KEY (bypass RLS) — BÍ MẬT, chỉ chạy local, KHÔNG commit/đẩy lên client.
//
// Cách chạy:
//   node scripts/migrate-to-supabase.mjs <OLD_USER_ID> <SUPABASE_USER_ID>
//
// Cần trong .env.local (script tự đọc file này):
//   GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID   (đã có sẵn)
//   NEXT_PUBLIC_SUPABASE_URL                                   (đã có sẵn)
//   SUPABASE_SERVICE_ROLE_KEY                                  (THÊM — Supabase → Settings → API)
//
// Idempotent: xóa sạch data của SUPABASE_USER_ID rồi chèn lại. KHÔNG đụng vào Google Sheets.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// ---- nạp .env.local thủ công (script chạy ngoài Next) ----
function loadEnv() {
  const p = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
loadEnv();

const safeFloat = (v) => {
  if (typeof v === 'number') return v;
  if (v == null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const safeInt = (v) => {
  const n = safeFloat(v);
  return n == null ? null : Math.trunc(n);
};
// Sheets có thể trả date dạng số serial hoặc "YYYY-MM-DD" — chuẩn hóa về YYYY-MM-DD.
const toDate = (v) => {
  if (v == null || v === '') return null;
  if (typeof v === 'number') {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
};

const [, , OLD_USER_ID, SUPABASE_USER_ID] = process.argv;
if (!OLD_USER_ID || !SUPABASE_USER_ID) {
  console.error('Usage: node scripts/migrate-to-supabase.mjs <OLD_USER_ID> <SUPABASE_USER_ID>');
  process.exit(1);
}

const SHEET_ID = process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.error('Thiếu env Google Sheets (SPREADSHEET_ID / GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY).');
  process.exit(1);
}
if (!SUPA_URL || !SERVICE_KEY) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local.');
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function readTab(sheets, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range,
    valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'FORMATTED_STRING',
  });
  return res.data.values || [];
}

async function main() {
  const sheets = await getSheets();
  const uid = SUPABASE_USER_ID;

  // ---- PROFILE (A:N) ----
  const profileRows = await readTab(sheets, 'Profile!A:N');
  const pr = profileRows.find((r) => r[0] === OLD_USER_ID);
  if (!pr) {
    const ids = profileRows.map((r) => r && r[0]).filter(Boolean);
    console.error(`Không tìm thấy userId "${OLD_USER_ID}" trong tab Profile.`);
    console.error(`userId có trong Sheet: ${ids.join(', ') || '(trống)'}`);
    process.exit(1);
  }
  let customFoods = [];
  let deletedCommon = [];
  try { if (pr[10]) customFoods = JSON.parse(pr[10]); } catch {}
  try { if (pr[11]) deletedCommon = JSON.parse(pr[11]); } catch {}

  const profile = {
    id: uid,
    gender: pr[1] || 'male',
    age: safeInt(pr[2]) ?? 25,
    height: safeFloat(pr[3]) ?? 165,
    weight: safeFloat(pr[4]) ?? 60,
    activity: safeFloat(pr[5]) ?? 1.375,
    goal: safeInt(pr[6]) ?? 0,
    manual_target_kcal: safeInt(pr[7]),
    start_weight: safeFloat(pr[12]),
    target_weight: safeFloat(pr[13]),
    deleted_common_foods: Array.isArray(deletedCommon) ? deletedCommon.map(String) : [],
    updated_at: new Date().toISOString(),
  };

  // ---- HISTORY (A:K) ----
  const historyRows = (await readTab(sheets, 'History!A:K')).slice(1);
  const foodLogs = [];
  for (const r of historyRows) {
    if (!r || r[0] !== OLD_USER_ID) continue;
    const date = toDate(r[1]);
    if (!date) continue;
    foodLogs.push({
      user_id: uid, date,
      meal: r[2] || null, name: r[3] || null,
      quantity: safeFloat(r[4]), unit: r[5] || 'g',
      kcal: safeFloat(r[6]), protein: safeFloat(r[7]), carb: safeFloat(r[8]), fat: safeFloat(r[9]),
    });
  }

  // ---- WEIGHT (A:C) ----
  const weightRows = (await readTab(sheets, 'Weight!A:C')).slice(1);
  const weightMap = new Map(); // date -> weight (giữ bản cuối)
  for (const r of weightRows) {
    if (!r || r[0] !== OLD_USER_ID) continue;
    const date = toDate(r[1]);
    const w = safeFloat(r[2]);
    if (date && w != null) weightMap.set(date, w);
  }
  const weightLogs = [...weightMap.entries()].map(([date, weight]) => ({ user_id: uid, date, weight }));

  // ---- CUSTOM FOODS ----
  const customRows = (Array.isArray(customFoods) ? customFoods : []).map((f) => ({
    user_id: uid,
    name: String(f.name || '').slice(0, 200),
    unit: f.unit || 'g',
    per: safeFloat(f.per) ?? 100,
    kcal: safeFloat(f.kcal) ?? 0,
    protein: safeFloat(f.protein) ?? 0,
    carb: safeFloat(f.carb) ?? 0,
    fat: safeFloat(f.fat) ?? 0,
    barcode: f.barcode || null,
  })).filter((f) => f.name);

  // ---- GHI VÀO SUPABASE (idempotent: xóa data của uid rồi chèn lại) ----
  console.log(`Di trú "${OLD_USER_ID}" → ${uid}`);
  console.log(`  food_logs=${foodLogs.length}  weight_logs=${weightLogs.length}  custom_foods=${customRows.length}`);

  await supabase.from('food_logs').delete().eq('user_id', uid);
  await supabase.from('weight_logs').delete().eq('user_id', uid);
  await supabase.from('custom_foods').delete().eq('user_id', uid);

  const up = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
  if (up.error) throw up.error;

  for (const chunk of chunked(foodLogs, 500)) {
    const r = await supabase.from('food_logs').insert(chunk);
    if (r.error) throw r.error;
  }
  if (weightLogs.length) {
    const r = await supabase.from('weight_logs').insert(weightLogs);
    if (r.error) throw r.error;
  }
  if (customRows.length) {
    const r = await supabase.from('custom_foods').insert(customRows);
    if (r.error) throw r.error;
  }

  console.log('✓ Xong. Google Sheets không bị thay đổi.');
}

function* chunked(arr, n) {
  for (let i = 0; i < arr.length; i += n) yield arr.slice(i, i + n);
}

main().catch((e) => { console.error('Lỗi di trú:', e.message || e); process.exit(1); });
