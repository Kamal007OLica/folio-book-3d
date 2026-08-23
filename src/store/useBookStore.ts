import { create } from "zustand";
import { PAGE_COUNT } from "@/lib/pages-data";
import { soundEngine } from "@/lib/audio/soundEngine";

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
}

export const useBookStore = create<BookState>((set, get) => ({
  page: 0,
  isOpen: false,
  hovered: null,
  soundEnabled: true,
  hasInteracted: false,
  theme: "dark",
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
      window.localStorage.setItem("folio-theme", theme);
    }
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));
