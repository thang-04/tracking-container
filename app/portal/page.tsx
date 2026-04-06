import { Activity, Boxes, Clock3 } from "lucide-react"

import { signOutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireCustomerAccess } from "@/lib/auth/server"

const portalHighlights = [
  {
    title: "Container được ủy quyền",
    value: "24",
    description: "Danh sách container khách hàng có quyền theo dõi trong cổng khách hàng.",
    icon: Boxes,
  },
  {
    title: "Dự kiến đến cần chú ý",
    value: "03",
    description: "Lô hàng có thời gian đến dự kiến thay đổi trong 24 giờ gần nhất.",
    icon: Clock3,
  },
  {
    title: "Trạng thái mới nhất",
    value: "18",
    description: "Container vừa nhận cập nhật hành trình hoặc vị trí trong ngày.",
    icon: Activity,
  },
]

export const dynamic = "force-dynamic"

export default async function PortalPage() {
  const auth = await requireCustomerAccess()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
              Cổng khách hàng
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Xin chào, {auth.profile.fullName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Đây là khu vực nền tảng dành cho khách hàng. Các màn tra cứu container,
                Thời gian đến dự kiến và lịch sử cơ bản sẽ được mở rộng từ không gian này.
              </p>
            </div>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="rounded-xl">
              Đăng xuất
            </Button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {portalHighlights.map(({ title, value, description, icon: Icon }) => (
            <Card key={title} className="border-border/60">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                  </CardTitle>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {value}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Khu vực cổng khách hàng đang được dựng nền tảng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Ở bước này, hệ thống đã có bộ chặn chỉ dành cho khách hàng và đích điều hướng hợp lệ
              sau đăng nhập.
            </p>
            <p>
              Các màn tiếp theo nên ưu tiên tra cứu container được ủy quyền, thời gian đến dự kiến,
              và dòng thời gian cơ bản thay vì sao chép giao diện nội bộ.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
