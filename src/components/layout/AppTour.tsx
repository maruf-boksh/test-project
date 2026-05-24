import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Step definitions ──────────────────────────────────────────────────────────
type TourStep = { targetId: string; title: string; description: string };

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-dashboard",
    title: "Dashboard",
    description:
      "Live overview of your entire catering operation — active flights, meals prepared, QC issues, dispatch status, and daily cost all in one place.",
  },
  {
    targetId: "tour-order-management",
    title: "Order Management",
    description:
      "Create, import, and manage catering orders for every flight. Supports multiple legs, crew meals, and bulk PAX load uploads from Zenith.",
  },
  {
    targetId: "tour-meal-planning",
    title: "Meal Planning",
    description:
      "Design and configure menus per airline and route. Set meal types, portion sizes, and special dietary options for Business and Economy class.",
  },
  {
    targetId: "tour-production",
    title: "Production Management",
    description:
      "Manage production orders, bill of materials, MRP planning, and monitor performance reports across all kitchen sections.",
  },
  {
    targetId: "tour-inventory",
    title: "Inventory & Store",
    description:
      "Monitor real-time stock levels, process item issues, handle transfer requests, and make adjustments across all warehouses.",
  },
  {
    targetId: "tour-supply",
    title: "Supply Chain",
    description:
      "Run the full procurement cycle — purchase requisitions, quotations, comparative statements, purchase orders, and goods receiving.",
  },
  {
    targetId: "tour-accounts",
    title: "Accounts",
    description:
      "Manage invoices, approve vendor payments, and track expense overviews to keep financials aligned with catering operations.",
  },
  {
    targetId: "tour-qc",
    title: "Food Safety & QC",
    description:
      "Record daily hygiene checklists, monitor cooking temperatures, and track dispatch quality for full food safety compliance.",
  },
  {
    targetId: "tour-dispatch",
    title: "Packaging & Dispatch",
    description:
      "Manage meal packaging, assign trolleys to flights, and monitor dispatch to ensure meals reach the aircraft on time.",
  },
  {
    targetId: "tour-airline-consumables",
    title: "Airline Consumables",
    description:
      "Track in-flight consumable inventory, monitor usage per flight, and allocate consumables to specific routes.",
  },
  {
    targetId: "tour-airline-equipments",
    title: "Airline Equipments",
    description:
      "Manage catering equipment assets, schedule maintenance, process returns, and log damage reports.",
  },
  {
    targetId: "tour-reports",
    title: "Reports & Analytics",
    description:
      "Access production summaries, dispatch logs, inventory valuations, purchase reports, and full operational analytics.",
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
type TourCtxType = { startTour: () => void; isActive: boolean };
const TourCtx = createContext<TourCtxType>({ startTour: () => {}, isActive: false });
export const useTour = () => useContext(TourCtx);

// ── Helpers ───────────────────────────────────────────────────────────────────
type Rect = { top: number; left: number; width: number; height: number };

function findRect(id: string): Rect | null {
  const el = document.querySelector(`[data-tour="${id}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const PAD = 8;
const CARD_W = 320;
const CARD_H = 240;

// ── Overlay ───────────────────────────────────────────────────────────────────
function TourOverlay({ onEnd }: { onEnd: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const total = TOUR_STEPS.length;
  const current = TOUR_STEPS[step];
  const isLast = step === total - 1;

  const refresh = useCallback(() => {
    setRect(findRect(TOUR_STEPS[step].targetId));
  }, [step]);

  useEffect(() => {
    const el = document.querySelector(`[data-tour="${current.targetId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    refresh();
    const t = setTimeout(refresh, 350);
    window.addEventListener("resize", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", refresh);
    };
  }, [refresh, current.targetId]);

  const next = () => (!isLast ? setStep((s) => s + 1) : onEnd());
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Position card to the right of the target; fall back to left if no room
  let cardTop = window.innerHeight / 2 - CARD_H / 2;
  let cardLeft = 280;
  if (rect) {
    const tryRight = rect.left + rect.width + 16;
    cardLeft =
      tryRight + CARD_W <= window.innerWidth - 8
        ? tryRight
        : Math.max(8, rect.left - CARD_W - 16);
    cardTop = Math.max(
      14,
      Math.min(rect.top + rect.height / 2 - CARD_H / 2, window.innerHeight - CARD_H - 14),
    );
  }

  return (
    <>
      {/* Dimmed backdrop with spotlight cutout */}
      <div className="fixed inset-0 z-[9997] pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="tour-spotlight">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - PAD}
                  y={rect.top - PAD}
                  width={rect.width + PAD * 2}
                  height={rect.height + PAD * 2}
                  rx="6"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.62)"
            mask="url(#tour-spotlight)"
          />
        </svg>
      </div>

      {/* Highlight ring around target */}
      {rect && (
        <div
          className="fixed pointer-events-none z-[9998] rounded-md transition-[top,left,width,height] duration-300"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 2px #fff, 0 0 18px 4px rgba(255,255,255,0.18)",
          }}
        />
      )}

      {/* Tour card */}
      <div
        className="fixed z-[9999] rounded-xl border border-border bg-card shadow-2xl p-5"
        style={{ top: cardTop, left: cardLeft, width: CARD_W }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Step {step + 1} of {total}
            </span>
            <h3 className="text-[15px] font-bold text-foreground mt-0.5 leading-tight">
              {current.title}
            </h3>
          </div>
          <button
            onClick={onEnd}
            className="ml-3 mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
          {current.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === step
                  ? "w-5 bg-primary"
                  : i < step
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/20",
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={onEnd}
          >
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={step === 0}
              onClick={back}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
              Back
            </Button>
            <Button size="sm" className="h-8 px-4" onClick={next}>
              {isLast ? (
                "Finish"
              ) : (
                <>
                  Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Provider (exported) ───────────────────────────────────────────────────────
export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  return (
    <TourCtx.Provider value={{ startTour: () => setActive(true), isActive: active }}>
      {children}
      {active && <TourOverlay onEnd={() => setActive(false)} />}
    </TourCtx.Provider>
  );
}
