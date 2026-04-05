# Cẩm nang các lệnh Prisma & Supabase

Dự án này sử dụng Prisma làm ORM để tương tác với cơ sở dữ liệu Supabase (PostgreSQL). Dưới đây là các lệnh CLI quan trọng để thao tác trong quá trình phát triển.

## 1. Đồng bộ Schema (Cấu trúc bảng) 

### 💡 Lựa chọn 1: Prototype nhanh (Không lưu lịch sử Migration)
Khi đang phát triển giao diện sơ thảo và thay đổi cấu trúc bảng liên tục, bạn hãy dùng lệnh này để đẩy thẳng cấu trúc từ `prisma/schema.prisma` lên Supabase.
```bash
npx prisma db push
```

### 💡 Lựa chọn 2: Phát triển chuyên nghiệp (Tạo file Migration)
Khi cấu trúc bảng đã ổn định, cần chia sẻ với team hoặc chuẩn bị lên Production, bạn nên dùng lệnh này để Prisma tạo thư mục lịch sử tại `prisma/migrations`.
```bash
npx prisma migrate dev --name <ten_thay_doi>
# Ví dụ: npx prisma migrate dev --name init_database
```

## 2. Cập nhật Prisma Client Code 
Bất cứ khi nào bạn chỉnh sửa file `prisma/schema.prisma` (thêm bảng, sửa cột), hãy chạy lệnh này để TypeScript cập nhật gợi ý code:
```bash
npx prisma generate
```

## 3. Xem và Quản lý dữ liệu trực tiếp 
Prisma cung cấp một giao diện web UI (Studio) mạnh mẽ thay vì phải mở trình duyệt vào dashboard Supabase.
```bash
npx prisma studio
```
Truy cập vào: `http://localhost:5555`

## 4. Reset và Đồng bộ ngược (Introspection)

### Nếu bạn sửa bảng trực tiếp trên giao diện của Supabase Dashboard:
Bạn phải kéo cấu trúc DB hiện tại về để chép đè vào file `prisma/schema.prisma`:
```bash
npx prisma db pull
```

### Nếu muốn xoá trắng dữ liệu và bắt đầu lại (Cẩn thận khi dùng)
```bash
npx prisma migrate reset
```

## Luồng làm việc (Workflow) khuyên dùng:
1. Sửa file `prisma/schema.prisma`
2. Chạy `npx prisma db push` (để update DB)
3. Chạy `npx prisma generate` (để update code TS)
4. Mở `npx prisma studio` để nhập một vài dữ liệu test.
5. Quay lại code Next.js gọi `await prisma.ten_bang.findMany()`
