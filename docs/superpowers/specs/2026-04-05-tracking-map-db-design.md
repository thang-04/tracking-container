# Thiết Kế Ghép Logic Tracking Map Với Database

## 1. Mục tiêu

Chuyển màn hình theo dõi bản đồ hiện tại từ dữ liệu hardcode trong UI sang dữ liệu lấy từ database thông qua Prisma, đồng thời giữ nguyên route `/map` của Next.js App Router.

Thiết kế này tập trung vào:

- Bỏ các mảng `locations`, `vehicles`, `routes` hardcode trong UI.
- Dùng một nguồn dữ liệu server-side duy nhất cho `/map` và preview ở dashboard.
- Đặt lại tên file theo nghiệp vụ ngắn gọn, dễ hiểu, thay vì để logic nằm trong các file generic.
- Giữ được trải nghiệm hiện tại của map giả lập Việt Nam bằng cách chuẩn hóa `lat/lng` thành `x/y`.
- Không thêm fallback runtime bằng mảng hardcode mới.

Không nằm trong scope của thiết kế này:

- Đổi sang thư viện map thật như Leaflet hoặc Mapbox.
- Thêm GPS realtime thật hoặc websocket mới.
- Mở rộng schema database ngoài các quy ước nhỏ trong tầng view-model.

## 2. Bối cảnh hiện tại

Hiện tại:

- [app/map/page.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/app/map/page.tsx) là client component chứa cả dữ liệu cứng, logic hiển thị, và state tương tác.
- [components/dashboard/map-preview.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/components/dashboard/map-preview.tsx) cũng có dữ liệu hardcode riêng và không đồng bộ với `/map`.
- Repo đã có schema Prisma và Supabase đủ dùng cho feature này, đặc biệt là các bảng `ports`, `routes`, `route_checkpoints`, `vehicles`, `voyages`, `voyage_containers`, `tracking_positions`, `containers`.
- Repo chưa có seed script hoặc fixture dùng chung cho dữ liệu demo tracking.

Vấn đề cần giải quyết:

- `/map` và dashboard đang dùng hai bộ data giả khác nhau.
- UI hiện phụ thuộc vào các field không đúng schema như `driver` và `currentContainer`.
- File route đang ôm quá nhiều trách nhiệm, khó bảo trì và khó nối DB.

## 3. Ràng buộc và nguyên tắc

- Giữ [app/map/page.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/app/map/page.tsx) vì đây là contract bắt buộc của Next.js App Router.
- Tên file mới phải ngắn, đúng nghiệp vụ, không lạm dụng prefix dài như `voyage-tracking-*`.
- Prisma chỉ được dùng ở server-side.
- Client component chỉ nhận dữ liệu JSON-safe đã được normalize.
- Không thêm fallback runtime bằng mảng hardcode trong component.
- Nếu database rỗng, UI phải hiển thị empty state đúng nghĩa.
- Copy hiển thị tiếp tục dùng tiếng Việt.
- Do schema hiện chỉ support `vehicle_type = barge`, UI map phải dùng wording trung tính như `Phương tiện` hoặc `Sà lan`, không tiếp tục giả định xe tải là trung tâm.

## 4. Quyết định thiết kế

### 4.1. Phương án được chọn

Dùng một data module server-side duy nhất để đọc và chuẩn hóa dữ liệu tracking từ Prisma, sau đó truyền payload này vào:

- màn `/map` ở bản đầy đủ
- card preview ở dashboard ở bản rút gọn

### 4.2. Lý do chọn

- Tránh lệch dữ liệu giữa `/map` và dashboard preview.
- Prisma không bị kéo vào client component.
- Có thể giữ state tương tác phía client mà không trộn với logic query.
- Dễ mở rộng sau này sang realtime, filter bằng URL, hoặc map library thật.

### 4.3. Phương án không chọn

Không chọn fetch qua API route riêng cho từng màn vì sẽ nhân đôi lớp normalize data.

Không chọn giữ nguyên page client rồi vá từng mảng cứng vì chỉ giải quyết bề mặt và sẽ tạo thêm nợ kỹ thuật.

## 5. Tên file và cấu trúc mới

### 5.1. Route layer

- [app/map/page.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/app/map/page.tsx): server route entry cho màn tracking
- [app/page.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/app/page.tsx): dashboard page, fetch preview data từ cùng data module

