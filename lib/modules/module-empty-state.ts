export type UnsupportedModuleKey =
  | "customs"
  | "settings"
  | "simulation"
  | "ahp"

export type UnsupportedModuleState = {
  title: string
  description: string
  reason: string
}

const MODULE_EMPTY_STATES: Record<UnsupportedModuleKey, UnsupportedModuleState> = {
  customs: {
    title: "Module hải quan chưa có dữ liệu vận hành",
    description:
      "Repo hiện chưa có bảng hồ sơ hải quan riêng trong schema Supabase/Postgres nên màn này không còn hiển thị dữ liệu mẫu.",
    reason:
      "Cần bổ sung backend và schema customs trước khi mở lại danh sách tờ khai, thống kê và hành động nghiệp vụ.",
  },
  settings: {
    title: "Module cài đặt chưa nối backend cấu hình",
    description:
      "Các form cấu hình trước đây chỉ là mock UI. Pha này đã bỏ toàn bộ giá trị hardcode để tránh hiểu nhầm rằng cấu hình đang được lưu thật.",
    reason:
      "Cần có bảng settings và cơ chế ghi/đọc cấu hình server-side trước khi bật lại biểu mẫu.",
  },
  simulation: {
    title: "Module mô phỏng đang chờ engine thực",
    description:
      "Các kết quả mô phỏng và biểu đồ cũ chỉ là dữ liệu giả nên đã được gỡ bỏ khỏi UI.",
    reason:
      "Cần định nghĩa thuật toán, dữ liệu đầu vào và backend tính toán trước khi bật lại màn này.",
  },
  ahp: {
    title: "Module AHP đang chờ mô hình quyết định thật",
    description:
      "Ma trận so sánh và kết quả xếp hạng trước đây không lấy từ backend hay bộ tính toán thật.",
    reason:
      "Cần có rule nghiệp vụ và engine AHP thật trước khi hiển thị lại phân tích quyết định.",
  },
}

export function getUnsupportedModuleState(module: UnsupportedModuleKey) {
  return MODULE_EMPTY_STATES[module]
}
