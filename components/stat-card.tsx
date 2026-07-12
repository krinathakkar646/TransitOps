import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  tone?: "default" | "accent" | "success" | "warning"
}) {
  const tones = {
    default: "bg-primary/8 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 interactive-card shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
