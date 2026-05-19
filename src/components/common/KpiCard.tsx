import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label, value, sub, icon: Icon, tone = "navy",
}: {
  label: string; value: string | number; sub?: string;
  icon: LucideIcon; tone?: "navy" | "red" | "success" | "warning";
}) {
  const grad = {
    navy: "kpi-gradient-navy",
    red: "kpi-gradient-red",
    success: "kpi-gradient-success",
    warning: "kpi-gradient-warning",
  }[tone];
  return (
    <div className={cn("rounded-lg p-4 text-white shadow-sm", grad)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium opacity-90 uppercase tracking-wide">{label}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
          {sub && <div className="text-xs opacity-85 mt-1">{sub}</div>}
        </div>
        <Icon className="h-8 w-8 opacity-40" />
      </div>
    </div>
  );
}
