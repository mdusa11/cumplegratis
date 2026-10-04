"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

type State = "idle" | "sending" | "ok" | "error";

export async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(String(res.status));
}

/** "¿Falta una promo?": la comunidad alimenta el catálogo. */
export function SuggestForm() {
  const [state, setState] = useState<State>("idle");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;
    setState("sending");
    try {
      await postJson("/api/reports", { slug: "nueva", kind: "new", note: `${brand.trim()} — ${note.trim()}` });
      setState("ok");
    } catch {
      setState("error");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {state === "ok" ? (
        <motion.p key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="display text-5xl">
          ¡Gracias! La revisamos y la subimos 🙌
        </motion.p>
      ) : (
        <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={submit} className="flex flex-col gap-3">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca (ej. Toks)" maxLength={80} className="field" required />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="¿Qué regalan y cómo se cobra?" maxLength={400} className="field" />
          <button type="submit" disabled={state === "sending"} className="btn btn-ink self-start disabled:opacity-60">
            {state === "sending" ? "Enviando…" : "Mandar promo"}
          </button>
          {state === "error" && <p className="font-semibold text-hot">No se pudo enviar. Intenta de nuevo en un rato.</p>}
          <p className="text-sm font-medium">
            No incluyas datos personales. Al enviarla aceptas los{" "}
            <Link href="/terminos" className="underline underline-offset-2">
              Términos
            </Link>{" "}
            y el{" "}
            <Link href="/privacidad" className="underline underline-offset-2">
              Aviso de privacidad
            </Link>
            .
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
