"use client"

import { startTransition, useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { CircleAlert, LoaderCircle, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

import { previewOrImportContainersAction } from "@/app/actions/containers"
import {
  initialContainerImportActionState,
  type ContainerImportActionState,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const NONE_VALUE = "__none__"

function ImportActions({
  canImport,
}: {
  canImport: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Button type="submit" name="intent" value="preview" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Dang kiem tra
          </>
        ) : (
          "Xem truoc va kiem tra"
        )}
      </Button>
      <Button type="submit" name="intent" value="import" disabled={pending || !canImport}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Dang import
          </>
        ) : (
          "Nhap du lieu"
        )}
      </Button>
    </div>
  )
}

function ImportPreview({ state }: { state: ContainerImportActionState }) {
  if (!state.summary || !state.rows?.length) {
    return null
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">Tong so dong</p>
          <p className="mt-1 text-2xl font-semibold">{state.summary.totalRows}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">Hop le</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {state.summary.validRows}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">Can sua</p>
          <p className="mt-1 text-2xl font-semibold text-destructive">
            {state.summary.invalidRows}
          </p>
        </div>
      </div>

      <div className="max-h-96 overflow-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Dong</TableHead>
              <TableHead>Container</TableHead>
              <TableHead>Loai</TableHead>
              <TableHead>Khach hang</TableHead>
              <TableHead>Tuyen</TableHead>
              <TableHead>Vi tri</TableHead>
              <TableHead>Trang thai</TableHead>
              <TableHead>Loi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.rows.map((row) => (
              <TableRow key={`${row.rowNo}-${row.containerNo}`}>
                <TableCell>{row.rowNo}</TableCell>
                <TableCell className="font-mono text-sm">{row.containerNo || "-"}</TableCell>
                <TableCell>{row.containerTypeCode || "-"}</TableCell>
                <TableCell>{row.customerCode || "-"}</TableCell>
                <TableCell>{row.routeCode || "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {[row.currentPortCode, row.currentYardCode, row.currentBlockCode, row.currentSlotCode]
                    .filter(Boolean)
                    .join(" / ") || "-"}
                </TableCell>
                <TableCell className={row.isValid ? "text-emerald-600" : "text-destructive"}>
                  {row.isValid ? "Hop le" : "Can sua"}
                </TableCell>
                <TableCell className="max-w-sm text-sm text-muted-foreground">
                  {row.errors.length ? row.errors.join(" | ") : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ImportStateAlert({ state }: { state: ContainerImportActionState }) {
  if (state.status === "idle") {
    return null
  }

  const destructive = state.status === "error" || (state.summary?.invalidRows ?? 0) > 0

  return (
    <Alert
      variant={destructive ? "destructive" : "default"}
      className={destructive ? "border-destructive/30 bg-destructive/10" : undefined}
    >
      <CircleAlert className="size-4" />
      <AlertTitle>
        {destructive ? "Can xu ly truoc khi import" : "San sang nhap du lieu"}
      </AlertTitle>
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
  )
}

function SpreadsheetImportForm({
  formOptions,
  onSuccess,
}: {
  formOptions: ContainerFormOptions
  onSuccess: () => void
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(
    previewOrImportContainersAction,
    initialContainerImportActionState,
  )
  const [customerCode, setCustomerCode] = useState("")
  const [routeCode, setRouteCode] = useState("")
  const stagedFileRef = useRef<File | null>(null)
  const [hasStagedFile, setHasStagedFile] = useState(false)
  const canImport =
    state.status === "preview" &&
    !!state.summary &&
    state.summary.totalRows > 0 &&
    state.summary.invalidRows === 0

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    onSuccess()
    router.refresh()
  }, [onSuccess, router, state.status])

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const formElement = event.currentTarget
        const submitEvent = event.nativeEvent as SubmitEvent
        const submitter = submitEvent.submitter as HTMLButtonElement | null
        const formData = new FormData(formElement)

        if (submitter?.name === "intent" && submitter.value) {
          formData.set("intent", submitter.value)
        }

        const staged = stagedFileRef.current

        if (staged && staged.size > 0) {
          formData.set("csvFile", staged)
        }

        startTransition(() => {
          formAction(formData)
        })
      }}
    >
      <input type="hidden" name="mode" value="csv" />
      <input type="hidden" name="importCustomerCode" value={customerCode} />
      <input type="hidden" name="importRouteCode" value={routeCode} />
      <input
        type="hidden"
        name="persistedSourceText"
        value={hasStagedFile ? "" : (state.sourceText ?? "")}
      />
      <input type="hidden" name="persistedFileName" value={state.sourceFileName ?? ""} />
      <input type="hidden" name="persistedSourceSummary" value={state.sourceSummary ?? ""} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">File CSV / Excel</label>
        <Input
          name="csvFile"
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null
            stagedFileRef.current = nextFile
            setHasStagedFile(Boolean(nextFile))
          }}
        />
        <p className="text-sm text-muted-foreground">
          Ho tro `CSV template noi bo`, bang discharge day du (`Unit Nbr`, `Type ISO`, `Line Op`,
          `Weight (kg)`, `POD`, `Seal Nbr1`, …) hoac sheet tom tat kieu `Sheet1` (`Container no`,
          `Container Size`, `Departure Date`, `Invoice Number`, tau/chuyen).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Khach hang ap cho batch</Label>
          <Select
            value={customerCode || NONE_VALUE}
            onValueChange={(value) => setCustomerCode(value === NONE_VALUE ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chon khach hang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Tu file CSV noi bo / chua chon</SelectItem>
              {formOptions.customers.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Bat buoc khi import file Excel discharge list.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Tuyen ap cho batch</Label>
          <Select
            value={routeCode || NONE_VALUE}
            onValueChange={(value) => setRouteCode(value === NONE_VALUE ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chon tuyen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Tu file CSV noi bo / chua chon</SelectItem>
              {formOptions.routes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Bat buoc khi import file Excel discharge list.
          </p>
        </div>
      </div>

      {state.sourceSummary ? (
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Nguon du lieu: {state.sourceSummary}
        </div>
      ) : null}

      <ImportStateAlert state={state} />
      <ImportPreview state={state} />
      <ImportActions canImport={canImport} />
    </form>
  )
}

function EdiImportForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [state, formAction] = useActionState(
    previewOrImportContainersAction,
    initialContainerImportActionState,
  )
  const canImport =
    state.status === "preview" &&
    !!state.summary &&
    state.summary.totalRows > 0 &&
    state.summary.invalidRows === 0

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    onSuccess()
    router.refresh()
  }, [onSuccess, router, state.status])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mode" value="edi" />
      <input type="hidden" name="persistedSourceText" value={state.sourceText ?? ""} />
      <input type="hidden" name="persistedFileName" value={state.sourceFileName ?? ""} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Noi dung EDI</label>
        <Textarea
          name="ediText"
          rows={8}
          defaultValue={state.sourceText ?? ""}
          placeholder={`EQD+MSKU1234567+40HC'\nRFF+CU:CUST-ALPHA'\nRFF+RT:RT-HCM-BDU'\nUNT'`}
        />
        <p className="text-sm text-muted-foreground">
          Ho tro profile MVP `Tracking Container EDI v1`. Ban co the paste text hoac tai file.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Hoac tai file .edi / .txt</label>
        <Input name="ediFile" type="file" accept=".edi,.txt,text/plain" />
      </div>

      <ImportStateAlert state={state} />
      <ImportPreview state={state} />
      <ImportActions canImport={canImport} />
    </form>
  )
}

export function ContainerImportDialog({
  formOptions,
}: {
  formOptions: ContainerFormOptions
}) {
  const [open, setOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 size-4" />
        Import CSV/Excel/EDI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Import container</DialogTitle>
            <DialogDescription>
              Chon `CSV / Excel` hoac `EDI`, xem truoc loi, sua het roi moi nhap vao he thong.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="csv" className="space-y-4">
            <TabsList>
              <TabsTrigger value="csv">CSV / Excel</TabsTrigger>
              <TabsTrigger value="edi">EDI</TabsTrigger>
            </TabsList>

            <TabsContent value="csv">
              <SpreadsheetImportForm
                key={`csv-${dialogKey}`}
                formOptions={formOptions}
                onSuccess={() => {
                  setOpen(false)
                  setDialogKey((current) => current + 1)
                }}
              />
            </TabsContent>

            <TabsContent value="edi">
              <EdiImportForm
                key={`edi-${dialogKey}`}
                onSuccess={() => {
                  setOpen(false)
                  setDialogKey((current) => current + 1)
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
