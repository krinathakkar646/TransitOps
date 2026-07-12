import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  Available: "bg-success/10 text-success border-success/20",
  "On Trip": "bg-accent/10 text-accent border-accent/20",
  "In Shop": "bg-warning/15 text-warning border-warning/30",
  Retired: "bg-muted text-muted-foreground border-border",
  Suspended: "bg-destructive/10 text-destructive border-destructive/20",
  Draft: "bg-muted text-muted-foreground border-border",
  Dispatched: "bg-accent/10 text-accent border-accent/20",
  Completed: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  Active: "bg-warning/15 text-warning border-warning/30",
  Closed: "bg-success/10 text-success border-success/20",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
