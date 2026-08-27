import { create } from "zustand";
import { PAGE_COUNT } from "@/lib/pages-data";
import { soundEngine } from "@/lib/audio/soundEngine";
import { THEME_STORAGE_KEY, BOOKMARKS_STORAGE_KEY } from "@/lib/theme";

// Page index model:
// 0          -> book closed, front cover facing viewer
// 1..PAGE_COUNT-1 -> that many leaves have been turned to the left stack
// PAGE_COUNT -> all leaves turned, back cover facing viewer (fully read)
export const TOTAL_STOPS = PAGE_COUNT;

export type Theme = "dark" | "light";

interface BookState {
  page: number;
  isOpen: boolean;
  hovered: number | null;
  soundEnabled: boolean;
  hasInteracted: boolean;
  theme: Theme;
  contentsOpen: boolean;
  /** Page indices the reader saved, kept sorted ascending. */
  bookmarks: number[];
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  setHovered: (page: number | null) => void;
  toggleSound: () => void;
  markInteracted: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setContentsOpen: (open: boolean) => void;
  toggleContents: () => void;
  hydrateBookmarks: (bookmarks: number[]) => void;
  toggleBookmark: (page?: number) => void;
  removeBookmark: (page: number) => void;
}

function persistBookmarks(bookmarks: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Private mode / blocked storage: bookmarks still work for this session.
  }
}

export const useBookStore = create<BookState>((set, get) => ({
  page: 0,
  isOpen: false,
  hovered: null,
  soundEnabled: true,
  hasInteracted: false,
  theme: "light",
  contentsOpen: false,
  bookmarks: [],
  setPage: (page) => {
    const prev = get().page;
    const clamped = Math.max(0, Math.min(TOTAL_STOPS, page));
    if (clamped === prev) return;
    set({ page: clamped, isOpen: clamped > 0 && clamped < TOTAL_STOPS, hasInteracted: true });
    soundEngine.init();
    if (clamped === 0 || clamped === TOTAL_STOPS) soundEngine.playCoverThud();
    else soundEngine.playTurn(0.7);
  },
  next: () => {
    const { page } = get();
    if (page < TOTAL_STOPS) get().setPage(page + 1);
  },
  prev: () => {
    const { page } = get();
    if (page > 0) get().setPage(page - 1);
  },
  goToStart: () => get().setPage(0),
  goToEnd: () => get().setPage(TOTAL_STOPS),
  setHovered: (hovered) => set({ hovered }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  markInteracted: () => set({ hasInteracted: true }),
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      document.documentElement.dataset.theme = theme;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Private mode / blocked storage: the toggle should still work for
        // this session even if the choice can't be persisted.
      }
    }
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  setContentsOpen: (contentsOpen) => set({ contentsOpen }),
  toggleContents: () => set((s) => ({ contentsOpen: !s.contentsOpen })),
  hydrateBookmarks: (bookmarks) => set({ bookmarks }),
  toggleBookmark: (page) => {
    const target = page ?? get().page;
    const existing = get().bookmarks;
    const next = existing.includes(target)
      ? existing.filter((p) => p !== target)
      : [...existing, target].sort((a, b) => a - b);
    set({ bookmarks: next });
    persistBookmarks(next);
  },
  removeBookmark: (page) => {
    const next = get().bookmarks.filter((p) => p !== page);
    set({ bookmarks: next });
    persistBookmarks(next);
  },
}));
