import type { NextConfig } from "next";

// GitHub Pages serves a project site from a subpath (/<repo>), so every URL
// the app emits has to carry that prefix. Driven by an env var so local dev
// and Vercel (which serve from the root) stay unprefixed.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Pages is a static host — no Node server, so prerender everything to HTML.
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
