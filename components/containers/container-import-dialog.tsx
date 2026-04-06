"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

import { ContainerImportWorkflow } from "@/components/containers/container-import-workflow"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ContainerImportDialog() {
  const [open, setOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const handleOpen = () => {
    setDialogKey((current) => current + 1)
    setOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpen}>
        <Upload className="mr-2 size-4" />
        Nhập CSV/Excel/EDI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nhập container</DialogTitle>
            <DialogDescription>
              Chọn CSV / Excel hoặc dán EDI. Hệ thống sẽ tạo phiên xem trước và chuyển sang page
              review riêng để bạn kiểm tra dữ liệu dài dễ hơn.
            </DialogDescription>
          </DialogHeader>

          <ContainerImportWorkflow key={dialogKey} />
        </DialogContent>
      </Dialog>
    </>
  )
}
