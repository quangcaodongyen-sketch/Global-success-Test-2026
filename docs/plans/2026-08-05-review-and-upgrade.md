# Review and Upgrade Implementation Plan

> **REQUIRED:** Follow TDD for every task. No production code without failing test first.

**Goal:** Rà soát app, sửa lỗi API trên Vercel (Unexpected token T), bắt buộc người dùng nhập API Key khi mở đầu app (kèm link HD lấy key), lưu vào localStorage, chọn Model, cấu hình Fallback & Retry động, và chuẩn hóa xuất file Word theo đúng biểu mẫu Bộ GD&ĐT & Nghị định 30.
**Stack:** React + TypeScript + Express + Tailwind CSS v4 + @google/genai

## Tasks

- [ ] Task 1: Tạo file `vercel.json` để định tuyến không rewrite `/api/generate-exam` thành `index.html`.
- [ ] Task 2: Tạo Vercel Serverless Function trong `api/generate-exam.ts` kế thừa logic từ `server.ts`.
- [ ] Task 3: Thiết kế và tạo Modal bắt buộc nhập API Key & chọn Model AI (dạng Cards) ở Frontend khi mở đầu app.
- [ ] Task 4: Cập nhật Header để hiển thị nút Settings cùng dòng chữ cảnh báo màu đỏ *"Lấy API key để sử dụng app"*.
- [ ] Task 5: Đồng bộ trạng thái lưu key trong LocalStorage và truyền key thông qua headers của request lên Backend.
- [ ] Task 6: Cập nhật Backend nhận key từ request, khởi tạo instance Gemini động, và cấu hình tự động Fallback & Retry.
- [ ] Task 7: Rà soát và cập nhật logic xuất Word (`docxExporter.ts`) để khớp chính xác biểu mẫu giữa kỳ và cuối kỳ trong thư mục `Tai lieu`.
