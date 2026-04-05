import { AuthCard } from "@/components/auth/auth-card"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { redirectAuthenticatedUser } from "@/lib/auth/server"

type LoginPageProps = {
  searchParams: Promise<{
    next?: string
    reset?: string
  }>
}

export const dynamic = "force-dynamic"

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  await redirectAuthenticatedUser(params.next)

  return (
    <AuthShell
      eyebrow="Mission Control Login"
      title="Một cổng truy cập cho toàn bộ điều phối container đường thủy."
      description="Đăng nhập bằng email đã được cấp quyền. Hệ thống sẽ tự đưa bạn vào khu nội bộ hoặc customer portal theo hồ sơ nghiệp vụ."
    >
      <AuthCard
        eyebrow="Đăng nhập hệ thống"
        title="Truy cập Tracking Container"
        description="Dùng email công việc hoặc email khách hàng đã được cấp quyền trong hệ thống."
      >
        {params.reset === "success" && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-slate-200">
            Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại bằng mật khẩu mới.
          </div>
        )}

        <LoginForm returnTo={params.next} />
      </AuthCard>
    </AuthShell>
  )
}
