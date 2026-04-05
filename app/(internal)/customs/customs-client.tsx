"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search, Download, TrendingUp, Package } from "lucide-react"
import type { CustomsFileData, CustomsStats } from "@/lib/customs/get-customs-data"

interface CustomsClientProps {
  initialFiles: CustomsFileData[]
  stats: CustomsStats
}

export function CustomsClient({ initialFiles, stats }: CustomsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = initialFiles.filter((file) =>
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
      <div className="space-y-6 mt-6">
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Quản lý hồ sơ thông quan</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê & báo cáo</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Hồ sơ thông quan
                    </CardTitle>
                    <CardDescription>Danh sách các hồ sơ thông quan và trạng thái xử lý</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tờ khai mới
                  </Button>
                </div>
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

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
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
                      {filteredFiles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            Không tìm thấy hồ sơ phù hợp với tiêu chí.
                          </td>
                        </tr>
                      ) : (
                        filteredFiles.map((file) => (
                          <tr key={file.id} className="border-b hover:bg-muted/30">
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                  <span>Hiển thị {filteredFiles.length} trong {initialFiles.length} hồ sơ</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Xuất Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>Tổng tờ khai</span>
                    <FileText className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Dữ liệu hệ thống</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>Đã thông quan</span>
                    <Package className="h-4 w-4 text-success" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.approvedDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.totalDeclarations > 0 ? ((stats.approvedDeclarations / stats.totalDeclarations) * 100).toFixed(1) : 0}% tỷ lệ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>Đang xử lý</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.pendingDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.totalDeclarations > 0 ? ((stats.pendingDeclarations / stats.totalDeclarations) * 100).toFixed(1) : 0}% tỷ lệ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>Từ chối</span>
                    <FileText className="h-4 w-4 text-destructive" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.rejectedDeclarations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.totalDeclarations > 0 ? ((stats.rejectedDeclarations / stats.totalDeclarations) * 100).toFixed(1) : 0}% tỷ lệ
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tổng giá trị hàng (ước tính)</span>
                    <span className="font-medium text-foreground">
                      {(stats.totalValue / 1000000000).toFixed(2)} tỷ VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Thời gian xử lý trung bình</span>
                    <span className="font-medium text-foreground">{stats.averageProcessingTime} ngày</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lượng thông quan/tháng</span>
                    <span className="font-medium text-foreground">{stats.monthlyApprovals} tờ khai</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Báo cáo & Xuất file</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Download className="h-4 w-4" />
                    Báo cáo hàng tuần
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Download className="h-4 w-4" />
                    Báo cáo hàng tháng
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Download className="h-4 w-4" />
                    Báo cáo quý
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
