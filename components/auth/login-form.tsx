"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { ArrowRight, CircleAlert, KeyRound, LoaderCircle, Mail } from "lucide-react"

import { loginAction } from "@/app/actions/auth"
import { initialAuthActionState } from "@/lib/auth/action-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
          Đang xác thực
        </>
      ) : (
        <>
          Đăng nhập
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function LoginForm({ returnTo }: { returnTo?: string | null }) {
  const [state, formAction] = useActionState(loginAction, initialAuthActionState)

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="returnTo" value={returnTo ?? ""} />

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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-200">
            Mật khẩu
          </Label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-sky-200 transition hover:text-sky-100"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu của bạn"
            className="h-11 rounded-xl border-white/10 bg-slate-900/85 pl-10 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      {state.status === "error" && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Không thể đăng nhập</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <SubmitButton />

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
        Tài khoản được cấp bởi quản trị viên hệ thống. Nếu bạn chưa có quyền truy
        cập, hãy liên hệ bộ phận vận hành hoặc quản trị hệ thống.
      </div>
    </form>
  )
}
