"use client";

import { useEffect } from "react";

/*
 * Reads ?id=X from the URL on mount and, if a card with matching
 * data-name-id exists, scrolls it into view and applies
 * data-highlighted="true" for ~2.4s. Lives as a tiny client-only sibling of
 * the server-rendered card grid so the cards themselves stay non-interactive
 * (lighter hydration cost). Triggered only on mount — switching cards
 * happens by sharing different links, not by re-querying within a session.
 */
export function NamesDeepLinkHighlighter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;

    const card = document.querySelector<HTMLElement>(`[data-name-id="${CSS.escape(id)}"]`);
    if (!card) return;

    window.requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    card.setAttribute("data-highlighted", "true");

    const timer = window.setTimeout(() => {
      card.removeAttribute("data-highlighted");
    }, 2400);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
