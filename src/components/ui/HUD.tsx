"use client";

import { useEffect, useState } from "react";
import { useBookStore, TOTAL_STOPS } from "@/store/useBookStore";
import { soundEngine } from "@/lib/audio/soundEngine";
import { SocialLinks } from "./SocialLinks";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SoundOnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function SoundOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
      <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.7 6.7 0 0 0 10.2 10.2z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const hudButton =
  "pointer-events-auto flex items-center justify-center rounded-full border transition backdrop-blur";
const hudButtonSurface = "border-[var(--hud-border)] bg-[var(--hud-surface)] text-paper/80";

export function HUD() {
  const page = useBookStore((s) => s.page);
  const next = useBookStore((s) => s.next);
  const prev = useBookStore((s) => s.prev);
  const soundEnabled = useBookStore((s) => s.soundEnabled);
  const toggleSound = useBookStore((s) => s.toggleSound);
  const theme = useBookStore((s) => s.theme);
  const toggleTheme = useBookStore((s) => s.toggleTheme);
  const hasInteracted = useBookStore((s) => s.hasInteracted);
  const markInteracted = useBookStore((s) => s.markInteracted);

  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (hasInteracted) {
      const t = setTimeout(() => setShowHint(false), 400);
      return () => clearTimeout(t);
    }
  }, [hasInteracted]);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleNav = (dir: "next" | "prev") => {
    markInteracted();
    if (dir === "next") next();
    else prev();
  };

  return (
    <div className="pointer-events-none fixed inset-0 flex flex-col justify-between p-6 sm:p-8">
      {/* top bar */}
      <div className="flex items-start justify-between">
        {/* Left cluster reads as a printed colophon: label, hairline, contacts. */}
        <div className="flex flex-col items-start gap-3">
          <div className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-paper/60">
            Folio · Volume I
          </div>
          <div className="h-px w-full min-w-[124px] bg-[var(--hud-border)]" />
          <SocialLinks />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={`${hudButton} ${hudButtonSurface} h-9 w-9 hover:border-ember/60 hover:text-ember-soft`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
            className={`${hudButton} ${hudButtonSurface} h-9 w-9 hover:border-ember/60 hover:text-ember-soft`}
          >
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
        </div>
      </div>

      {/* center hint */}
      <div
        className={`pointer-events-none mx-auto max-w-xs text-center transition-opacity duration-700 ${
          showHint ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-paper/50">
          Click or drag a page edge to turn
        </p>
      </div>

      {/* bottom bar */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => handleNav("prev")}
          disabled={page <= 0}
          aria-label="Previous page"
          className={`${hudButton} ${hudButtonSurface} h-11 w-11 enabled:hover:border-ember/70 enabled:hover:text-ember-soft disabled:opacity-25`}
        >
          <ChevronLeft />
        </button>

        <div className="font-mono-tech min-w-[86px] text-center text-xs tracking-[0.15em] text-paper/70">
          {String(page).padStart(2, "0")} / {String(TOTAL_STOPS).padStart(2, "0")}
        </div>

        <button
          onClick={() => handleNav("next")}
          disabled={page >= TOTAL_STOPS}
          aria-label="Next page"
          className={`${hudButton} ${hudButtonSurface} h-11 w-11 enabled:hover:border-ember/70 enabled:hover:text-ember-soft disabled:opacity-25`}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
