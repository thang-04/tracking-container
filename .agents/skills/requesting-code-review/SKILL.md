---
name: requesting-code-review
description: Use when a completed change in this repo should be reviewed before handoff, especially for multi-file features, behavior changes, or risky UI work.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Requesting Code Review

## When to Use

- Sau feature nhiều file
- Sau bugfix có thay đổi behavior
- Trước khi chốt handoff quan trọng
- Khi thay đổi layout, form, table, chart, route logic có nguy cơ hồi quy

## Preferred Review Inputs

- Summary thay đổi
- File chính đã sửa
- Requirements hoặc expected behavior
- Kết quả `lint/build`
- Rủi ro còn nghi ngờ

## Review Execution

- Nếu có subagents: spawn reviewer agent và dùng `code-reviewer.md` làm brief
- Nếu không có subagents: tự review cục bộ với mindset review nghiêm ngặt

## Repo-Specific Review Focus

- Có phá `DashboardLayout` hay shell không
- Có lệch design tokens hoặc primitive `components/ui/*` không
- Copy tiếng Việt có nhất quán không
- Charts/badges/status colors có đọc được trong dark mode không
- Verification đã đủ chưa
