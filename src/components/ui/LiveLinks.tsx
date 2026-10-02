"use client";

import { LIVE_LINKS } from "@/lib/links";

/**
 * Bottom-left counterweight to the colophon in the opposite corner: same
 * mono label and hairline rule, so the two clusters read as one printed
 * system rather than two unrelated bits of app UI.
 *
 * Desktop stacks the links in a column, which can't collide with the
 * centred page controls however long a title gets. Below `md` there isn't
 * room beside those controls at all, so the cluster sits above them and
 * reflows into a wrapping row to stay short.
 */

function ArrowIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 opacity-70"
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LiveLinks() {
  return (
    <div className="flex flex-col items-center gap-3 md:items-start">
      <div className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-paper/60">
        Live
      </div>
      <div className="h-px w-full min-w-[124px] bg-[var(--hud-border)]" />
      <nav
        aria-label="Live work"
        className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 md:flex-col md:flex-nowrap md:items-start md:gap-y-1"
      >
        {LIVE_LINKS.map(({ href, label, note }) => (
          <a
            key={href}
            href={href}
            title={note}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-tech pointer-events-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-paper/55 transition-colors duration-200 hover:text-ember-soft focus-visible:text-ember-soft focus-visible:outline-none"
          >
            {label}
            <ArrowIcon />
          </a>
        ))}
      </nav>
    </div>
  );
}
