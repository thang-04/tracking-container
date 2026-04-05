---
name: subagent-driven-development
description: Use when a written plan has multiple mostly independent tasks and Codex subagents can implement or review parts in parallel.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Subagent-Driven Development

## Core Idea

Chỉ tách task cho subagents khi write scope đủ rời nhau.

## Good Splits in This Repo

- Một agent cho `app/containers/page.tsx`, agent khác cho `components/ui/*`
- Một agent cho chart component, agent khác cho form/dialog
- Một agent triển khai, một agent review

## Bad Splits

- Hai agent cùng sửa một page lớn
- Tách quá nhỏ khiến main thread phải merge logic liên tục
- Giao task blocking quan trọng cho subagent rồi đứng chờ

## Required Brief for Each Worker

- Mục tiêu task
- File ownership
- Relevant repo patterns cần giữ
- Verification expected
- Nhắc rõ họ không được revert sửa đổi của agent khác

## Review Pattern

1. Worker implement
2. Reviewer kiểm tra spec compliance
3. Reviewer hoặc main thread kiểm tra code quality
4. Main thread tích hợp và verify
