import { NextResponse } from "next/server"
import { getVehicles } from "@/lib/fleet/get-vehicles"

export const dynamic = "force-dynamic"

export async function GET() {
  const vehicles = await getVehicles()
  return NextResponse.json({ data: vehicles })
}
