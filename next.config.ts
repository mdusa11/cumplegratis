import type { NextConfig } from "next";

// Modos de build:
// - normal (Vercel/servidor): todo, incluidas las rutas /api (archivos route.dynamic.ts).
// - STATIC_EXPORT=true (Cloudflare Pages en la raíz del dominio): HTML estático, sin /api.
// - GITHUB_PAGES=true: igual que el estático pero bajo /cumplegratis.
const pages = process.env.GITHUB_PAGES === "true";
const staticExport = pages || process.env.STATIC_EXPORT === "true";
const basePath = pages ? "/cumplegratis" : "";

const nextConfig: NextConfig = {
  ...(staticExport && { output: "export", trailingSlash: true }),
  ...(pages && { basePath }),
  // Las rutas /api viven en route.dynamic.ts: en modo estático esa extensión no cuenta y se excluyen solas.
  pageExtensions: staticExport ? ["tsx", "ts"] : ["tsx", "ts", "dynamic.ts"],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC: staticExport ? "1" : "",
  },
};

export default nextConfig;
