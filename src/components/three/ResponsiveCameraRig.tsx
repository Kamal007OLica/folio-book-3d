"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useBookStore, TOTAL_STOPS } from "@/store/useBookStore";

// Must match the OrbitControls `target` in Experience.tsx — the book's
// vertical center now that it rests on the floor instead of being bisected
// by it (see Book.tsx: raised by PAGE_HEIGHT / 2).
const TARGET = new THREE.Vector3(0, 0.75, 0);

const BASE_FOV = 32;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.8;

// A closed cover is one page-width wide (half-width ~0.75); an open spread
// shows two pages side by side (~1.5) — the frame has to loosen up while
// reading or the sides overflow, then tighten back in when it closes again.
const COVER_HALF_HEIGHT = 1.15;
const COVER_HALF_WIDTH = 1.25;
const SPREAD_HALF_HEIGHT = 1.15;
const SPREAD_HALF_WIDTH = 2.05;

/**
 * Keeps the book comfortably framed regardless of viewport aspect ratio
 * (portrait/mobile included), and re-frames smoothly between the narrower
 * closed-cover silhouette and the wider open two-page spread. Uses
 * camera.zoom rather than fov or position: OrbitControls (makeDefault) owns
 * camera.position every frame via its own spherical radius (direct position
 * edits get overwritten), and zoom is untouched by OrbitControls for a
 * perspective camera (it dollies instead), so it's the one knob that's safe
 * to drive from outside.
 */
export function ResponsiveCameraRig() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const page = useBookStore((s) => s.page);
  const zoomRef = useRef(1);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    // eslint-disable-next-line react-hooks/immutability -- imperative three.js camera update, not React state
    camera.aspect = width / height;
    camera.fov = BASE_FOV;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  // eslint-disable-next-line react-hooks/immutability -- imperative three.js camera update, not React state
  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = width / height;
    const distance = camera.position.distanceTo(TARGET);
    const isSpread = page > 0 && page < TOTAL_STOPS;
    const desiredHalfHeight = isSpread ? SPREAD_HALF_HEIGHT : COVER_HALF_HEIGHT;
    const desiredHalfWidth = isSpread ? SPREAD_HALF_WIDTH : COVER_HALF_WIDTH;

    const halfHeightAtDistance = distance * Math.tan((BASE_FOV * Math.PI) / 180 / 2);
    const zoomForHeight = halfHeightAtDistance / desiredHalfHeight;
    const zoomForWidth = (halfHeightAtDistance * aspect) / desiredHalfWidth;
    const target = THREE.MathUtils.clamp(Math.min(zoomForHeight, zoomForWidth), MIN_ZOOM, MAX_ZOOM);

    zoomRef.current = THREE.MathUtils.damp(zoomRef.current, target, 4, delta);
    // eslint-disable-next-line react-hooks/immutability -- imperative three.js camera update, not React state
    camera.zoom = zoomRef.current;
    camera.updateProjectionMatrix();
  });

  return null;
}
