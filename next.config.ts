import type { NextConfig } from "next";

// GITHUB_PAGES=true → export 100% estático bajo /cumplegratis (sin APIs: Pages no corre servidor).
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/cumplegratis" : "";

const nextConfig: NextConfig = {
  ...(pages && { output: "export", basePath, trailingSlash: true }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC: pages ? "1" : "",
  },
};

export default nextConfig;
