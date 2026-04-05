# Thiết Kế Database MVP

## 1. Mục tiêu

Tài liệu này mô tả thiết kế database cho hệ thống theo dõi container vận chuyển bằng sà lan từ cảng biển đến cảng cạn, theo đúng phạm vi MVP đã chốt:

- Quản trị người dùng và phân quyền cơ bản
- Danh mục nền
- Quản lý container
- Quản lý vị trí bãi
- Import EDI
- Quản lý phương tiện, chuyến và manifest container
- Theo dõi bản đồ và realtime
- Cảnh báo và xử lý sự cố
- Báo cáo và lịch sử
- Cổng tra cứu khách hàng

Thiết kế này tối ưu cho `Supabase Postgres`, theo hướng thực dụng, dễ triển khai MVP và vẫn đủ đường mở rộng sau này.

## 2. Nguyên tắc thiết kế

- `containers` là thực thể trung tâm.
- Trạng thái hiện tại lưu trực tiếp trên bảng `containers`.
- Toàn bộ lịch sử biến động của container lưu ở `container_events`.
- Không dùng bảng `container_current_state`.
- Không dùng bảng `yard_slot_occupancies`.
- Tình trạng slot đang bị chiếm được kiểm bằng `containers.current_slot_id` và rule/index phù hợp.
- Tạo phương tiện trước, rồi mới tạo chuyến, rồi mới gán container vào chuyến.
- Các thao tác EDI phải truy vết được theo batch và theo từng dòng import.
- Dữ liệu khách hàng phải tách quyền truy cập ở mức hàng dữ liệu khi triển khai với Supabase.

## 3. Quy ước chung

### 3.1. Kiểu khóa chính

Tất cả bảng nên dùng:

- `id uuid primary key default gen_random_uuid()`

Lý do:

- Hợp với Supabase
- Dễ đồng bộ client/server
- Không lộ số thứ tự nội bộ

### 3.2. Trường thời gian chuẩn

Hầu hết bảng nên có:

- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Ý nghĩa:

- `created_at`: thời điểm record được tạo
- `updated_at`: thời điểm record được cập nhật gần nhất

### 3.3. Trường bật/tắt chuẩn

Với bảng danh mục nền nên có:

- `is_active boolean not null default true`

Ý nghĩa:

- `true`: đang được phép sử dụng trong nghiệp vụ
- `false`: ngừng dùng nhưng chưa xóa khỏi hệ thống

### 3.4. Về xóa dữ liệu

MVP không nên xóa cứng dữ liệu nghiệp vụ quan trọng như:

- containers
- edi_batches
- voyages
- alerts
- container_events

Nếu cần ẩn khỏi nghiệp vụ thì dùng:

- `is_active = false`
- hoặc đổi trạng thái

## 4. Thiết kế bảng theo module

---

## 4.1. Nhóm Auth và người dùng

### Bảng `profiles`

**Bảng này lưu gì**

Lưu hồ sơ người dùng nội bộ và khách hàng, nối với `auth.users` của Supabase để biết người đó là ai, thuộc vai trò nào và được xem dữ liệu nào.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính. Đồng thời nên trùng với `auth.users.id` của Supabase để map 1-1 giữa auth và hồ sơ người dùng. |
| `email` | `text` | Email đăng nhập hoặc email liên hệ chính của user. |
| `full_name` | `text` | Họ tên đầy đủ để hiển thị trong UI và audit log. |
| `role` | `text` hoặc enum | Vai trò người dùng. Giá trị khuyến nghị: `admin`, `seaport_staff`, `dryport_staff`, `customer`. |
| `port_id` | `uuid nullable` | Nếu là nhân viên cảng biển hoặc cảng cạn thì chỉ ra user đang thuộc cảng nào. |
| `customer_id` | `uuid nullable` | Nếu là khách hàng thì chỉ ra user này thuộc khách hàng nào để giới hạn dữ liệu portal. |
| `phone` | `text nullable` | Số điện thoại liên hệ. |
| `job_title` | `text nullable` | Chức danh nghiệp vụ, ví dụ điều độ, thủ kho, quản trị viên. |
| `is_active` | `boolean` | Cho biết tài khoản này còn được phép sử dụng hệ thống hay không. |
| `last_login_at` | `timestamptz nullable` | Lần đăng nhập gần nhất, phục vụ quản trị và bảo mật. |
| `created_at` | `timestamptz` | Thời điểm tạo hồ sơ người dùng. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật hồ sơ gần nhất. |

