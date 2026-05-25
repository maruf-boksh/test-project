import { Outlet } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Layout } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { TourProvider } from "./AppTour";
import { useApplyStoredTheme } from "./ThemeCenterButton";
import { RoleContext, type Role } from "@/lib/roles";
import { WorkflowProvider } from "@/lib/workflow-store";
import { Toaster } from "@/components/ui/sonner";

const SIDEBAR_KEY = "sidebar-collapsed";
const SIDER_WIDTH = 280;
const SIDER_COLLAPSED_WIDTH = 64;

export function AppShell({ children }: { children?: ReactNode }) {
  useApplyStoredTheme();
  const [role, setRole] = useState<Role>("GM/Admin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed ? "1" : "0"); } catch { /* ignore */ }
  }, [sidebarCollapsed]);

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <WorkflowProvider>
        <TourProvider>
          <Layout style={{ minHeight: "100vh", background: "transparent" }}>
            <Layout.Header
              style={{
                position: "sticky",
                top: 0,
                zIndex: 40,
                width: "100%",
                padding: 0,
                background: "transparent",
                lineHeight: "normal",
              }}
            >
              <TopNav sidebarCollapsed={sidebarCollapsed} />
            </Layout.Header>

            <Layout style={{ background: "transparent", position: "relative" }}>
              <Layout.Sider
                collapsed={sidebarCollapsed}
                collapsedWidth={SIDER_COLLAPSED_WIDTH}
                width={SIDER_WIDTH}
                trigger={null}
                collapsible
                style={{
                  position: "sticky",
                  top: 56,
                  height: "calc(100vh - 56px)",
                  overflow: "auto",
                  borderRight: "1px solid var(--color-sidebar-border)",
                  background: "var(--color-sidebar)",
                  boxShadow: "var(--sidebar-shadow, none)",
                }}
              >
                <Sidebar collapsed={sidebarCollapsed} />
              </Layout.Sider>

              {/* Floating boundary toggle — pinned vertically near the top
                  of the sidebar/content split. `left` animates to follow the
                  sidebar's collapse transition; `translateX(-50%)` centres
                  the circle on the border so half sits over the sidebar and
                  half over the content. */}
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                style={{
                  position: "fixed",
                  top: 80,
                  left: sidebarCollapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH,
                  transform: "translateX(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "1px solid var(--color-sidebar-border, #D8E7E5)",
                  background: "var(--color-card, #ffffff)",
                  color: "var(--color-foreground, #1F2937)",
                  boxShadow:
                    "0 4px 10px -2px rgba(15, 23, 42, 0.18), 0 1px 3px rgba(15, 23, 42, 0.08)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  padding: 0,
                  zIndex: 50,
                  transition:
                    "left 200ms cubic-bezier(0.2, 0, 0, 1), background-color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-primary, #0F766E)";
                  e.currentTarget.style.color = "var(--color-primary-foreground, #ffffff)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-card, #ffffff)";
                  e.currentTarget.style.color = "var(--color-foreground, #1F2937)";
                }}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={14} strokeWidth={2.5} />
                ) : (
                  <ChevronLeft size={14} strokeWidth={2.5} />
                )}
              </button>

              <Layout.Content
                style={{
                  padding: "24px 28px",
                  background: "transparent",
                  minHeight: "calc(100vh - 56px)",
                }}
              >
                {children ?? <Outlet />}
              </Layout.Content>
            </Layout>

            <Toaster richColors position="top-right" />
          </Layout>
        </TourProvider>
      </WorkflowProvider>
    </RoleContext.Provider>
  );
}
