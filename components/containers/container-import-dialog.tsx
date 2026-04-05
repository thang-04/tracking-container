"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { CircleAlert, LoaderCircle, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

import { previewOrImportContainersAction } from "@/app/actions/containers"
import {
  initialContainerImportActionState,
  type ContainerImportActionState,
} from "@/lib/containers/container-action-state"
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

function CsvImportForm({ onSuccess }: { onSuccess: () => void }) {
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
      <input type="hidden" name="mode" value="csv" />
      <input type="hidden" name="persistedSourceText" value={state.sourceText ?? ""} />
      <input type="hidden" name="persistedFileName" value={state.sourceFileName ?? ""} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">File CSV</label>
        <Input name="csvFile" type="file" accept=".csv,text/csv" />
        <p className="text-sm text-muted-foreground">
          Header bat buoc: `container_no`, `container_type_code`, `customer_code`, `route_code`.
        </p>
      </div>

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

export function ContainerImportDialog() {
  const [open, setOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 size-4" />
        Import CSV/EDI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Import container</DialogTitle>
            <DialogDescription>
              Chon `CSV` hoac `EDI`, xem truoc loi, sua het roi moi nhap vao he thong.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="csv" className="space-y-4">
            <TabsList>
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="edi">EDI</TabsTrigger>
            </TabsList>

            <TabsContent value="csv">
              <CsvImportForm
                key={`csv-${dialogKey}`}
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