**Ghi chú**

- Ở mức MVP, chỉ cần `role` là đủ, chưa cần tách `roles`, `permissions`, `user_roles`.
- Khi hệ thống lớn hơn có thể tách sang RBAC chi tiết.

---

## 4.2. Nhóm danh mục nền

### Bảng `customers`

**Bảng này lưu gì**

Lưu danh sách khách hàng sở hữu hoặc sử dụng dịch vụ vận chuyển container.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính khách hàng. |
| `code` | `text unique` | Mã khách hàng nội bộ hoặc mã dùng để tra cứu/nghiệp vụ. |
| `name` | `text` | Tên khách hàng hoặc doanh nghiệp. |
| `tax_code` | `text nullable` | Mã số thuế doanh nghiệp. |
| `contact_name` | `text nullable` | Người liên hệ chính. |
| `phone` | `text nullable` | Số điện thoại liên hệ. |
| `email` | `text nullable` | Email liên hệ chính. |
| `address` | `text nullable` | Địa chỉ khách hàng. |
| `is_active` | `boolean` | Còn hoạt động hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `shipping_lines`

**Bảng này lưu gì**

Lưu hãng tàu của container.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính hãng tàu. |
| `code` | `text unique` | Mã hãng tàu. |
| `name` | `text` | Tên hãng tàu. |
| `country` | `text nullable` | Quốc gia hoặc khu vực hãng tàu. |
| `is_active` | `boolean` | Còn được sử dụng trong nghiệp vụ hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `container_types`

**Bảng này lưu gì**

Lưu danh mục loại container để chuẩn hóa dữ liệu nhập tay và EDI.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính loại container. |
| `code` | `text unique` | Mã loại nội bộ, ví dụ `20GP`, `40HC`. |
| `name` | `text` | Tên hiển thị loại container. |
| `iso_code` | `text nullable` | Mã ISO container nếu cần dùng chuẩn quốc tế. |
| `length_ft` | `integer nullable` | Chiều dài container tính theo feet. |
| `description` | `text nullable` | Diễn giải thêm. |
| `is_active` | `boolean` | Còn được dùng hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `ports`

**Bảng này lưu gì**

Lưu danh sách cảng biển và cảng cạn.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính cảng. |
| `code` | `text unique` | Mã cảng. |
| `name` | `text` | Tên cảng. |
| `port_type` | `text` hoặc enum | Loại cảng. Giá trị khuyến nghị: `seaport`, `dryport`. |
| `address` | `text nullable` | Địa chỉ cảng. |
| `lat` | `numeric nullable` | Vĩ độ phục vụ bản đồ và geo rule. |
| `lng` | `numeric nullable` | Kinh độ phục vụ bản đồ và geo rule. |
| `is_active` | `boolean` | Cảng còn hoạt động trong hệ thống hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `yards`

**Bảng này lưu gì**

Lưu các bãi container thuộc từng cảng.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính bãi. |
| `port_id` | `uuid` | Tham chiếu đến cảng mà bãi này trực thuộc. |
| `code` | `text` | Mã bãi. |
| `name` | `text` | Tên bãi. |
| `description` | `text nullable` | Mô tả thêm về bãi. |
| `is_active` | `boolean` | Bãi còn được vận hành hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `yard_blocks`

**Bảng này lưu gì**

Lưu block trong từng bãi. Một bãi có nhiều block.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính block. |
| `yard_id` | `uuid` | Bãi mà block này thuộc về. |
| `code` | `text` | Mã block. |
| `name` | `text` | Tên hiển thị block. |
| `description` | `text nullable` | Mô tả thêm. |
| `is_active` | `boolean` | Block còn được sử dụng hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `yard_slots`

**Bảng này lưu gì**

Lưu vị trí slot cụ thể trong block. Đây là đơn vị nhỏ nhất để gán container vào bãi.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính slot. |
| `block_id` | `uuid` | Block mà slot này thuộc về. |
| `code` | `text` | Mã slot hiển thị trong nghiệp vụ. |
| `row_no` | `integer nullable` | Số hàng. |
| `bay_no` | `integer nullable` | Số bay nếu muốn quản lý theo mặt bằng bãi. |
| `tier_no` | `integer nullable` | Số tầng nếu cần quản lý chiều cao xếp chồng. |
| `max_weight_kg` | `numeric nullable` | Tải trọng tối đa slot chịu được. |
| `is_active` | `boolean` | Slot có còn được sử dụng không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `routes`

**Bảng này lưu gì**

