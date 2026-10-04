import { json, supabase } from "@/lib/supabase";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const month = Number(body?.month);
  const day = Number(body?.day);
  if (!EMAIL.test(email) || email.length > 254 || !(month >= 1 && month <= 12) || !(day >= 1 && day <= 31)) {
    return json({ error: "invalid" }, 400);
  }

  const db = supabase();
  if (!db) return json({ error: "not_configured" }, 503);

  const { error } = await db.from("reminders").insert({ email, birth_month: month, birth_day: day });
  // 23505 = ya estaba registrado: para el usuario es un éxito.
  if (error && error.code !== "23505") return json({ error: "db" }, 500);
  return json({ ok: true });
}
