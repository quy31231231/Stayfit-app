'use client';

// Tầng truy cập dữ liệu Supabase (native, RLS tự lọc theo session đăng nhập).
// QUAN TRỌNG: KHÔNG gọi sb.auth.getUser()/getSession() ở đây — sẽ deadlock nếu chạy trong
// onAuthStateChange. uid được truyền vào từ session. Query REST vẫn tự gắn access token (RLS OK).

import { getSupabaseBrowser } from './client';

const num = (v) => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const int = (v) => {
  const n = num(v);
  return n == null ? null : Math.trunc(n);
};

// ── LOAD: kéo toàn bộ dữ liệu của uid, dựng lại đúng shape state của app ──
export async function loadUserData(uid) {
  const sb = getSupabaseBrowser();
  if (!sb || !uid) return null;

  const [prof, foods, weights, customs] = await Promise.all([
    sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
    sb.from('food_logs').select('*').eq('user_id', uid),
    sb.from('weight_logs').select('*').eq('user_id', uid),
    sb.from('custom_foods').select('*').eq('user_id', uid),
  ]);

  const history = {};
  for (const r of foods.data || []) {
    (history[r.date] ??= []).push({
      id: r.id,
      name: r.name, quantity: num(r.quantity) ?? 0, unit: r.unit || 'g',
      kcal: num(r.kcal) ?? 0, protein: num(r.protein) ?? 0, carb: num(r.carb) ?? 0, fat: num(r.fat) ?? 0,
      meal: r.meal || 'Bữa sáng',
      ...(r.image_key ? { imageKey: r.image_key } : {}),
    });
  }

  const weightLog = {};
  for (const r of weights.data || []) weightLog[r.date] = num(r.weight);

  const customFoods = (customs.data || []).map((r) => ({
    name: r.name, unit: r.unit || 'g', per: num(r.per) ?? 100,
    kcal: num(r.kcal) ?? 0, protein: num(r.protein) ?? 0, carb: num(r.carb) ?? 0, fat: num(r.fat) ?? 0,
    ...(r.barcode ? { barcode: r.barcode } : {}),
  }));

  const p = prof.data || {};
  const profile = {
    nickname: p.nickname || '',
    avatarKey: p.avatar_key || null,
    gender: p.gender || 'male',
    age: int(p.age) ?? 25,
    height: num(p.height) ?? 165,
    weight: num(p.weight) ?? 60,
    activity: num(p.activity) ?? 1.375,
    goal: int(p.goal) ?? 0,
    manualTargetKcal: p.manual_target_kcal != null ? int(p.manual_target_kcal) : 2000,
    isManualTarget: p.manual_target_kcal != null,
  };
  if (p.start_weight != null) profile.startWeight = num(p.start_weight);
  if (p.target_weight != null) profile.targetWeight = num(p.target_weight);

  const deletedCommonFoods = Array.isArray(p.deleted_common_foods) ? p.deleted_common_foods : [];

  return { history, weightLog, customFoods, deletedCommonFoods, profile };
}

// ── SAVE: đẩy snapshot lên Supabase (upsert + reconcile — an toàn, không xóa-trắng) ──
export async function saveSnapshot(uid, { profile, history, weightLog, customFoods, deletedCommonFoods }) {
  const sb = getSupabaseBrowser();
  if (!sb || !uid) return;

  await sb.from('profiles').upsert({
    id: uid,
    nickname: profile.nickname ? String(profile.nickname).trim().slice(0, 40) : null,
    avatar_key: profile.avatarKey || null,
    gender: profile.gender || 'male',
    age: int(profile.age),
    height: num(profile.height),
    weight: num(profile.weight),
    activity: num(profile.activity),
    goal: int(profile.goal),
    manual_target_kcal: profile.isManualTarget ? int(profile.manualTargetKcal) : null,
    start_weight: num(profile.startWeight),
    target_weight: num(profile.targetWeight),
    deleted_common_foods: (deletedCommonFoods || []).map(String),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  // food_logs — upsert theo id (uuid), xóa id không còn trong state
  const foodRows = [];
  const foodIds = [];
  for (const [date, items] of Object.entries(history || {})) {
    for (const it of items || []) {
      if (!it || !it.id) continue;
      foodRows.push({
        id: it.id, user_id: uid, date,
        meal: it.meal || null, name: it.name || null,
        quantity: num(it.quantity), unit: it.unit || 'g',
        kcal: num(it.kcal), protein: num(it.protein), carb: num(it.carb), fat: num(it.fat),
        image_key: it.imageKey || null,
      });
      foodIds.push(it.id);
    }
  }
  if (foodRows.length) await sb.from('food_logs').upsert(foodRows, { onConflict: 'id' });
  await reconcileDelete(sb, 'food_logs', uid, 'id', foodIds);

  // weight_logs
  const wRows = [];
  const wDates = [];
  for (const [date, w] of Object.entries(weightLog || {})) {
    if (w == null || w === '') continue;
    wRows.push({ user_id: uid, date, weight: num(w) });
    wDates.push(date);
  }
  if (wRows.length) await sb.from('weight_logs').upsert(wRows, { onConflict: 'user_id,date' });
  await reconcileDelete(sb, 'weight_logs', uid, 'date', wDates, true);

  // custom_foods
  const cRows = [];
  const cNames = [];
  for (const f of customFoods || []) {
    if (!f || !f.name) continue;
    cRows.push({
      user_id: uid, name: f.name, unit: f.unit || 'g', per: num(f.per) ?? 100,
      kcal: num(f.kcal) ?? 0, protein: num(f.protein) ?? 0, carb: num(f.carb) ?? 0, fat: num(f.fat) ?? 0,
      barcode: f.barcode || null,
    });
    cNames.push(f.name);
  }
  if (cRows.length) await sb.from('custom_foods').upsert(cRows, { onConflict: 'user_id,name' });
  await reconcileDelete(sb, 'custom_foods', uid, 'name', cNames, true);
}

async function reconcileDelete(sb, table, uid, keyCol, keepVals, quoteVals = false) {
  let q = sb.from(table).delete().eq('user_id', uid);
  if (keepVals.length > 0) {
    const list = keepVals.map((v) => (quoteVals ? `"${String(v).replace(/"/g, '')}"` : v)).join(',');
    q = q.not(keyCol, 'in', `(${list})`);
  }
  await q;
}

export async function upsertWeight(uid, date, weight) {
  const sb = getSupabaseBrowser();
  if (!sb || !uid || weight == null || weight === '') return;
  await sb.from('weight_logs').upsert({ user_id: uid, date, weight: num(weight) }, { onConflict: 'user_id,date' });
}

export async function deleteWeight(uid, date) {
  const sb = getSupabaseBrowser();
  if (!sb || !uid) return;
  await sb.from('weight_logs').delete().eq('user_id', uid).eq('date', date);
}

export async function addScanFeedback(uid, fb) {
  const sb = getSupabaseBrowser();
  if (!sb || !uid) return;
  await sb.from('scan_feedback').insert({
    user_id: uid,
    ai_predicted_name: fb.aiPredictedName || null,
    library_matched_name: fb.libraryMatchedName || fb.libraryName || null,
    user_corrected_name: fb.userCorrectedName || null,
    confidence: num(fb.confidence),
    fuzzy_matched: !!fb.fuzzyMatched,
    kcal: num(fb.kcal), protein: num(fb.protein), carb: num(fb.carb), fat: num(fb.fat),
  });
}
