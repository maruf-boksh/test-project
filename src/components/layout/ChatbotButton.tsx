import { useState, useRef, useEffect, useMemo } from "react";
import { MessageSquare, Maximize2, Minimize2, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  seedFlightOrders, flights, inventory, qcChecks, purchaseOrders,
  vendors, dispatch, inventoryValue, nearExpiryCount,
} from "@/lib/sample-data";
import { useWorkflow } from "@/lib/workflow-store";
import logo from "@/assets/logo.png";

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
};

const SUGGESTIONS = [
  "Flights today",
  "Low stock",
  "Pending POs",
  "QC issues",
  "Active dispatch",
  "Stock value",
  "Top suppliers",
  "Help",
] as const;

function nowTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });
}

function fmtLakh(n: number): string {
  if (n >= 100000) return `৳ ${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `৳ ${(n / 1000).toFixed(1)}K`;
  return `৳ ${n.toLocaleString()}`;
}

function makeWelcome(): Message {
  return {
    id: `welcome-${Date.now()}`,
    role: "bot",
    time: nowTime(),
    text:
      "Assalamu alaikum,\nWelcome to US-Bangla Airlines Catering ChatBot. " +
      "Ask me about flights, inventory, purchase orders, dispatch, QC checks or production.",
  };
}

// ── Intent matcher ─────────────────────────────────────────────────────────
// Each intent has a regex that runs against the lowercased user text. The
// first match wins. Answers are computed from live sample data + workflow
// store so they reflect whatever is currently in the app.

type AnswerCtx = {
  wfPurchaseOrders: ReturnType<typeof useWorkflow>["wfPurchaseOrders"];
  wfRequisitions:   ReturnType<typeof useWorkflow>["wfRequisitions"];
  productionEntries: ReturnType<typeof useWorkflow>["productionEntries"];
  productionEntryRecords: ReturnType<typeof useWorkflow>["productionEntryRecords"];
};

/**
 * Each intent declares the keywords/phrases that signal it. The matcher
 * lowercases the user query and scores every intent by how many characters
 * of its keywords appear as a substring — longer phrases beat shorter ones,
 * so "pending po" beats plain "po", and "top supplier" beats plain
 * "supplier". This handles plural / capitalisation variants ("POs",
 * "Pending POs", "vendors") without strict word boundaries.
 */
type Intent = {
  /** Custom scorer; return positive score on match, 0 to skip. */
  score: (text: string) => number;
  answer: (ctx: AnswerCtx) => string;
};

function kwScore(text: string, ...keywords: string[]): number {
  let total = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) total += kw.length;
  }
  return total;
}

function helpText(): string {
  return [
    "I can help with:",
    "• Flights — \"flights today\", \"delayed flights\", \"active orders\"",
    "• Inventory — \"low stock\", \"critical items\", \"near expiry\", \"stock value\"",
    "• Purchase — \"pending POs\", \"approved POs\", \"top suppliers\"",
    "• QC — \"qc issues\", \"failed checks\"",
    "• Dispatch — \"active dispatch\", \"en route\"",
    "• Production — \"production today\", \"meals prepared\"",
    "",
    "Type a keyword or use a suggestion chip below.",
  ].join("\n");
}

function flightsTodayAnswer(): string {
  const dates = Array.from(new Set(seedFlightOrders.map((o) => o.date))).sort();
  const today = dates[dates.length - 1];
  const todayOrders = seedFlightOrders.filter((o) => o.date === today);
  if (todayOrders.length === 0) return "No flight orders scheduled for today.";
  const head = `${todayOrders.length} flight order${todayOrders.length === 1 ? "" : "s"} for ${today}:`;
  const list = todayOrders.slice(0, 6).map((o) =>
    `• ${o.flight} ${o.sector} · ETD ${o.etd} · ${o.pax} pax · ${o.status}`,
  ).join("\n");
  const more = todayOrders.length > 6 ? `\n…and ${todayOrders.length - 6} more.` : "";
  return `${head}\n${list}${more}`;
}

function delayedFlightsAnswer(): string {
  const delayed = flights.filter((f) => f.status === "Delayed");
  if (delayed.length === 0) return "✅ No delayed flights right now.";
  return `${delayed.length} delayed flight${delayed.length === 1 ? "" : "s"}:\n` +
    delayed.map((f) => `• ${f.flight} ${f.sector} · was ${f.dep}`).join("\n");
}

function activeOrdersAnswer(): string {
  const active = seedFlightOrders.filter((o) => o.status !== "Completed");
  if (active.length === 0) return "No active flight orders.";
  const byStatus = active.reduce<Record<string, number>>((m, o) => {
    m[o.status] = (m[o.status] ?? 0) + 1;
    return m;
  }, {});
  return `${active.length} active flight orders:\n` +
    Object.entries(byStatus).map(([s, n]) => `• ${s}: ${n}`).join("\n");
}

function lowStockAnswer(): string {
  const low = inventory.filter((i) => i.status === "Low");
  const crit = inventory.filter((i) => i.status === "Critical");
  const total = low.length + crit.length;
  if (total === 0) return "✅ No stock alerts. All items above reorder level.";
  const head = `${total} item${total === 1 ? "" : "s"} flagged (${crit.length} critical, ${low.length} low):`;
  const list = [...crit, ...low].slice(0, 6).map(
    (i) => `• ${i.name} — ${i.stock} ${i.uom} (reorder ${i.reorder})`,
  ).join("\n");
  return `${head}\n${list}`;
}

function nearExpiryAnswer(): string {
  const n = nearExpiryCount(inventory, 30);
  return `${n} item${n === 1 ? "" : "s"} have at least one batch expiring within 30 days.`;
}

function stockValueAnswer(): string {
  const v = inventoryValue(inventory);
  return `Current FEFO stock value: ${fmtLakh(v)} (across ${inventory.length} items).`;
}

function pendingPOAnswer(ctx: AnswerCtx): string {
  const seedPending = purchaseOrders.filter((p) => p.status === "Pending Approval");
  const wfPending = ctx.wfPurchaseOrders.filter((p) => p.status === "Pending Approval");
  const reqsPending = ctx.wfRequisitions.filter((r) => r.status === "Pending Accounts");
  const total = seedPending.length + wfPending.length + reqsPending.length;
  if (total === 0) return "✅ No purchase orders awaiting approval.";
  const seedAmt = seedPending.reduce((s, p) => s + p.amount, 0);
  const lines = [
    `${total} pending approval${total === 1 ? "" : "s"}:`,
    seedPending.length > 0 ? `• ${seedPending.length} purchase orders · ${fmtLakh(seedAmt)}` : "",
    wfPending.length > 0   ? `• ${wfPending.length} workflow POs` : "",
    reqsPending.length > 0 ? `• ${reqsPending.length} requisitions awaiting accounts` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function approvedPOAnswer(ctx: AnswerCtx): string {
  const approved = [
    ...purchaseOrders.filter((p) => p.status === "Approved"),
    ...ctx.wfPurchaseOrders.filter((p) => p.status === "Approved"),
  ];
  if (approved.length === 0) return "No approved purchase orders yet.";
  const head = `${approved.length} approved PO${approved.length === 1 ? "" : "s"}:`;
  const list = approved.slice(0, 5).map(
    (p) => `• ${p.id} — ${p.vendor} · ${fmtLakh(p.amount ?? 0)}`,
  ).join("\n");
  return `${head}\n${list}`;
}

function topSuppliersAnswer(ctx: AnswerCtx): string {
  const all = [
    ...ctx.wfPurchaseOrders.map((p) => ({ vendor: p.vendor, amount: p.amount ?? 0 })),
    ...purchaseOrders.map((p) => ({ vendor: p.vendor, amount: p.amount ?? 0 })),
  ];
  const map = new Map<string, number>();
  all.forEach((p) => map.set(p.vendor, (map.get(p.vendor) ?? 0) + p.amount));
  const ranked = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (ranked.length === 0) return "No supplier spend recorded yet.";
  return "Top suppliers by spend:\n" +
    ranked.map(([v, amt], i) => `${i + 1}. ${v} · ${fmtLakh(amt)}`).join("\n");
}

function qcIssuesAnswer(): string {
  const fails = qcChecks.filter((q) => q.result === "Fail");
  const passes = qcChecks.filter((q) => q.result === "Pass").length;
  if (fails.length === 0) return `✅ No QC failures. ${passes} passing checks.`;
  const list = fails.slice(0, 5).map(
    (q) => `• ${q.id} — ${q.flight} · ${q.parameter} (${q.value})`,
  ).join("\n");
  return `${fails.length} QC issue${fails.length === 1 ? "" : "s"} (${passes} passing):\n${list}`;
}

function activeDispatchAnswer(): string {
  const active = dispatch.filter((d) => d.status !== "Delivered");
  const enRoute = dispatch.filter((d) => d.status === "En Route").length;
  if (active.length === 0) return "✅ No active dispatch — everything delivered.";
  return `${active.length} active dispatch${active.length === 1 ? "" : "es"} (${enRoute} en route):\n` +
    active.slice(0, 5).map((d) => `• ${d.id} — ${d.flight} · ${d.status}`).join("\n");
}

function productionAnswer(ctx: AnswerCtx): string {
  const totalProduced = ctx.productionEntryRecords.reduce((s, r) => s + r.producedQty, 0);
  const totalTarget = ctx.productionEntries.reduce(
    (s, p) => s + (p.orderQty ?? p.producedQty), 0,
  );
  const pct = totalTarget > 0 ? Math.round((totalProduced / totalTarget) * 100) : 0;
  return `Production today: ${totalProduced.toLocaleString()} meals produced` +
    (totalTarget > 0 ? ` (${pct}% of ${totalTarget.toLocaleString()} target).` : ".") +
    `\nActive orders: ${ctx.productionEntries.length}.`;
}

function vendorCountAnswer(): string {
  return `${vendors.length} active vendor${vendors.length === 1 ? "" : "s"} in the catalog: ` +
    vendors.map((v) => v.name).slice(0, 4).join(", ") +
    (vendors.length > 4 ? `, …+${vendors.length - 4} more` : "");
}

const INTENTS: Intent[] = [
  // Greetings — anchored to start so "hi there" matches but "this" doesn't.
  {
    score: (t) => /^(hi\b|hello\b|hey\b|salam|assalam)/i.test(t) ? 100 : 0,
    answer: () =>
      "Wa alaikum assalam! Ask me about flights, inventory, POs, dispatch, QC, or production. Type 'help' for the full list.",
  },

  // Help
  {
    score: (t) => kwScore(t, "help", "what can you do", "commands", "menu"),
    answer: () => helpText(),
  },

  // Flights
  {
    score: (t) => kwScore(t,
      "flights today", "flight today", "today flight", "todays flight",
      "today's flight", "how many flight", "flight count", "todays schedule",
    ),
    answer: () => flightsTodayAnswer(),
  },
  {
    score: (t) => kwScore(t, "delayed", "delay"),
    answer: () => delayedFlightsAnswer(),
  },
  {
    score: (t) => kwScore(t, "active order", "active flight", "flight order", "open order"),
    answer: () => activeOrdersAnswer(),
  },

  // Inventory
  {
    score: (t) => kwScore(t, "low stock", "critical stock", "critical item", "stock alert", "reorder", "out of stock"),
    answer: () => lowStockAnswer(),
  },
  {
    score: (t) => kwScore(t, "near expiry", "expiring", "expire", "shelf life"),
    answer: () => nearExpiryAnswer(),
  },
  {
    score: (t) => kwScore(t, "stock value", "inventory value", "fefo value", "valuation", "working capital"),
    answer: () => stockValueAnswer(),
  },

  // Purchase
  {
    score: (t) => kwScore(t,
      "pending po", "pending purchase", "pending approval", "po pending",
      "purchase order pending", "awaiting approval",
    ),
    answer: (ctx) => pendingPOAnswer(ctx),
  },
  {
    score: (t) => kwScore(t,
      "approved po", "approved purchase", "po approved", "purchase order approved",
    ),
    answer: (ctx) => approvedPOAnswer(ctx),
  },
  {
    score: (t) => kwScore(t,
      "top supplier", "top vendor", "best supplier", "best vendor",
      "supplier rank", "vendor rank", "supplier spend", "vendor spend",
    ),
    answer: (ctx) => topSuppliersAnswer(ctx),
  },
  {
    score: (t) => kwScore(t, "vendor", "supplier", "active supplier", "active vendor"),
    answer: () => vendorCountAnswer(),
  },

  // QC
  {
    score: (t) => kwScore(t, "qc issue", "qc fail", "failed check", "quality issue", "quality fail", "food safety", " qc "),
    answer: () => qcIssuesAnswer(),
  },

  // Dispatch
  {
    score: (t) => kwScore(t, "active dispatch", "dispatch", "en route", "enroute", "delivery", "delivery status", "truck"),
    answer: () => activeDispatchAnswer(),
  },

  // Production
  {
    score: (t) => kwScore(t,
      "production today", "production", "meals prepared", "meals produced",
      "kitchen output", "meal target", "output today",
    ),
    answer: (ctx) => productionAnswer(ctx),
  },
];

function answerFor(query: string, ctx: AnswerCtx): string {
  const raw = query.trim();
  if (!raw) return "";
  // Normalize: lowercase + collapse whitespace + pad with spaces so " qc "
  // style word-boundary keywords can match at start/end too.
  const text = ` ${raw.toLowerCase().replace(/\s+/g, " ")} `;

  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    const s = intent.score(text);
    if (s > 0 && (!best || s > best.score)) best = { intent, score: s };
  }
  if (best) return best.intent.answer(ctx);
  return "I didn't catch that. Type \"help\" to see what I can answer, or try one of the suggestion chips below.";
}

// ── Component ──────────────────────────────────────────────────────────────

export function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [makeWelcome()]);

  const resetChat = () => {
    setMessages([makeWelcome()]);
    setDraft("");
    setExpanded(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetChat();
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const wf = useWorkflow();
  const ctx: AnswerCtx = useMemo(() => ({
    wfPurchaseOrders: wf.wfPurchaseOrders,
    wfRequisitions: wf.wfRequisitions,
    productionEntries: wf.productionEntries,
    productionEntryRecords: wf.productionEntryRecords,
  }), [wf.wfPurchaseOrders, wf.wfRequisitions, wf.productionEntries, wf.productionEntryRecords]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (textOverride?: string) => {
    const text = (textOverride ?? draft).trim();
    if (!text) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`, role: "user", text, time: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    // Compute the answer synchronously, but display after a short delay so the
    // user perceives the bot "typing".
    const replyText = answerFor(text, ctx);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          time: nowTime(),
          text: replyText,
        },
      ]);
    }, 350);
  };

  const sendSuggestion = (s: string) => {
    send(s);
    inputRef.current?.focus();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/15 hover:text-white"
        onClick={() => setOpen(true)}
        aria-label="Open US-Bangla Catering ChatBot"
        title="US-Bangla Catering ChatBot"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "p-0 gap-0 overflow-hidden rounded-md flex flex-col",
            // Hide the auto-injected Radix close — we render our own in the header.
            "[&>button[class*='absolute']]:hidden",
            expanded
              ? "max-w-3xl w-[min(90vw,768px)] h-[80vh]"
              : "max-w-md w-[min(95vw,420px)] h-[600px]",
          )}
        >
          {/* Branded header */}
          <div
            className="flex items-center justify-between text-white px-4 py-2.5 shrink-0"
            style={{ backgroundColor: "#0824D9" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center h-8 w-8 rounded bg-white shadow-sm shrink-0">
                <img src={logo} alt="US-Bangla Airlines" className="h-6 w-auto object-contain" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-bold tracking-wide truncate">
                  US-Bangla Catering ChatBot
                </div>
                <div className="text-[10px] text-white/70 -mt-0.5 tracking-wider truncate">
                  AIRLINES · Operations Assistant
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="text-white/90 hover:text-white p-1 rounded hover:bg-white/15 transition-colors"
                title={expanded ? "Shrink" : "Expand"}
                aria-label={expanded ? "Shrink chatbot" : "Expand chatbot"}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="text-white/90 hover:text-white p-1 rounded hover:bg-white/15 transition-colors"
                title="Close"
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/10"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-2",
                  m.role === "user" ? "justify-end" : "justify-start items-start",
                )}
              >
                {m.role === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={logo} alt="USB" className="h-5 w-auto object-contain" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg shadow-sm px-3 py-2 max-w-[78%]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border",
                  )}
                >
                  <div className="text-sm whitespace-pre-line">{m.text}</div>
                  <div
                    className={cn(
                      "mt-1 text-[10px] italic",
                      m.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {m.role === "user" ? "You" : "Bot"} · {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestion chips */}
          <div className="border-t border-border bg-muted/30 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendSuggestion(s)}
                className="text-[11px] whitespace-nowrap px-2 py-1 rounded-full border border-border bg-card hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                title={`Ask: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-3 bg-card flex items-center gap-2 shrink-0">
            <Input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type your message..."
              className="h-9"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => send()}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-primary"
              aria-label="Send message"
              disabled={!draft.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