Lưu tuyến vận chuyển chuẩn giữa cảng đi và cảng đến.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính tuyến. |
| `code` | `text unique` | Mã tuyến. |
| `name` | `text` | Tên tuyến. |
| `origin_port_id` | `uuid` | Cảng xuất phát của tuyến. |
| `destination_port_id` | `uuid` | Cảng đích của tuyến. |
| `standard_eta_hours` | `integer nullable` | Số giờ ETA chuẩn để tham chiếu tính ETA. |
| `distance_km` | `numeric nullable` | Quãng đường hoặc khoảng cách tham chiếu. |
| `is_active` | `boolean` | Tuyến còn được dùng trong nghiệp vụ hay không. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `route_checkpoints`

**Bảng này lưu gì**

Lưu các mốc chuẩn trên tuyến để dùng cho theo dõi hành trình, ETA và geofence.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính checkpoint. |
| `route_id` | `uuid` | Tuyến mà checkpoint này thuộc về. |
| `seq_no` | `integer` | Thứ tự checkpoint trên tuyến. |
| `name` | `text` | Tên checkpoint, ví dụ “ra cửa sông”, “điểm giữa tuyến”. |
| `lat` | `numeric` | Vĩ độ mốc. |
| `lng` | `numeric` | Kinh độ mốc. |
| `radius_m` | `integer nullable` | Bán kính geofence tính bằng mét. |
| `description` | `text nullable` | Mô tả bổ sung. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

---

## 4.3. Nhóm container và vị trí bãi

### Bảng `containers`

**Bảng này lưu gì**

Lưu thông tin container và trạng thái hiện tại của container. Đây là bảng trung tâm của toàn hệ thống.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính container. |
| `container_no` | `text unique` | Số container duy nhất, dùng để tra cứu chính. |
| `container_type_id` | `uuid` | Loại container. |
| `shipping_line_id` | `uuid nullable` | Hãng tàu của container. |
| `customer_id` | `uuid nullable` | Khách hàng sở hữu hoặc được phép theo dõi container. |
| `route_id` | `uuid nullable` | Tuyến vận chuyển dự kiến hoặc đang áp dụng cho container. |
| `current_status` | `text` hoặc enum | Trạng thái hiện tại. Giá trị khuyến nghị: `new`, `at_seaport_yard`, `on_barge`, `in_transit`, `at_dryport_yard`, `released`, `hold`. |
| `customs_status` | `text` hoặc enum | Trạng thái hải quan hiện tại. Giá trị khuyến nghị: `pending`, `cleared`, `hold`. |
| `current_port_id` | `uuid nullable` | Cảng hiện tại mà container đang nằm hoặc vừa được xác nhận tới. |
| `current_yard_id` | `uuid nullable` | Bãi hiện tại của container nếu container đang ở bãi. |
| `current_block_id` | `uuid nullable` | Block hiện tại của container nếu đang ở bãi. |
| `current_slot_id` | `uuid nullable` | Slot hiện tại mà container đang chiếm. Nếu container không ở bãi thì để `null`. |
| `current_voyage_id` | `uuid nullable` | Chuyến hiện tại mà container đang được gán vào. |
| `eta` | `timestamptz nullable` | Thời gian ETA dự kiến mới nhất của container. |
| `gross_weight_kg` | `numeric nullable` | Trọng lượng tổng của container. |
| `seal_no` | `text nullable` | Số seal. |
| `bill_no` | `text nullable` | Mã bill hoặc vận đơn liên quan. |
| `source_type` | `text` hoặc enum | Nguồn tạo container. Giá trị khuyến nghị: `manual`, `edi`. |
| `edi_batch_id` | `uuid nullable` | Batch EDI đã tạo ra container này, nếu có. |
| `last_event_at` | `timestamptz nullable` | Thời điểm sự kiện mới nhất của container. |
| `note` | `text nullable` | Ghi chú vận hành. |
| `created_at` | `timestamptz` | Thời điểm container được tạo trên hệ thống. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật gần nhất. |

**Ghi chú**

- Bảng này cố tình lưu `current_status`, `current_slot_id`, `current_voyage_id` để query nhanh.
- Không cần dựng lại trạng thái hiện tại từ toàn bộ event cho dashboard MVP.

### Bảng `container_events`

**Bảng này lưu gì**

