---
name: finishing-a-development-branch
description: Use when implementation in this repo is done and you need the final verification, review, and handoff steps before closing the work.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Finishing a Development Branch

## Goal

Chỉ chốt công việc sau khi đã có bằng chứng verify phù hợp với repo này.

## Required Verification

Trước khi báo hoàn thành:

1. Chạy `npm run lint`
2. Chạy `npm run build`
3. Nếu đổi UI hoặc route behavior, kiểm tra thủ công route bị ảnh hưởng

Nếu bước nào fail, quay lại sửa trước khi tiếp tục.

## Review Decision

- Change nhỏ: tự review diff cục bộ rồi chốt
- Change vừa hoặc lớn: dùng `requesting-code-review`
- Change nhiều phần độc lập: chốt sau khi các phần đều có verification riêng

## Git Awareness

- Nếu workspace có git: ghi rõ branch, changed files, review status
- Nếu workspace không có git: bỏ qua phần merge/PR và thay bằng handoff summary theo file

## Final Handoff Checklist

- Mục tiêu thay đổi đã hoàn thành chưa
- File chính đã sửa là gì
- Verification nào đã chạy
- Rủi ro còn lại là gì
- Có cần bước tiếp theo nào không
