"use client"

import { useMemo, useState } from "react"
import { Building2, Search, Shield, UserPlus, Users, Warehouse } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  buildUserDirectoryStats,
  filterUserDirectoryItems,
  getUserRoleMeta,
  getUserStatusMeta,
  type UserDirectoryFilterRole,
  type UserDirectoryFilterStatus,
  type UserDirectoryItem,
} from "@/lib/users/user-view-model"

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function StatCard(props: {
  icon: typeof Users
  title: string
  value: number
}) {
  const Icon = props.icon

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{props.value}</p>
            <p className="text-sm text-muted-foreground">{props.title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UsersPageClient({ users }: { users: UserDirectoryItem[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserDirectoryFilterRole>("all")
  const [statusFilter, setStatusFilter] = useState<UserDirectoryFilterStatus>("all")

  const stats = useMemo(() => buildUserDirectoryStats(users), [users])
  const filteredUsers = useMemo(
    () =>
      filterUserDirectoryItems(users, {
        searchTerm,
        role: roleFilter,
        status: statusFilter,
      }),
    [users, searchTerm, roleFilter, statusFilter],
  )

  return (
    <DashboardLayout
      title="Quản lý người dùng"
      description="Danh sách tài khoản đang được cấp quyền trong hệ thống"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={Users} title="Tổng người dùng" value={stats.total} />
          <StatCard icon={Shield} title="Quản trị viên" value={stats.admins} />
          <StatCard icon={Building2} title="Nhân viên cảng biển" value={stats.seaportStaff} />
          <StatCard icon={Warehouse} title="Nhân viên cảng cạn" value={stats.dryportStaff} />
          <StatCard icon={Users} title="Khách hàng" value={stats.customers} />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Danh sách người dùng</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tạo, sửa và xóa tài khoản sẽ được mở khi nối đầy đủ flow Supabase Auth phía quản trị.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-full bg-secondary pl-9 md:w-64"
                    placeholder="Tìm theo tên, email, phạm vi..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as UserDirectoryFilterRole)}
                >
                  <SelectTrigger className="w-full md:w-52">
                    <SelectValue placeholder="Vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="seaport_staff">Nhân viên cảng biển</SelectItem>
                    <SelectItem value="dryport_staff">Nhân viên cảng cạn</SelectItem>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as UserDirectoryFilterStatus)}
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled>
                  <UserPlus className="mr-2 size-4" />
                  Thêm người dùng
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <Empty className="border border-dashed border-border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có người dùng trong bảng `profiles`</EmptyTitle>
                  <EmptyDescription>
                    Khi Supabase đã có tài khoản và bản ghi `profiles`, danh sách người dùng sẽ hiển thị tại đây.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : filteredUsers.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Không có người dùng phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Phạm vi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Đăng nhập cuối</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const roleMeta = getUserRoleMeta(user.role)
                        const statusMeta = getUserStatusMeta(user.isActive)

                        return (
                          <TableRow key={user.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(user.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">{user.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                  {user.phone ? (
                                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                                  ) : null}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("border-transparent", roleMeta.className)}>
                                {roleMeta.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.scopeLabel}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("border-transparent", statusMeta.className)}>
                                {statusMeta.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.lastLoginAtLabel}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="pt-4 text-sm text-muted-foreground">
                  Hiển thị {filteredUsers.length} trong {users.length} người dùng.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
