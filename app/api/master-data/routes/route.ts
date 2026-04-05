import { NextResponse } from "next/server"
import { getRoutes } from "@/lib/master-data/get-routes"

export const dynamic = "force-dynamic"

export async function GET() {
  const routes = await getRoutes()
  return NextResponse.json({ data: routes })
}
