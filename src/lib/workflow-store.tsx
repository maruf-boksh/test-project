import { createContext, useContext, useState, type ReactNode } from "react";
import { demandRequests as seedDemands, requisitions as seedReqs, purchaseOrders as seedPOs } from "@/lib/sample-data";

// ── Status enums ───────────────────────────────────────────────────────────────
export type WfDemandStatus =
  | "Pending Store Review"
  | "Partially Available"
  | "Partially Issued"
  | "Escalated to Supply Chain"
  | "Fulfilled";

export type WfReqStatus = "Pending Accounts" | "Approved" | "Rejected";

export type WfPOStatus =
  | "Draft"
  | "Open"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Ordered"
  | "Delivered"
  | "Closed"
  | "Issued to Vendor";

export type WfTransferStatus = "Pending" | "Issued";

// ── Entity types ───────────────────────────────────────────────────────────────
export type WfDemandItem = { id: string; name: string; qty: number; uom: string; type: string };

export type WfDemandRequest = {
  id: string;
  reference: string;        // PRD-XXXX — the production order that raised this demand
  requestedBy: string;
  role: string;
  date: string;
  status: WfDemandStatus;
  items: WfDemandItem[];
  note: string;
  source: string;           // "Kitchen" | "Store"
  grnRef?: string;          // set when a GRN fulfils this demand
  officeId?: string;
  warehouseId?: string;
};

export type WfRequisition = {
  id: string;
  reference: string;        // DR-XXXX demand that triggered this
  requestedBy: string;
  source: string;
  date: string;
  status: WfReqStatus;
  items: number;
  note: string;
  demandRef: string;        // WfDemandRequest.id
  demandItems?: WfDemandItem[];
  officeId?: string;
  warehouseId?: string;
};

export type WfPOLineItem = {
  itemId: string;
  name: string;
  qty: number;
  uom: string;
  unitPrice: number;
};

export type WfPurchaseOrder = {
  id: string;
  vendor: string;
  items: number;
  amount: number;
  date: string;
  status: WfPOStatus;
  requisitionRef: string;
  deliveryDate?: string;
  notes?: string;
  issuedToVendor?: boolean;
  lineItems?: WfPOLineItem[];
  rejectionReason?: string;
  officeId?: string;
  warehouseId?: string;
};

export type WfTransferNote = {
  id: string;
  demandRef: string;
  grnRef: string;
  items: { id: string; name: string; qty: number; uom: string }[];
  from: string;
  to: string;
  issuedBy: string;
  date: string;
  status: WfTransferStatus;
  officeId?: string;
  warehouseId?: string;
};

export type WfGRNLine = {
  itemId: string;
  name: string;
  qty: number;
  uom: string;
  temp: string;
  expiry: string;
  qcStatus: "Accepted" | "On Hold" | "Rejected";
};

export type WfGRN = {
  id: string;
  poRef: string;
  vendor: string;
  receivedBy: string;
  date: string;
  lines: WfGRNLine[];
  linkedDemandRef?: string;
  officeId?: string;
  warehouseId?: string;
};

export type StockDelta = { itemId: string; delta: number };

// ── Production Entry workflow ─────────────────────────────────────────────────
export type WfProductionEntryStatus =
  | "Pending"
  | "Approved"
  | "In Preparation"
  | "Ready for QC"
  | "Completed";

export type WfProductionEntry = {
  id: string;
  date: string;
  bom: string;
  outputItemName?: string;
  outputItemCode?: string;
  producedQty: number;
  status: WfProductionEntryStatus;
  qcLogId?: string;
  qcPassedAt?: string;
  qcCheckedBy?: string;
  completedAt?: string;
  inventoryAdded?: boolean;
  officeId?: string;
  warehouseId?: string;
};

// ── Context type ───────────────────────────────────────────────────────────────
type WorkflowCtx = {
  demands: WfDemandRequest[];
  addDemands: (items: WfDemandRequest[]) => void;
  updateDemandStatus: (id: string, status: WfDemandStatus, extra?: Partial<WfDemandRequest>) => void;

  wfRequisitions: WfRequisition[];
  addRequisition: (req: WfRequisition) => void;
  updateRequisitionStatus: (id: string, status: WfReqStatus) => void;

  wfPurchaseOrders: WfPurchaseOrder[];
  addPurchaseOrder: (po: WfPurchaseOrder) => void;
  updatePOStatus: (id: string, status: WfPOStatus, extra?: Partial<WfPurchaseOrder>) => void;

  grns: WfGRN[];
  addGRN: (grn: WfGRN) => void;

  transferNotes: WfTransferNote[];
  addTransferNote: (tn: WfTransferNote) => void;
  acknowledgeTransfer: (id: string) => void;

  stockDeltas: StockDelta[];
  applyStockDeltas: (deltas: StockDelta[]) => void;

  prdStatuses: Record<string, string>;
  prdProgress: Record<string, number>;
  setPRDStatus: (id: string, status: string, progress: number) => void;

  productionEntries: WfProductionEntry[];
  addProductionEntry: (entry: WfProductionEntry) => void;
  updateProductionEntryStatus: (
    id: string,
    status: WfProductionEntryStatus,
    extra?: Partial<WfProductionEntry>,
  ) => void;
};

