import { json, supabase } from "@/lib/supabase";
import { getPromo } from "@/lib/promos";

const KINDS = new Set(["works", "broken", "new"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const kind = String(body?.kind ?? "");
  const slug = String(body?.slug ?? "");
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : null;
  if (!KINDS.has(kind) || (kind === "new" ? !note : !getPromo(slug))) return json({ error: "invalid" }, 400);

  const db = supabase();
  if (!db) return json({ error: "not_configured" }, 503);

  const { error } = await db.from("promo_reports").insert({ slug: kind === "new" ? null : slug, kind, note });
  if (error) return json({ error: "db" }, 500);
  return json({ ok: true });
}
