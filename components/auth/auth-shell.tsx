import { ShipWheel, ShieldCheck, Waves, Waypoints } from "lucide-react"

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}

const statusCards = [
  {
    title: "Điều phối nội bộ",
    description: "Nhân sự cảng biển và cảng cạn đi vào đúng khu vận hành sau đăng nhập.",
    icon: ShieldCheck,
  },
  {
    title: "Portal khách hàng",
    description: "Khách hàng được đưa thẳng tới khu tra cứu container được ủy quyền.",
    icon: Waypoints,
  },
  {
    title: "Theo dõi tuyến sà lan",
    description: "ETA, checkpoints và trạng thái container được đồng bộ trên một nền truy cập.",
    icon: Waves,
  },
]

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,oklch(0.11_0.03_245),oklch(0.09_0.03_240))] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(88,176,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(61,161,138,0.14),transparent_32%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:3rem_3rem]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_minmax(440px,0.9fr)]">
        <section className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="space-y-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/75">
              <ShipWheel className="h-4 w-4" />
              Tracking Container Access
            </div>

            <div className="max-w-2xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-sky-200/60">
                {eyebrow}
              </p>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] text-white xl:text-6xl">
                {title}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                {description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2rem] border border-sky-200/12 bg-sky-300/8 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/60">
                  Mission Control
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
                    <span>Điều hướng sau login</span>
                    <span>Theo role</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-200/12 bg-emerald-300/8 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/60">
                  Delivery Stack
                </p>
                <div className="mt-10 space-y-3 text-sm leading-6 text-slate-200">
                  <p>Next.js 16</p>
                  <p>Supabase Auth SSR</p>
                  <p>Prisma profiles guard</p>
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
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-100/60">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {description}
              </p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </div>
  )
}
