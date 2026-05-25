import { Card } from "antd";
import type { ComponentType } from "react";

/**
 * Vizyon KPI card recipe (DESIGN.md §4 + §8):
 * - Calm white surface with a left primary-tint accent bar
 * - Tiny uppercase label (11px / 700)
 * - Large bold value (24px / 800), tabular-nums for alignment
 * - Optional sub-line in muted text
 * - Gradient teal icon square on the right
 *
 * Tones are kept (navy/red/success/warning) so existing call sites compile
 * unchanged, but their colors now derive from the Vizyon palette rather than
 * the old US-Bangla red/blue.
 */

type Tone = "navy" | "red" | "success" | "warning";

const TONE: Record<Tone, {
  accent: string;
  iconGradient: string;
  labelColor: string;
  valueColor: string;
  tintBg: string;
}> = {
  navy: {
    accent: "#0F766E",
    iconGradient: "linear-gradient(135deg, #14B8A6, #0F766E)",
    labelColor: "#115E59",
    valueColor: "#1F2937",
    tintBg: "rgba(15, 118, 110, 0.06)",
  },
  red: {
    accent: "#DC2626",
    iconGradient: "linear-gradient(135deg, #F87171, #DC2626)",
    labelColor: "#B91C1C",
    valueColor: "#1F2937",
    tintBg: "rgba(220, 38, 38, 0.06)",
  },
  success: {
    accent: "#16A34A",
    iconGradient: "linear-gradient(135deg, #4ADE80, #16A34A)",
    labelColor: "#15803D",
    valueColor: "#1F2937",
    tintBg: "rgba(22, 163, 74, 0.06)",
  },
  warning: {
    accent: "#D97706",
    iconGradient: "linear-gradient(135deg, #FBBF24, #D97706)",
    labelColor: "#B45309",
    valueColor: "#1F2937",
    tintBg: "rgba(217, 119, 6, 0.06)",
  },
};

// Accepts any component that renders with className — lucide icons and
// @ant-design/icons both satisfy this, so call sites don't need to change
// when icons are swapped during Phase 3 page migrations.
type IconLike = ComponentType<{ className?: string; style?: React.CSSProperties }>;

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: IconLike;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <Card
      variant="borderless"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        transition: "transform 150ms ease, box-shadow 150ms ease",
        cursor: "default",
        background: "var(--color-card)",
      }}
      styles={{ body: { padding: 16 } }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px -2px rgba(15, 23, 42, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 1px 2px 0 rgba(15, 23, 42, 0.04)";
      }}
    >
      {/* Soft tonal blob in the top-right for depth */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -32,
          right: -32,
          width: 96,
          height: 96,
          borderRadius: "9999px",
          background: t.tintBg,
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />
      {/* Tonal left accent bar */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          insetBlock: 0,
          left: 0,
          width: 4,
          background: t.accent,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: t.labelColor,
            }}
          >
            {label}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 24,
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              color: t.valueColor,
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "var(--color-muted-foreground)",
              }}
            >
              {sub}
            </div>
          )}
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: t.iconGradient,
            color: "white",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            boxShadow: "0 4px 10px -2px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Icon className="h-5 w-5" style={{ fontSize: 20 }} />
        </div>
      </div>
    </Card>
  );
}
