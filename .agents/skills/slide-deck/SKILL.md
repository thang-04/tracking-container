---
name: slide-deck
description: Use when the user wants a presentation experience built inside or alongside this repo, especially if the deck should reuse the current design system instead of a generic slide scaffold.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Slide Deck

## Repo-Specific Default

Trong repo này, ưu tiên làm slide deck như một route hoặc module của Next.js nếu user không yêu cầu scaffold app riêng.

Không default tạo Vite app mới trong cùng workspace.

## Before Building

- Hỏi rõ topic và audience
- Xác định deck nằm trong route hiện có hay route mới
- Xác định có cần thêm animation library hay không

## Styling Rules

- Tận dụng typography và color tokens hiện có nếu deck thuộc cùng sản phẩm
- Nếu deck là artifact riêng, vẫn tránh visual language generic
- Copy mặc định theo ngôn ngữ user yêu cầu

## Verification

- `npm run lint`
- `npm run build`
- kiểm tra thủ công route hoặc entrypoint của deck
