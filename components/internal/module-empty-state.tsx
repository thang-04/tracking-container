import type { LucideIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Card, CardContent } from "@/components/ui/card"

export function ModuleEmptyState(props: {
  icon: LucideIcon
  title: string
  description: string
  reason: string
}) {
  const Icon = props.icon

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <Empty className="border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon />
            </EmptyMedia>
            <EmptyTitle>{props.title}</EmptyTitle>
            <EmptyDescription>{props.description}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-xl text-muted-foreground">
            <p>{props.reason}</p>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}
