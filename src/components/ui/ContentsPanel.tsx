"use client";

import { useEffect, useRef } from "react";
import { useBookStore } from "@/store/useBookStore";
import {
  CHAPTERS,
  CONTENTS_FOLIO,
  describePage,
  folioRangeLabel,
  foliosOnPage,
  pageForFolio,
} from "@/lib/sections";
import { PAGE_COUNT } from "@/lib/pages-data";

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RibbonIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    >
      <path
        d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContentsPanel() {
  const open = useBookStore((s) => s.contentsOpen);
  const setContentsOpen = useBookStore((s) => s.setContentsOpen);
  const page = useBookStore((s) => s.page);
  const setPage = useBookStore((s) => s.setPage);
  const bookmarks = useBookStore((s) => s.bookmarks);
  const removeBookmark = useBookStore((s) => s.removeBookmark);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContentsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setContentsOpen]);

  if (!open) return null;

  const { left, right } = foliosOnPage(page);
  const goTo = (targetPage: number) => {
    setPage(targetPage);
    setContentsOpen(false);
  };

  const isCurrentEntry = (folio: number) => folio === left || folio === right;

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      {/* scrim */}
      <button
        aria-label="Close contents"
        onClick={() => setContentsOpen(false)}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contents"
        className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--hud-border)] bg-background/95 shadow-2xl backdrop-blur-md"
      >
        {/* header — mirrors the book's own contents spread */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hud-border)] px-6 py-5 sm:px-8">
          <div>
            <div className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-paper/50">
              Contents · Vol. 01
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-paper">Sections</h2>
          </div>
          <button
            ref={closeRef}
            onClick={() => setContentsOpen(false)}
            aria-label="Close contents"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--hud-border)] text-paper/70 transition hover:border-ember/60 hover:text-ember-soft"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 sm:px-8">
          {bookmarks.length > 0 && (
            <section className="mb-7">
              <div className="font-mono-tech mb-3 text-[10px] uppercase tracking-[0.22em] text-paper/50">
                Bookmarks
              </div>
              <ul className="flex flex-col gap-1">
                {bookmarks.map((bm) => (
                  <li key={bm} className="flex items-center gap-2">
                    <button
                      onClick={() => goTo(bm)}
                      className={`flex flex-1 items-center gap-3 rounded px-2 py-1.5 text-left text-sm transition hover:bg-ember/10 ${
                        bm === page ? "text-ember-soft" : "text-paper/80"
                      }`}
                    >
                      <RibbonIcon filled />
                      <span className="flex-1 truncate">{describePage(bm)}</span>
                      <span className="font-mono-tech text-[10px] tracking-[0.15em] text-paper/45">
                        {folioRangeLabel(bm)}
                      </span>
                    </button>
                    <button
                      onClick={() => removeBookmark(bm)}
                      aria-label={`Remove bookmark: ${describePage(bm)}`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-paper/40 transition hover:text-ember-soft"
                    >
                      <CloseIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* quick jumps */}
          <section className="mb-7">
            <div className="font-mono-tech mb-3 text-[10px] uppercase tracking-[0.22em] text-paper/50">
              Jump to
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Front cover", target: 0 },
                { label: "Contents", target: pageForFolio(CONTENTS_FOLIO) },
                { label: "Back cover", target: PAGE_COUNT },
              ].map(({ label, target }) => (
                <button
                  key={label}
                  onClick={() => goTo(target)}
                  className={`font-mono-tech rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                    page === target
                      ? "border-ember/70 text-ember-soft"
                      : "border-[var(--hud-border)] text-paper/70 hover:border-ember/50 hover:text-ember-soft"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* chapters, two columns on desktop like the printed spread */}
          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {CHAPTERS.map((chapter) => {
              const chapterActive = chapter.entries.some((e) => isCurrentEntry(e.folio));
              return (
                <section key={chapter.id}>
                  <div className="mb-2 flex items-baseline gap-3">
                    <span
                      className={`font-mono-tech text-[10px] uppercase tracking-[0.22em] ${
                        chapterActive ? "text-ember-soft" : "text-paper/45"
                      }`}
                    >
                      {chapter.number}
                    </span>
                    <span className="h-px flex-1 bg-[var(--hud-border)]" />
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold leading-snug tracking-tight text-paper">
                    {chapter.title}
                  </h3>
                  <ul className="flex flex-col">
                    {chapter.entries.map((entry) => {
                      const active = isCurrentEntry(entry.folio);
                      return (
                        <li key={entry.folio}>
                          <button
                            onClick={() => goTo(pageForFolio(entry.folio))}
                            className={`flex w-full items-baseline gap-3 rounded px-2 py-1 text-left text-[13px] transition hover:bg-ember/10 ${
                              active ? "text-ember-soft" : "text-paper/75 hover:text-paper"
                            }`}
                          >
                            <span className="font-mono-tech w-7 shrink-0 text-[10px] tracking-[0.12em] text-paper/45">
                              {String(entry.folio).padStart(2, "0")}
                            </span>
                            <span className="flex-1">{entry.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
