# Tử Vi Việt

Web bói toán trực tuyến: **Bát Tự · Tử Vi · Dịch Kinh · Hoàng Lịch · Hợp Hôn**.

Bản dựng mới, sạch — nền **Supabase + Vercel**.

## Các trang
- `index.html` — Gieo quẻ Dịch
- `bat-tu.html` — Lập mệnh bàn Bát Tự & Tử Vi
- `hop-hon.html` — Hợp hôn
- `hoang-lich.html` — Hoàng lịch hôm nay
- `64-que.html` — 64 quẻ Dịch
- `giai-nghia.html` — Giải nghĩa cơ bản
- `them.html` — Tổng hợp công cụ
- `login.html` / `profile.html` — Đăng nhập & hồ sơ (Supabase Auth)

## Công nghệ
- Frontend: HTML/CSS/JS thuần (không build). Engine an sao chạy client-side
  (`js/engine.js` Bát Tự, `js/ziwei-engine.js` Tử Vi).
- Backend: **Supabase** (Auth + Postgres + RLS + pgvector) — module `js/supabase.js`.
- Hosting: **Vercel** (web tĩnh).

## Triển khai
Xem `supabase/schema.sql` cho cấu trúc DB. Deploy: import repo vào Vercel
(preset Other, không build). Nhớ cấu hình Redirect URL trong Supabase Auth cho tên miền.
