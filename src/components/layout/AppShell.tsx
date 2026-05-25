import { Outlet } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Layout } from "antd";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { TourProvider } from "./AppTour";
import { RoleContext, type Role } from "@/lib/roles";
import { WorkflowProvider } from "@/lib/workflow-store";
import { Toaster } from "@/components/ui/sonner";

const SIDEBAR_KEY = "sidebar-collapsed";
const SIDER_WIDTH = 240;
const SIDER_COLLAPSED_WIDTH = 64;

export function AppShell({ children }: { children?: ReactNode }) {
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
              <TopNav
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={toggleSidebar}
              />
            </Layout.Header>

            <Layout style={{ background: "transparent" }}>
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
                }}
              >
                <Sidebar collapsed={sidebarCollapsed} />
              </Layout.Sider>

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
