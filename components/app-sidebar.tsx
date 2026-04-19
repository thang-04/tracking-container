"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js"
import {
  AlertTriangle,
  BarChart2,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  Ship,
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  isLocalAuthMockEnabled,
  readLocalAuthSessionFromCookieHeader,
} from "@/lib/auth/mock-auth"
import { createClient } from "@/lib/supabase/client"

type NavigationItem = {
  name: string
  href: string
  icon: any
  items?: { name: string; href: string }[]
}

const navigation: NavigationItem[] = [
  { name: "Bảng điều khiển", href: "/", icon: LayoutDashboard },
  { name: "Sản lượng", href: "/throughput/overview", icon: BarChart2 },
  { name: "Container", href: "/containers", icon: Package },
  { name: "Quản lý bãi", href: "/yard", icon: Grid3X3 },
  { name: "Quản Lý Chuyến Sà Lan", href: "/transport", icon: Ship },
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

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4 group-data-[collapsible=icon]:p-2">
        <Link
          href="/"
          className="block rounded-lg transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
        >
          <div className="w-full group-data-[collapsible=icon]:hidden">
            <ProjectLogo className="h-24 w-full" priority />
          </div>
          <div className="hidden h-11 w-11 items-center justify-center rounded-lg bg-sidebar-accent text-sm font-semibold text-sidebar-primary group-data-[collapsible=icon]:flex">
            TC
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarMenu>
          {navigation.filter((item) => item.href !== "/").map((item) => {
            const isActive = isActiveRoute(pathname, item.href)

            if (item.items && item.items.length > 0) {
              return (
                <Collapsible
                  key={item.name}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.name} className="h-10 rounded-lg px-3" isActive={isActive}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.name}>
                            <SidebarMenuSubButton asChild isActive={isActiveRoute(pathname, subItem.href)}>
                              <Link href={subItem.href}>
                                <span>{subItem.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className="h-10 rounded-lg px-3"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <form id="sidebar-signout-form" action={signOutAction} />

        {!mounted ? (
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/50 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2 group-data-[collapsible=icon]:hidden">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-2 w-28 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                    {accountInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <span className="block truncate text-sm font-medium text-sidebar-foreground">
                    {accountName}
                  </span>
                  <span className="block truncate text-xs text-sidebar-foreground/60">
                    {account.email ?? "Mở menu tài khoản"}
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
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
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
