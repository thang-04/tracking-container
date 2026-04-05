import { NextResponse } from "next/server"
import { getActiveVoyages } from "@/lib/transport/get-active-voyages"

export const dynamic = "force-dynamic"

export async function GET() {
  const voyages = await getActiveVoyages()
  return NextResponse.json({ data: voyages })
}
