import { cn } from "@/lib/utils"

type AuthCardProps = {
  eyebrow: string
  title: string
  description: string
  className?: string
  children: React.ReactNode
}

export function AuthCard({
  eyebrow,
  title,
  description,
  className,
  children,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-slate-950/88 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-sm sm:p-8",
        className,
      )}
    >
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/70">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          {description.trim() ? (
            <p className="max-w-md text-sm leading-6 text-slate-300">{description}</p>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  )
}
