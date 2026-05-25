import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CateringShell } from "@/layouts/CateringShell";

import LoginPage from "@/routes/login";
import DashboardPage from "@/routes/index";
import OrderManagementPage from "@/routes/order-management";
import MealPlanningPage from "@/routes/meal-planning";
import BomPage from "@/routes/bom";
import ProductionEntryPage from "@/routes/production-entry";
import ProductionEntryNewPage from "@/routes/production-entry-new";
import MrpPage from "@/routes/mrp";
import ProductionReportsPage from "@/routes/production-reports";
import DemandOrdersPage from "@/routes/demand-orders";
import ItemIssuePage from "@/routes/item-issue";
import TransferRequestPage from "@/routes/transfer-request";
import TransferPage from "@/routes/transfer";
import InventoryPage from "@/routes/inventory";
import StockAdjustmentPage from "@/routes/stock-adjustment";
import PurchaseRequisitionPage from "@/routes/purchase-requisition";
import RequestForQuotationPage from "@/routes/request-for-quotation";
import QuotationEntryPage from "@/routes/quotation-entry";
import ComparativeStatementPage from "@/routes/comparative-statement";
import ProcurementPage from "@/routes/procurement";
import ReceiveItemPage from "@/routes/receive-item";
import PurchaseReturnPage from "@/routes/purchase-return";
import PurchaseReportsPage from "@/routes/purchase-reports";
import AccountsInvoicesPage from "@/routes/accounts-invoices";
import AccountsApprovalsPage from "@/routes/accounts-approvals";
import AccountsExpensesPage from "@/routes/accounts-expenses";
import AccountsPage from "@/routes/accounts";
import HygieneMonitoringPage from "@/routes/hygiene-monitoring";
import CookingTempPage from "@/routes/cooking-temp";
import DispatchMonitoringPage from "@/routes/dispatch-monitoring";
import DispatchPage from "@/routes/dispatch";
import AirlineConsumablesPage from "@/routes/airline-consumables";
import ConsumableUsagePage from "@/routes/consumable-usage";
import ConsumableAllocationPage from "@/routes/consumable-allocation";
import AirlineEquipmentsPage from "@/routes/airline-equipments";
import EquipmentMaintenancePage from "@/routes/equipment-maintenance";
import EquipmentReturnsPage from "@/routes/equipment-returns";
import EquipmentDamagePage from "@/routes/equipment-damage";
import MaintenancePage from "@/routes/maintenance";
import ReportsPage from "@/routes/reports";
import UsersPage from "@/routes/users";
import AuditPage from "@/routes/audit";
import ApprovalManagementPage from "@/routes/approval-management";
import ConfigItemPage from "@/routes/config-item";
import ConfigSupplierPage from "@/routes/config-supplier";
import ConfigCompanyPage from "@/routes/config-company";
import ConfigAirlinePage from "@/routes/config-airline";
import ConfigOfficePage from "@/routes/config-office";
import ConfigWarehousePage from "@/routes/config-warehouse";
import ConfigPricePage from "@/routes/config-price";
import ConfigApprovalPage from "@/routes/config-approval";
import AmenitiesPage from "@/routes/amenities";
import BakeryPage from "@/routes/bakery";
import KitchenPage from "@/routes/kitchen";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<CateringShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/order-management" element={<OrderManagementPage />} />
            <Route path="/meal-planning" element={<MealPlanningPage />} />
            <Route path="/bom" element={<BomPage />} />
            <Route path="/production-entry" element={<ProductionEntryPage />} />
            <Route path="/production-entry-new" element={<ProductionEntryNewPage />} />
            <Route path="/mrp" element={<MrpPage />} />
            <Route path="/production-reports" element={<ProductionReportsPage />} />
            <Route path="/demand-orders" element={<DemandOrdersPage />} />
            <Route path="/item-issue" element={<ItemIssuePage />} />
            <Route path="/transfer-request" element={<TransferRequestPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/stock-adjustment" element={<StockAdjustmentPage />} />
            <Route path="/purchase-requisition" element={<PurchaseRequisitionPage />} />
            <Route path="/request-for-quotation" element={<RequestForQuotationPage />} />
            <Route path="/quotation-entry" element={<QuotationEntryPage />} />
            <Route path="/comparative-statement" element={<ComparativeStatementPage />} />
            <Route path="/procurement" element={<ProcurementPage />} />
            <Route path="/receive-item" element={<ReceiveItemPage />} />
            <Route path="/purchase-return" element={<PurchaseReturnPage />} />
            <Route path="/purchase-reports" element={<PurchaseReportsPage />} />
            <Route path="/accounts-invoices" element={<AccountsInvoicesPage />} />
            <Route path="/accounts-approvals" element={<AccountsApprovalsPage />} />
            <Route path="/accounts-expenses" element={<AccountsExpensesPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/hygiene-monitoring" element={<HygieneMonitoringPage />} />
            <Route path="/cooking-temp" element={<CookingTempPage />} />
            <Route path="/dispatch-monitoring" element={<DispatchMonitoringPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/airline-consumables" element={<AirlineConsumablesPage />} />
            <Route path="/consumable-usage" element={<ConsumableUsagePage />} />
            <Route path="/consumable-allocation" element={<ConsumableAllocationPage />} />
            <Route path="/airline-equipments" element={<AirlineEquipmentsPage />} />
            <Route path="/equipment-maintenance" element={<EquipmentMaintenancePage />} />
            <Route path="/equipment-returns" element={<EquipmentReturnsPage />} />
            <Route path="/equipment-damage" element={<EquipmentDamagePage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/approval-management" element={<ApprovalManagementPage />} />
            <Route path="/config-item" element={<ConfigItemPage />} />
            <Route path="/config-supplier" element={<ConfigSupplierPage />} />
            <Route path="/config-company" element={<ConfigCompanyPage />} />
            <Route path="/config-airline" element={<ConfigAirlinePage />} />
            <Route path="/config-office" element={<ConfigOfficePage />} />
            <Route path="/config-warehouse" element={<ConfigWarehousePage />} />
            <Route path="/config-price" element={<ConfigPricePage />} />
            <Route path="/config-approval" element={<ConfigApprovalPage />} />
            <Route path="/amenities" element={<AmenitiesPage />} />
            <Route path="/bakery" element={<BakeryPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
