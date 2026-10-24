"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { postJson } from "./SuggestForm";

type State = "idle" | "sending" | "ok" | "error";

/** Alta de recordatorios con doble opt-in: el consentimiento es obligatorio y el correo solo se activa al confirmarlo. */
export function ReminderSignup({ birthday, city }: { birthday: { m: number; d: number }; city?: string | null }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setState("sending");
    try {
      await postJson("/api/reminders", { email, month: birthday.m, day: birthday.d, ...(city ? { city } : {}) });
      setState("ok");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="card my-16 bg-lilac p-7 sm:p-10">
      <p className="mono-tag">Recordatorios</p>
      <h2 className="display mt-2 text-5xl sm:text-7xl">Te avisamos a tiempo</h2>
      <p className="mt-3 max-w-xl text-lg font-medium">Un correo cuando toque registrarte y otro cuando se acerque tu cumple. Nada de spam.</p>
      <AnimatePresence mode="wait">
        {state === "ok" ? (
          <motion.p key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="display mt-6 text-4xl">
            Te mandamos un correo para confirmar <Icon name="mail" shadow />
          </motion.p>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Correo</span>
                <input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="field" />
              </label>
              <button type="submit" disabled={state === "sending" || !consent} className="btn btn-ink disabled:opacity-60">
                {state === "sending" ? "Guardando…" : "Avísenme"}
              </button>
            </div>
            <label className="flex items-start gap-3 text-sm font-medium">
              <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-5 shrink-0" />
              <span>
                Acepto recibir recordatorios de mi cumpleaños por correo y el{" "}
                <Link href="/privacidad#recordatorios" className="underline underline-offset-2">
                  Aviso de privacidad
                </Link>
                .
              </span>
            </label>
          </motion.form>
        )}
      </AnimatePresence>
      {state === "error" && <p className="mt-3 font-semibold">No se pudo guardar. Intenta en un rato.</p>}
      {state !== "ok" && <p className="mt-4 text-sm font-medium">Solo guardamos tu correo y tu día y mes de cumpleaños. Te puedes dar de baja cuando quieras.</p>}
    </section>
  );
}
