import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const STORAGE_KEY = "arrival-flash";
const STORAGE_ROWS_KEY = "arrival-flash-rows";

export type ArrivalPayload =
  | string
  | { target: string; ids?: string[] };

/**
 * Stash the target id (and optionally a list of row ids) before navigating.
 * The destination page's `useArrivalFlash()` will:
 *   • flash the container at `[data-arrival-id="<target>"]` (green ring)
 *   • flash each row at `[data-arrival-row-id="<id>"]` (amber row tint)
 */
export function flagArrival(payload: ArrivalPayload) {
  if (typeof window === "undefined") return;
  try {
    if (typeof payload === "string") {
      sessionStorage.setItem(STORAGE_KEY, payload);
      sessionStorage.removeItem(STORAGE_ROWS_KEY);
      // eslint-disable-next-line no-console
      console.log("[arrival-flash] flagged →", payload);
    } else {
      sessionStorage.setItem(STORAGE_KEY, payload.target);
      if (payload.ids && payload.ids.length > 0) {
        sessionStorage.setItem(STORAGE_ROWS_KEY, payload.ids.join("|"));
      } else {
        sessionStorage.removeItem(STORAGE_ROWS_KEY);
      }
      // eslint-disable-next-line no-console
      console.log("[arrival-flash] flagged →", payload.target, "rows:", payload.ids?.length ?? 0);
    }
  } catch {
    /* sessionStorage unavailable — silently no-op */
  }
}

/**
 * Drop-in hook for destination pages. Reads the stashed arrival target from
 * sessionStorage, finds `[data-arrival-id="<id>"]`, scrolls it into view, and
 * flashes a green ring for ~2.5s. If row ids were also stashed, flashes each
 * matching row at `[data-arrival-row-id="<id>"]` with an amber row tint.
 * Re-runs whenever the pathname changes.
 */
export function useArrivalFlash() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let target: string | null = null;
    let rowIds: string[] = [];
    try {
      target = sessionStorage.getItem(STORAGE_KEY);
      const rawRows = sessionStorage.getItem(STORAGE_ROWS_KEY);
      if (rawRows) rowIds = rawRows.split("|").filter(Boolean);
    } catch {
      return;
    }
    if (!target && rowIds.length === 0) return;
    // eslint-disable-next-line no-console
    console.log("[arrival-flash] reading on", pathname, "→ target:", target, "rows:", rowIds.length);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_ROWS_KEY);

    // ── Container flash ────────────────────────────────────────────────────
    let foundContainer: HTMLElement | null = null;
    const flashContainer = (): HTMLElement | null => {
      if (!target) return null;
      const el = document.querySelector<HTMLElement>(`[data-arrival-id="${target}"]`);
      if (!el) return null;
      if (el === foundContainer) return el;
      foundContainer = el;
      el.classList.remove("arrival-flash");
      void el.offsetWidth;
      el.classList.add("arrival-flash");
      // Only scroll to container if no specific rows were requested.
      if (rowIds.length === 0) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return el;
    };

    // ── Row flash ──────────────────────────────────────────────────────────
    const flashedRows = new Set<HTMLElement>();
    let firstRow: HTMLElement | null = null;
    const flashRows = () => {
      if (rowIds.length === 0) return 0;
      let count = 0;
      for (const id of rowIds) {
        const el = document.querySelector<HTMLElement>(`[data-arrival-row-id="${cssEscape(id)}"]`);
        if (!el || flashedRows.has(el)) continue;
        el.classList.remove("arrival-row-flash");
        void el.offsetWidth;
        el.classList.add("arrival-row-flash");
        flashedRows.add(el);
        if (!firstRow) firstRow = el;
        count++;
      }
      if (firstRow && count > 0) {
        firstRow.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return count;
    };

    // First attempt synchronously, then retry up to ~1.5s in case the list
    // renders lazily.
    const initialContainer = flashContainer();
    const initialRows = flashRows();

    // Toast fallback so the user always gets a visible cue even if the
    // target element renders later or is somehow missing.
    if (!initialContainer && initialRows === 0) {
      toast.success(`Linked from dashboard → ${target ?? "rows"}`, { duration: 2500 });
    } else if (rowIds.length > 0 && initialRows < rowIds.length) {
      // Show how many rows we found vs requested (helps when paginated).
      // Suppress for trivial counts.
      if (rowIds.length >= 3) {
        toast.success(`Highlighted ${initialRows} of ${rowIds.length} ${rowIds.length === 1 ? "row" : "rows"}.`, { duration: 2000 });
      }
    }

    const retries: ReturnType<typeof setTimeout>[] = [];
    [80, 200, 500, 900, 1400].forEach((delay) => {
      retries.push(setTimeout(() => {
        flashContainer();
        flashRows();
      }, delay));
    });

    const cleanup = setTimeout(() => {
      foundContainer?.classList.remove("arrival-flash");
      flashedRows.forEach((el) => el.classList.remove("arrival-row-flash"));
    }, 4200);

    return () => {
      retries.forEach((t) => clearTimeout(t));
      clearTimeout(cleanup);
    };
  }, [pathname]);
}

/** Escape special CSS selector characters in user-supplied ids. */
function cssEscape(s: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(s);
  return s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
