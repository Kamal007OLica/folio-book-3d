import { asset } from "./basePath";

// Interior page textures were exported from the source PDF as
// public/textures/pages/001.jpg .. 078.jpg (one image per printed page).
// 001-005 are front matter (colophon + two blanks + contents spread),
// 006-078 are the main content (folios 006-078). A physical "leaf" has two
// faces (recto/verso), so we pair them up: leaf 0 -> front: 001, back: 002
// ... last leaf may have a blank verso.
export const INTERIOR_PAGE_IMAGE_COUNT = 78;

export interface LeafData {
  front: string;
  back: string;
}

const pad = (n: number) => String(n).padStart(3, "0");
const pagePath = (n: number) => asset(`/textures/pages/${pad(n)}.jpg`);

export const LEAVES: LeafData[] = (() => {
  const leaves: LeafData[] = [];
  for (let i = 1; i <= INTERIOR_PAGE_IMAGE_COUNT; i += 2) {
    leaves.push({
      front: pagePath(i),
      back: i + 1 <= INTERIOR_PAGE_IMAGE_COUNT ? pagePath(i + 1) : asset("/textures/paper-blank.jpg"),
    });
  }
  return leaves;
})();

// PAGE_COUNT = number of turnable leaves, including the front & back cover
// as the first and last "leaf" so they participate in the same open/close
// animation as the interior pages.
export const PAGE_COUNT = LEAVES.length + 2;

export const COVER_FRONT = asset("/textures/cover-front.jpg");
export const COVER_BACK = asset("/textures/cover-back.jpg");
export const SPINE_TEXTURE = asset("/textures/spine.png");
export const PAPER_EDGE_COLOR = "#e7dcc8";
const BLANK_PAGE = asset("/textures/paper-blank.jpg");

export interface LeafFaces {
  front: string;
  back: string;
  isCover: boolean;
}

/** leaf 0 = front cover, leaves 1..N = interior spreads, leaf N+1 = back cover. */
export function getLeafFaces(leafIndex: number): LeafFaces {
  if (leafIndex === 0) {
    return { front: COVER_FRONT, back: BLANK_PAGE, isCover: true };
  }
  if (leafIndex === PAGE_COUNT - 1) {
    return { front: BLANK_PAGE, back: COVER_BACK, isCover: true };
  }
  const leaf = LEAVES[leafIndex - 1];
  return { front: leaf.front, back: leaf.back, isCover: false };
}
