import { requireCustomerAccess } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireCustomerAccess()

  return children
}
