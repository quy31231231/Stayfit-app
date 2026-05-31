-- ============================================================================
-- StayFit — Supabase schema (native, RLS)
-- Chạy 1 lần trong Supabase → SQL Editor.
-- An toàn chạy lại (idempotent: dùng IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================================

-- ---------- profiles (1 dòng / 1 tài khoản auth) ----------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  nickname            text,
  gender              text,
  age                 int,
  height              numeric,
  weight              numeric,
  activity            numeric,
  goal                int,
  manual_target_kcal  int,
  start_weight        numeric,
  target_weight       numeric,
  deleted_common_foods text[] not null default '{}',
  updated_at          timestamptz not null default now()
);
-- Migration cho DB đã tạo trước (thêm cột nếu chưa có):
alter table public.profiles add column if not exists nickname text;

-- ---------- custom_foods (thư viện món tự thêm) ----------
create table if not exists public.custom_foods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  unit       text not null default 'g',
  per        numeric not null default 100,
  kcal       numeric default 0,
  protein    numeric default 0,
  carb       numeric default 0,
  fat        numeric default 0,
  barcode    text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create index if not exists custom_foods_user_idx on public.custom_foods (user_id);

-- ---------- food_logs (History) ----------
create table if not exists public.food_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  meal       text,
  name       text,
  quantity   numeric,
  unit       text,
  kcal       numeric,
  protein    numeric,
  carb       numeric,
  fat        numeric,
  created_at timestamptz not null default now()
);
create index if not exists food_logs_user_date_idx on public.food_logs (user_id, date);

-- ---------- weight_logs ----------
create table if not exists public.weight_logs (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date    date not null,
  weight  numeric not null,
  unique (user_id, date)
);
create index if not exists weight_logs_user_idx on public.weight_logs (user_id);

-- ---------- scan_feedback (log sửa AI) ----------
create table if not exists public.scan_feedback (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  ai_predicted_name    text,
  library_matched_name text,
  user_corrected_name  text,
  confidence           numeric,
  fuzzy_matched        boolean,
  kcal                 numeric,
  protein              numeric,
  carb                 numeric,
  fat                  numeric,
  created_at           timestamptz not null default now()
);
create index if not exists scan_feedback_user_idx on public.scan_feedback (user_id);

-- ============================================================================
-- RLS — mỗi người chỉ thấy/đụng được dữ liệu của chính mình
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.custom_foods  enable row level security;
alter table public.food_logs     enable row level security;
alter table public.weight_logs   enable row level security;
alter table public.scan_feedback enable row level security;

-- profiles: khóa theo id = auth.uid()
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- các bảng còn lại: khóa theo user_id = auth.uid()
drop policy if exists "own custom_foods" on public.custom_foods;
create policy "own custom_foods" on public.custom_foods
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own food_logs" on public.food_logs;
create policy "own food_logs" on public.food_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own weight_logs" on public.weight_logs;
create policy "own weight_logs" on public.weight_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own scan_feedback" on public.scan_feedback;
create policy "own scan_feedback" on public.scan_feedback
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- Tự tạo profile khi có tài khoản mới (Google / SĐT)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
