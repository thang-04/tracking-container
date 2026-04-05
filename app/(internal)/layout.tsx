import { requireInternalAccess } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

export default async function InternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireInternalAccess()

  return children
}
