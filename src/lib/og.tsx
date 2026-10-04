import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ACCENT } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets", file));

/** Plantilla de imagen para compartir: titular gigante + sticker de la marca Cumplegratis. */
export async function ogImage({ kicker, title, subtitle, color }: { kicker: string; title: string; subtitle: string; color: string }) {
  const [display, sans] = await Promise.all([font("BigShoulders-Black.ttf"), font("Bricolage-Bold.ttf")]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: color, padding: 64, border: "14px solid #0b0b0b", fontFamily: "Bricolage" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 2, textTransform: "uppercase", border: "4px solid #0b0b0b", borderRadius: 999, padding: "8px 22px", background: "#f3f0e8" }}>
            {kicker}
          </div>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "BigShoulders", fontSize: 54, textTransform: "uppercase" }}>
            Cumple
            <span style={{ marginLeft: 8, background: ACCENT, border: "4px solid #0b0b0b", borderRadius: 12, padding: "0 10px", transform: "rotate(-4deg)" }}>gratis</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "BigShoulders", fontSize: title.length > 12 ? 150 : 200, lineHeight: 0.82, textTransform: "uppercase", color: "#0b0b0b" }}>{title}</div>
          <div style={{ marginTop: 26, fontSize: 44, color: "#0b0b0b", maxWidth: 980 }}>{subtitle}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "BigShoulders", data: display, weight: 900, style: "normal" },
        { name: "Bricolage", data: sans, weight: 700, style: "normal" },
      ],
    },
  );
}
