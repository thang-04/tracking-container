import { AuthCard } from "@/components/auth/auth-card"
import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const dynamic = "force-dynamic"

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery Session"
      title="Thiết lập lại mật khẩu và quay lại đúng luồng làm việc."
      description="Liên kết từ email sẽ tạo phiên recovery tạm thời để bạn cập nhật mật khẩu an toàn."
    >
      <AuthCard
        eyebrow="Đặt lại mật khẩu"
        title="Tạo mật khẩu mới"
        description="Mật khẩu mới sẽ được áp dụng ngay cho tài khoản đã xác minh từ email recovery."
      >
        <ResetPasswordForm />
      </AuthCard>
    </AuthShell>
  )
}
