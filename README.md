# Folio — Volume I

An interactive 3D hardcover portfolio. The book rests in a lit room, opens on
click, and its pages bend and turn with drag physics and procedurally
synthesized paper audio.

**Live site:** https://<username>.github.io/folio-book-3d/

## Stack

- **Next.js** (App Router, static export)
- **react-three-fiber** + **drei** — 3D scene, skinned-mesh page bending
- **howler.js** — page-turn audio playback
- **zustand** — page/turn state
- **Tailwind CSS** — HUD and overlays

## How it works

**Page bending.** Each leaf is a `SkinnedMesh` driven by a bone chain
(`src/components/three/pageGeometry.ts`). Turn progress drives a per-bone
rotation curve, so pages arc and flex rather than pivoting rigidly. Leaves
swap z-depth at the halfway point, where the page is edge-on and the swap is
invisible.

**Audio.** No sound files ship with the app. `src/lib/audio/synthPaper.ts`
generates noise, shapes it with a lift/glide/settle envelope plus clustered
crackle transients, then runs it through a swept bandpass filter via
`OfflineAudioContext` and encodes the result as a WAV blob for Howler.

**Drag.** Pointer state lives in a plain mutable object
(`src/lib/dragState.ts`) rather than React state, so high-frequency
`pointermove` events never trigger re-renders — only the `useFrame` loop reads
it, imperatively, each frame.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds a
static export and publishes it to GitHub Pages.

Because a project site is served from `/<repo>/`, the build sets
`NEXT_PUBLIC_BASE_PATH`. Next's `basePath` only rewrites URLs it generates
itself — the three.js texture URLs are fetched raw, so they are prefixed
explicitly via `asset()` in `src/lib/basePath.ts`. Local development leaves
the variable unset and serves from the root.
