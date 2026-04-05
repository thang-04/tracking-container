---
name: writing-skills
description: Use when creating or editing skills in `.agents/skills` so they match Codex, this repo, and the tools actually available in the current environment.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Writing Skills

## Overview

Viết skill là viết tài liệu tác chiến cho các phiên Codex sau, không phải chép lại câu chuyện đã làm một lần.

## Ground Rules for This Repo

- Generic techniques để trong từng skill
- Conventions riêng của `tracking-container` để trong `SKILLS_GUIDE.md`
- Không dùng giả định của nền tảng khác như `.claude`, `CLAUDE.md`, `AskUserQuestionTool`, slash commands
- Khi skill nói về verification, bám `npm run lint`, `npm run build`, và manual route checks

## Skill Authoring Checklist

1. Description chỉ nói khi nào dùng, không tóm tắt workflow
2. Path examples phải dùng `.agents/skills/...` nếu cần path local
3. Nếu skill áp cho UI repo này, phải biết đây là Next.js App Router dashboard
4. Nếu skill cần hỏi thêm context, nói rõ là hỏi user trực tiếp trong chat
5. Nếu skill nhắc subagents, dùng mô hình `spawn_agent` hoặc reviewer prompt thực tế của Codex

## Project Alignment Checklist

Trước khi chốt skill, kiểm tra:

- Có còn tham chiếu công cụ không tồn tại không
- Có còn command verify sai repo không
- Có default stack sai như `html-tailwind` thay vì `nextjs` không
- Có bỏ qua `components/ui` và `DashboardLayout` không
- Có còn ví dụ ngôn ngữ/brand lệch khỏi dashboard logistics không

## Where to Persist Repo Conventions

Project-specific conventions phải được phản ánh ở `SKILLS_GUIDE.md`.

## Success Criteria

- Skill đọc lên là dùng được ngay trong repo hiện tại
- Không cần suy diễn thêm về stack hay workflow
- Không còn mismatch giữa skill docs và môi trường Codex hiện tại
