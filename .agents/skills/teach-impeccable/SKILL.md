---
name: teach-impeccable
description: Use once to capture or refresh the design conventions of this repo and write them into `SKILLS_GUIDE.md` so later sessions stay aligned.
user-invokable: true
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Teach Impeccable

Mục tiêu của skill này là gom design context của project và lưu lại vào `SKILLS_GUIDE.md`, không phải tạo thêm một design manifesto mơ hồ.

## Step 1: Explore the Codebase

Đọc tối thiểu các file sau:

- `package.json`
- `components.json`
- `app/layout.tsx`
- `app/globals.css`
- `components/dashboard-layout.tsx`
- `components/app-sidebar.tsx`
- Các route quan trọng trong `app/**/page.tsx`

## Step 2: Extract What Is Already Known

Tối thiểu ghi lại:

- Stack và version chính
- Theme mode mặc định
- Font stack
- Color tokens và status colors
- Layout shell
- Ngôn ngữ giao diện
- Route map chính
- Verification defaults

## Step 3: Ask Only What Is Missing

Nếu vẫn thiếu context ảnh hưởng lớn đến thiết kế, hỏi user trực tiếp trong chat.

Chỉ hỏi các câu chưa thể suy ra từ codebase, ví dụ:

- Brand tone mong muốn có cần thay đổi không?
- Có route ưu tiên nào sẽ là flagship screen không?
- Có chuẩn copy song ngữ không?

## Step 4: Update `SKILLS_GUIDE.md`

Cập nhật hoặc làm mới các phần sau trong `SKILLS_GUIDE.md`:

- `Project Context`
- `Main Routes`
- `Default Verification for This Repo`
- `Project Rules Skills Should Follow`

Không ghi context project vào các skill generic nếu context đó chỉ phù hợp cho repo hiện tại. Với repo này, `SKILLS_GUIDE.md` là nguồn tổng hợp chính.

## Success Criteria

- `SKILLS_GUIDE.md` phản ánh đúng stack hiện tại
- Design context bám code thật, không bịa brand story
- Các session sau có thể dùng guide đó mà không phải quét lại repo từ đầu
