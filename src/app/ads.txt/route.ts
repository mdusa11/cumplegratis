import { ADS } from "@/lib/site";

export const dynamic = "force-static";

// Vendedores autorizados (IAB). Solo existe contenido cuando hay ID de AdSense.
export function GET() {
  const body = ADS.client ? `google.com, ${ADS.client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
