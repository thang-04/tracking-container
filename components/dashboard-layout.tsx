"use client"

import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <AppHeader title={title} description={description} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
