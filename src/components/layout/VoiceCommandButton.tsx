import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Web Speech API isn't in the standard DOM lib; use loose typing.
type SR = any;
declare global {
  interface Window {
    SpeechRecognition?: SR;
    webkitSpeechRecognition?: SR;
  }
}

type NavCommand = { patterns: string[]; to: string; label: string };

const NAV_COMMANDS: NavCommand[] = [
  { patterns: ["dashboard", "home"],                                 to: "/",                       label: "Dashboard" },
  { patterns: ["order management", "flight orders", "active orders", "orders"], to: "/order-management",       label: "Order Management" },
  { patterns: ["meal planning", "menu", "meals"],                    to: "/meal-planning",          label: "Meal Planning" },
  { patterns: ["bill of materials", "b o m", "bom"],                 to: "/bom",                    label: "Bill of Materials" },
  { patterns: ["production entry"],                                  to: "/production-entry",       label: "Production Entry" },
  { patterns: ["production order"],                                  to: "/production-entry-new",   label: "Production Order" },
  { patterns: ["material requirement", "m r p", "mrp"],              to: "/mrp",                    label: "MRP" },
  { patterns: ["production reports"],                                to: "/production-reports",     label: "Production Reports" },
  { patterns: ["stock overview", "inventory", "stock"],              to: "/inventory",              label: "Stock Overview" },
  { patterns: ["stock adjustment"],                                  to: "/stock-adjustment",       label: "Stock Adjustment" },
  { patterns: ["demand request", "demand orders"],                   to: "/demand-orders",          label: "Demand Requests" },
  { patterns: ["item issue"],                                        to: "/item-issue",             label: "Item Issue" },
  { patterns: ["transfer request"],                                  to: "/transfer-request",       label: "Transfer Request" },
  { patterns: ["transfer"],                                          to: "/transfer",               label: "Transfer" },
  { patterns: ["purchase requisition", "requisition", "p r"],        to: "/purchase-requisition",   label: "Purchase Requisition" },
  { patterns: ["request for quotation", "r f q", "rfq"],             to: "/request-for-quotation",  label: "Request for Quotation" },
  { patterns: ["quotation entry", "quotation"],                      to: "/quotation-entry",        label: "Quotation Entry" },
  { patterns: ["comparative statement", "comparison"],               to: "/comparative-statement",  label: "Comparative Statement" },
  { patterns: ["purchase orders", "purchase order", "procurement"],  to: "/procurement",            label: "Procurement" },
  { patterns: ["receive items", "g r n", "grn", "receiving"],        to: "/receive-item",           label: "Receive Items" },
  { patterns: ["purchase return"],                                   to: "/purchase-return",        label: "Purchase Return" },
  { patterns: ["purchase reports"],                                  to: "/purchase-reports",       label: "Purchase Reports" },
  { patterns: ["dispatch monitoring"],                               to: "/dispatch-monitoring",    label: "Dispatch Monitoring" },
  { patterns: ["dispatch", "packaging", "delivery"],                 to: "/dispatch",               label: "Dispatch" },
  { patterns: ["hygiene", "qc", "quality"],                          to: "/hygiene-monitoring",     label: "Hygiene Monitoring" },
  { patterns: ["cooking temperature", "cooking temp", "temperature"],to: "/cooking-temp",           label: "Cooking Temp" },
  { patterns: ["airline consumables", "consumables inventory"],      to: "/airline-consumables",    label: "Airline Consumables" },
  { patterns: ["consumable usage", "usage tracking"],                to: "/consumable-usage",       label: "Consumable Usage" },
  { patterns: ["airline equipments", "airline equipment", "assets"], to: "/airline-equipments",     label: "Airline Equipments" },
  { patterns: ["equipment maintenance", "maintenance"],              to: "/equipment-maintenance",  label: "Equipment Maintenance" },
  { patterns: ["equipment returns", "returns"],                      to: "/equipment-returns",      label: "Equipment Returns" },
  { patterns: ["equipment damage", "damage reports"],                to: "/equipment-damage",       label: "Equipment Damage" },
  { patterns: ["accounts", "finance", "invoices"],                   to: "/accounts",               label: "Accounts" },
  { patterns: ["payment approvals"],                                 to: "/accounts-approvals",     label: "Payment Approvals" },
  { patterns: ["expenses", "expense overview"],                      to: "/accounts-expenses",      label: "Expenses" },
  { patterns: ["audit logs", "audit"],                               to: "/audit",                  label: "Audit Logs" },
  { patterns: ["reports"],                                           to: "/reports",                label: "Reports" },
  { patterns: ["users", "user management"],                          to: "/users",                  label: "Users" },
  { patterns: ["approval management"],                               to: "/approval-management",    label: "Approval Management" },
  { patterns: ["item profile", "items"],                             to: "/config-item",            label: "Item Profile" },
  { patterns: ["supplier profile", "suppliers", "vendors"],          to: "/config-supplier",        label: "Supplier Profile" },
  { patterns: ["company profile", "company"],                        to: "/config-company",         label: "Company Profile" },
  { patterns: ["airline profile", "airline config"],                 to: "/config-airline",         label: "Airline Profile" },
  { patterns: ["warehouse"],                                         to: "/config-warehouse",       label: "Warehouse" },
  { patterns: ["price setup", "price"],                              to: "/config-price",           label: "Price Setup" },
];

