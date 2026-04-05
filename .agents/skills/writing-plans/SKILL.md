---
name: writing-plans
description: Use when a request spans multiple steps or files and you need a concrete implementation plan for this repo before touching code.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Writing Plans

## Output Standard

Plan phải đủ cụ thể để một engineer khác có thể thực hiện mà không đoán tiếp.

Mỗi plan nên ghi rõ:

- Mục tiêu
- File cần đọc
- File dự kiến sửa
- Dependencies và patterns cần giữ
- Verification steps
- Risks hoặc unknowns

## Repo-Specific Planning Rules

- Route work phải tham chiếu `app/**/page.tsx`
- Shared layout work phải kiểm tra `components/dashboard-layout.tsx`, `components/app-sidebar.tsx`, `components/app-header.tsx`
- UI work phải xem `components/ui/*`, `components.json`, `app/globals.css`
- Chart work phải ưu tiên Recharts
- Copy/UI text mặc định là tiếng Việt

## Verification Section Must Include

- `npm run lint`
- `npm run build`
- manual route checks cho màn hình bị ảnh hưởng

Nếu plan cần automated tests nhưng repo chưa có harness, phải ghi rõ:

- có thêm harness hay không
- nếu không thêm, manual failing check là gì

## Save Location

Nếu user muốn lưu plan, mặc định dùng `docs/plans/YYYY-MM-DD-<feature>.md`.

## Execution Handoff

- Nếu task có nhiều phần độc lập và có subagents: dùng `subagent-driven-development`
- Nếu task cần làm tuần tự trong session: dùng `executing-plans`
