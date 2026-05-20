import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE = {
  navy: {
    iconBg: "bg-navy/15",
    iconText: "text-navy",
    accent: "bg-navy",
    bg: "bg-gradient-to-br from-navy/[0.06] via-card to-card",
    border: "border-navy/20",
    valueText: "text-navy",
    blob: "bg-navy/10",
  },
  red: {
    iconBg: "bg-brand/15",
    iconText: "text-brand",
    accent: "bg-brand",
    bg: "bg-gradient-to-br from-brand/[0.07] via-card to-card",
    border: "border-brand/20",
    valueText: "text-brand",
    blob: "bg-brand/10",
  },
  success: {
    iconBg: "bg-success/15",
    iconText: "text-success",
    accent: "bg-success",
    bg: "bg-gradient-to-br from-success/[0.07] via-card to-card",
    border: "border-success/20",
    valueText: "text-success",
    blob: "bg-success/10",
  },
  warning: {
    iconBg: "bg-warning/20",
    iconText: "text-warning",
    accent: "bg-warning",
    bg: "bg-gradient-to-br from-warning/[0.08] via-card to-card",
    border: "border-warning/25",
    valueText: "text-warning",
    blob: "bg-warning/15",
  },
} as const;

export function KpiCard({
  label, value, sub, icon: Icon, tone = "navy",
}: {
  label: string; value: string | number; sub?: string;
  icon: LucideIcon; tone?: keyof typeof TONE;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
        t.bg,
        t.border,
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", t.accent)} />
      <span
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-70",
          t.blob,
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={cn("mt-1.5 text-2xl font-bold tabular-nums", t.valueText)}>{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-white/40", t.iconBg)}>
          <Icon className={cn("h-5 w-5", t.iconText)} />
        </div>
      </div>
    </div>
  );
}