const NAV_TRIGGER = /\b(go to|open|show( me)?|take me to|navigate( to)?|launch|switch to)\b/i;

function matchNav(transcript: string): { to: string; label: string } | null {
  const t = transcript.toLowerCase().trim();
  if (!t) return null;
  const hasTrigger = NAV_TRIGGER.test(t);
  let best: { to: string; label: string; len: number } | null = null;
  for (const cmd of NAV_COMMANDS) {
    for (const p of cmd.patterns) {
      if (t.includes(p) && (!best || p.length > best.len)) {
        best = { to: cmd.to, label: cmd.label, len: p.length };
      }
    }
  }
  // Without trigger, require an exact pattern match (short phrases like just "inventory")
  if (!hasTrigger && best && best.len < 6) return null;
  return best ? { to: best.to, label: best.label } : null;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1;
    u.volume = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

export function VoiceCommandButton() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [open, setOpen] = useState(false);
  const [lastResult, setLastResult] = useState<"none" | "matched" | "unmatched">("none");
  const recognitionRef = useRef<SR | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  useEffect(() => {
    const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SRClass) {
      setSupported(false);
      return;
    }
    const r: SR = new SRClass();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      const combined = (finalTranscriptRef.current + final + interim).trim();
      if (final) finalTranscriptRef.current += final;
      setTranscript(combined);
    };

    r.onerror = (e: any) => {
      const err = e?.error ?? "unknown";
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast.error("Microphone access denied. Enable in browser settings.");
      } else if (err === "no-speech") {
        toast.info("No speech detected — try again.");
      } else if (err !== "aborted") {
        toast.error(`Voice error: ${err}`);
      }
      setListening(false);
    };

    r.onend = () => setListening(false);

    recognitionRef.current = r;
    return () => {
      try { r.abort(); } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        if (listening) stop();
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (listening) stop();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, listening, stop]);

  // When listening ends with a transcript, process it
  useEffect(() => {
    if (listening) return;
    const t = transcript.trim();
    if (!t) return;
    const nav = matchNav(t);
    if (nav) {
      setLastResult("matched");
      speak(`Opening ${nav.label}`);
      toast.success(`Voice → ${nav.label}`);
      navigate({ to: nav.to });
      const closeTimer = window.setTimeout(() => {
        setOpen(false);
        setTranscript("");
        finalTranscriptRef.current = "";
        setLastResult("none");
      }, 600);
      return () => window.clearTimeout(closeTimer);
    } else {
      setLastResult("unmatched");
      speak("Sorry, I didn't catch a known command.");
    }
  }, [listening, transcript, navigate]);

  const start = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    finalTranscriptRef.current = "";
    setLastResult("none");
    setOpen(true);
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // Likely "already started" — toggle off
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setListening(false);
    }
  };

  const close = () => {
    if (listening) stop();
    setOpen(false);
    setTranscript("");
    finalTranscriptRef.current = "";
    setLastResult("none");
  };

  if (!supported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-white/50 hover:bg-white/15 hover:text-white/50"
        onClick={() =>
          toast.error("Voice commands not supported in this browser. Try Chrome or Edge.")
        }
        aria-label="Voice commands not supported"
        title="Voice commands not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "text-white hover:bg-white/15 hover:text-white relative",
          listening && "bg-white/20",
        )}
        onClick={() => (listening ? stop() : start())}
        aria-label={listening ? "Stop listening" : "Start voice command"}
        title={listening ? "Listening — click to stop" : "Voice command"}
      >
        <Mic className={cn("h-4 w-4", listening && "text-red-300")} />
        {listening && (
          <>
            <span className="absolute inset-0 rounded-md ring-2 ring-red-400 animate-pulse pointer-events-none" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0824D9] animate-pulse" />
          </>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] bg-card text-foreground border border-border rounded-md shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className={cn(
                "h-4 w-4",
                listening ? "text-red-500 animate-pulse" : "text-muted-foreground",
              )} />
              <span className="text-sm font-semibold">
                {listening ? "Listening…" : "Voice Command"}
              </span>
            </div>
            <button
              type="button"
              onClick={close}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted"
              aria-label="Close voice command"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-3 py-3 min-h-[64px] text-sm border-b border-border/40">
            {transcript ? (
              <div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Heard
                </div>
                <div className="text-foreground italic">"{transcript}"</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs italic">
                {listening ? "Speak your command now…" : "Click the mic to start."}
              </div>
            )}
          </div>

          {!listening && lastResult === "unmatched" && transcript && (
            <div className="px-3 py-2 text-[11px] text-amber-800 bg-amber-50 border-b border-amber-100">
              No matching page. Try a phrase like the examples below.
            </div>
          )}
          {!listening && lastResult === "matched" && (
            <div className="px-3 py-2 text-[11px] text-emerald-800 bg-emerald-50 border-b border-emerald-100">
              Navigating…
            </div>
          )}

          <div className="px-3 py-2 bg-muted/30 text-[10px] text-muted-foreground">
            <div className="font-semibold mb-1 uppercase tracking-wider">Try saying</div>
            <div className="grid grid-cols-1 gap-0.5">
              <div>• "Open dashboard"</div>
              <div>• "Go to inventory"</div>
              <div>• "Show purchase orders"</div>
              <div>• "Open meal planning"</div>
              <div>• "Take me to suppliers"</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
