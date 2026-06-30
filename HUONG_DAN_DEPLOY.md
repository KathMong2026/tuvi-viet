# Hướng Dẫn Deploy — Tử Vi Việt (bản mới, tách hẳn bản cũ)

Thư mục `tuvi-viet/` này là dự án **mới hoàn toàn, sạch** — chỉ chứa file production,
không dính file cũ/hỏng/Firebase, không dùng chung lịch sử git với repo cũ.
Dùng lại các bảng `tuvi_` trên Supabase (không cần tạo DB mới).

## Bước 0 — Dọn .git tạm (làm trên máy bạn)
Mình có lỡ tạo một thư mục `.git` rỗng/hỏng trong này nhưng môi trường không xóa được.
Trên máy bạn, xóa nó đi rồi tạo git mới:
```bash
cd tuvi-viet
rmdir /s /q .git        # Windows (CMD).  PowerShell: Remove-Item -Recurse -Force .git
git init
git add -A
git commit -m "Tử Vi Việt - khởi tạo"
```

## Bước 1 — Tạo repo GitHub MỚI
1. Vào https://github.com/new → đặt tên mới, ví dụ `tuvi-viet` (KHÁC repo cũ `tuvi`).
2. Để trống (không thêm README), bấm Create.
3. Nối và push:
```bash
git remote add origin https://github.com/KathMong2026/tuvi-viet.git
git branch -M main
git push -u origin main
```

## Bước 2 — Deploy Vercel (subdomain miễn phí)
1. https://vercel.com → **Add New → Project → Import** repo `tuvi-viet`.
2. **Project Name**: tên bạn gõ ở đây chính là subdomain → `ten-ban-chon.vercel.app`.
3. Framework Preset: **Other**. Build Command: *để trống*. Output: *để trống* (web tĩnh).
   - Nếu bạn lỡ push cả thư mục cha, đặt **Root Directory** = `tuvi-viet`.
4. **Deploy** → nhận link `https://ten-ban-chon.vercel.app`.

## Bước 3 — Cấu hình Supabase Auth cho tên miền mới
Supabase Dashboard (project `qtgynwhjfcppuvwykiji`) → **Authentication → URL Configuration**:
- **Site URL**: `https://ten-ban-chon.vercel.app`
- **Redirect URLs**: thêm
  `https://ten-ban-chon.vercel.app/profile.html`,
  `https://ten-ban-chon.vercel.app/login.html`
- Bật provider **Email** (và **Google** nếu muốn — dán OAuth client + redirect
  `https://qtgynwhjfcppuvwykiji.supabase.co/auth/v1/callback`).

Xong là web mới chạy độc lập, không ảnh hưởng gì bản cũ.

## Ghi chú
- Database dùng chung các bảng `tuvi_` đã tạo — không cần chạy lại schema.
  (Nếu sau muốn tách DB riêng hẳn thì tạo Supabase project mới + đổi URL/key trong `js/supabase.js`.)
- `anon key` trong `js/supabase.js` là công khai, an toàn nhờ RLS.
