import { NextResponse } from "next/server"
import { getPorts } from "@/lib/master-data/get-ports"

export const dynamic = "force-dynamic"

export async function GET() {
  const ports = await getPorts()
  return NextResponse.json({ data: ports })
}
