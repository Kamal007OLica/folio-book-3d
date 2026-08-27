"use client";

import dynamic from "next/dynamic";
import { HUD } from "@/components/ui/HUD";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ContentsPanel } from "@/components/ui/ContentsPanel";
import { PreferencesInit } from "@/components/PreferencesInit";

const Experience = dynamic(
  () => import("@/components/three/Experience").then((mod) => mod.Experience),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative h-full w-full">
      <PreferencesInit />
      <Experience />
      <HUD />
      <ContentsPanel />
      <LoadingOverlay />
    </main>
  );
}
