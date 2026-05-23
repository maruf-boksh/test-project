import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE = {
  navy: {
    bg: "bg-[#EEF2FF]",
    border: "border-[#C7D2FE]",
    accent: "bg-[#4F6EF7]",
    labelText: "text-[#3B5BDB]",
    valueText: "text-[#1e3a8a]",
    iconBg: "bg-[#4F6EF7]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#4F6EF7]/10",
  },
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
  success: {
    bg: "bg-[#ECFDF5]",
    border: "border-[#A7F3D0]",
    accent: "bg-[#22C55E]",
    labelText: "text-[#059669]",
    valueText: "text-[#14532d]",
    iconBg: "bg-[#22C55E]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#22C55E]/10",
  },
  warning: {
    bg: "bg-[#FFFBEB]",
    border: "border-[#FDE68A]",
    accent: "bg-[#F59E0B]",
    labelText: "text-[#D97706]",
    valueText: "text-[#78350f]",
    iconBg: "bg-[#F59E0B]",
    iconRing: "ring-white/30",
    iconText: "text-white",
    blob: "bg-[#F59E0B]/10",
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
          <div className={cn("text-[11px] font-semibold uppercase tracking-wider", t.labelText)}>{label}</div>
          <div className={cn("mt-1.5 text-2xl font-bold tabular-nums", t.valueText)}>{value}</div>
          {sub && <div className="mt-1 text-xs text-[#6b7280]">{sub}</div>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1 ring-inset", t.iconBg, t.iconRing)}>
          <Icon className={cn("h-5 w-5", t.iconText)} />
        </div>
      </div>
    </div>
  );
}
