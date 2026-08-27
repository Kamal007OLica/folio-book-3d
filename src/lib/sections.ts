import { PAGE_COUNT, INTERIOR_PAGE_IMAGE_COUNT } from "./pages-data";

/**
 * The book's real table of contents, transcribed from the Contents spread
 * (folios 004-005). `folio` is the printed folio number, which is also the
 * page-image number: public/textures/pages/006.jpg is folio 006.
 */
export interface SectionEntry {
  folio: number;
  label: string;
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  entries: SectionEntry[];
}

/**
 * Maps a printed folio to the `page` value that brings it into view.
 *
 * Leaf L carries image 2L-1 on its front and 2L on its back, so with `page`
 * counting turned leaves, the open spread at page p shows image 2p-2 on the
 * left and 2p-1 on the right. Inverting that, folio F sits on the spread at
 * floor(F / 2) + 1 -- odd folios land on the right (recto), even on the left.
 */
export function pageForFolio(folio: number): number {
  return Math.max(0, Math.min(PAGE_COUNT, Math.floor(folio / 2) + 1));
}

/** The folios visible on the spread at a given page, for highlighting. */
export function foliosOnPage(page: number): { left: number; right: number } {
  return { left: page * 2 - 2, right: page * 2 - 1 };
}

export const CONTENTS_FOLIO = 4;

export const CHAPTERS: Chapter[] = [
  {
    id: "ch01",
    number: "Ch. 01",
    title: "The Introduction & Operating System",
    entries: [
      { folio: 6, label: "Hi, I'm Kamal" },
      { folio: 7, label: "Proof, tools & a way in" },
      { folio: 8, label: "Design philosophy" },
      { folio: 9, label: "The 11-step process" },
      { folio: 10, label: "Second brain setup" },
      { folio: 11, label: "Venture knowledge base" },
      { folio: 12, label: "The skillsets" },
      { folio: 13, label: "Certifications" },
    ],
  },
  {
    id: "ch02",
    number: "Ch. 02",
    title: "Awards, Recognition & IP",
    entries: [
      { folio: 16, label: "Design Forge '25 · national winner" },
      { folio: 18, label: "Figma Fusion & system sense" },
      { folio: 20, label: "Research poster & presentation" },
      { folio: 22, label: "Designathon '25 · redesigned flow" },
      { folio: 24, label: "nVision '26 · route optimisation" },
      { folio: 26, label: "Xflows time tracker" },
      { folio: 27, label: "Best market validation" },
      { folio: 28, label: "Top 8% of startups · $205K credits" },
      { folio: 30, label: "Green Hydrogen Mission logo" },
      { folio: 31, label: "Five papers, legally mine" },
    ],
  },
  {
    id: "ch03",
    number: "Ch. 03",
    title: "Case Study · Licaverse Ecosystem",
    entries: [
      { folio: 34, label: "Welcome to Licaverse" },
      { folio: 36, label: "An eagle's view" },
      { folio: 38, label: "Research, findings & hook cycle" },
      { folio: 40, label: "Product crux & learning loop" },
      { folio: 42, label: "Future of learning · ecosystem" },
      { folio: 44, label: "Design system" },
      { folio: 46, label: "Milestones & the grand vision" },
    ],
  },
  {
    id: "ch04",
    number: "Ch. 04",
    title: "Case Study · ZenMode Launcher",
    entries: [
      { folio: 50, label: "Reimagining minimal digital life" },
      { folio: 52, label: "Build team & core problem" },
      { folio: 54, label: "Home screen & journey map" },
      { folio: 56, label: "Three loops, one habit" },
      { folio: 58, label: "Play Store listing · V3" },
      { folio: 60, label: "Event taxonomy & live metrics" },
    ],
  },
  {
    id: "ch05",
    number: "Ch. 05",
    title: "Venture & Systems Design",
    entries: [
      { folio: 64, label: "One venture, one visual language" },
      { folio: 66, label: "Systems, frameworks, SOPs" },
      { folio: 68, label: "Founder and product designer" },
    ],
  },
  {
    id: "ch06",
    number: "Ch. 06",
    title: "The Offline Chapter",
    entries: [
      { folio: 70, label: "Away from the desk · mentorship" },
      { folio: 72, label: "Meditation · 22,320 minutes" },
      { folio: 73, label: "Training · 244 workouts" },
      { folio: 74, label: "Reading habit · 100+ books" },
      { folio: 75, label: "Open source contributions" },
      { folio: 77, label: "Closing note · with gratitude" },
    ],
  },
];

/**
 * Folio label for a spread, e.g. "06-07". Bookmarks are stored as page
 * indices, but readers navigate by the folio numbers printed in the book
 * and listed in the contents, so showing the page index here would put two
 * different numbers on the same spread.
 */
export function folioRangeLabel(page: number): string {
  if (page <= 0) return "Cover";
  if (page >= PAGE_COUNT) return "End";
  const { left, right } = foliosOnPage(page);
  const from = Math.max(1, left);
  const to = Math.min(INTERIOR_PAGE_IMAGE_COUNT, right);
  const pad = (n: number) => String(n).padStart(2, "0");
  return from === to ? pad(from) : `${pad(from)}–${pad(to)}`;
}

/** Best-effort label for a page, used to name bookmarks. */
export function describePage(page: number): string {
  if (page <= 0) return "Front cover";
  if (page >= PAGE_COUNT) return "Back cover";
  const { left, right } = foliosOnPage(page);
  for (const chapter of CHAPTERS) {
    for (const entry of chapter.entries) {
      if (entry.folio === left || entry.folio === right) return entry.label;
    }
  }
  if (left <= CONTENTS_FOLIO + 1 && right >= CONTENTS_FOLIO) return "Contents";
  return `Folio ${String(right).padStart(3, "0")}`;
}
