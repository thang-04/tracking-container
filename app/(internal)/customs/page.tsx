import { getCustomsData } from "@/lib/customs/get-customs-data"
import { CustomsClient } from "./customs-client"

export const dynamic = "force-dynamic"

export default async function CustomsPage() {
  const { files, stats } = await getCustomsData()

  return (
    <CustomsClient initialFiles={files} stats={stats} />
  )
}
