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
        "flex items-center bg-transparent p-0",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      {/* width/height phai khop file PNG (1280x698); sai ty le lam logo mo/me */}
      <Image
        src="/tracking-container-logo-lockup.png"
        alt="Container Tracking"
        width={1280}
        height={698}
        priority={priority}
        sizes="(max-width: 640px) 100vw, 280px"
        className={cn("block h-full w-auto max-w-full object-contain", imageClassName)}
      />
    </div>
  )
}
