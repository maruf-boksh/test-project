import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE = {
  /* Brand teal — primary metrics, flights, dispatch */
  navy: {
    bg: "bg-[#f0fdfa]",
    border: "border-[#99f6e4]",
    accent: "bg-[#0f766e]",
    labelText: "text-[#0f766e]",
    valueText: "text-[#115e59]",
    iconBg: "bg-[#0f766e]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#0f766e]/10",
  },
  /* Destructive red — QC issues, inventory alerts, failures */
  red: {
    bg: "bg-[#FEF2F2]",
    border: "border-[#FECACA]",
    accent: "bg-[#EF4444]",
    labelText: "text-[#DC2626]",
    valueText: "text-[#7f1d1d]",
    iconBg: "bg-[#EF4444]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#EF4444]/10",
  },
  /* Green — meals prepared, dispatch active, approved */
  success: {
    bg: "bg-[#ECFDF5]",
    border: "border-[#A7F3D0]",
    accent: "bg-[#059669]",
    labelText: "text-[#059669]",
    valueText: "text-[#14532d]",
    iconBg: "bg-[#059669]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#059669]/10",
  },
  /* Amber — delayed, pending, warnings (accent only, never primary CTA) */
  warning: {
    bg: "bg-[#FFFBEB]",
    border: "border-[#FDE68A]",
    accent: "bg-[#D97706]",
    labelText: "text-[#B45309]",
    valueText: "text-[#78350f]",
    iconBg: "bg-[#D97706]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#D97706]/10",
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
        "relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-150 ease-out hover:shadow-md hover:-translate-y-px",
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
          <div className={cn("text-[11px] font-semibold uppercase tracking-wider", t.labelText)}>{label}</div>
          <div className={cn("mt-1.5 text-2xl font-bold tabular-nums", t.valueText)}>{value}</div>
          {sub && <div className="mt-1 text-xs text-[#6b7280]">{sub}</div>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1 ring-inset text-[20px] leading-none",
            "[&_svg]:h-5 [&_svg]:w-5",
            t.iconBg,
            t.iconRing,
            t.iconText,
          )}
        >
          <Icon className={cn("h-5 w-5", t.iconText)} />
        </div>
      </div>
    </div>
  );
}
