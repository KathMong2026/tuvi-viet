-- ============================================================
-- Tử Vi Việt — Schema Postgres cho Supabase
-- ============================================================
-- LƯU Ý: Project này DÙNG CHUNG với hệ thống shop.
-- Mọi bảng đều có tiền tố tuvi_ để KHÔNG đụng dữ liệu shop.
-- Script chỉ TẠO MỚI (create ... if not exists) — không xóa/sửa bảng nào khác.
-- KHÔNG tạo trigger trên auth.users (tránh ảnh hưởng luồng đăng ký của shop);
-- hồ sơ tuvi_profiles được tạo "lazy" từ client khi đăng nhập lần đầu.
-- ============================================================

create extension if not exists vector;

-- 1. tuvi_profiles — hồ sơ Tử Vi của user (nối auth.users dùng chung)
create table if not exists public.tuvi_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  gender       text check (gender in ('nam','nu')),
  birth_date   date,
  birth_hour   text,
  birth_place  text,
  solar        boolean default true,
  display_name text, -- added 2026-07: align with client code
  email        text, -- added 2026-07: align with client code
  birth_year   int,  -- added 2026-07: align with client code
  birth_month  int,  -- added 2026-07: align with client code
  birth_day    int,  -- added 2026-07: align with client code
  longitude    numeric, -- added 2026-07: align with client code
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 2. tuvi_horoscopes — lá số
create table if not exists public.tuvi_horoscopes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  label        text,
  birth_info   jsonb,
  life_palace  jsonb,
  palaces      jsonb,
  great_years  jsonb,
  annual_years jsonb,
  data         jsonb, -- added 2026-07: align with client code
  notes        text,  -- added 2026-07: align with client code
  created_at   timestamptz default now()
);
create index if not exists idx_tuvi_horo_user  on public.tuvi_horoscopes(user_id);
create index if not exists idx_tuvi_horo_birth on public.tuvi_horoscopes using gin (birth_info);

-- 3. tuvi_stars — master data sao (public read)
create table if not exists public.tuvi_stars (
  id            uuid primary key default gen_random_uuid(),
  name          text unique not null,
  chinese_name  text,
  type          text,
  element       text,
  star_gender   text,
  brightness    jsonb,
  meaning       jsonb,
  combinations  jsonb,
  created_at    timestamptz default now()
);
create index if not exists idx_tuvi_stars_type on public.tuvi_stars(type);

-- 4. tuvi_predictions — phú đoán gán nhãn (public read)
create table if not exists public.tuvi_predictions (
  id             uuid primary key default gen_random_uuid(),
  type           text,
  palace         text,
  stars_involved text[],
  content        text,
  source         text,
  confidence     text check (confidence in ('cao','trung','tham_khao')),
  tags           text[],
  created_at     timestamptz default now()
);
create index if not exists idx_tuvi_pred_palace on public.tuvi_predictions(palace, type);
create index if not exists idx_tuvi_pred_stars  on public.tuvi_predictions using gin (stars_involved);
create index if not exists idx_tuvi_pred_tags   on public.tuvi_predictions using gin (tags);

-- 5. tuvi_buildings — phong thủy nhà
create table if not exists public.tuvi_buildings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  name         text,
  address      text,
  direction    numeric,
  built_year   int,
  current_van  int,
  bat_trach    jsonb,
  huyen_khong  jsonb,
  created_at   timestamptz default now()
);
create index if not exists idx_tuvi_build_user on public.tuvi_buildings(user_id);

-- 6. tuvi_palm_readings — xem chỉ tay (ảnh ở Storage)
create table if not exists public.tuvi_palm_readings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  photos         text[],
  hand_type      text,
  main_lines     jsonb,
  mounts         jsonb,
  special_marks  jsonb,
  interpretation text,
  created_at     timestamptz default now()
);
create index if not exists idx_tuvi_palm_user on public.tuvi_palm_readings(user_id);

-- 7. tuvi_knowledge_chunks — RAG (giai đoạn 4). 1536 = OpenAI text-embedding-3-small.
create table if not exists public.tuvi_knowledge_chunks (
  id         uuid primary key default gen_random_uuid(),
  source     text,
  title      text,
  content    text,
  metadata   jsonb,
  embedding  vector(1536),
  created_at timestamptz default now()
);
create index if not exists idx_tuvi_knowledge_embedding
  on public.tuvi_knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.tuvi_profiles        enable row level security;
alter table public.tuvi_horoscopes      enable row level security;
alter table public.tuvi_buildings       enable row level security;
alter table public.tuvi_palm_readings   enable row level security;
alter table public.tuvi_stars           enable row level security;
alter table public.tuvi_predictions     enable row level security;
alter table public.tuvi_knowledge_chunks enable row level security;

-- Dữ liệu riêng tư — chỉ chủ sở hữu
drop policy if exists "tuvi own profile"    on public.tuvi_profiles;
create policy "tuvi own profile"    on public.tuvi_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "tuvi own horoscopes" on public.tuvi_horoscopes;
create policy "tuvi own horoscopes" on public.tuvi_horoscopes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tuvi own buildings"  on public.tuvi_buildings;
create policy "tuvi own buildings"  on public.tuvi_buildings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tuvi own palms"      on public.tuvi_palm_readings;
create policy "tuvi own palms"      on public.tuvi_palm_readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tri thức — ai cũng đọc, chỉ sửa qua service_role
drop policy if exists "tuvi read stars"      on public.tuvi_stars;
create policy "tuvi read stars"      on public.tuvi_stars          for select using (true);
drop policy if exists "tuvi read predictions" on public.tuvi_predictions;
create policy "tuvi read predictions" on public.tuvi_predictions   for select using (true);
drop policy if exists "tuvi read knowledge"   on public.tuvi_knowledge_chunks;
create policy "tuvi read knowledge"   on public.tuvi_knowledge_chunks for select using (true);

-- ============================================================
-- HÀM RAG — gọi từ /api/luan-giai
-- ============================================================
create or replace function public.match_tuvi_knowledge(
  query_embedding vector(1536),
  match_count int default 5
) returns table (id uuid, content text, source text, similarity float)
language sql stable as $$
  select id, content, source,
         1 - (embedding <=> query_embedding) as similarity
  from public.tuvi_knowledge_chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;