### 5.2. Tracking UI

- `components/tracking/tracking-screen.tsx`: shell chính của màn `/map`
- `components/tracking/tracking-map.tsx`: canvas giả lập Việt Nam, route line, location marker, vehicle marker
- `components/tracking/tracking-sidebar.tsx`: ô tìm kiếm, filter, danh sách phương tiện
- `components/tracking/tracking-details.tsx`: panel chi tiết location hoặc vehicle

### 5.3. Dashboard preview

- `components/dashboard/live-tracking-preview.tsx`: card preview nhận props, không tự fetch và không chứa hardcode

### 5.4. Tracking data layer

- `lib/tracking/types.ts`: DTO và shared types cho tracking UI
- `lib/tracking/get-tracking-overview.ts`: query Prisma, aggregate dữ liệu, trả payload chung
- `lib/tracking/build-tracking-view-model.ts`: chuyển database record sang view-model cho UI
- `lib/tracking/select-active-voyage.ts`: rule chọn voyage đang hiệu lực theo phương tiện
- `lib/tracking/project-map-point.ts`: chuẩn hóa `lat/lng` thành `x/y` cho pseudo-map hiện tại

## 6. Mapping dữ liệu từ database sang UI

### 6.1. Location markers

Nguồn:

- `ports`

Field cần lấy:

- `id`
- `name`
- `port_type`
- `lat`
- `lng`
- `is_active`

Field phát sinh cho UI:

- `containerCount`: aggregate từ `containers` theo `current_port_id`
- `x`, `y`: từ `project-map-point.ts`
- `kind`: map từ `port_type` sang giá trị UI như `port` hoặc `dryport`

Rule count:

- loại trừ container có `current_status = released`
- chỉ count container còn hiệu lực nghiệp vụ tại cảng hiện tại

### 6.2. Route lines

Nguồn:

- `routes`
- `ports` cho cảng đi và đến
- `route_checkpoints` nếu có

Rule vẽ:

- nếu route có checkpoints thì vẽ polyline theo checkpoint order `seq_no`
- nếu không có checkpoints thì vẽ đường nối từ origin port sang destination port

### 6.3. Vehicle markers

Nguồn chính:

- `vehicles`

Nguồn bổ sung:

- `tracking_positions` lấy bản ghi mới nhất theo `vehicle_id`
- `voyages`
- `routes`

Rule lấy tọa độ:

1. `tracking_positions` mới nhất của vehicle
2. `voyages.current_lat/current_lng` của active voyage
3. `vehicles.current_lat/current_lng`

Field UI:

- `id`
- `code`
- `name`
- `status`
- `lat`
- `lng`
- `x`
- `y`
- `speed`
- `recordedAt`
- `routeName`
- `manifestCount`
- `eta`
- `voyageStatus`

### 6.4. Vehicle details panel

Nguồn:

- `vehicles`
- active `voyages`
- `routes`
- `voyage_containers`
- `containers`
- `route_checkpoints`

UI sẽ hiển thị:

- mã phương tiện
- tên phương tiện
- trạng thái
- tuyến hiện tại
- ETA
- checkpoint hiện tại nếu có
- số container trên manifest
- danh sách container tiêu biểu, giới hạn số lượng để panel không quá nặng

### 6.5. Dashboard preview

Payload cũng lấy từ `get-tracking-overview.ts` nhưng cho phép mode preview để:

- giới hạn số vehicle marker
- giới hạn số route line
- chỉ giữ thông tin đủ cho card preview

## 7. Quy ước nghiệp vụ trong UI

### 7.1. Bỏ field không có trong schema

Không hiển thị `driver` trên map vì schema hiện không có field này.

Không hiển thị `currentContainer` singular vì nghiệp vụ đúng là một chuyến có nhiều container thông qua `voyage_containers`.

### 7.2. Chọn active voyage

Một vehicle có thể có nhiều voyage trong DB, nên cần quy ước chọn bản ghi dùng cho tracking UI.

Thứ tự ưu tiên:

1. `loading`
2. `departed`
3. `planned`

Nếu có nhiều voyage cùng trạng thái ưu tiên, lấy voyage có `updated_at` mới nhất.

### 7.3. Wording trên màn map

Ưu tiên các từ:

