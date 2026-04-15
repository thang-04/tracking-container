import { YardPageClient } from "@/components/yard/yard-page-client"
import { getYardOverview } from "@/lib/yard/get-yard-overview"

export const dynamic = "force-dynamic"

export default async function YardPage() {
  const overview = await getYardOverview()

  return <YardPageClient overview={overview} />
}