Lưu toàn bộ timeline biến động của container. Đây là bảng audit nghiệp vụ quan trọng nhất sau `containers`.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính sự kiện. |
| `container_id` | `uuid` | Container mà sự kiện này thuộc về. |
| `event_type` | `text` hoặc enum | Loại sự kiện. Giá trị khuyến nghị: `created`, `edi_imported`, `yard_in`, `yard_move`, `yard_out`, `voyage_assigned`, `voyage_departed`, `checkpoint_updated`, `voyage_arrived`, `customs_changed`, `released`, `alert_created`. |
| `event_time` | `timestamptz` | Thời điểm sự kiện xảy ra. |
| `from_status` | `text nullable` | Trạng thái trước khi thay đổi. |
| `to_status` | `text nullable` | Trạng thái sau khi thay đổi. |
| `from_slot_id` | `uuid nullable` | Slot trước khi chuyển vị trí bãi. |
| `to_slot_id` | `uuid nullable` | Slot sau khi chuyển vị trí bãi. |
| `voyage_id` | `uuid nullable` | Chuyến liên quan nếu sự kiện gắn với hành trình. |
| `description` | `text nullable` | Mô tả sự kiện bằng ngôn ngữ dễ đọc cho UI timeline. |
| `source_type` | `text` hoặc enum | Nguồn phát sinh sự kiện. Giá trị khuyến nghị: `system`, `user`, `edi`, `gps`. |
| `actor_user_id` | `uuid nullable` | Người thao tác tạo ra sự kiện nếu có. |
| `metadata` | `jsonb nullable` | Dữ liệu mở rộng để lưu chi tiết nghiệp vụ mà chưa cần tách thêm cột. |
| `created_at` | `timestamptz` | Thời điểm record event được lưu vào DB. |

**Ghi chú**

- Nếu container chuyển slot thì ghi 1 event `yard_move`.
- Nếu container được gán lên chuyến thì ghi 1 event `voyage_assigned`.
- Nếu thay đổi customs thì ghi 1 event `customs_changed`.

---

## 4.4. Nhóm EDI

### Bảng `edi_batches`

**Bảng này lưu gì**

Lưu một đợt import EDI ở cấp file/batch.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính batch. |
| `batch_no` | `text unique` | Mã batch nghiệp vụ để tra cứu nhanh. |
| `file_name` | `text` | Tên file gốc mà user upload. |
| `file_path` | `text` | Đường dẫn file trong Supabase Storage. |
| `status` | `text` hoặc enum | Trạng thái batch. Giá trị khuyến nghị: `uploaded`, `validated`, `imported`, `partial`, `rejected`. |
| `total_rows` | `integer default 0` | Tổng số dòng parser đọc được từ file. |
| `success_rows` | `integer default 0` | Số dòng import thành công. |
| `error_rows` | `integer default 0` | Số dòng bị lỗi hoặc bị reject. |
| `uploaded_by` | `uuid nullable` | User upload file. |
| `uploaded_at` | `timestamptz nullable` | Thời điểm upload file. |
| `processed_at` | `timestamptz nullable` | Thời điểm hoàn tất validate/import. |
| `note` | `text nullable` | Ghi chú vận hành. |
| `created_at` | `timestamptz` | Thời điểm record batch được tạo. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật batch gần nhất. |

### Bảng `edi_batch_rows`

**Bảng này lưu gì**

Lưu từng dòng dữ liệu sau khi parse từ file EDI. Đây là nơi giữ preview, trạng thái validate và lỗi theo dòng.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính dòng import. |
| `batch_id` | `uuid` | Batch cha của dòng này. |
| `row_no` | `integer` | Số thứ tự dòng trong file hoặc trong kết quả parse. |
| `raw_data` | `jsonb` | Dữ liệu gốc sau parse, chưa normalize hoàn toàn. |
| `container_no` | `text nullable` | Số container đọc ra từ dòng EDI để hỗ trợ preview và tìm lỗi. |
| `validation_status` | `text` hoặc enum | Trạng thái validate. Giá trị khuyến nghị: `pending`, `valid`, `invalid`. |
| `import_status` | `text` hoặc enum | Trạng thái import. Giá trị khuyến nghị: `pending`, `imported`, `rejected`. |
| `error_message` | `text nullable` | Lý do lỗi nếu dòng bị invalid hoặc reject. |
| `imported_container_id` | `uuid nullable` | Container được tạo hoặc cập nhật từ dòng này, nếu import thành công. |
| `replay_count` | `integer default 0` | Số lần dòng này được thử import lại. |
| `created_at` | `timestamptz` | Thời điểm dòng được lưu vào DB. |
| `updated_at` | `timestamptz` | Thời điểm dòng được cập nhật gần nhất. |

