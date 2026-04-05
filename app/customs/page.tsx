"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search, Download, TrendingUp, Package } from "lucide-react"

export default function CustomsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customsFiles, setCustomsFiles] = useState([
    {
      id: "CF001",
      shipmentId: "SHIP001",
      declarationNumber: "TTKQ/2024/001",
      status: "Đã thông quan",
      submissionDate: "2024-01-15",
      approvalDate: "2024-01-16",
      goods: "Container hàng điện tử",
      value: 50000000,
    },
    {
      id: "CF002",
      shipmentId: "SHIP002",
      declarationNumber: "TTKQ/2024/002",
      status: "Đang xử lý",
      submissionDate: "2024-01-20",
      approvalDate: null,
      goods: "Thiết bị cơ khí",
      value: 75000000,
    },
    {
      id: "CF003",
      shipmentId: "SHIP003",
      declarationNumber: "TTKQ/2024/003",
      status: "Chờ cải chính",
      submissionDate: "2024-01-22",
      approvalDate: null,
      goods: "Vật liệu xây dựng",
      value: 120000000,
    },
  ])

  const [statistics] = useState({
    totalDeclarations: 342,
    approvedDeclarations: 298,
    pendingDeclarations: 38,
    rejectedDeclarations: 6,
    totalValue: 2480000000,
    monthlyApprovals: 45,
    averageProcessingTime: 2.5,
  })

  const filteredFiles = customsFiles.filter((file) =>
    file.declarationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.shipmentId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã thông quan":
        return "bg-green-100 text-green-800"
      case "Đang xử lý":
        return "bg-blue-100 text-blue-800"
      case "Chờ cải chính":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout
      title="Hoạt động hải quan"
      description="Quản lý hồ sơ thông quan và thống kê báo cáo"
    >
      <div className="space-y-6">

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Quản lý hồ sơ thông quan</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê & báo cáo</TabsTrigger>
          </TabsList>

          {/* Tab: Quản lý hồ sơ thông quan */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Hồ sơ thông quan
                  </span>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tờ khai mới
                  </Button>
                </CardTitle>
                <CardDescription>Danh sách các hồ sơ thông quan và trạng thái xử lý</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo số tờ khai hoặc shipment..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Số tờ khai</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shipment</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hàng hóa</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Giá trị (VNĐ)</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Trạng thái</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngày nộp</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngày thông quan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium text-foreground">{file.declarationNumber}</td>
                          <td className="px-4 py-3 text-foreground">{file.shipmentId}</td>
                          <td className="px-4 py-3 text-foreground">{file.goods}</td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {file.value.toLocaleString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(file.status)}`}>
                              {file.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground">{file.submissionDate}</td>
                          <td className="px-4 py-3 text-foreground">{file.approvalDate || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                  <span>Hiển thị {filteredFiles.length} trong {customsFiles.length} hồ sơ</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Xuất Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Thống kê & báo cáo */}
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Tổng tờ khai</span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{statistics.totalDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Cả năm 2024</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Đã thông quan</span>
                    <Package className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statistics.approvedDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{((statistics.approvedDeclarations / statistics.totalDeclarations) * 100).toFixed(1)}% tỷ lệ</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Đang xử lý</span>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{statistics.pendingDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{((statistics.pendingDeclarations / statistics.totalDeclarations) * 100).toFixed(1)}% tỷ lệ</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Từ chối</span>
                    <FileText className="h-4 w-4 text-red-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statistics.rejectedDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{((statistics.rejectedDeclarations / statistics.totalDeclarations) * 100).toFixed(1)}% tỷ lệ</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tổng giá trị hàng thông quan</span>
                    <span className="font-medium text-foreground">
                      {(statistics.totalValue / 1000000000).toFixed(2)} tỷ VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Thời gian xử lý trung bình</span>
                    <span className="font-medium text-foreground">{statistics.averageProcessingTime} ngày</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lượng thông quan/tháng</span>
                    <span className="font-medium text-foreground">{statistics.monthlyApprovals} tờ khai</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Báo cáo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Báo cáo hàng tháng
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Báo cáo quý
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Báo cáo năm
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Xuất dữ liệu tùy chọn
                  </Button>
                </CardContent>
              </Card>
            </div>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
