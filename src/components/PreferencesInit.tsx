"use client";

import { useEffect } from "react";
import { useBookStore } from "@/store/useBookStore";
import { THEME_STORAGE_KEY, BOOKMARKS_STORAGE_KEY } from "@/lib/theme";
import { PAGE_COUNT } from "@/lib/pages-data";

/**
 * Restores persisted reader preferences (theme + bookmarks) on mount.
 *
 * The inline script in the root layout has already stamped `data-theme` on
 * <html> before paint, so the CSS is correct from the first frame; this
 * catches the store up (the 3D scene reads its palette from there) and
 * loads saved bookmarks. Runs in an effect rather than at store-init so SSR
 * and the first client render agree and hydration stays clean.
 *
 * Light is the default theme and needs no action -- only a stored choice is
 * applied. OS `prefers-color-scheme` is intentionally ignored.
 */
export function PreferencesInit() {
  const setTheme = useBookStore((s) => s.setTheme);
  const hydrateBookmarks = useBookStore((s) => s.hydrateBookmarks);

  useEffect(() => {
    let storedTheme: string | null = null;
    let storedBookmarks: string | null = null;
    try {
      storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      storedBookmarks = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    } catch {
      // localStorage can throw in private mode / blocked-cookie contexts.
      return;
    }

    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);

    if (storedBookmarks) {
      try {
        const parsed: unknown = JSON.parse(storedBookmarks);
        if (Array.isArray(parsed)) {
          // Filter defensively: stored pages can fall out of range if the
          // book's page count ever changes between visits.
          const valid = parsed
            .filter((p): p is number => typeof p === "number" && Number.isInteger(p))
            .filter((p) => p >= 0 && p <= PAGE_COUNT)
            .sort((a, b) => a - b);
          if (valid.length > 0) hydrateBookmarks(Array.from(new Set(valid)));
        }
      } catch {
        // Corrupt JSON: ignore and start with no bookmarks.
      }
    }
  }, [setTheme, hydrateBookmarks]);

  return null;
}
