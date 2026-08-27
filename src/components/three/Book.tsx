"use client";

import * as THREE from "three";
import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PAGE_COUNT, getLeafFaces } from "@/lib/pages-data";
import { useBookStore } from "@/store/useBookStore";
import { useBookDrag } from "@/hooks/useBookDrag";
import { Page, FlatFiller } from "./Page";
import { Spine } from "./Spine";
import { BookmarkRibbons } from "./BookmarkRibbons";
import { PAGE_HEIGHT, PAGE_THICKNESS, PAGE_WIDTH } from "./pageGeometry";

const WINDOW = 2;

export function Book() {
  const page = useBookStore((s) => s.page);
  const { startDrag } = useBookDrag();
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const targetTilt = useRef({ x: 0, y: 0 });

  const leaves = useMemo(
    () => Array.from({ length: PAGE_COUNT }, (_, i) => ({ index: i, ...getLeafFaces(i) })),
    []
  );

  const windowStart = Math.max(0, page - WINDOW);
  const windowEnd = Math.min(PAGE_COUNT - 1, page + WINDOW);

  const totalThickness = PAGE_COUNT * PAGE_THICKNESS;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // A slow, continuous idle sway so the book feels alive even with no
    // pointer movement, layered underneath the mouse-parallax tilt.
    const t = state.clock.elapsedTime;
    const idleSwayY = Math.sin(t * 0.28) * 0.035;
    const idleSwayX = Math.sin(t * 0.21 + 1.3) * 0.015;
    targetTilt.current.y = -0.32 + state.pointer.x * 0.05 + idleSwayY;
    targetTilt.current.x = 0.07 + state.pointer.y * -0.025 + idleSwayX;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetTilt.current.y,
      3,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetTilt.current.x,
      3,
      delta
    );
    // Centering has three regimes: only the right (unread) stack has
    // content -> center on that lone page; only the left (read) stack has
    // content -> center on that lone page; both stacks present (the normal
    // reading state, a real two-page spread) -> center on the spine itself,
    // since the spread is symmetric around it.
    if (innerRef.current) {
      const targetX = page <= 0 ? -PAGE_WIDTH / 2 : page >= PAGE_COUNT ? PAGE_WIDTH / 2 : 0;
      innerRef.current.position.x = THREE.MathUtils.damp(
        innerRef.current.position.x,
        targetX,
        4,
        delta
      );
    }
  });

  return (
    // Pages are centered on local y=0, so the whole stack has to be lifted
    // by half its height — otherwise it's centered ON the floor and the
    // bottom half renders buried beneath it (looked like the cover art was
    // cropped, but it was actually just occluded by the floor plane).
    <group ref={groupRef} position={[0, PAGE_HEIGHT / 2, totalThickness / 2]}>
      <group ref={innerRef} position={[-PAGE_WIDTH / 2, 0, 0]}>
        <Spine totalThickness={totalThickness} page={page} />
        <BookmarkRibbons page={page} />
        {leaves.map((leaf) => {
          const inWindow = leaf.index >= windowStart && leaf.index <= windowEnd;
          const isCoverLeaf = leaf.isCover;
          if (inWindow || isCoverLeaf) {
            return (
              <Suspense
                key={leaf.index}
                fallback={<FlatFiller leafIndex={leaf.index} page={page} />}
              >
                <Page
                  leafIndex={leaf.index}
                  frontUrl={leaf.front}
                  backUrl={leaf.back}
                  page={page}
                  isCover={isCoverLeaf}
                  onStartDrag={startDrag}
                />
              </Suspense>
            );
          }
          return <FlatFiller key={leaf.index} leafIndex={leaf.index} page={page} />;
        })}
      </group>
    </group>
  );
}
