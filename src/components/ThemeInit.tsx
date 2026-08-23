"use client";

import { useEffect } from "react";
import { useBookStore } from "@/store/useBookStore";

/** Applies the persisted (or OS-preferred) theme once on mount, client-only
 * to avoid an SSR/hydration mismatch — the server always renders "dark". */
export function ThemeInit() {
  const setTheme = useBookStore((s) => s.setTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem("folio-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    } else {
      document.documentElement.dataset.theme = "dark";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
