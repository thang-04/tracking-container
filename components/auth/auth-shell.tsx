import { ShieldCheck, Waves, Waypoints } from "lucide-react"

import { ProjectLogo } from "@/components/project-logo"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  compact?: boolean
  showHighlights?: boolean
  children: React.ReactNode
}

const statusCards = [
  {
    title: "Điều phối nội bộ",
    description:
      "Hỗ trợ nhân sự cảng quản lý và điều phối hoạt động khai thác thông qua các phân hệ như sản lượng, container và quản lý bãi.",
    icon: ShieldCheck,
  },
  {
    title: "Quản lý bãi & container",
    description:
      "Theo dõi vị trí, trạng thái container trong bãi; tối ưu sắp xếp và hỗ trợ tra cứu phục vụ vận hành.",
    icon: Waypoints,
  },
  {
    title: "Quản lý vận tải sà lan",
    description:
      "Quản lý kế hoạch và theo dõi hành trình sà lan, cập nhật tiến độ vận chuyển và liên kết với hoạt động bãi.",
    icon: Waves,
  },
]

export function AuthShell({
  eyebrow,
  title,
  description,
  compact = false,
  showHighlights = false,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,oklch(0.11_0.03_245),oklch(0.09_0.03_240))] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(88,176,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(61,161,138,0.14),transparent_32%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:3rem_3rem]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_minmax(440px,0.9fr)]">
        <section
          className={cn(
            "hidden px-10 py-12 lg:flex xl:px-16",
            compact ? "lg:items-center lg:justify-center" : "lg:flex-col lg:justify-between",
          )}
        >
          <div className={cn("space-y-8", compact && showHighlights ? "w-full" : compact && "max-w-xl")}>
            <div className={cn("space-y-4", compact && showHighlights && "mx-auto flex max-w-2xl flex-col items-center text-center")}>
              <ProjectLogo
                align={compact && showHighlights ? "center" : "left"}
                className="h-28 w-full max-w-[21rem]"
                priority
              />
              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/75">
                {compact ? eyebrow : "Cổng truy cập điều phối"}
              </div>
            </div>

            <div
              className={cn(
                "mx-auto w-full space-y-6 text-center px-6",
                compact ? "max-w-3xl" : "max-w-7xl"
              )}
            >
              {!compact && (
                <p className="text-xs font-semibold uppercase tracking-[0.42em] text-sky-200/60">
                  {eyebrow}
                </p>
              )}

              <h1
                className={cn(
                  "mx-auto font-semibold leading-[1.05] text-white",
                  compact ? "max-w-3xl text-2xl xl:text-3xl" : "max-w-5xl text-4xl xl:text-6xl"
                )}
              >
                {title}
              </h1>

              <p
                className={cn(
                  "mx-auto text-slate-300",
                  compact ? "max-w-2xl text-base leading-7" : "max-w-4xl text-lg leading-8"
                )}
              >
                {description.trim() ? description : null}
              </p>
            </div>

            {compact && showHighlights && (
              <div className="w-full">
                <div className="grid gap-4 md:grid-cols-3">
                  {statusCards.map(({ title, description, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-4"
                    >
                      <Icon className="h-4 w-4 text-sky-200" />
                      <h2 className="mt-4 text-[0.98rem] font-semibold text-white">{title}</h2>
                      <p className="mt-2 text-xs leading-5 text-slate-300">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!compact && (
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[2rem] border border-sky-200/12 bg-sky-300/8 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/60">
                    Trung tâm điều phối
                  </p>
                  <div className="mt-10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/8 pb-3 text-sm text-slate-200">
                      <span>Luồng truy cập</span>
                      <span>1 cổng chung</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/8 pb-3 text-sm text-slate-200">
                      <span>Xác thực</span>
                      <span>Email + mật khẩu</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <span>Điều hướng sau đăng nhập</span>
                      <span>Theo role</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-emerald-200/12 bg-emerald-300/8 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/60">
                    Nền tảng triển khai
                  </p>
                  <div className="mt-10 space-y-3 text-sm leading-6 text-slate-200">
                    <p>Next.js 16</p>
                    <p>Xác thực SSR bằng Supabase</p>
                    <p>Kiểm tra hồ sơ bằng Prisma</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {statusCards.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-5"
                  >
                    <Icon className="h-5 w-5 text-sky-200" />
                    <h2 className="mt-6 text-base font-semibold text-white">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 lg:hidden">
              <ProjectLogo className="h-24 w-full max-w-[18rem]" priority />
              {!compact && (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-sky-100/60">
                  {eyebrow}
                </p>
              )}
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white">{title}</h1>
              {description.trim() ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
              ) : null}
            </div>

            {children}
          </div>
        </section>
      </div>
    </div>
  )
}