const WorkflowContext = createContext<WorkflowCtx>({
  demands: [], addDemands: () => {}, updateDemandStatus: () => {},
  wfRequisitions: [], addRequisition: () => {}, updateRequisitionStatus: () => {},
  wfPurchaseOrders: [], addPurchaseOrder: () => {}, updatePOStatus: () => {},
  grns: [], addGRN: () => {},
  transferNotes: [], addTransferNote: () => {}, acknowledgeTransfer: () => {},
  stockDeltas: [], applyStockDeltas: () => {},
  prdStatuses: {}, prdProgress: {}, setPRDStatus: () => {},
  productionEntries: [], addProductionEntry: () => {}, updateProductionEntryStatus: () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────────
export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<WfDemandRequest[]>(
    seedDemands.map(d => ({
      id: d.id,
      reference: d.reference,
      requestedBy: d.requestedBy,
      role: d.role,
      date: d.date,
      status: d.status as WfDemandStatus,
      items: d.items.map(i => ({ ...i })),
      note: d.note,
      source: "Kitchen",
      officeId: "OFF-001",
      warehouseId: "WH-003",
    }))
  );

  const [wfRequisitions, setWfRequisitions] = useState<WfRequisition[]>(
    seedReqs.map(r => ({
      id: r.id,
      reference: r.reference,
      requestedBy: r.requestedBy,
      source: r.source,
      date: r.date,
      status: r.status as WfReqStatus,
      items: r.items,
      note: r.note,
      demandRef: r.reference,
      officeId: "OFF-001",
      warehouseId: "WH-001",
    }))
  );

  const [wfPurchaseOrders, setWfPOs] = useState<WfPurchaseOrder[]>(
    seedPOs.map(p => ({
      id: p.id,
      vendor: p.vendor,
      items: p.items,
      amount: p.amount,
      date: p.date,
      status: p.status as WfPOStatus,
      requisitionRef: "",
      officeId: "OFF-001",
      warehouseId: "WH-001",
    }))
  );

  const [grns, setGRNs] = useState<WfGRN[]>([]);
  const [transferNotes, setTransferNotes] = useState<WfTransferNote[]>([
    {
      id: "TN-50001",
      demandRef: "DR-9001",
      grnRef: "Direct from Store",
      items: [
        { id: "INV-1002", name: "Chicken Breast", qty: 80,  uom: "Kg" },
        { id: "INV-1005", name: "Tomato",         qty: 110, uom: "Kg" },
      ],
      from: "Store",
      to: "Hot Kitchen",
      issuedBy: "S. Ahmed",
      date: "2026-05-18 14:30",
      status: "Issued",
      officeId: "OFF-001",
      warehouseId: "WH-003",
    },
    {
      id: "TN-50002",
      demandRef: "DR-9002",
      grnRef: "Direct from Store",
      items: [
        { id: "INV-1010", name: "Basmati Rice",   qty: 150, uom: "Kg" },
        { id: "INV-1015", name: "Mineral Water 250ml", qty: 600, uom: "Bottle" },
      ],
      from: "Store",
      to: "Cold Kitchen",
      issuedBy: "M. Hossain",
      date: "2026-05-19 09:15",
      status: "Issued",
      officeId: "OFF-001",
      warehouseId: "WH-004",
    },
    {
      id: "TN-50003",
      demandRef: "Direct Issue",
      grnRef: "Direct from Store",
      items: [
        { id: "INV-1003", name: "Cooking Oil", qty: 25, uom: "Litre" },
      ],
      from: "Store",
      to: "Bakery",
      issuedBy: "F. Begum",
      date: "2026-05-19 11:40",
      status: "Issued",
      officeId: "OFF-001",
      warehouseId: "WH-001",
    },
  ]);
  const [stockDeltas, setStockDeltas] = useState<StockDelta[]>([]);
  const [prdStatuses, setPrdStatuses] = useState<Record<string, string>>({});
  const [prdProgress, setPrdProgress] = useState<Record<string, number>>({});
  const [productionEntries, setProductionEntries] = useState<WfProductionEntry[]>([
    { id: "PE-2026-000031", date: "2026-05-19", bom: "Chicken Biryani",       outputItemName: "Chicken Biryani",      producedQty: 280, status: "In Preparation", officeId: "OFF-001", warehouseId: "WH-003" },
    { id: "PE-2026-000030", date: "2026-05-18", bom: "Continental Breakfast", outputItemName: "Continental Breakfast", producedQty: 150, status: "Ready for QC",   officeId: "OFF-001", warehouseId: "WH-003" },
    { id: "PE-2026-000029", date: "2026-05-17", bom: "Veg Pulao",             outputItemName: "Veg Pulao",            producedQty: 320, status: "Approved",        officeId: "OFF-001", warehouseId: "WH-003" },
    { id: "PE-2026-000028", date: "2026-05-12", bom: "Chicken Biryani",       outputItemName: "Chicken Biryani",      producedQty: 250, status: "Completed",      qcCheckedBy: "Hygiene Lead", qcPassedAt: "2026-05-12 16:20", completedAt: "2026-05-12 16:22", inventoryAdded: true, officeId: "OFF-001", warehouseId: "WH-003" },
    { id: "PE-2026-000025", date: "2026-05-10", bom: "Veg Pulao",             outputItemName: "Veg Pulao",            producedQty: 180, status: "Completed",      qcCheckedBy: "F. Begum",     qcPassedAt: "2026-05-10 14:05", completedAt: "2026-05-10 14:07", inventoryAdded: true, officeId: "OFF-001", warehouseId: "WH-004" },
    { id: "PE-2026-000022", date: "2026-05-08", bom: "Continental Breakfast", outputItemName: "Continental Breakfast", producedQty: 220, status: "Completed",      qcCheckedBy: "T. Islam",     qcPassedAt: "2026-05-08 09:40", completedAt: "2026-05-08 09:42", inventoryAdded: true, officeId: "OFF-001", warehouseId: "WH-003" },
    { id: "PE-2026-000019", date: "2026-05-05", bom: "Grilled Salmon",        outputItemName: "Grilled Salmon",       producedQty: 130, status: "Completed",      qcCheckedBy: "Hygiene Lead", qcPassedAt: "2026-05-05 12:30", completedAt: "2026-05-05 12:31", inventoryAdded: true, officeId: "OFF-001", warehouseId: "WH-004" },
    { id: "PE-2026-000016", date: "2026-05-02", bom: "Hindu Meal Special",    outputItemName: "Hindu Meal Special",   producedQty:  80, status: "Pending",         officeId: "OFF-001", warehouseId: "WH-003" },
  ]);

  return (
    <WorkflowContext.Provider value={{
      demands,
      addDemands: (items) => setDemands(prev => [...items, ...prev]),
      updateDemandStatus: (id, status, extra) =>
        setDemands(prev => prev.map(d => d.id === id ? { ...d, status, ...extra } : d)),

      wfRequisitions,
      addRequisition: (req) => setWfRequisitions(prev => [req, ...prev]),
      updateRequisitionStatus: (id, status) =>
        setWfRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r)),

      wfPurchaseOrders,
      addPurchaseOrder: (po) => setWfPOs(prev => [po, ...prev]),
      updatePOStatus: (id, status, extra) =>
        setWfPOs(prev => prev.map(p => p.id === id ? { ...p, status, ...extra } : p)),

      grns,
      addGRN: (grn) => setGRNs(prev => [grn, ...prev]),

      transferNotes,
      addTransferNote: (tn) => setTransferNotes(prev => [tn, ...prev]),
      acknowledgeTransfer: (id) =>
        setTransferNotes(prev => prev.map(t => t.id === id ? { ...t, status: "Issued" } : t)),

      stockDeltas,
      applyStockDeltas: (deltas) => setStockDeltas(prev => [...prev, ...deltas]),

      productionEntries,
      addProductionEntry: (entry) => setProductionEntries(prev => [entry, ...prev]),
      updateProductionEntryStatus: (id, status, extra) =>
        setProductionEntries(prev => prev.map(e => e.id === id ? { ...e, status, ...extra } : e)),

      prdStatuses, prdProgress,
      setPRDStatus: (id, status, progress) => {
        setPrdStatuses(prev => ({ ...prev, [id]: status }));
        setPrdProgress(prev => ({ ...prev, [id]: progress }));
      },
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export const useWorkflow = () => useContext(WorkflowContext);
