---
name: executing-plans
description: Use when you already have a written implementation plan and need to execute it carefully in this session for the current repo.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Executing Plans

## Flow

1. Đọc plan
2. Soát lại plan với codebase hiện tại
3. Tách thành các bước thực thi rõ ràng
4. Thực hiện từng bước
5. Verify sau mỗi phần có rủi ro
6. Chốt bằng `finishing-a-development-branch`

## When to Prefer Another Skill

- Có nhiều task độc lập và subagents khả dụng -> `subagent-driven-development`
- Chưa có plan -> `writing-plans`

## Repo-Specific Execution Checks

- Mọi thay đổi route phải khớp App Router
- UI changes phải bám `components/ui` và layout dashboard
- Verification cuối cùng tối thiểu là `lint + build + manual route check`
