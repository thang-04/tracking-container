import { notFound } from "next/navigation"

import { ContainerImportPageClient } from "@/components/containers/container-import-page-client"
import { getContainerImportPreviewBatch } from "@/lib/containers/container-persistence"

export const dynamic = "force-dynamic"

export default async function ContainerImportPreviewPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const preview = await getContainerImportPreviewBatch(batchId)

  if (!preview) {
    notFound()
  }

  return <ContainerImportPageClient preview={preview} />
}
