"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  Grid3X3,
  MapPin,
  Moon,
  Package,
  Search,
  Settings,
  Sun,
  Truck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface AppHeaderProps {
  title: string
  description?: string
}

const quickAccessSections = [
  {
    label: "Vận hành chính",
    items: [
      { label: "Container", href: "/containers", icon: Package },
      { label: "Quản lý bãi", href: "/yard", icon: Grid3X3 },
      { label: "Vận chuyển", href: "/transport", icon: Truck },
      { label: "Bản đồ", href: "/map", icon: MapPin },
      { label: "Cảnh báo", href: "/alerts", icon: AlertTriangle },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { label: "Người dùng", href: "/users", icon: Users },
      { label: "Cài đặt", href: "/settings", icon: Settings },
    ],
  },
] as const

export function AppHeader({ title, description }: AppHeaderProps) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement

    if (html.classList.contains("dark")) {
      html.classList.remove("dark")
      setIsDark(false)
      return
    }

    html.classList.add("dark")
    setIsDark(true)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm container, bill, seal, khách hàng..."
            className="h-9 w-72 bg-secondary pl-9 pr-3 xl:w-80"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3 shadow-none">
              <Package className="h-4 w-4" />
              <span className="hidden xl:inline">Truy cập nhanh</span>
              <span className="xl:hidden">Nhanh</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1">
            {quickAccessSections.map((section, index) => (
              <div key={section.label}>
                {index > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {section.label}
                </DropdownMenuLabel>
                {section.items.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    asChild
                    className="h-8 gap-2 rounded-md px-2 text-sm"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
