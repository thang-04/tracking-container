import { AuthCard } from "@/components/auth/auth-card"
import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { redirectAuthenticatedUser } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser()

  return (
    <AuthShell
      eyebrow="Password Recovery"
      title="Khôi phục quyền truy cập mà không làm vỡ luồng vận hành."
      description="Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi liên kết đặt lại mật khẩu tới đúng địa chỉ đã đăng ký."
    >
      <AuthCard
        eyebrow="Quên mật khẩu"
        title="Gửi liên kết đặt lại"
        description="Nhập email đã được cấp quyền để nhận hướng dẫn khôi phục truy cập."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  )
}