- `Phương tiện`
- `Sà lan`
- `Tuyến`
- `Cảng biển`
- `Cảng cạn`

Tránh dùng wording truck-centric như `Xe tải đang hoạt động` trên màn `/map`.

## 8. Server/client boundary

### 8.1. Server-side

Phần sau phải ở server:

- Prisma query
- aggregate container count
- join vehicle, route, voyage, tracking position
- chọn active voyage
- chuẩn hóa status
- tính `x/y` từ `lat/lng`
- quyết định empty state do DB rỗng

### 8.2. Client-side

Phần sau ở client:

- `selectedVehicle`
- `selectedLocation`
- `filter`
- `searchTerm`
- lọc danh sách đã load
- click marker
- mở panel chi tiết

## 9. Empty state và demo data

### 9.1. Runtime behavior

Runtime chỉ đọc database thật.

Nếu database chưa có dữ liệu tracking:

- `/map` vẫn render khung map và legend
- sidebar hiển thị empty state như `Chưa có dữ liệu phương tiện`
- card preview ở dashboard hiển thị trạng thái `Chưa có dữ liệu theo dõi`
- không fallback về mảng hardcode

### 9.2. Seed data

Thêm file:

- `supabase/seed-tracking-demo.sql`

File này phải idempotent ở mức hợp lý cho local/dev và tạo bộ dữ liệu tối thiểu cho:

- `ports`
- `routes`
- `route_checkpoints`
- `vehicles`
- `voyages`
- `tracking_positions`
- `containers`
- `voyage_containers`

Mục tiêu của seed là để `/map` và dashboard preview cùng đọc một nguồn DB thật, không phải để tái tạo hardcode cũ trong component.

## 10. Cách chia implementation bằng 5 agent

### Agent 1

Phạm vi:

- `lib/tracking/types.ts`
- `lib/tracking/get-tracking-overview.ts`
- `lib/tracking/build-tracking-view-model.ts`
- `lib/tracking/select-active-voyage.ts`
- `lib/tracking/project-map-point.ts`

### Agent 2

Phạm vi:

- `components/tracking/tracking-map.tsx`

### Agent 3

Phạm vi:

- `components/tracking/tracking-screen.tsx`
- `components/tracking/tracking-sidebar.tsx`
- `components/tracking/tracking-details.tsx`

### Agent 4

Phạm vi:

- `components/dashboard/live-tracking-preview.tsx`
- [app/page.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/app/page.tsx)

### Agent 5

Phạm vi:

- [app/map/page.tsx](C:/Users/thangnd04/IdeaProjects/tracking-container/app/map/page.tsx)
- `supabase/seed-tracking-demo.sql`
- tài liệu ngắn hướng dẫn seed và manual check nếu cần

### Main thread

Trách nhiệm:

- tích hợp các thay đổi
- xử lý va chạm nhỏ
- kiểm tra lại naming
- chạy verify cuối

## 11. Rủi ro và unknowns

- Một số port hoặc vehicle có thể chưa có `lat/lng`, cần graceful handling để bỏ qua marker không đủ tọa độ.
- Schema chưa có route geometry thật, nên bản đầu chỉ vẽ endpoint-to-endpoint hoặc polyline qua checkpoints.
- Nếu số lượng `tracking_positions` lớn, query lấy record mới nhất theo vehicle cần làm cẩn thận để không nặng page.
- Các page prototype khác trong repo vẫn còn hardcode và có thể dùng wording không đồng bộ với tracking mới, nhưng không nằm trong scope hiện tại.

## 12. Verification

Mặc định phải chạy:

- `node_modules\\.bin\\tsc.cmd --noEmit`
- `npm run build`
- manual check cho `/map`
- manual check cho `/`

Ghi chú:

- `npm run lint` được khai báo trong `package.json` nhưng repo hiện chưa có `eslint` cài đặt, nên verification sẽ ghi nhận là blocked thay vì báo pass giả.

## 13. Kết luận

Thiết kế này giữ nguyên route framework của Next.js nhưng tách logic tracking ra các file tên theo nghiệp vụ, đủ ngắn và rõ nghĩa. Dữ liệu map sẽ được lấy từ DB thông qua một server data module duy nhất, dùng chung cho cả `/map` và dashboard preview, loại bỏ hoàn toàn hardcode runtime trong component.
