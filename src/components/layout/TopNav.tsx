import { Link } from "@tanstack/react-router";
import { Button } from "antd";
import { ChatbotButton } from "@/components/layout/ChatbotButton";
import { VoiceCommandButton } from "@/components/layout/VoiceCommandButton";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeCenterButton } from "@/components/layout/ThemeCenterButton";
import { useTour } from "@/components/layout/AppTour";
import logo from "@/assets/logo.png";

type TopNavProps = {
  sidebarCollapsed: boolean;
};

/**
 * DESIGN.md §8 — Topbar recipe:
 *   "Teal gradient bar with rounded corners (14px), sitting inside the page
 *    shell. Carries the wordmark, breadcrumb, search, time chip, notifications,
 *    and profile."
 *
 * The outer <header> is the Layout.Header slot (transparent); the inner bar is
 * the actual visual surface — inset 12px on all sides, rounded 14px, teal
 * gradient.
 */
export function TopNav({ sidebarCollapsed }: TopNavProps) {
  const { startTour } = useTour();

  return (
    <div
      style={{
        padding: "10px 12px 0",
        height: 56,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 46,
          borderRadius: 14,
          background: "var(--header-bg, linear-gradient(90deg, #0F766E 0%, #115E59 100%))",
          color: "var(--header-fg, white)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
          boxShadow:
            "var(--header-shadow, 0 6px 16px -6px rgba(15, 118, 110, 0.55), 0 2px 4px 0 rgba(15, 23, 42, 0.08))",
        }}
      >
        <Link
          to="/"
          aria-label="Go to Dashboard"
          title="Go to Dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--header-fg, white)",
            textDecoration: "none",
            padding: "4px 8px",
            borderRadius: 10,
            transition: "background-color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--header-logo-bg, white)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <img src={logo} alt="US-Bangla Airlines" style={{ height: 22, width: "auto", objectFit: "contain" }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div
                className="vizyon-wordmark"
                style={{
                  fontSize: 14,
                  letterSpacing: "0.08em",
                }}
              >
                US-BANGLA
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Catering ERP
              </div>
            </div>
          )}
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <GlobalSearch />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ThemeCenterButton />
          <Button
            onClick={startTour}
            size="small"
            style={{
              background: "var(--header-button-bg, rgba(255,255,255,0.95))",
              color: "var(--header-button-fg, #0F766E)",
              borderColor: "transparent",
              fontWeight: 700,
              height: 30,
            }}
          >
            Take a Tour?
          </Button>
          <ChatbotButton />
          <VoiceCommandButton />
          <NotificationsButton />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
