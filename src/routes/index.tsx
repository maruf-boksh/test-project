import { BrowserRouter, Route, Routes } from "react-router-dom"

import { DashboardLayout } from "@/layouts/dashboard-layout"
import { DashboardPage } from "@/pages/dashboard-page"
import { ReportsPage } from "@/pages/reports-page"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
