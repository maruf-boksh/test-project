import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";

const STORAGE_KEY = "arrival-flash";

/** Stash the target id; called from the source page right before navigating. */
export function flagArrival(targetId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, targetId);
    // eslint-disable-next-line no-console
    console.log("[arrival-flash] flagged →", targetId);
  } catch {
    /* sessionStorage unavailable — silently no-op */
  }
}

/**
 * Drop-in hook for destination pages. Reads the stashed arrival target from
 * sessionStorage, finds `[data-arrival-id="<id>"]`, scrolls it into view, and
 * flashes a green ring for ~2.5s. Re-runs whenever the pathname changes so it
 * works even if the destination component instance is reused.
 */
export function useArrivalFlash() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let target: string | null = null;
    try {
      target = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (!target) return;
    // eslint-disable-next-line no-console
    console.log("[arrival-flash] reading on", pathname, "→ target:", target);
    sessionStorage.removeItem(STORAGE_KEY);

    let foundEl: HTMLElement | null = null;
    const tryFind = (): HTMLElement | null => {
      const el = document.querySelector<HTMLElement>(`[data-arrival-id="${target}"]`);
      if (!el) return null;
      if (el === foundEl) return el;
      foundEl = el;
      // Restart animation if class was already present
      el.classList.remove("arrival-flash");
      void el.offsetWidth;
      el.classList.add("arrival-flash");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // eslint-disable-next-line no-console
      console.log("[arrival-flash] flashing", target, el);
      return el;
    };

    // First attempt synchronously, then retry up to ~1.5s in case the list
    // renders lazily (data-arrival-id may not exist on first tick).
    const initial = tryFind();
    if (!initial) {
      // Toast fallback so the user always gets a visible cue even if the
      // target element renders later or is somehow missing.
      toast.success(`Linked from dashboard → ${target}`, { duration: 2500 });
    }

    const retries: ReturnType<typeof setTimeout>[] = [];
    [80, 200, 500, 900, 1400].forEach((delay) => {
      retries.push(setTimeout(tryFind, delay));
    });

    const cleanup = setTimeout(() => {
      foundEl?.classList.remove("arrival-flash");
    }, 3500);

    return () => {
      retries.forEach((t) => clearTimeout(t));
      clearTimeout(cleanup);
    };
  }, [pathname]);
}
