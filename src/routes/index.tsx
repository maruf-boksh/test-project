import { BrowserRouter, Route, Routes } from "react-router-dom"

import { DashboardLayout } from "@/layouts/dashboard-layout"
import { DashboardPage } from "@/pages/dashboard-page"
import { EventsPage } from "@/pages/events-page"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="events" element={<EventsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
