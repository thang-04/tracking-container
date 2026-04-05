"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { useFormStatus } from "react-dom"
import { CircleAlert, LoaderCircle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { createContainerAction } from "@/app/actions/containers"
import {
  initialCreateContainerActionState,
  type CreateContainerActionState,
} from "@/lib/containers/container-action-state"
import type { ContainerFormOptions } from "@/lib/containers/container-master-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const NONE_VALUE = "__none__"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Dang luu
        </>
      ) : (
        <>
          <Plus className="size-4" />
          Tao container
        </>
      )}
    </Button>
  )
}

function FieldError({
  state,
  name,
}: {
  state: CreateContainerActionState
  name: keyof NonNullable<CreateContainerActionState["fieldErrors"]>
}) {
  const message = state.fieldErrors?.[name]

  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

function CreateContainerDialogForm({
  formOptions,
  onSuccess,
}: {
  formOptions: ContainerFormOptions
  onSuccess: () => void
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(
    createContainerAction,
    initialCreateContainerActionState,
  )
  const [locationMode, setLocationMode] = useState<"none" | "yard">("none")
  const [shippingLineCode, setShippingLineCode] = useState("")
  const [containerTypeCode, setContainerTypeCode] = useState("")
  const [customerCode, setCustomerCode] = useState("")
  const [routeCode, setRouteCode] = useState("")
  const [currentPortCode, setCurrentPortCode] = useState("")
  const [currentYardCode, setCurrentYardCode] = useState("")
  const [currentBlockCode, setCurrentBlockCode] = useState("")
  const [currentSlotCode, setCurrentSlotCode] = useState("")

  const derivedPortCode = useMemo(
    () =>
      formOptions.yards.find((yard) => yard.value === currentYardCode)?.portCode ?? "",
    [currentYardCode, formOptions.yards],
  )

  const blockOptions = useMemo(
    () =>
      formOptions.blocks.filter((block) => block.yardCode === currentYardCode),
    [currentYardCode, formOptions.blocks],
  )

  const slotOptions = useMemo(
    () =>
      formOptions.slots.filter(
        (slot) =>
          slot.yardCode === currentYardCode &&
          slot.blockCode === currentBlockCode &&
          !formOptions.occupiedSlotCodes.includes(slot.value),
      ),
    [currentBlockCode, currentYardCode, formOptions.occupiedSlotCodes, formOptions.slots],
  )

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    onSuccess()
    router.refresh()
  }, [onSuccess, router, state.status])

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="containerTypeCode" value={containerTypeCode} />
      <input type="hidden" name="customerCode" value={customerCode} />
      <input type="hidden" name="routeCode" value={routeCode} />
      <input type="hidden" name="shippingLineCode" value={shippingLineCode} />
      <input
        type="hidden"
        name="currentPortCode"
        value={locationMode === "yard" ? derivedPortCode : currentPortCode}
      />
      <input type="hidden" name="currentYardCode" value={currentYardCode} />
      <input type="hidden" name="currentBlockCode" value={currentBlockCode} />
      <input type="hidden" name="currentSlotCode" value={currentSlotCode} />
      <input type="hidden" name="locationMode" value={locationMode} />

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <h3 className="font-medium text-foreground">Thong tin chinh</h3>
          <p className="text-sm text-muted-foreground">
            Tao moi container bang master data hien co trong Supabase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="containerNo">Ma container</Label>
            <Input id="containerNo" name="containerNo" placeholder="MSKU1234567" />
            <FieldError state={state} name="containerNo" />
          </div>
          <div className="space-y-2">
            <Label>Loai container</Label>
            <Select value={containerTypeCode} onValueChange={setContainerTypeCode}>
              <SelectTrigger>
                <SelectValue placeholder="Chon loai container" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.containerTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError state={state} name="containerTypeCode" />
          </div>
          <div className="space-y-2">
            <Label>Khach hang</Label>
            <Select value={customerCode} onValueChange={setCustomerCode}>
              <SelectTrigger>
                <SelectValue placeholder="Chon khach hang" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.customers.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError state={state} name="customerCode" />
          </div>
          <div className="space-y-2">
            <Label>Tuyen</Label>
            <Select value={routeCode} onValueChange={setRouteCode}>
              <SelectTrigger>
                <SelectValue placeholder="Chon tuyen" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.routes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError state={state} name="routeCode" />
          </div>
          <div className="space-y-2">
            <Label>Hang tau</Label>
            <Select
              value={shippingLineCode || NONE_VALUE}
              onValueChange={(value) =>
                setShippingLineCode(value === NONE_VALUE ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Khong gan hang tau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Khong gan hang tau</SelectItem>
                {formOptions.shippingLines.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="grossWeightKg">Trong luong (kg)</Label>
            <Input id="grossWeightKg" name="grossWeightKg" type="number" min="0" step="0.001" />
            <FieldError state={state} name="grossWeightKg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eta">ETA</Label>
            <Input id="eta" name="eta" type="datetime-local" />
            <FieldError state={state} name="eta" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billNo">Bill No</Label>
            <Input id="billNo" name="billNo" placeholder="BL-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sealNo">Seal No</Label>
            <Input id="sealNo" name="sealNo" placeholder="SEAL-001" />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <h3 className="font-medium text-foreground">Vi tri ban dau</h3>
          <p className="text-sm text-muted-foreground">
            Neu container da vao bai, he thong se tu dat trang thai theo loai port cua yard.
          </p>
        </div>

        <RadioGroup
          value={locationMode}
          onValueChange={(value) => {
            const nextValue = value === "yard" ? "yard" : "none"
            setLocationMode(nextValue)

            if (nextValue === "none") {
              setCurrentYardCode("")
              setCurrentBlockCode("")
              setCurrentSlotCode("")
            }
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
            <RadioGroupItem value="none" className="mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Chua vao bai</p>
              <p className="text-sm text-muted-foreground">
                Chi luu cang hien tai neu can. Trang thai se la `new`.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
            <RadioGroupItem value="yard" className="mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Da co vi tri bai</p>
              <p className="text-sm text-muted-foreground">
                Bat buoc chon day du yard, block va slot.
              </p>
            </div>
          </label>
        </RadioGroup>

        {locationMode === "none" ? (
          <div className="space-y-2">
            <Label>Cang hien tai</Label>
            <Select
              value={currentPortCode || NONE_VALUE}
              onValueChange={(value) => setCurrentPortCode(value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Khong gan cang hien tai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Khong gan cang hien tai</SelectItem>
                {formOptions.ports.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError state={state} name="currentPortCode" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Yard</Label>
              <Select
                value={currentYardCode}
                onValueChange={(value) => {
                  setCurrentYardCode(value)
                  setCurrentBlockCode("")
                  setCurrentSlotCode("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chon yard" />
                </SelectTrigger>
                <SelectContent>
                  {formOptions.yards.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError state={state} name="currentYardCode" />
            </div>
            <div className="space-y-2">
              <Label>Cang tuong ung</Label>
              <Input value={derivedPortCode || "Se tu dong suy ra tu yard"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Block</Label>
              <Select
                value={currentBlockCode}
                onValueChange={(value) => {
                  setCurrentBlockCode(value)
                  setCurrentSlotCode("")
                }}
                disabled={!currentYardCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chon block" />
                </SelectTrigger>
                <SelectContent>
                  {blockOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError state={state} name="currentBlockCode" />
            </div>
            <div className="space-y-2">
              <Label>Slot</Label>
              <Select
                value={currentSlotCode}
                onValueChange={setCurrentSlotCode}
                disabled={!currentBlockCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chon slot con trong" />
                </SelectTrigger>
                <SelectContent>
                  {slotOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError state={state} name="currentSlotCode" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chu</Label>
        <Textarea id="note" name="note" placeholder="Ghi chu nghiep vu neu can" rows={4} />
      </div>

      {state.status === "error" && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <CircleAlert className="size-4" />
          <AlertTitle>Khong the tao container</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{state.message}</p>
            {state.issues?.length ? (
              <ul className="ml-4 list-disc space-y-1">
                {state.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end gap-3">
        <SubmitButton />
      </div>
    </form>
  )
}

export function ContainerCreateDialog({
  formOptions,
}: {
  formOptions: ContainerFormOptions
}) {
  const [open, setOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Them container
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Them container</DialogTitle>
            <DialogDescription>
              Workflow nay ghi truc tiep vao `containers` va `container_events`.
            </DialogDescription>
          </DialogHeader>

          <CreateContainerDialogForm
            key={dialogKey}
            formOptions={formOptions}
            onSuccess={() => {
              setOpen(false)
              setDialogKey((current) => current + 1)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
