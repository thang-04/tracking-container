import { getContainerDirectory } from "@/lib/containers/get-container-directory"

import { ContainersPageClient } from "./containers-page-client"

export const dynamic = "force-dynamic"

export default async function ContainersPage() {
  const containers = await getContainerDirectory()

  return <ContainersPageClient containers={containers} />
}