**Ghi chú**

- Giai đoạn MVP không cần bảng lỗi riêng. Lỗi để ngay ở `error_message` là đủ.

---

## 4.5. Nhóm phương tiện và chuyến

### Bảng `vehicles`

**Bảng này lưu gì**

Lưu phương tiện vận chuyển. Theo scope hiện tại, trọng tâm là sà lan.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính phương tiện. |
| `code` | `text unique` | Mã nội bộ phương tiện. |
| `name` | `text` | Tên hiển thị phương tiện. |
| `vehicle_type` | `text` hoặc enum | Loại phương tiện. Giai đoạn này khuyến nghị dùng `barge`. |
| `registration_no` | `text nullable` | Số đăng ký hoặc biển số phương tiện. |
| `capacity_teu` | `integer nullable` | Sức chứa tính theo TEU. |
| `capacity_weight_kg` | `numeric nullable` | Sức chứa tối đa tính theo trọng lượng. |
| `status` | `text` hoặc enum | Trạng thái phương tiện. Giá trị khuyến nghị: `available`, `maintenance`, `in_use`. |
| `current_lat` | `numeric nullable` | Vị trí hiện tại của phương tiện trên bản đồ. |
| `current_lng` | `numeric nullable` | Vị trí hiện tại của phương tiện trên bản đồ. |
| `note` | `text nullable` | Ghi chú về phương tiện. |
| `created_at` | `timestamptz` | Thời điểm tạo record. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

### Bảng `voyages`

**Bảng này lưu gì**

Lưu từng chuyến vận chuyển của một phương tiện trên một tuyến cụ thể.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính chuyến. |
| `code` | `text unique` | Mã chuyến. |
| `vehicle_id` | `uuid` | Phương tiện thực hiện chuyến. |
| `route_id` | `uuid` | Tuyến mà chuyến đang chạy. |
| `status` | `text` hoặc enum | Trạng thái chuyến. Giá trị khuyến nghị: `draft`, `planned`, `loading`, `departed`, `arrived`, `cancelled`. |
| `etd` | `timestamptz nullable` | Thời gian dự kiến khởi hành. |
| `eta` | `timestamptz nullable` | Thời gian dự kiến đến. |
| `atd` | `timestamptz nullable` | Thời gian khởi hành thực tế. |
| `ata` | `timestamptz nullable` | Thời gian đến thực tế. |
| `current_checkpoint_id` | `uuid nullable` | Checkpoint gần nhất mà chuyến đã đi qua hoặc đang ở gần. |
| `current_lat` | `numeric nullable` | Vị trí hiện tại của chuyến. |
| `current_lng` | `numeric nullable` | Vị trí hiện tại của chuyến. |
| `note` | `text nullable` | Ghi chú vận hành của chuyến. |
| `created_at` | `timestamptz` | Thời điểm tạo chuyến. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật chuyến gần nhất. |

### Bảng `voyage_containers`

**Bảng này lưu gì**

Lưu manifest container của từng chuyến. Một chuyến có nhiều container, một container tại một thời điểm chỉ nên active trên một chuyến.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính item manifest. |
| `voyage_id` | `uuid` | Chuyến mà container được gán vào. |
| `container_id` | `uuid` | Container thuộc manifest. |
| `sequence_no` | `integer nullable` | Thứ tự xếp container trên manifest nếu cần. |
| `load_status` | `text` hoặc enum | Trạng thái trên chuyến. Giá trị khuyến nghị: `planned`, `loaded`, `unloaded`. |
| `loaded_at` | `timestamptz nullable` | Thời điểm container được xác nhận lên phương tiện. |
| `unloaded_at` | `timestamptz nullable` | Thời điểm container được xác nhận xuống phương tiện. |
| `note` | `text nullable` | Ghi chú nghiệp vụ. |
| `created_at` | `timestamptz` | Thời điểm gán container vào chuyến. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

**Ghi chú**

- Bảng này chính là manifest của chuyến.
- Nên có unique `(voyage_id, container_id)`.

### Bảng `voyage_checkpoints`

**Bảng này lưu gì**

