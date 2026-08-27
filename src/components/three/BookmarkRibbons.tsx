"use client";

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { PAGE_COUNT } from "@/lib/pages-data";
import { PAGE_HEIGHT, PAGE_THICKNESS, PAGE_WIDTH } from "./pageGeometry";
import { useBookStore } from "@/store/useBookStore";
import { SCENE_THEMES } from "@/lib/sceneTheme";
import { describePage, folioRangeLabel } from "@/lib/sections";
import { dragState } from "@/lib/dragState";

/** Index tabs on the fore-edge: wide along x, shallow in y. */
const TAB_W = 0.28;
const TAB_H = 0.075;
const TAB_D = 0.005;
/** Overlaps the fore-edge (x = PAGE_WIDTH) and pokes ~0.18 beyond it. */
const TAB_X = PAGE_WIDTH + 0.04;

// Leaves are only 0.004 thick, so ribbons placed at their true depth would
// sit within a hair of each other and read as one strip. Fanning them down
// the fore-edge by reading position separates the tabs and makes vertical
// position double as a progress cue -- the same way index tabs work.
const TAB_Y_TOP = PAGE_HEIGHT / 2 - 0.18;
const TAB_Y_BOTTOM = -PAGE_HEIGHT / 2 + 0.18;

function tabY(bookmarkPage: number): number {
  const t = Math.max(0, Math.min(1, bookmarkPage / PAGE_COUNT));
  return TAB_Y_TOP + (TAB_Y_BOTTOM - TAB_Y_TOP) * t;
}

function Ribbon({
  bookmarkPage,
  page,
  color,
}: {
  bookmarkPage: number;
  page: number;
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const setPage = useBookStore((s) => s.setPage);

  // Bookmarks can sit on the closing stop (PAGE_COUNT), one past the last
  // real leaf, so clamp before using it as a stack index.
  const leaf = Math.min(PAGE_COUNT - 1, Math.max(0, bookmarkPage));

  // Frozen at mount: useFrame owns the transform from then on, so letting a
  // re-render re-apply these props would snap the group mid-animation.
  const [initial] = useState(() => {
    const turnedAtMount = page > bookmarkPage;
    return {
      turned: turnedAtMount,
      z: -(turnedAtMount ? PAGE_COUNT - 1 - leaf : leaf) * PAGE_THICKNESS,
    };
  });

  const y = tabY(bookmarkPage);
  const isTurned = page > bookmarkPage;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isTurned = page > bookmarkPage;
    // Same rank flip the leaves use: once past the spine, depth order
    // reverses so the left-hand stack sits correctly above the right.
    const rank = isTurned ? PAGE_COUNT - 1 - leaf : leaf;
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      -rank * PAGE_THICKNESS,
      7.5,
      delta
    );
    // Pivots about the spine on the same arc a leaf follows, so turning past
    // a bookmark sweeps its tab over with the pages.
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      isTurned ? -Math.PI : 0,
      7.5,
      delta
    );
  });

  const setCursor = (value: string) => {
    // Page.tsx also drives the cursor for drag affordance; don't stomp it
    // mid-drag.
    if (!dragState.active) document.body.style.cursor = value;
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    setCursor("pointer");
  };
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    setCursor("");
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Stop it reaching the page underneath, which would start a page turn.
    e.stopPropagation();
    setHovered(false);
    setCursor("");
    setPage(bookmarkPage);
  };

  return (
    <group
      ref={groupRef}
      position={[0, 0, initial.z]}
      rotation={[0, initial.turned ? -Math.PI : 0, 0]}
    >
      <mesh
        position={[TAB_X, y, 0]}
        scale={hovered ? [1.14, 1.25, 1] : [1, 1, 1]}
        castShadow
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <boxGeometry args={[TAB_W, TAB_H, TAB_D]} />
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          metalness={0}
          emissive={color}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>

      {hovered && (
        // Anchored inward (toward the spine), never outward: the tabs sit at
        // the fore-edge, so an outward tooltip runs off the viewport. The
        // anchor's local offset mirrors with the group's rotation so it stays
        // inward on either stack, but the DOM transform does not mirror -- so
        // flip it explicitly, otherwise a turned tab's tooltip grows outward
        // off the left edge. Sized by content, so long labels stay on screen.
        <Html
          position={[TAB_X - TAB_W / 2 - 0.08, y, 0.02]}
          zIndexRange={[20, 0]}
          style={{
            pointerEvents: "none",
            transform: isTurned ? "translate(0, -50%)" : "translate(-100%, -50%)",
          }}
        >
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-[var(--hud-border)] bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
            <div className="text-[12px] font-medium leading-tight text-paper">
              {describePage(bookmarkPage)}
            </div>
            <div className="font-mono-tech mt-0.5 text-[9px] uppercase tracking-[0.18em] text-paper/55">
              Folio {folioRangeLabel(bookmarkPage)} · click to open
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function BookmarkRibbons({ page }: { page: number }) {
  const bookmarks = useBookStore((s) => s.bookmarks);
  const theme = useBookStore((s) => s.theme);
  const color = SCENE_THEMES[theme].ribbon;

  // Dedupe defensively; the store already dedupes, this guards hydration.
  const unique = useMemo(() => Array.from(new Set(bookmarks)), [bookmarks]);

  return (
    <>
      {unique.map((bm) => (
        <Ribbon key={bm} bookmarkPage={bm} page={page} color={color} />
      ))}
    </>
  );
}
