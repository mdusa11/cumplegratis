import { createClient } from "@supabase/supabase-js";

/** Cliente con la anon key: las tablas solo permiten INSERT (ver supabase/schema.sql). Null si no hay credenciales. */
export function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });
