"use client"

import Link from "next/link"
import { startTransition, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import {
  ArrowLeft,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  isLocalAuthMockEnabled,
  LOCAL_AUTH_MOCK_ACCOUNT,
} from "@/lib/auth/mock-auth"
import { createClient } from "@/lib/supabase/client"

type RecoveryState = "checking" | "ready" | "invalid" | "saving" | "success"

const MIN_PASSWORD_LENGTH = 8

export function ResetPasswordForm() {
  if (isLocalAuthMockEnabled()) {
    return (
      <div className="space-y-5">
        <Alert className="border-sky-400/20 bg-sky-500/10 text-slate-100">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Chế độ mock local không hỗ trợ đổi mật khẩu</AlertTitle>
          <AlertDescription className="text-slate-300">
            Hãy đăng nhập bằng tài khoản demo {LOCAL_AUTH_MOCK_ACCOUNT.email} / {LOCAL_AUTH_MOCK_ACCOUNT.password} rồi quay lại màn đăng nhập khi cần thử luồng auth.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition hover:text-sky-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  const router = useRouter()
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) {
        return
      }

      setRecoveryState(session ? "ready" : "invalid")
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!active) {
          return
        }

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "PASSWORD_RECOVERY"
        ) {
          setRecoveryState(session ? "ready" : "invalid")
        }

        if (event === "SIGNED_OUT") {
          setRecoveryState("invalid")
        }
      },
    )

    void syncSession().catch(() => {
      if (active) {
        setRecoveryState("invalid")
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Mật khẩu cần có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`)
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận chưa khớp.")
      return
    }

    setRecoveryState("saving")

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setRecoveryState("ready")
      setErrorMessage("Không thể cập nhật mật khẩu. Vui lòng yêu cầu liên kết mới.")
      return
    }

    await supabase.auth.signOut()
    setRecoveryState("success")

    startTransition(() => {
      router.replace("/login?reset=success")
    })
  }

  if (recoveryState === "checking") {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center text-slate-300">
        <LoaderCircle className="h-6 w-6 animate-spin text-sky-200" />
        <p>Đang xác minh phiên đặt lại mật khẩu...</p>
      </div>
    )
  }

  if (recoveryState === "invalid") {
    return (
      <div className="space-y-5">
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Liên kết không còn hiệu lực</AlertTitle>
          <AlertDescription>
            Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Hãy yêu cầu
            một liên kết mới để tiếp tục.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between gap-4">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition hover:text-sky-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Gửi lại liên kết
          </Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (recoveryState === "success") {
    return (
      <Alert className="border-emerald-400/20 bg-emerald-500/10 text-slate-100">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Mật khẩu đã được cập nhật</AlertTitle>
        <AlertDescription className="text-slate-300">
          Bạn đang được chuyển về màn đăng nhập để dùng mật khẩu mới.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-200">
          Mật khẩu mới
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ít nhất 8 ký tự"
            autoComplete="new-password"
            className="h-11 rounded-xl border-white/10 bg-slate-900/85 pl-10 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-200">
          Xác nhận mật khẩu mới
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            className="h-11 rounded-xl border-white/10 bg-slate-900/85 pl-10 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
        Dùng mật khẩu đủ mạnh với ít nhất 8 ký tự. Tránh lặp lại mật khẩu đã dùng
        ở các hệ thống khác.
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Không thể cập nhật mật khẩu</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-sky-200 text-slate-950 hover:bg-sky-100"
        disabled={recoveryState === "saving"}
      >
        {recoveryState === "saving" ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Đang cập nhật
          </>
        ) : (
          "Cập nhật mật khẩu"
        )}
      </Button>
    </form>
  )
}