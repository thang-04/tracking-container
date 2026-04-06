import { AuthCard } from "@/components/auth/auth-card"
import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { redirectAuthenticatedUser } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser()

  return (
    <AuthShell
      eyebrow="Khôi phục truy cập"
      title="Đặt lại mật khẩu"
      description=""
      compact
    >
      <AuthCard eyebrow="Quên mật khẩu" title="Gửi liên kết đặt lại" description="">
        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  )
}
