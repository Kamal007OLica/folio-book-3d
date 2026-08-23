// Mutable, non-reactive drag state shared between the pointer handlers and
// the per-frame bending logic in <Page/>. Kept outside React/zustand so that
// high-frequency pointermove updates never trigger a re-render — only the
// useFrame loop reads it, every frame, imperatively.
export interface DragState {
  active: boolean;
  leaf: number | null;
  direction: 1 | -1;
  startX: number;
  startProgress: number;
  progress: number;
}

export const dragState: DragState = {
  active: false,
  leaf: null,
  direction: 1,
  startX: 0,
  startProgress: 0,
  progress: 0,
};

export function resetDrag() {
  dragState.active = false;
  dragState.leaf = null;
}
