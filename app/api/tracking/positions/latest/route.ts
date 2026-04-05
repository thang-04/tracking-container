import { NextResponse } from "next/server"
import { getLatestPositions } from "@/lib/tracking/get-latest-positions"

export const dynamic = "force-dynamic"

export async function GET() {
  const positions = await getLatestPositions()
  return NextResponse.json({ data: positions })
}