Lưu lịch sử checkpoint thực tế mà chuyến đã đi qua.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính checkpoint thực tế. |
| `voyage_id` | `uuid` | Chuyến mà sự kiện checkpoint này thuộc về. |
| `checkpoint_id` | `uuid nullable` | Checkpoint chuẩn trên tuyến, nếu map được vào danh mục chuẩn. |
| `checkpoint_time` | `timestamptz` | Thời điểm ghi nhận checkpoint. |
| `lat` | `numeric nullable` | Vị trí thực tế lúc checkpoint. |
| `lng` | `numeric nullable` | Vị trí thực tế lúc checkpoint. |
| `note` | `text nullable` | Ghi chú của người vận hành hoặc hệ thống. |
| `created_at` | `timestamptz` | Thời điểm record được tạo. |

---

## 4.6. Nhóm tracking và realtime

### Bảng `tracking_positions`

**Bảng này lưu gì**

Lưu các điểm vị trí theo thời gian của phương tiện hoặc chuyến để hiển thị bản đồ và tính ETA/cảnh báo.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính vị trí tracking. |
| `vehicle_id` | `uuid` | Phương tiện phát sinh vị trí này. |
| `voyage_id` | `uuid nullable` | Chuyến đang chạy tại thời điểm nhận vị trí, nếu có. |
| `lat` | `numeric` | Vĩ độ. |
| `lng` | `numeric` | Kinh độ. |
| `speed` | `numeric nullable` | Tốc độ tại thời điểm ghi nhận. |
| `heading` | `numeric nullable` | Hướng di chuyển, nếu có. |
| `geofence_status` | `text` hoặc enum | Trạng thái liên quan geofence. Giá trị khuyến nghị: `normal`, `entered`, `exited`, `deviated`. |
| `source_type` | `text` hoặc enum | Nguồn vị trí. Giá trị khuyến nghị: `gps`, `manual`. |
| `recorded_at` | `timestamptz` | Thời điểm vị trí được ghi nhận. |
| `created_at` | `timestamptz` | Thời điểm record được ghi vào DB. |

**Ghi chú**

- Nếu chưa có GPS thật, vẫn dùng bảng này cho dữ liệu nhập tay hoặc giả lập.

---

## 4.7. Nhóm cảnh báo

### Bảng `alerts`

**Bảng này lưu gì**

Lưu các cảnh báo và sự cố phát sinh trong quá trình vận hành.

**Các trường**

| Trường | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `uuid` | Khóa chính cảnh báo. |
| `alert_type` | `text` hoặc enum | Loại cảnh báo. Giá trị khuyến nghị: `delay`, `hold`, `route_deviation`, `congestion`, `maintenance`, `weather`. |
| `severity` | `text` hoặc enum | Mức độ nghiêm trọng. Giá trị khuyến nghị: `info`, `warning`, `critical`. |
| `status` | `text` hoặc enum | Trạng thái xử lý cảnh báo. Giá trị khuyến nghị: `open`, `acknowledged`, `resolved`. |
| `container_id` | `uuid nullable` | Container liên quan nếu alert phát sinh từ container. |
| `voyage_id` | `uuid nullable` | Chuyến liên quan nếu alert phát sinh từ hành trình. |
| `vehicle_id` | `uuid nullable` | Phương tiện liên quan nếu alert phát sinh từ phương tiện. |
| `title` | `text` | Tiêu đề ngắn của cảnh báo. |
| `message` | `text` | Nội dung chi tiết của cảnh báo. |
| `triggered_at` | `timestamptz` | Thời điểm cảnh báo được tạo. |
| `acknowledged_by` | `uuid nullable` | User đã xác nhận cảnh báo. |
| `acknowledged_at` | `timestamptz nullable` | Thời điểm xác nhận cảnh báo. |
| `resolved_by` | `uuid nullable` | User đã xử lý xong cảnh báo. |
| `resolved_at` | `timestamptz nullable` | Thời điểm xử lý xong. |
| `resolution_note` | `text nullable` | Ghi chú cách xử lý hoặc kết luận sự cố. |
| `created_at` | `timestamptz` | Thời điểm record được tạo. |
| `updated_at` | `timestamptz` | Thời điểm cập nhật record. |

---

## 5. Quan hệ chính giữa các bảng

### 5.1. Quan hệ người dùng

- `profiles.port_id -> ports.id`
- `profiles.customer_id -> customers.id`

### 5.2. Quan hệ danh mục nền

- `yards.port_id -> ports.id`
- `yard_blocks.yard_id -> yards.id`
- `yard_slots.block_id -> yard_blocks.id`
- `routes.origin_port_id -> ports.id`
- `routes.destination_port_id -> ports.id`
- `route_checkpoints.route_id -> routes.id`

### 5.3. Quan hệ container

