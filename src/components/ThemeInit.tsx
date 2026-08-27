"use client";

import { useEffect } from "react";
import { useBookStore } from "@/store/useBookStore";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Syncs the zustand store with a previously chosen theme.
 *
 * The inline script in the root layout has already stamped `data-theme` on
 * <html> before paint, so the CSS is correct from the first frame; this only
 * catches the store up (the 3D scene reads its palette from there). Runs in
 * an effect rather than at store-init so SSR and the first client render
 * agree on the default and hydration stays clean.
 *
 * Light is the default and needs no action — only a stored preference is
 * applied. OS `prefers-color-scheme` is intentionally ignored.
 */
export function ThemeInit() {
  const setTheme = useBookStore((s) => s.setTheme);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // localStorage can throw in private mode / blocked-cookie contexts.
      return;
    }
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, [setTheme]);

  return null;
}
