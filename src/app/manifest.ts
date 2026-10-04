import type { MetadataRoute } from "next";
import { ACCENT, BASE_PATH, SITE } from "@/lib/site";

export const dynamic = "force-static";

const at = (path: string) => `${BASE_PATH}${path}`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: at("/"),
    name: "Cumplegratis · Promos de cumpleaños",
    short_name: "Cumplegratis",
    description: SITE.description,
    lang: "es-MX",
    dir: "ltr",
    start_url: at("/?app=1"),
    scope: at("/"),
    display: "standalone",
    orientation: "any",
    background_color: "#f3f0e8",
    theme_color: ACCENT,
    categories: ["lifestyle", "shopping", "food"],
    icons: [
      { src: at("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: at("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: at("/icons/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mi plan de cumpleaños", short_name: "Mi cumple", url: at("/mi-cumple/"), icons: [{ src: at("/icons/icon-192.png"), sizes: "192x192" }] },
      { name: "Promos cerca de mí", short_name: "Promos", url: at("/promos/"), icons: [{ src: at("/icons/icon-192.png"), sizes: "192x192" }] },
    ],
    screenshots: [
      { src: at("/screenshots/home.png"), sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Tu cumple sale gratis" },
      { src: at("/screenshots/promos.png"), sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Promos cerca de ti" },
      { src: at("/screenshots/plan.png"), sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Tu plan de cumpleaños" },
    ],
  };
}
