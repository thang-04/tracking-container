import { NextResponse } from "next/server"
import { getPortContainerCounts } from "@/lib/containers/get-port-container-counts"

export const dynamic = "force-dynamic"

export async function GET() {
  const counts = await getPortContainerCounts()
  return NextResponse.json({ data: counts })
}
