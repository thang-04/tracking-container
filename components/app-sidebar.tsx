"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js"
import {
  AlertTriangle,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Truck,
  Users,
} from "lucide-react"

import { signOutAction } from "@/app/actions/auth"
import { ProjectLogo } from "@/components/project-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  isLocalAuthMockEnabled,
  readLocalAuthSessionFromCookieHeader,
} from "@/lib/auth/mock-auth"
import { createClient } from "@/lib/supabase/client"
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

function formatDisplayName(email: string | null) {
  if (!email) {
    return "Tài khoản nội bộ"
  }

  const localPart = email.split("@")[0]?.trim() ?? ""

  if (!localPart) {
    return "Tài khoản nội bộ"
  }

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getInitials(value: string) {
  const initials = value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "TK"
}

export function AppSidebar() {
  const pathname = usePathname()
  const mockMode = isLocalAuthMockEnabled()
  const [mounted, setMounted] = useState(false)
  const [account, setAccount] = useState<{
    email: string | null
    fullName: string | null
  }>({
    email: null,
    fullName: null,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mockMode) {
      const session = readLocalAuthSessionFromCookieHeader(document.cookie)

      setAccount({
        email: session?.email ?? null,
        fullName: session?.fullName ?? null,
      })

      return
    }

    const supabase = createClient()
    let active = true

    const syncAccount = (nextEmail: string | null) => {
      if (active) {
        setAccount({
          email: nextEmail,
          fullName: null,
        })
      }
    }

    supabase.auth.getUser().then((result: UserResponse) => {
      syncAccount(result.data.user?.email ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        syncAccount(session?.user?.email ?? null)
      },
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [mockMode])

  const accountName = account.fullName ?? formatDisplayName(account.email)
  const accountInitials = getInitials(accountName)

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="block">
          <ProjectLogo className="h-24 w-full" priority />
        </Link>
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
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <form id="sidebar-signout-form" action={signOutAction} />

        {!mounted ? (
          <div className="flex w-full items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2 opacity-50">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-2 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-left transition-colors hover:bg-sidebar-accent/80"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                    {accountInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-sidebar-foreground">
                    {accountName}
                  </span>
                  <span className="block truncate text-xs text-sidebar-foreground/60">
                    {account.email ?? "Mở menu tài khoản"}
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-64">
              <DropdownMenuLabel className="space-y-1">
                <div className="text-sm font-medium">{accountName}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {account.email ?? "Phiên nội bộ đang hoạt động"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild variant="destructive">
                <button type="submit" form="sidebar-signout-form" className="w-full">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  )
}