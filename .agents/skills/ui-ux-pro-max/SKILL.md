---
name: ui-ux-pro-max
description: Use when choosing or reviewing UI direction for this Next.js logistics dashboard, especially for tables, charts, forms, dashboard pages, and shadcn-based components.
---

> Project context: `tracking-container` is a Next.js 16 App Router logistics dashboard in Vietnamese using React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Radix, Lucide, Recharts, OKLCH tokens in `app/globals.css`, a fixed sidebar dashboard layout, and default dark mode. Prefer `app/**/page.tsx`; verify with `npm run lint`, `npm run build`, and manual route checks.

# UI/UX Pro Max

Dùng skill này như lớp tra cứu thiết kế có định hướng, nhưng mặc định phải bám hệ thống hiện có của repo.

## Repo Defaults

- Stack mặc định: `nextjs`
- Stack phụ trợ: `shadcn`
- Font mặc định: Poppins và Fira Code
- Theme mặc định: dark mode
- Copy mặc định: tiếng Việt
- Icons: Lucide
- Charts: Recharts
- Layout chuẩn: sidebar cố định, content dashboard, cards, tables, alerts, charts

## Before Using Search Data

Luôn kiểm tra trước:

- `app/globals.css` cho color tokens, radius, font tokens
- `components.json` cho shadcn aliases và style
- `components/dashboard-layout.tsx`
- `components/app-sidebar.tsx`
- `components/ui/*` nếu đang sửa primitive đã có

Không dùng search results để đè lên system đã tồn tại nếu repo đã có pattern tốt hơn.

## Search Workflow for This Repo

### Step 1: Xác định loại yêu cầu

- Dashboard page mới
- Tối ưu table/filter/form hiện có
- Cải thiện charts/KPI cards
- Cải thiện visual hierarchy hoặc màu
- Review UI code đang có

### Step 2: Dùng search với preset gần repo nhất

Trên Windows, ưu tiên:

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system -p "tracking-container"
```

Nếu máy dùng launcher `py`:

```powershell
py -3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system -p "tracking-container"
```

### Step 3: Mặc định stack là `nextjs`

Không default về `html-tailwind` cho repo này.

Ví dụ:

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "logistics operations dashboard vietnamese dark" --design-system -p "tracking-container"
python .agents/skills/ui-ux-pro-max/scripts/search.py "table filtering status badges" --stack nextjs
python .agents/skills/ui-ux-pro-max/scripts/search.py "shadcn form validation dialog" --stack shadcn
python .agents/skills/ui-ux-pro-max/scripts/search.py "chart readability dark dashboard" --domain chart
python .agents/skills/ui-ux-pro-max/scripts/search.py "alert severity color accessibility" --domain ux
```

## Recommended Query Presets

### Dashboard Page

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "logistics dashboard cards charts sidebar" --design-system -p "tracking-container"
```

### Table + Filter UX

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "data table filters badges pagination" --stack nextjs
```

### Form + Dialog

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "dialog form validation shadcn" --stack shadcn
```

### Chart Quality

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard chart contrast legend tooltip" --domain chart
```

### Accessibility and Motion

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py "dark dashboard accessibility motion" --domain ux
```

## What Good Output Looks Like in This Repo

- Giữ tone vận hành logistics, không thành landing page marketing
- Tables và cards có hierarchy rõ
- Badges trạng thái đọc được trong dark mode
- Charts dùng palette gần chart tokens đang có
- Sidebar/header/content spacing đồng nhất với `DashboardLayout`
- Không phá vỡ primitive `components/ui/*`

## Anti-Patterns for This Repo

- Default về `html-tailwind` rồi bỏ qua Next.js App Router
- Dùng palette lạ, đặc biệt purple neon hoặc gradient marketing không ăn nhập dashboard hiện có
- Đưa tiếng Anh vào copy mà không có yêu cầu rõ ràng
- Bỏ qua dark mode vì repo đang force `.dark`
- Thay table/card/dialog có sẵn bằng custom markup kém nhất quán

## Use With Other Skills

- `frontend-design` khi cần build UI mới
- `normalize` khi cần ép màn mới khớp design system hiện có
- `polish` cho final pass
- `audit` khi cần quality report