- `containers.container_type_id -> container_types.id`
- `containers.shipping_line_id -> shipping_lines.id`
- `containers.customer_id -> customers.id`
- `containers.route_id -> routes.id`
- `containers.current_port_id -> ports.id`
- `containers.current_yard_id -> yards.id`
- `containers.current_block_id -> yard_blocks.id`
- `containers.current_slot_id -> yard_slots.id`
- `containers.current_voyage_id -> voyages.id`
- `containers.edi_batch_id -> edi_batches.id`
- `container_events.container_id -> containers.id`
- `container_events.voyage_id -> voyages.id`

### 5.4. Quan hệ EDI

- `edi_batch_rows.batch_id -> edi_batches.id`
- `edi_batch_rows.imported_container_id -> containers.id`

### 5.5. Quan hệ chuyến

- `voyages.vehicle_id -> vehicles.id`
- `voyages.route_id -> routes.id`
- `voyages.current_checkpoint_id -> route_checkpoints.id`
- `voyage_containers.voyage_id -> voyages.id`
- `voyage_containers.container_id -> containers.id`
- `voyage_checkpoints.voyage_id -> voyages.id`
- `voyage_checkpoints.checkpoint_id -> route_checkpoints.id`

### 5.6. Quan hệ tracking và alert

- `tracking_positions.vehicle_id -> vehicles.id`
- `tracking_positions.voyage_id -> voyages.id`
- `alerts.container_id -> containers.id`
- `alerts.voyage_id -> voyages.id`
- `alerts.vehicle_id -> vehicles.id`

## 6. Enum khuyến nghị

### 6.1. `profiles.role`

- `admin`
- `seaport_staff`
- `dryport_staff`
- `customer`

### 6.2. `ports.port_type`

- `seaport`
- `dryport`

### 6.3. `containers.current_status`

- `new`
- `at_seaport_yard`
- `on_barge`
- `in_transit`
- `at_dryport_yard`
- `released`
- `hold`

### 6.4. `containers.customs_status`

- `pending`
- `cleared`
- `hold`

### 6.5. `containers.source_type`

- `manual`
- `edi`

### 6.6. `container_events.event_type`

- `created`
- `edi_imported`
- `yard_in`
- `yard_move`
- `yard_out`
- `voyage_assigned`
- `voyage_departed`
- `checkpoint_updated`
- `voyage_arrived`
- `customs_changed`
- `released`
- `alert_created`

### 6.7. `container_events.source_type`

- `system`
- `user`
- `edi`
- `gps`

### 6.8. `edi_batches.status`

- `uploaded`
- `validated`
- `imported`
- `partial`
- `rejected`

### 6.9. `edi_batch_rows.validation_status`

- `pending`
- `valid`
- `invalid`

### 6.10. `edi_batch_rows.import_status`

- `pending`
- `imported`
- `rejected`

### 6.11. `vehicles.vehicle_type`

- `barge`

### 6.12. `vehicles.status`

- `available`
- `maintenance`
- `in_use`

### 6.13. `voyages.status`

- `draft`
- `planned`
- `loading`
- `departed`
- `arrived`
- `cancelled`

### 6.14. `voyage_containers.load_status`

- `planned`
- `loaded`
- `unloaded`

### 6.15. `tracking_positions.geofence_status`

- `normal`
- `entered`
- `exited`
- `deviated`

### 6.16. `tracking_positions.source_type`

- `gps`
- `manual`

### 6.17. `alerts.alert_type`

- `delay`
- `hold`
- `route_deviation`
- `congestion`
- `maintenance`
- `weather`

### 6.18. `alerts.severity`

- `info`
- `warning`
- `critical`

### 6.19. `alerts.status`

- `open`
- `acknowledged`
- `resolved`

## 7. Index khuyến nghị

### 7.1. Bảng `containers`

Nên có các index sau:

- unique index cho `container_no`
- index cho `customer_id`
- index cho `shipping_line_id`
- index cho `current_status`
- index cho `customs_status`
- index cho `current_port_id`
- index cho `current_slot_id`
- index cho `current_voyage_id`
- index cho `eta`

### 7.2. Unique slot occupancy bằng chính bảng `containers`

Do không dùng bảng occupancy riêng, nên dùng unique index có điều kiện trên `current_slot_id`.

Ý tưởng:

- mỗi `current_slot_id` chỉ được xuất hiện 1 lần với container đang thực sự nằm trong bãi

Điều kiện khuyến nghị:

- `current_slot_id is not null`

Như vậy:

