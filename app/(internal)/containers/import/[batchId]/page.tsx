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
  console.log(`[DEBUG] Rendering ContainerImportPreviewPage for batchId: ${batchId}`)
  
  try {
    const preview = await getContainerImportPreviewBatch(batchId)
    if (!preview) {
      console.log(`[DEBUG] Preview NOT FOUND for batchId: ${batchId}`)
      notFound()
    }

    console.log(`[DEBUG] Rendering ContainerImportPageClient with rows: ${preview.rows.length}`)
    
    console.log(`[DEBUG] Step 2 Restoration: Calling ContainerImportPageClient (Hidden Table)`)
    
    // Phục hồi lại dữ liệu nén
    const rowsJson = JSON.stringify(preview.rows)
    
    return (
      <ContainerImportPageClient 
        batch={preview.batch} 
        rowsJson={rowsJson} 
      />
    )
  } catch (error) {
    console.error(`[DEBUG] FATAL ERROR in ContainerImportPreviewPage:`, error)
    throw error // Re-throw to show error in terminal
  }
}
