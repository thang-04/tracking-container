import Image from "next/image"
import { cn } from "@/lib/utils"

type ProjectLogoProps = {
  className?: string
  imageClassName?: string
  align?: "left" | "center"
  priority?: boolean
}

export function ProjectLogo({
  className,
  imageClassName,
  align = "left",
  priority = false,
}: ProjectLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/70",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      <Image
        src="/tracking-container-logo-lockup.png"
        alt="Container Tracking"
        width={1069}
        height={486}
        priority={priority}
        sizes="(max-width: 640px) 12rem, 18rem"
        className={cn("h-full w-auto max-w-full object-contain", imageClassName)}
      />
    </div>
  )
}
