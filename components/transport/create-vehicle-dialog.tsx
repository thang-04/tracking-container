"use client"

import { useActionState, useEffect, useState } from "react"
import { Plus, Ship } from "lucide-react"

import {
  createVehicleAction,
  initialCreateVehicleActionState,
} from "@/app/actions/transport"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateVehicleDialog() {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [state, formAction, isPending] = useActionState(
    createVehicleAction,
    initialCreateVehicleActionState,
  )

  // Close dialog on success and reset form
  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        setOpen(false)
        setFormKey((current) => current + 1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [state.status])

  const handleOpen = () => {
    setFormKey((current) => current + 1)
    setOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpen}>
        <Plus className="mr-2 size-4" />
        Tạo sà lan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ship className="size-5" />
              Tạo sà lan mới
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin phương tiện sà lan. Mã và tên là bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <form key={formKey} action={formAction} className="space-y-4">
            {/* Status messages */}
            {state.status === "error" && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.message}
              </div>
            )}
            {state.status === "success" && (
              <div className="rounded-md border border-success/50 bg-success/10 px-3 py-2 text-sm text-success">
                {state.message}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicle-code">Mã sà lan *</Label>
                <Input
                  id="vehicle-code"
                  name="code"
                  placeholder="SL-001"
                  required
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-name">Tên sà lan *</Label>
                <Input
                  id="vehicle-name"
                  name="name"
                  placeholder="Sà lan Bình Dương 01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-registration">Số đăng ký</Label>
              <Input
                id="vehicle-registration"
                name="registrationNo"
                placeholder="VD: HP-1234"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicle-capacity-teu">Sức chở (TEU)</Label>
                <Input
                  id="vehicle-capacity-teu"
                  name="capacityTeu"
                  type="number"
                  min={0}
                  placeholder="48"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-capacity-weight">Sức chở (kg)</Label>
                <Input
                  id="vehicle-capacity-weight"
                  name="capacityWeightKg"
                  type="number"
                  min={0}
                  step="0.001"
                  placeholder="500000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-note">Ghi chú</Label>
              <Input
                id="vehicle-note"
                name="note"
                placeholder="Thông tin bổ sung..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo sà lan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
