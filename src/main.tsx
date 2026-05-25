import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ConfigProvider, theme as antTheme } from "antd"

import { ThemeProvider, useTheme } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App.tsx"
import "./index.css"
import "@/styles/globals.css"
import "@/styles/sidebar.css"

/**
 * Bridges the existing useTheme hook to Ant Design's ConfigProvider so a
 * single source of truth (localStorage "theme") drives both Tailwind's `.dark`
 * class and Ant's theme algorithm. Tokens here mirror DESIGN.md §3 (teal
 * primary, amber accent, light borders) so Ant components match the rest of
 * the app without custom CSS overrides on every component.
 */
function AntThemeBridge({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  const isDark = resolved === "dark"

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? "#2DD4BF" : "#0F766E",
          colorInfo:    isDark ? "#38BDF8" : "#0EA5E9",
          colorSuccess: isDark ? "#4ADE80" : "#16A34A",
          colorWarning: isDark ? "#FBBF24" : "#D97706",
          colorError:   isDark ? "#F87171" : "#DC2626",
          colorBgBase:  isDark ? "#0F1117" : "#F4F5F8",
          colorTextBase:isDark ? "#E5E7EB" : "#1F2937",
          colorBorder:  isDark ? "#252F42" : "#D8E7E5",
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          fontFamily:
            '"Manrope", "Nunito Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          fontSize: 13,
        },
        components: {
          Layout: {
            headerBg: "transparent",
            headerHeight: 56,
            headerPadding: 0,
            siderBg: isDark ? "#131826" : "#FFFFFF",
            bodyBg: "transparent",
          },
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: isDark ? "rgba(45,212,191,0.12)" : "#F0FDFA",
            itemSelectedColor: isDark ? "#2DD4BF" : "#0F766E",
            itemHoverBg: isDark ? "rgba(45,212,191,0.08)" : "#F1F5F4",
            itemHoverColor: isDark ? "#2DD4BF" : "#0F766E",
            itemHeight: 36,
            iconSize: 14,
            fontSize: 13,
            subMenuItemBg: "transparent",
          },
          Button: {
            controlHeight: 34,
            controlHeightSM: 28,
            fontWeight: 600,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <AntThemeBridge>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </AntThemeBridge>
    </ThemeProvider>
  </StrictMode>
)
