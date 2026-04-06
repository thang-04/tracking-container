"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CircleAlert, LoaderCircle } from "lucide-react"

import { startContainerImportPreviewAction } from "@/app/actions/containers"
import {
  initialContainerImportActionState,
  type ContainerImportActionState,
} from "@/lib/containers/container-action-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

function ImportSubmitButton({
  label,
}: {
  label: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Đang kiểm tra
        </>
      ) : (
        label
      )}
    </Button>
  )
}

function ImportStateAlert({ state }: { state: ContainerImportActionState }) {
  if (state.status !== "error") {
    return null
  }

  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
      <CircleAlert className="size-4" />
      <AlertTitle>Không thể tạo phiên xem trước</AlertTitle>
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

function CsvImportForm() {
  const [state, formAction] = useActionState(
    startContainerImportPreviewAction,
    initialContainerImportActionState,
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mode" value="csv" />

      <div className="space-y-2">
        <label htmlFor="csvFile" className="text-sm font-medium text-foreground">
          File CSV / Excel
        </label>
        <Input
          id="csvFile"
          name="csvFile"
          type="file"
          accept=".csv,.xlsx,.xlsm,.xlsb,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        <p className="text-sm text-muted-foreground">
          Chọn file CSV hoặc Excel. Sau khi kiểm tra, hệ thống sẽ chuyển sang trang xem trước riêng.
        </p>
      </div>

      <ImportStateAlert state={state} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">Preview riêng</Badge>
          <span>Dữ liệu lớn sẽ dễ đọc hơn ở page full-width.</span>
        </div>
        <ImportSubmitButton label="Kiểm tra và xem trước" />
      </div>
    </form>
  )
}

function EdiImportForm() {
  const [state, formAction] = useActionState(
    startContainerImportPreviewAction,
    initialContainerImportActionState,
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mode" value="edi" />

      <div className="space-y-2">
        <label htmlFor="ediText" className="text-sm font-medium text-foreground">
          Nội dung EDI
        </label>
        <Textarea
          id="ediText"
          name="ediText"
          rows={8}
          placeholder={`EQD+MSKU1234567+40HC'\nRFF+CU:CUST-ALPHA'\nRFF+RT:RT-HCM-BDU'\nUNT'`}
        />
        <p className="text-sm text-muted-foreground">
          Dán nội dung EDI hoặc tải file .edi / .txt. Sau khi kiểm tra, hệ thống sẽ mở trang preview
          riêng.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="ediFile" className="text-sm font-medium text-foreground">
          Hoặc tải file .edi / .txt
        </label>
        <Input id="ediFile" name="ediFile" type="file" accept=".edi,.txt,text/plain" />
      </div>

      <ImportStateAlert state={state} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">Preview riêng</Badge>
          <span>Đọc từng dòng EDI trên page review để kiểm tra dễ hơn.</span>
        </div>
        <ImportSubmitButton label="Kiểm tra và xem trước" />
      </div>
    </form>
  )
}

export function ContainerImportWorkflow() {
  return (
    <div className="space-y-4">
      <Alert className="border-primary/20 bg-primary/5">
        <CircleAlert className="size-4" />
        <AlertTitle>Không preview trong modal</AlertTitle>
        <AlertDescription>
          Bấm kiểm tra xong, hệ thống sẽ tạo phiên xem trước và mở sang trang review riêng để đọc dữ
          liệu dài dễ hơn.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="csv" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv">CSV / Excel</TabsTrigger>
          <TabsTrigger value="edi">EDI</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <CsvImportForm />
        </TabsContent>

        <TabsContent value="edi" className="space-y-4">
          <EdiImportForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
