import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  ok: "bg-success text-success-foreground",
  approved: "bg-success text-success-foreground",
  delivered: "bg-success text-success-foreground",
  pass: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
  imported: "bg-success text-success-foreground",
  exited: "bg-muted text-muted-foreground",
  operational: "bg-success text-success-foreground",
  scheduled: "bg-navy text-navy-foreground",
  boarding: "bg-navy text-navy-foreground",
  ordered: "bg-navy text-navy-foreground",
  cooking: "bg-warning text-warning-foreground",
  baking: "bg-warning text-warning-foreground",
  "in preparation": "bg-warning text-warning-foreground",
  preparing: "bg-warning text-warning-foreground",
  cooling: "bg-warning text-warning-foreground",
  "ready for qc": "bg-warning text-warning-foreground",
  ready: "bg-success text-success-foreground",
  pending: "bg-muted text-foreground border border-border",
  draft: "bg-muted text-foreground border border-border",
  "pending approval": "bg-warning text-warning-foreground",
  partial: "bg-warning text-warning-foreground",
  "partially issued": "bg-warning text-warning-foreground",
  "service due": "bg-warning text-warning-foreground",
  maintenance: "bg-warning text-warning-foreground",
  inside: "bg-navy text-navy-foreground",
  loaded: "bg-success text-success-foreground",
  "en route": "bg-navy text-navy-foreground",
  "sent to packaging": "bg-success text-success-foreground",
  "pending store review": "bg-muted text-foreground border border-border",
  "partially available": "bg-warning text-warning-foreground",
  "escalated to supply chain": "bg-warning text-warning-foreground",
  fulfilled: "bg-success text-success-foreground",
  "pending acknowledgment": "bg-warning text-warning-foreground",
  "issued to vendor": "bg-navy text-navy-foreground",
  acknowledged: "bg-success text-success-foreground",
  issued: "bg-success text-success-foreground",
  low: "bg-warning text-warning-foreground",
  critical: "bg-destructive text-destructive-foreground",
  delayed: "bg-destructive text-destructive-foreground",
  fail: "bg-destructive text-destructive-foreground",
  failed: "bg-destructive text-destructive-foreground",
  departed: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status.toLowerCase()] ?? "bg-muted text-foreground";
  return <Badge className={cn("font-medium", cls)}>{status}</Badge>;
}
