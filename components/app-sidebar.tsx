"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPin,
  AlertTriangle,
  Settings,
  Users,
  FileText,
  Ship,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Bảng điều khiển", href: "/", icon: LayoutDashboard },
  { name: "Container", href: "/containers", icon: Package },
  { name: "Vận chuyển", href: "/transport", icon: Truck },
  { name: "Bản đồ", href: "/map", icon: MapPin },
  { name: "Cảnh báo", href: "/alerts", icon: AlertTriangle },
  { name: "Hoạt động hải quan", href: "/customs", icon: FileText },
  { name: "Người dùng", href: "/users", icon: Users },
  { name: "Cài đặt", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Ship className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">tracking-container</span>
          <span className="text-xs text-sidebar-foreground/60">Hệ thống hỗ trợ quyết định</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">Quản trị viên</span>
            <span className="text-xs text-sidebar-foreground/60">admin@tracking-container.vn</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
