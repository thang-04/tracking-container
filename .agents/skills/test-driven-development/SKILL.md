---
name: test-driven-development
description: Use when changing behavior in this repo before writing implementation code, especially when you can define a focused failing check first.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Test-Driven Development

## Rule

Không viết implementation trước khi có failing check rõ ràng.

## Repo-Specific Reality

Repo hiện chưa có test runner app-level trong `package.json`.

Vì vậy, trước khi code, phải chọn một trong ba cách:

1. Dùng test harness đã có sẵn trong branch hiện tại
2. Thêm test harness nhỏ nhất hợp lý cho phạm vi thay đổi
3. Nếu không đáng thêm harness, mô tả failing manual check thật cụ thể rồi dùng `lint + build + browser verification` làm green check

## Minimal Red-Green Loop for This Repo

### Red

Ghi rõ:

- Route bị ảnh hưởng
- Dữ liệu đầu vào hoặc thao tác user
- Kết quả hiện tại đang sai
- Kết quả mong đợi

### Green

Sau khi sửa:

- `npm run lint`
- `npm run build`
- kiểm tra lại route bằng trình duyệt hoặc `agent-browser`

### Refactor

- Rút gọn code lặp
- ép code về pattern của `components/ui`, `DashboardLayout`, tokens hiện có
- chạy lại green checks

## When to Add a Real Test Harness

- Logic tính toán không thuần UI
- Form validation phức tạp
- Filtering/sorting/state transitions dễ hồi quy
- Bug tái hiện được bằng input rõ ràng

## When Manual TDD Is Acceptable

- Pure layout or visual adjustments
- Dark mode contrast fixes
- Spacing, alignment, copy, badge color, chart labeling

Nhưng ngay cả khi manual, failing check vẫn phải được mô tả trước khi sửa.
