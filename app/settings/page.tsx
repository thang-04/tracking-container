"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Bell,
  Globe,
  Shield,
  Database,
  Save,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout
      title="Cài đặt"
      description="Quản lý cấu hình và tùy chọn hệ thống"
    >
      <div className="grid gap-6">
        {/* Company Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5" />
              Thông tin công ty
            </CardTitle>
            <CardDescription>Thông tin cơ bản về tổ chức của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Tên công ty</Label>
                <Input id="company-name" defaultValue="tracking-container" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email liên hệ</Label>
                <Input id="company-email" type="email" defaultValue="contact@tracking-container.vn" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Số điện thoại</Label>
                <Input id="company-phone" type="tel" defaultValue="+84 24 1234 5678" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Địa chỉ</Label>
                <Input id="company-address" defaultValue="Hải Phòng, Việt Nam" className="bg-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Thông báo
            </CardTitle>
            <CardDescription>Cấu hình cách bạn nhận cảnh báo và thông báo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo qua email</Label>
                <p className="text-sm text-muted-foreground">Nhận cảnh báo qua email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cảnh báo nghiêm trọng</Label>
                <p className="text-sm text-muted-foreground">Nhận thông báo ngay lập tức cho các sự kiện nghiêm trọng</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Báo cáo hàng ngày</Label>
                <p className="text-sm text-muted-foreground">Nhận báo cáo tổng hợp hàng ngày</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nhắc nhở bảo dưỡng</Label>
                <p className="text-sm text-muted-foreground">Nhận thông báo về lịch bảo dưỡng định kỳ</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5" />
              Cài đặt vùng
            </CardTitle>
            <CardDescription>Ngôn ngữ, múi giờ và định dạng hiển thị</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Ngôn ngữ</Label>
                <Select defaultValue="vi">
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Múi giờ</Label>
                <Select defaultValue="asia-ho-chi-minh">
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Chọn múi giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia-ho-chi-minh">Việt Nam (UTC+7)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Định dạng ngày</Label>
                <Select defaultValue="dd-mm-yyyy">
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Chọn định dạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5" />
              Cấu hình hệ thống
            </CardTitle>
            <CardDescription>Cài đặt hệ thống nâng cao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tự động làm mới bảng điều khiển</Label>
                <p className="text-sm text-muted-foreground">Tự động cập nhật dữ liệu bảng điều khiển</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theo dõi thời gian thực</Label>
                <p className="text-sm text-muted-foreground">Bật theo dõi GPS trực tiếp cho xe</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Thời gian lưu trữ dữ liệu</Label>
              <Select defaultValue="90">
                <SelectTrigger className="w-full md:w-64 bg-secondary">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 ngày</SelectItem>
                  <SelectItem value="60">60 ngày</SelectItem>
                  <SelectItem value="90">90 ngày</SelectItem>
                  <SelectItem value="180">180 ngày</SelectItem>
                  <SelectItem value="365">1 năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5" />
              Bảo mật
            </CardTitle>
            <CardDescription>Cài đặt bảo mật và xác thực</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Xác thực hai yếu tố</Label>
                <p className="text-sm text-muted-foreground">Yêu cầu 2FA cho tất cả người dùng</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thời gian phiên làm việc</Label>
                <p className="text-sm text-muted-foreground">Tự động đăng xuất sau thời gian không hoạt động</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-32 bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="60">1 giờ</SelectItem>
                  <SelectItem value="120">2 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo đăng nhập</Label>
                <p className="text-sm text-muted-foreground">Nhận thông báo khi có đăng nhập mới</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
