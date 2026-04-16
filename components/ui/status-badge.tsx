import { cn } from "@/lib/utils"

type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"
  | "planned"
  | "inbound"
  | "arrived"
  | "discharging"
  | "completed"
  | "delayed"
  | "hold"
  | "cleared"
  | "pending"
  | "expected"
  | "in-transit"
  | "yarded"
  | "released"

interface StatusBadgeProps {
  status: StatusType
  children: React.ReactNode
  className?: string
  size?: "sm" | "md"
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-success/20 text-success border-success/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  error: "bg-destructive/20 text-destructive border-destructive/30",
  info: "bg-info/20 text-info border-info/30",
  default: "bg-muted text-muted-foreground border-border",
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  inbound: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  arrived: "bg-green-500/20 text-green-400 border-green-500/30",
  discharging: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  delayed: "bg-red-500/20 text-red-400 border-red-500/30",
  hold: "bg-red-500/20 text-red-400 border-red-500/30",
  cleared: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  expected: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "in-transit": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yarded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  released: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}

export function StatusBadge({ status, children, className, size = "sm" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-md",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  )
}
