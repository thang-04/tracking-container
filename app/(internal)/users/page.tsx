"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Truck,
  Settings,
  Edit,
  Trash2,
  Mail,
  Phone,
} from "lucide-react"

type UserRole = "admin" | "operator" | "transporter"
type UserStatus = "active" | "inactive" | "pending"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  department: string
  lastActive: string
  avatar?: string
}

const usersData: User[] = [
  {
    id: "1",
    name: "Nguyễn Văn Admin",
    email: "admin@tracking-container.vn",
    phone: "0901234567",
    role: "admin",
    status: "active",
    department: "Phòng CNTT",
    lastActive: "5 phút trước",
  },
  {
    id: "2",
    name: "Trần Thị Operator",
    email: "operator1@tracking-container.vn",
    phone: "0912345678",
    role: "operator",
    status: "active",
    department: "Vận hành",
    lastActive: "1 giờ trước",
  },
  {
    id: "3",
    name: "Lê Văn Transporter",
    email: "driver1@tracking-container.vn",
    phone: "0923456789",
    role: "transporter",
    status: "active",
    department: "Vận tải",
    lastActive: "30 phút trước",
  },
  {
    id: "4",
    name: "Phạm Minh Operator",
    email: "operator2@tracking-container.vn",
    phone: "0934567890",
    role: "operator",
    status: "active",
    department: "Vận hành",
    lastActive: "2 giờ trước",
  },
  {
    id: "5",
    name: "Hoàng Đức Transporter",
    email: "driver2@tracking-container.vn",
    phone: "0945678901",
    role: "transporter",
    status: "inactive",
    department: "Vận tải",
    lastActive: "3 ngày trước",
  },
  {
    id: "6",
    name: "Vũ Thị Admin",
    email: "admin2@tracking-container.vn",
    phone: "0956789012",
    role: "admin",
    status: "active",
    department: "Quản lý",
    lastActive: "15 phút trước",
  },
  {
    id: "7",
    name: "Đặng Văn Operator",
    email: "operator3@tracking-container.vn",
    phone: "0967890123",
    role: "operator",
    status: "pending",
    department: "Vận hành",
    lastActive: "Chưa hoạt động",
  },
  {
    id: "8",
    name: "Bùi Thanh Transporter",
    email: "driver3@tracking-container.vn",
    phone: "0978901234",
    role: "transporter",
    status: "active",
    department: "Vận tải",
    lastActive: "4 giờ trước",
  },
]

const roleConfig: Record<UserRole, { label: string; className: string; icon: typeof Shield }> = {
  admin: { label: "Quản trị viên", className: "bg-destructive/10 text-destructive", icon: Shield },
  operator: { label: "Điều hành viên", className: "bg-primary/10 text-primary", icon: Settings },
  transporter: { label: "Tài xế", className: "bg-accent/10 text-accent", icon: Truck },
}

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  active: { label: "Hoạt động", className: "bg-success/10 text-success" },
  inactive: { label: "Không hoạt động", className: "bg-muted text-muted-foreground" },
  pending: { label: "Chờ duyệt", className: "bg-warning/10 text-warning" },
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: usersData.length,
    admins: usersData.filter((u) => u.role === "admin").length,
    operators: usersData.filter((u) => u.role === "operator").length,
    transporters: usersData.filter((u) => u.role === "transporter").length,
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DashboardLayout
      title="Quản lý người dùng"
      description="Quản lý người dùng và phân quyền"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Tổng người dùng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Quản trị viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.operators}</p>
                <p className="text-sm text-muted-foreground">Điều hành viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Truck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.transporters}</p>
                <p className="text-sm text-muted-foreground">Tài xế</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card className="mt-6 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-medium">Danh sách người dùng</CardTitle>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full bg-secondary pl-9 md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="operator">Điều hành viên</SelectItem>
                  <SelectItem value="transporter">Tài xế</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Thêm người dùng
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm người dùng mới</DialogTitle>
                    <DialogDescription>
                      Tạo tài khoản người dùng mới cho hệ thống.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Họ và tên</label>
                      <Input placeholder="VD: Nguyễn Văn A" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="VD: user@tracking-container.vn" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Số điện thoại</label>
                      <Input type="tel" placeholder="VD: 0901234567" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Vai trò</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Quản trị viên</SelectItem>
                          <SelectItem value="operator">Điều hành viên</SelectItem>
                          <SelectItem value="transporter">Tài xế</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Phòng ban</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">Phòng CNTT</SelectItem>
                          <SelectItem value="operations">Vận hành</SelectItem>
                          <SelectItem value="transport">Vận tải</SelectItem>
                          <SelectItem value="management">Quản lý</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Tạo người dùng</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Người dùng</TableHead>
                  <TableHead className="font-medium">Liên hệ</TableHead>
                  <TableHead className="font-medium">Vai trò</TableHead>
                  <TableHead className="font-medium">Phòng ban</TableHead>
                  <TableHead className="font-medium">Trạng thái</TableHead>
                  <TableHead className="font-medium">Hoạt động cuối</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const RoleIcon = roleConfig[user.role].icon
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleConfig[user.role].className}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleConfig[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.department}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[user.status].className}>
                          {statusConfig[user.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.lastActive}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Gửi email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa người dùng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Không tìm thấy người dùng phù hợp với tiêu chí.
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Hiển thị {filteredUsers.length} trong {usersData.length} người dùng
            </span>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
