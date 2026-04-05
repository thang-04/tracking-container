"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { ArrowLeft, LoaderCircle, Mail, Send, ShieldAlert } from "lucide-react"

import { forgotPasswordAction } from "@/app/actions/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initialAuthActionState } from "@/lib/auth/action-state"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="h-11 w-full rounded-xl bg-sky-200 text-slate-950 hover:bg-sky-100"
      disabled={pending}
    >
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang gửi liên kết
        </>
      ) : (
        <>
          Gửi liên kết đặt lại
          <Send className="h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialAuthActionState,
  )

  const isSuccess = state.status === "success"

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-200">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ban@tracking-container.vn"
            className="h-11 rounded-xl border-white/10 bg-slate-900/85 pl-10 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      {state.status !== "idle" && (
        <Alert
          variant={isSuccess ? "default" : "destructive"}
          className={
            isSuccess
              ? "border-emerald-400/20 bg-emerald-500/10 text-slate-100"
              : "border-destructive/30 bg-destructive/10"
          }
        >
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>
            {isSuccess ? "Yêu cầu đã được ghi nhận" : "Không thể gửi liên kết"}
          </AlertTitle>
          <AlertDescription className={isSuccess ? "text-slate-300" : undefined}>
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      <SubmitButton />

      <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
        <span>Liên kết đặt lại sẽ được gửi tới email đã đăng ký.</span>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-medium text-sky-200 transition hover:text-sky-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  )
}
