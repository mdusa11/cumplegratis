import { OG_SIZE, ogImage } from "@/lib/og";
import { stats } from "@/lib/promos";

export const alt = "Cumplegratis: tu cumple sale gratis";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ kicker: `${stats.total} promos en México`, title: "Tu cumple sale gratis", subtitle: "Café, pastel, cine y descuentos. Te decimos dónde registrarte y hasta cuándo.", color: "#c6ff00" });
}
