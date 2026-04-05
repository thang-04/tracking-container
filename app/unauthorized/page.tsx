import Link from "next/link"

import { signOutAction } from "@/app/actions/auth"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { getCurrentAuthContext } from "@/lib/auth/server"
import { getDefaultPathForRole } from "@/lib/auth/routing"

type UnauthorizedPageProps = {
  searchParams: Promise<{
    reason?: string
  }>
}

const reasonCopy: Record<string, { title: string; description: string }> = {
  "missing-profile": {
    title: "Tài khoản chưa có hồ sơ nghiệp vụ",
    description:
      "Bạn đã xác thực thành công nhưng tài khoản này chưa được gắn hồ sơ quyền truy cập trong hệ thống.",
  },
  inactive: {
    title: "Tài khoản đã bị tạm ngưng",
    description:
      "Tài khoản của bạn hiện không ở trạng thái hoạt động. Hãy liên hệ quản trị viên để được hỗ trợ.",
  },
  session: {
    title: "Phiên đăng nhập chưa được xác minh",
    description:
      "Hệ thống không thể xác minh đầy đủ phiên đăng nhập vừa tạo. Vui lòng đăng nhập lại.",
  },
}

export const dynamic = "force-dynamic"

export default async function UnauthorizedPage({
  searchParams,
}: UnauthorizedPageProps) {
  const params = await searchParams
  const auth = await getCurrentAuthContext()

  const copy = params.reason
    ? reasonCopy[params.reason] ??
      {
        title: "Không có quyền truy cập khu vực này",
        description:
          "Tài khoản của bạn không được cấp quyền vào khu vực đang truy cập. Hãy quay lại đúng không gian làm việc hoặc đăng xuất.",
      }
    : {
        title: "Không có quyền truy cập khu vực này",
        description:
          "Tài khoản của bạn không được cấp quyền vào khu vực đang truy cập. Hãy quay lại đúng không gian làm việc hoặc đăng xuất.",
      }

  const fallbackPath =
    auth?.profile && auth.profile.isActive
      ? getDefaultPathForRole(auth.profile.role)
      : "/login"

  return (
    <AuthShell
      eyebrow="Access Control"
      title="Xác thực thành công không đồng nghĩa với được phép vào mọi khu vực."
      description="Quyền truy cập được xác định theo hồ sơ nghiệp vụ và ranh giới giữa vận hành nội bộ với customer portal."
    >
      <AuthCard
        eyebrow="Không có quyền"
        title={copy.title}
        description={copy.description}
      >
        <div className="space-y-4">
          {auth?.profile && auth.profile.isActive && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
              Tài khoản hiện tại thuộc vai trò{" "}
              <span className="font-semibold text-white">{auth.profile.role}</span>.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 flex-1 rounded-xl bg-sky-200 text-slate-950 hover:bg-sky-100"
            >
              <Link href={fallbackPath}>Đi tới khu vực phù hợp</Link>
            </Button>

            <form action={signOutAction} className="flex-1">
              <Button
                type="submit"
                variant="outline"
                className="h-11 w-full rounded-xl border-white/10 bg-transparent text-slate-100 hover:bg-white/5"
              >
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </AuthCard>
    </AuthShell>
  )
}
