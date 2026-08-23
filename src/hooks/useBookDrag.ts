"use client";

import { useCallback, useEffect, useRef } from "react";
import { dragState } from "@/lib/dragState";
import { useBookStore, TOTAL_STOPS } from "@/store/useBookStore";
import { soundEngine } from "@/lib/audio/soundEngine";

const DRAG_RANGE_PX = 340;
const CLICK_DISTANCE_PX = 6;

export function useBookDrag() {
  const setPage = useBookStore((s) => s.setPage);
  const markInteracted = useBookStore((s) => s.markInteracted);
  const draggingRef = useRef(false);
  const maxMoveRef = useRef(0);
  const cleanupRef = useRef<() => void>(() => {});

  const startDrag = useCallback(
    (leafIndex: number, clientX: number) => {
      const page = useBookStore.getState().page;
      let direction: 1 | -1;
      let startProgress: number;
      if (leafIndex === page && page < TOTAL_STOPS) {
        direction = 1;
        startProgress = 0;
      } else if (leafIndex === page - 1 && page > 0) {
        direction = -1;
        startProgress = 1;
      } else {
        return;
      }

      markInteracted();
      soundEngine.init();
      dragState.active = true;
      dragState.leaf = leafIndex;
      dragState.direction = direction;
      dragState.startX = clientX;
      dragState.startProgress = startProgress;
      dragState.progress = startProgress;
      draggingRef.current = true;
      maxMoveRef.current = 0;
      document.body.style.cursor = "grabbing";

      function handleMove(e: PointerEvent) {
        if (!draggingRef.current) return;
        const deltaX = e.clientX - dragState.startX;
        maxMoveRef.current = Math.max(maxMoveRef.current, Math.abs(deltaX));
        const delta = (-deltaX / DRAG_RANGE_PX) * dragState.direction;
        dragState.progress = Math.max(0, Math.min(1, dragState.startProgress + delta));
      }

      function handleUp() {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        const { leaf, direction: dir, progress } = dragState;
        const wasClick = maxMoveRef.current < CLICK_DISTANCE_PX;
        dragState.active = false;
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        document.body.style.cursor = "";

        if (leaf === null) return;
        const currentPage = useBookStore.getState().page;
        if (dir === 1) {
          if (wasClick || progress > 0.5) setPage(currentPage + 1);
        } else {
          if (wasClick || progress < 0.5) setPage(currentPage - 1);
        }
        // else: snaps back to where it was, handled by Page's useFrame reading page/leaf again
      }

      cleanupRef.current = () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [markInteracted, setPage]
  );

  useEffect(() => () => cleanupRef.current(), []);

  return { startDrag };
}
