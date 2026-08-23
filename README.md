# Folio — 3D Interactive Book

An immersive hardcover-portfolio experience: a real 3D book you open, drag, and page through, built with react-three-fiber. Front cover, spine, back cover, and all 73 interior pages are your actual exported artwork; paper-rustle audio is synthesized entirely in-browser (no sound files).

## Stack & key dependencies

| Package | Why |
|---|---|
| `next` 16 (App Router) | App shell, routing, `next/font` for Plus Jakarta Sans + JetBrains Mono |
| `three` | Underlying WebGL engine |
| `@react-three/fiber` | React renderer for three.js — the `<Canvas>` and scene graph |
| `@react-three/drei` | `useTexture`, `OrbitControls`, `ContactShadows` helpers |
| `howler` | Audio playback engine for the synthesized page-turn/cover-thud sounds |
| `zustand` | Tiny global store for the book's page-index state |
| `tailwindcss` v4 | Minimal UI chrome (HUD, loading screen) |

No `postprocessing`/`meshline`/HDRI-environment packages are used — lighting is a manual three-point setup plus `ContactShadows`, kept dependency-light and offline-friendly (no third-party CDN fetch for environment maps).

## Project structure

```
src/
  app/
    layout.tsx        Fonts, metadata, global styles
    page.tsx           Client entry — lazy-loads the 3D Experience (ssr: false)
    globals.css
  components/
    three/
      Experience.tsx        Canvas, camera, OrbitControls
      Room.tsx               Lighting rig + floor + ContactShadows
      Book.tsx               Orchestrates all leaves, idle parallax tilt,
                              end-of-book recentring
      Page.tsx               The bending page: bone-skinned plane, drag
                              interactivity, per-frame paper curl
      Spine.tsx               The book's binding, using your spine artwork
      pageGeometry.ts         Shared geometry/skinning/bend math
      ResponsiveCameraRig.tsx Keeps the book framed at any aspect ratio
    ui/
      HUD.tsx                 Page counter, prev/next, mute toggle
      LoadingOverlay.tsx       Minimal loading screen
  hooks/
    useBookDrag.ts             Pointer-drag-to-turn + click-to-turn logic
  lib/
    pages-data.ts               Leaf → texture-path mapping
    dragState.ts                 Non-reactive drag state (read every frame,
                                   never triggers React re-renders)
    audio/
      synthPaper.ts              Procedural paper-rustle noise synthesis
      soundEngine.ts              Howler wrapper around the synthesized sounds
  store/
    useBookStore.ts               Global page-index state + sound triggers
public/
  textures/
    cover-front.jpg, cover-back.jpg, spine.png, paper-blank.jpg
    pages/001.jpg … 073.jpg       Compressed interior page textures
```

## How the page-turn works

Each leaf is a `PlaneGeometry` subdivided into 22 segments along its width, skinned to a chain of 23 bones (standard three.js `SkinnedMesh` technique). Turning a page animates:

- **Hinge rotation** (`bones[0]`) — the page's overall open/closed angle.
- **Incremental curl** on the remaining bones — an S-curve that peaks exactly mid-turn and flattens at rest, giving the paper a convincing bend instead of rotating as a rigid flat plane.
- **Depth re-ranking** — a leaf's z-stacking position swaps sides the instant it crosses the spine (progress 0.5, where it's edge-on and invisible), so pages correctly pile up on whichever side they've been turned to, and the back cover surfaces properly once the whole book is read.

Front/back faces of a leaf are two meshes sharing one skeleton; the back face's UVs are horizontally mirrored so its text reads correctly once the page has turned (naively rendering the same UVs with `THREE.BackSide` shows mirrored text).

Interaction: click (or a short drag) on the active page edge turns it; a longer drag lets you manually control the turn in real time, snapping forward/back on release depending on how far you dragged. Only ~5 leaves near the current page are ever fully textured/skinned at once — everything else is a cheap untextured filler plane, so the 73-page book stays light.

## Audio

`lib/audio/synthPaper.ts` generates short noise bursts (layered grains, high-pass filtered, with sparse crackle spikes) entirely with plain JS math — no external sound assets. These are packaged as WAV blobs and handed to Howler (`soundEngine.ts`), which the store triggers on every committed page turn, with pitch/volume jitter for variety and a distinct low "thud" for the cover closing at either end.

Audio initializes on the first real user gesture (satisfies browser autoplay policy).

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

This is a stock Next.js App Router project — no custom server, no special build steps.

```bash
npx vercel
```

or connect the repo in the Vercel dashboard and it will detect Next.js automatically. `next build` has been verified to compile cleanly (TypeScript + ESLint both pass with zero errors).

## Swapping in updated artwork

Regenerate `public/textures/` by re-exporting from your source design file at the same names/aspect ratios:

- `cover-front.jpg`, `cover-back.jpg` — square, ~1600px
- `spine.png` — tall strip with transparent rounded ends, ~900px tall
- `pages/NNN.jpg` — sequential 3-digit filenames, square, ~1400px

No code changes needed as long as the file count/order matches `INTERIOR_PAGE_IMAGE_COUNT` in `src/lib/pages-data.ts`.
