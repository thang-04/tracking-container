---
name: screen-crawler
description: Use when documenting routes, screens, and UI behavior in this Next.js App Router logistics dashboard, especially for route inventory, screen breakdowns, or `screens.yaml` output.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# Screen Crawler

Skill này được tối ưu cho cấu trúc route hiện tại của `tracking-container`, không phải cho React Router generic.

## Project-First Assumptions

- Source of truth cho routes là `app/**/page.tsx`
- Shared chrome nằm ở `app/layout.tsx`, `components/dashboard-layout.tsx`, `components/app-sidebar.tsx`
- Phần lớn màn hình dùng mock data ngay trong page/component
- Copy hiện tại là tiếng Việt
- Route labels nên đối chiếu thêm với navigation trong `components/app-sidebar.tsx`

## Route Discovery Order

1. Đọc `package.json` để xác nhận Next.js App Router
2. Đọc `app/layout.tsx` để hiểu global shell, theme, font, metadata
3. Quét `app/**/page.tsx`
4. Quét `app/**/layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` nếu có
5. Đối chiếu với `components/app-sidebar.tsx` để kiểm tra route names hiển thị

## Mapping Rules for This Repo

- `app/page.tsx` -> `/`
- `app/containers/page.tsx` -> `/containers`
- `app/transport/page.tsx` -> `/transport`
- `app/map/page.tsx` -> `/map`
- `app/alerts/page.tsx` -> `/alerts`
- `app/customs/page.tsx` -> `/customs`
- `app/users/page.tsx` -> `/users`
- `app/settings/page.tsx` -> `/settings`
- `app/simulation/page.tsx` -> `/simulation`
- `app/ahp/page.tsx` -> `/ahp`

## App Router Handling Rules

- Bỏ route groups như `(group)` khỏi URL cuối cùng
- Preserve dynamic segments `[id]`, `[slug]`, `[...slug]`, `[[...slug]]`
- Đánh dấu route nào dùng layout chung thay vì xem page như standalone screen hoàn toàn
- Khi page render component lớn từ `components/`, đọc cả component đó trước khi mô tả screen

## Per-Screen Analysis Checklist

### 1. Xác định mục tiêu màn hình

- Tên route
- Tên hiển thị nếu có trong sidebar hoặc title
- Mô tả ngắn bằng tiếng Việt

### 2. Trích xuất chức năng

Tìm:

- `useState`, `useReducer`, form state
- Event handlers như `onClick`, `onSubmit`, `onChange`
- Dialog, drawer, dropdown, tabs, table actions
- Filter, search, sort, status toggles
- Map interactions, chart interactions, simulation controls

### 3. Trích xuất nội dung hiển thị

Ghi lại:

- KPI cards
- Tables
- Charts
- Forms
- Alerts, badges, status chips
- Map panels
- Empty, loading, error states nếu có

### 4. Trích xuất nguồn dữ liệu

Ghi rõ page đang dùng:

- Mock arrays nội tuyến
- Imported constants
- Client state
- API calls thực tế nếu có

### 5. Trích xuất tham số route và query

- Dynamic params từ App Router
- `searchParams` nếu page sử dụng
- URL-driven filters nếu có

## Output Rules

- Chỉ tạo `screens.yaml` khi user yêu cầu tài liệu route hoặc screen inventory
- Nếu user chỉ hỏi về 1 route, trả lời tập trung route đó, không crawl toàn bộ app
- Dùng tiếng Việt cho `description`, `functionalities`, `ui_elements`

## Suggested `screens.yaml` Schema

```yaml
app:
  name: tracking-container
  framework: nextjs-app-router
  language: vi
  total_routes: 10

routes:
  - path: /containers
    name: Quản lý Container
    file: app/containers/page.tsx
    layout: components/dashboard-layout.tsx
    description: Quản lý danh sách container, lọc trạng thái, và thêm dữ liệu mới.
    functionalities:
      - Lọc container theo trạng thái và từ khóa
      - Mở dialog thêm container
      - Preview dữ liệu import trước khi thêm
    ui_elements:
      - KPI cards
      - Table danh sách container
      - Dialog thêm container
      - Badge trạng thái
```

## Verification

- Đếm route thực tế trong `app/**/page.tsx`
- So khớp các route chính với sidebar navigation
- Nếu mô tả screen behavior, kiểm tra lại page/component thay vì suy đoán từ tên file
