# Skills Guide for `tracking-container`

## Project Context

`tracking-container` là dashboard logistics hỗ trợ theo dõi container và ra quyết định vận hành.

- Stack chính: Next.js 16 App Router, React 19, TypeScript 5.7, Tailwind CSS v4.
- UI system: `components/ui/*` theo phong cách shadcn/ui `new-york`, Radix primitives, Lucide icons, Recharts.
- Layout chuẩn: sidebar cố định bên trái, header phía trên, nội dung chính dùng `DashboardLayout`.
- Theme chuẩn: dark mode bật mặc định từ `app/layout.tsx`.
- Design tokens: OKLCH variables, màu chính xanh dương, accent xanh ngọc, warning vàng, destructive đỏ trong `app/globals.css`.
- Typography: `Poppins` cho sans, `Fira Code` cho mono.
- Ngôn ngữ giao diện hiện tại: tiếng Việt.
- Route source of truth: `app/**/page.tsx`.

## Main Routes

- `/` dashboard tổng quan
- `/containers` quản lý container
- `/transport` điều phối vận chuyển
- `/map` bản đồ phương tiện và container
- `/alerts` cảnh báo vận hành
- `/customs` hoạt động hải quan
- `/users` quản lý người dùng
- `/settings` cấu hình hệ thống
- `/simulation` mô phỏng vận hành
- `/ahp` phân tích AHP

## Default Verification for This Repo

Repo hiện chưa có app test suite riêng trong `package.json`. Khi skill yêu cầu xác minh, mặc định dùng:

1. `npm run lint`
2. `npm run build`
3. Kiểm tra thủ công route bị ảnh hưởng bằng trình duyệt hoặc `agent-browser`

Nếu thay đổi cần automated test thật sự, hãy ghi rõ trong plan rằng phải thêm test harness trước hoặc trong cùng task.

## How to Invoke Skills in Codex

Không dùng slash command kiểu `/skill-name`.

Các cách gọi đúng trong workspace này:

- Nhắc thẳng tên skill trong prompt, ví dụ: `dùng screen-crawler để liệt kê routes`
- Mô tả nhu cầu đủ rõ để Codex tự chọn skill phù hợp
- Kết hợp tối đa 2-3 skill cho một yêu cầu, tránh chồng workflow không cần thiết

## Project Rules Skills Should Follow

- Ưu tiên đọc `app/`, `components/`, `hooks/`, `lib/` trước khi đề xuất thay đổi.
- Với UI hiện có, giữ ngôn ngữ thiết kế dashboard logistics đang dùng thay vì dựng lại một design system mới từ đầu.
- Mọi thay đổi UI nên tái sử dụng `DashboardLayout`, `AppSidebar`, `AppHeader`, `components/ui/*` nếu phù hợp.
- Copy mặc định bằng tiếng Việt, trừ khi user yêu cầu tiếng Anh.
- Chart mới nên ưu tiên Recharts và palette chart tokens hiện có.
- Không giả định có `AskUserQuestionTool`, `CLAUDE.md`, `.claude/skills`, hay slash workflow của nền tảng khác.
- Khi thiếu context quan trọng, hỏi user trực tiếp trong chat.

## Recommended Skill Flows

### 1. Chỉnh UI trên màn hình hiện có

`normalize` -> `frontend-design` hoặc `ui-ux-pro-max` -> `polish` -> `audit`

Dùng khi giữ layout dashboard hiện tại nhưng muốn nâng chất lượng visual, spacing, chart, form, table, hoặc copy.

### 2. Thêm feature hoặc refactor nhiều bước

`writing-plans` -> `subagent-driven-development` hoặc `executing-plans` -> `requesting-code-review` -> `finishing-a-development-branch`

Dùng khi thay đổi trải qua nhiều file hoặc nhiều route.

### 3. Sửa bug hoặc hành vi sai

`systematic-debugging` -> `test-driven-development` -> `verification-before-completion`

Nếu repo chưa có test harness, skill TDD phải nêu rõ hình thức failing check thay thế.

### 4. Liệt kê route hoặc document app

`screen-crawler`

Dùng khi cần `screens.yaml`, route inventory, hoặc breakdown chức năng từng màn hình.

### 5. Kiểm tra giao diện trước khi chốt

`audit` hoặc `critique` -> `polish` -> `verification-before-completion`

### 6. Tạo hoặc sửa chính skill docs

`writing-skills`

## Skill Groups

### Core Workflow

- `writing-plans`
- `executing-plans`
- `subagent-driven-development`
- `requesting-code-review`
- `receiving-code-review`
- `finishing-a-development-branch`
- `verification-before-completion`
- `dispatching-parallel-agents`

### Debugging and Quality

- `systematic-debugging`
- `test-driven-development`
- `audit`
- `critique`

### UI and UX for This Dashboard

- `frontend-design`
- `ui-ux-pro-max`
- `normalize`
- `polish`
- `adapt`
- `animate`
- `bolder`
- `colorize`
- `delight`
- `distill`
- `quieter`
- `clarify`
- `harden`
- `onboard`
- `optimize`
- `extract`
- `teach-impeccable`

### Project Discovery and Browser Work

- `screen-crawler`
- `agent-browser`

### Data and Utilities

- `mysql-tools`
- `find-skills`

## Project-Specific Defaults by Area

### Layout

- Trang mới nên cân nhắc bọc trong `DashboardLayout`.
- Sidebar labels nên nhất quán với route names hiện có.
- Không bỏ qua dark mode vì root HTML đang force `.dark`.

### Forms and Tables

- Ưu tiên các primitive trong `components/ui`.
- Forms nên dùng structure rõ ràng, label tiếng Việt, validation states dễ đọc.
- Tables nên có trạng thái empty/loading nếu feature có dữ liệu động.

### Maps, Alerts, and Operations Screens

- Visual language nên thiên về vận hành logistics: trạng thái, ETA, cảnh báo, vị trí, phương tiện.
- Màu sắc phải bám token đã có thay vì palette ngẫu nhiên.

### Documentation Output

- `screens.yaml` chỉ tạo khi user yêu cầu document routes hoặc phân tích màn hình.
- Plan files nên đặt trong `docs/plans/` nếu task đủ lớn để cần lưu lại.

## Quick Selection Table

| Bạn cần | Skill nên dùng trước |
|---|---|
| Liệt kê tất cả màn hình | `screen-crawler` |
| Thiết kế thêm card, table, chart trong dashboard | `frontend-design` |
| Ép UI mới khớp hệ thống hiện có | `normalize` |
| Kiểm tra UI trước khi giao | `audit` |
| Sửa copy, label, warning, helper text | `clarify` |
| Sửa bug khó tái hiện | `systematic-debugging` |
| Chuẩn bị plan nhiều bước | `writing-plans` |
| Chạy task nhiều phần độc lập | `subagent-driven-development` |
| Chốt task trước khi báo hoàn thành | `verification-before-completion` |
| Viết hoặc sửa skill docs | `writing-skills` |

## Maintenance Notes

- Khi stack hoặc route map thay đổi đáng kể, cập nhật file này trước rồi mới cập nhật các skill chuyên biệt.
- Nếu repo thêm test runner chính thức, thay `lint + build + manual check` bằng verification chain mới trong toàn bộ skill docs.
- Nếu ngôn ngữ giao diện đổi khỏi tiếng Việt, cập nhật mục Project Context và các skill liên quan đến copy/UI.