- container đã lên sà lan hoặc đã release bắt buộc phải được set `current_slot_id = null`
- nếu dữ liệu nghiệp vụ sai và vẫn còn giữ slot thì index sẽ chặn không cho slot đó bị dùng trùng
- không cần bảng `yard_slot_occupancies`

### 7.3. Bảng `container_events`

- index `(container_id, event_time desc)`
- index `event_type`
- index `voyage_id`

### 7.4. Bảng `edi_batch_rows`

- index `batch_id`
- index `(batch_id, row_no)`
- index `container_no`
- index `validation_status`
- index `import_status`

### 7.5. Bảng `voyage_containers`

- unique index `(voyage_id, container_id)`
- unique partial index trên `container_id` với các trạng thái active như `planned`, `loaded`
- index `container_id`
- index `load_status`

### 7.6. Bảng `tracking_positions`

- index `(vehicle_id, recorded_at desc)`
- index `(voyage_id, recorded_at desc)`

### 7.7. Bảng `alerts`

- index `status`
- index `alert_type`
- index `severity`
- index `container_id`
- index `voyage_id`
- index `vehicle_id`
- index `triggered_at desc`

## 8. Rule nghiệp vụ quan trọng cần enforce

### Rule 1: Container không được chiếm 2 slot cùng lúc

Thực hiện bằng:

- chỉ có 1 `current_slot_id` trên `containers`
- unique index có điều kiện trên `current_slot_id`

### Rule 2: Muốn gán container lên chuyến thì phải có phương tiện và chuyến trước

Luồng đúng:

1. tạo `vehicles`
2. tạo `voyages`
3. tạo `voyage_containers`
4. cập nhật `containers.current_voyage_id`

### Rule 3: Khi container lên chuyến thì phải giải phóng slot

Khi xác nhận container đã lên sà lan:

- `containers.current_slot_id = null`
- `containers.current_status = 'on_barge'` hoặc `in_transit`
- ghi `container_events`

### Rule 4: Mọi thay đổi quan trọng phải ghi timeline

Các hành động sau phải tạo record trong `container_events`:

- tạo container
- import từ EDI
- nhập bãi
- chuyển slot
- xuất bãi
- gán lên chuyến
- khởi hành
- đến checkpoint
- đến cảng đích
- đổi trạng thái hải quan
- release container

### Rule 5: Customer chỉ được xem container của mình

Thực hiện bằng:

- `profiles.customer_id`
- `containers.customer_id`
- Supabase RLS ở các bảng customer-facing

## 9. Gợi ý RLS với Supabase

### 9.1. User nội bộ

Các bảng nghiệp vụ chính nên thao tác ghi qua server-side logic:

- Server Actions
- Route Handlers

Lý do:

- Dễ kiểm soát nghiệp vụ hơn
- Dễ kiểm tra quyền theo vai trò hơn
- Dễ enforce các rule như chuyển slot, lên chuyến, resolve alert

### 9.2. Customer portal

Customer chỉ nên có quyền đọc các bảng liên quan:

- `containers`
- `container_events`
- có thể thêm `voyages` ở mức giới hạn nếu cần hiển thị ETA

Điều kiện logic:

- user đăng nhập có `profiles.role = 'customer'`
- chỉ được thấy record mà `containers.customer_id = profiles.customer_id`

## 10. Thứ tự tạo schema khi triển khai

Nên tạo theo thứ tự:

1. `customers`
2. `shipping_lines`
3. `container_types`
4. `ports`
5. `yards`
6. `yard_blocks`
7. `yard_slots`
8. `routes`
9. `route_checkpoints`
10. `profiles`
11. `vehicles`
12. `voyages`
13. `edi_batches`
14. `containers`
15. `edi_batch_rows`
16. `voyage_containers`
17. `voyage_checkpoints`
18. `tracking_positions`
19. `alerts`
20. `container_events`

## 11. Kết luận

Thiết kế này đủ gọn cho MVP nhưng vẫn giữ được các điểm quan trọng:

- Có trạng thái hiện tại để query nhanh
- Có timeline đầy đủ để tra cứu lịch sử
- Có luồng EDI rõ ràng theo batch và row
- Có luồng phương tiện -> chuyến -> manifest đúng nghiệp vụ
- Có dữ liệu cho tracking, ETA và cảnh báo
- Có nền tảng để triển khai customer portal với Supabase RLS

Đây là baseline schema nên dùng cho giai đoạn triển khai đầu tiên trên `Vercel + Supabase`.
