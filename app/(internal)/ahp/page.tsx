import { getAHPData } from "@/lib/ahp/get-ahp-data"
import { AHPClient } from "./ahp-client"

export const dynamic = "force-dynamic"

export default async function AHPPage() {
  const { criteria, comparisonScale } = await getAHPData()

  return <AHPClient criteria={criteria} scales={comparisonScale} />
}
