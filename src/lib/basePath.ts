/**
 * Next's `basePath` only rewrites URLs it generates itself (routing, `_next`
 * bundles, next/image, next/link). Textures here are fetched as raw URLs by
 * three.js `useTexture`, which Next never sees — so those have to be prefixed
 * by hand or they 404 on a GitHub Pages project subpath.
 *
 * Inlined at build time by Next because of the NEXT_PUBLIC_ prefix, so this
 * works inside client components.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Resolves a root-relative public/ path against the deployment's base path. */
export const asset = (path: string) => `${BASE_PATH}${path}`;
