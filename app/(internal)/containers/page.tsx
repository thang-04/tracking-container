import { getContainerFormOptions } from "@/lib/containers/container-master-data"
import { getContainerDirectory } from "@/lib/containers/get-container-directory"

import { ContainersPageClient } from "./containers-page-client"

export const dynamic = "force-dynamic"

export default async function ContainersPage() {
  const [containers, formOptions] = await Promise.all([
    getContainerDirectory(),
    getContainerFormOptions(),
  ])

  return <ContainersPageClient containers={containers} formOptions={formOptions} />
}
