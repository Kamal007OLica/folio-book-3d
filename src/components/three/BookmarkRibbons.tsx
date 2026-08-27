"use client";

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PAGE_COUNT } from "@/lib/pages-data";
import { PAGE_HEIGHT, PAGE_THICKNESS, PAGE_WIDTH } from "./pageGeometry";
import { useBookStore } from "@/store/useBookStore";
import { SCENE_THEMES } from "@/lib/sceneTheme";

const RIBBON_WIDTH = 0.055;
const RIBBON_HEIGHT = 0.34;
const RIBBON_DEPTH = 0.005;
/** Centre chosen so the strip pokes ~0.16 above the page's top edge. */
const RIBBON_Y = PAGE_HEIGHT / 2 - RIBBON_HEIGHT / 2 + 0.16;

// Leaves are only 0.004 thick, so ribbons a few pages apart would sit within
// a hair of each other in depth and read as one strip. Instead, fan them
// along the top edge by how far through the book they sit -- they separate
// visibly, and the tab's position doubles as a progress cue. The near end
// clears the spine block (which spans x <= 0).
const RIBBON_X_NEAR = PAGE_WIDTH * 0.3;
const RIBBON_X_FAR = PAGE_WIDTH * 0.92;

function ribbonX(bookmarkPage: number): number {
  const t = Math.max(0, Math.min(1, bookmarkPage / PAGE_COUNT));
  return RIBBON_X_NEAR + (RIBBON_X_FAR - RIBBON_X_NEAR) * t;
}

/**
 * One ribbon marking a bookmarked spread.
 *
 * Mirrors how a leaf moves rather than merely re-stacking: the group pivots
 * about the spine (x = 0) from 0 to -PI, so when pages turn past the
 * bookmark the ribbon sweeps across on the same arc a page does, instead of
 * sliding through the paper stack.
 */
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
  // Bookmarks can sit on the closing stop (PAGE_COUNT), which is one past the
  // last real leaf, so clamp before using it as a stack index.
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
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      isTurned ? -Math.PI : 0,
      7.5,
      delta
    );
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, initial.z]}
      rotation={[0, initial.turned ? -Math.PI : 0, 0]}
    >
      <mesh position={[ribbonX(bookmarkPage), RIBBON_Y, 0]} castShadow>
        <boxGeometry args={[RIBBON_WIDTH, RIBBON_HEIGHT, RIBBON_DEPTH]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0} />
      </mesh>
    </group>
  );
}

export function BookmarkRibbons({ page }: { page: number }) {
  const bookmarks = useBookStore((s) => s.bookmarks);
  const theme = useBookStore((s) => s.theme);
  const color = SCENE_THEMES[theme].ribbon;

  // Two bookmarks on adjacent leaves would z-fight at nearly the same depth;
  // dedupe defensively (the store already dedupes, this guards hydration).
  const unique = useMemo(() => Array.from(new Set(bookmarks)), [bookmarks]);

  return (
    <>
      {unique.map((bm) => (
        <Ribbon key={bm} bookmarkPage={bm} page={page} color={color} />
      ))}
    </>
  );
}
