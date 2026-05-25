import { Tag } from "antd";

/**
 * DESIGN.md §3: status colors carry meaning — pending=amber, approved=green,
 * rejected=red, draft=gray, info=sky/navy. Mapped via tone categories so the
 * same set of underlying Vizyon tokens drives every status pill in the app.
 */
type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_TONES: Record<string, Tone> = {
  // success
  ok: "success",
  approved: "success",
  delivered: "success",
  pass: "success",
  imported: "success",
  operational: "success",
  ready: "success",
  completed: "success",
  loaded: "success",
  "sent to packaging": "success",
  fulfilled: "success",
  acknowledged: "success",
  issued: "success",

  // info (in-flight / scheduled / routed)
  scheduled: "info",
  boarding: "info",
  ordered: "info",
  dispatched: "info",
  inside: "info",
  "en route": "info",
  "issued to vendor": "info",

  // warning (in-progress / pending action)
  cooking: "warning",
  baking: "warning",
  "in preparation": "warning",
  preparing: "warning",
  cooling: "warning",
  "ready for qc": "warning",
  "pending approval": "warning",
  production: "warning",
  partial: "warning",
  "partially issued": "warning",
  "service due": "warning",
  maintenance: "warning",
  "partially available": "warning",
  "escalated to supply chain": "warning",
  "pending acknowledgment": "warning",
  low: "warning",

  // danger
  critical: "danger",
  delayed: "danger",
  fail: "danger",
  failed: "danger",
  rejected: "danger",

  // neutral
  pending: "neutral",
  draft: "neutral",
  closed: "neutral",
  exited: "neutral",
  departed: "neutral",
  "pending store review": "neutral",
};

const TONE_STYLE: Record<Tone, { bg: string; color: string; border: string }> = {
  success: { bg: "rgba(22, 163, 74, 0.12)",  color: "#15803D", border: "rgba(22, 163, 74, 0.30)" },
  warning: { bg: "rgba(217, 119, 6, 0.12)",  color: "#B45309", border: "rgba(217, 119, 6, 0.30)" },
  danger:  { bg: "rgba(220, 38, 38, 0.12)",  color: "#B91C1C", border: "rgba(220, 38, 38, 0.30)" },
  info:    { bg: "rgba(14, 165, 233, 0.12)", color: "#0369A1", border: "rgba(14, 165, 233, 0.30)" },
  neutral: { bg: "rgba(100, 116, 139, 0.10)", color: "#475569", border: "rgba(100, 116, 139, 0.25)" },
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status.toLowerCase()] ?? "neutral";
  const s = TONE_STYLE[tone];
  return (
    <Tag
      style={{
        background: s.bg,
        color: s.color,
        borderColor: s.border,
        borderRadius: 9999,
        fontWeight: 600,
        fontSize: 11,
        lineHeight: 1.2,
        padding: "2px 10px",
        margin: 0,
      }}
    >
      {status}
    </Tag>
  );
}
