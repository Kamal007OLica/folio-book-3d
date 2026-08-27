"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { soundEngine } from "@/lib/audio/soundEngine";

export function LoadingOverlay() {
  const { progress, active } = useProgress();
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100 && !ready) {
      const t = setTimeout(() => setReady(true), 350);
      return () => clearTimeout(t);
    }
  }, [active, progress, ready]);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setDismissed(true), 550);
      return () => clearTimeout(t);
    }
  }, [ready]);

  const handleEnter = () => {
    soundEngine.init();
    soundEngine.playCoverThud();
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background transition-opacity duration-500">
      <div className="flex flex-col items-center gap-3">
        <div className="text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
          Let&rsquo;s Talk &amp; Build.
        </div>
        <div className="font-mono-tech text-[11px] uppercase tracking-[0.3em] text-paper/40">
          Kamalraaj Senthilkumar — Folio Vol. 01
        </div>
      </div>

      <div className="h-px w-40 overflow-hidden bg-[var(--hud-border)]">
        <div
          className="h-full bg-ember transition-[width] duration-200 ease-out"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {ready ? (
        <button
          onClick={handleEnter}
          className="font-mono-tech rounded-full border border-ember/60 px-6 py-2 text-xs uppercase tracking-[0.25em] text-ember-soft transition hover:bg-ember/10"
        >
          Open the book
        </button>
      ) : (
        <div className="font-mono-tech text-[11px] tracking-[0.2em] text-paper/30">
          {Math.floor(progress)}%
        </div>
      )}
    </div>
  );
}
