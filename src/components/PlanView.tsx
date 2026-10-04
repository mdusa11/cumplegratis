"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BirthdayPicker, burst } from "./BirthdayPicker";
import { BenefitBadge } from "./BenefitBadge";
import { CountUp } from "./fx";
import { locationName, useAutoAskLocation, useLocation } from "./LocationProvider";
import { useOpenPromo } from "./PromoSheet";
import { availability, isAvailable } from "@/lib/availability";
import { promos } from "@/lib/promos";
import { postJson } from "./SuggestForm";
import { SplitText } from "./Reveal";
import { buildPlan, formatDate, type Birthday, type PlanItem } from "@/lib/plan";
import { API_ENABLED, MONTHS, cn } from "@/lib/site";
import { toggleDone, useDone, useStoredBirthday } from "@/lib/storage";

function useBirthday(): Birthday | null {
  const params = useSearchParams();
  const stored = useStoredBirthday();
  const m = Number(params.get("m"));
  const d = Number(params.get("d"));
  if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return { m, d };
  return stored;
}

export function PlanView() {
  const birthday = useBirthday();
  const [editing, setEditing] = useState(false);

  if (!birthday || editing) {
    return (
      <section className="flex min-h-[80svh] flex-col justify-center">
        <p className="mono-tag">Tu plan de cumpleaños</p>
        <h1 className="display mt-3 text-[clamp(4rem,14vw,12rem)]">
          <SplitText text="¿Cuándo" className="block" />
          <SplitText text="cumples?" delay={0.15} className="block text-hot" />
        </h1>
        <BirthdayPicker size="lg" className="mt-10" onDone={editing ? () => setEditing(false) : undefined} />
      </section>
    );
  }
  return <Plan birthday={birthday} onEdit={() => setEditing(true)} />;
}

function Plan({ birthday, onEdit }: { birthday: Birthday; onEdit: () => void }) {
  const { location, openPicker } = useLocation();
  useAutoAskLocation();
  const plan = useMemo(
    () => buildPlan(birthday, location ? promos.filter((p) => isAvailable(availability(p, location))) : promos),
    [birthday, location],
  );
  const done = useDone();
  const needSignup = [...plan.now, ...plan.later];
  const doneCount = needSignup.filter((i) => done.includes(i.promo.slug)).length;
  const isToday = plan.daysLeft === 0;

  useEffect(() => {
    if (isToday) burst({ x: 0.5, y: 0.3 });
  }, [isToday]);

  return (
    <>
      <section className="pb-12">
        <p className="mono-tag">
          Tu cumple: {birthday.d} de {MONTHS[birthday.m - 1]} ·{" "}
          <button type="button" onClick={onEdit} className="underline underline-offset-4 hover:text-hot">
            cambiar
          </button>{" "}
          · 📍 {location ? locationName(location) : "Todo México"} ·{" "}
          <button type="button" onClick={openPicker} className="underline underline-offset-4 hover:text-hot">
            {location ? "cambiar zona" : "elegir mi ciudad"}
          </button>
        </p>
        {isToday ? (
          <h1 className="display mt-4 text-[clamp(5rem,20vw,18rem)]">
            <SplitText text="¡Hoy es" className="block" />
            <SplitText text="tu cumple!" delay={0.2} className="block text-hot" />
          </h1>
        ) : (
          <h1 className="display mt-4 flex flex-wrap items-end gap-x-6 text-[clamp(5rem,22vw,20rem)]">
            <Countdown value={plan.daysLeft} />
            <span className="pb-[0.12em] text-[0.32em] leading-[0.9]">
              {plan.daysLeft === 1 ? "día" : "días"}
              <br />
              para tu cumple
            </span>
          </h1>
        )}

        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
          <Stat value={plan.total} label="regalos te esperan" color="var(--color-acid)" />
          <Stat value={plan.now.length} label="registros urgentes" color="var(--color-hot)" />
          <Stat value={plan.walkIn.length} label="solo con tu INE" color="var(--color-sky)" />
        </div>

        {needSignup.length > 0 && (
          <div className="card mt-6 bg-paper p-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="display text-3xl">Tu avance</p>
              <p className="mono-tag">
                {doneCount}/{needSignup.length} registros
              </p>
            </div>
            <div className="mt-3 h-5 overflow-hidden rounded-full border-2 border-ink bg-paper-2">
              <motion.div
                className="h-full rounded-full bg-acid"
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / needSignup.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        )}
      </section>

      <Group
        title="🔥 Regístrate ya"
        hint="Su fecha límite ya está cerca (o ya pasó: regístrate igual por si alcanzas)."
        items={plan.now}
        done={done}
      />
      <Group title="📅 Más adelante" hint="Tienes tiempo, pero no lo dejes para el final." items={plan.later} done={done} />
      <Group title="🪪 Sin registro" hint="Solo llega en tu fecha con identificación oficial." items={plan.walkIn} done={done} />

      <ReminderForm birthday={birthday} />
    </>
  );
}

function Countdown({ value }: { value: number }) {
  return (
    <span className="inline-flex overflow-hidden" aria-label={String(value)}>
      {String(value)
        .split("")
        .map((digit, i) => (
          <motion.span
            key={`${i}-${digit}`}
            aria-hidden
            initial={{ y: "100%", rotate: 10 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 200, damping: 18 }}
            className="inline-block"
          >
            {digit}
          </motion.span>
        ))}
    </span>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.4 }}
      className="card !rounded-2xl p-3 sm:!rounded-3xl sm:p-5"
      style={{ background: color }}
    >
      <p className="display text-5xl sm:text-7xl">
        <CountUp value={value} />
      </p>
      <p className="text-sm leading-tight font-semibold sm:text-lg">{label}</p>
    </motion.div>
  );
}

function Group({ title, hint, items, done }: { title: string; hint: string; items: PlanItem[]; done: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-10">
      <h2 className="display text-5xl sm:text-7xl">{title}</h2>
      <p className="mt-2 text-lg font-medium">{hint}</p>
      <ul className="mt-6 space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={item.promo.slug}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: Math.min(i, 6) * 0.05, type: "spring", stiffness: 260, damping: 26 }}
          >
            <Row item={item} checked={done.includes(item.promo.slug)} />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Row({ item, checked }: { item: PlanItem; checked: boolean }) {
  const { promo, registerBy, status, estimated } = item;
  const openPromo = useOpenPromo();
  const needsSignup = status !== "sin-registro";
  const toggle = (e: React.MouseEvent) => {
    if (!checked) burst({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    toggleDone(promo.slug);
  };

  return (
    <div className={cn("card flex flex-wrap items-center gap-4 p-4 transition-colors sm:flex-nowrap sm:p-5", checked ? "bg-paper-2" : "bg-paper")}>
      {needsSignup && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={checked}
          aria-label={checked ? `Marcar ${promo.brand} como pendiente` : `Marcar ${promo.brand} como registrado`}
          className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-ink transition-colors", checked ? "bg-acid" : "bg-paper hover:bg-paper-2")}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={3.5}>
                <motion.path d="M4 12.5l5 5L20 6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/promos/${promo.slug}`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) return;
              e.preventDefault();
              openPromo(promo);
            }}
            className={cn("display text-3xl hover:text-hot sm:text-4xl", checked && "line-through decoration-4")}
          >
            {promo.brand}
          </Link>
          <BenefitBadge type={promo.benefitType} className="!text-sm" />
        </div>
        <p className="mt-1 font-medium">{promo.benefit}</p>
        {promo.requirements.length > 0 && (
          <p className="mt-1 text-sm opacity-80">
            {promo.requirements.slice(0, 2).join(" · ")}
            {promo.requirements.length > 2 && " · …"}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {registerBy && (
          <span className={cn("chip", status === "tarde" ? "bg-hot" : status === "urgente" ? "bg-sun" : "bg-paper")}>
            {status === "tarde" ? "Quizá ya no alcanzas" : `Antes del ${formatDate(registerBy)}`}
            {estimated && status !== "tarde" && " *"}
          </span>
        )}
        {promo.signupUrl && needsSignup && !checked && (
          <a href={promo.signupUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-ink !px-4 !py-2 !text-base">
            Registrarme ↗
          </a>
        )}
      </div>
    </div>
  );
}

function ReminderForm({ birthday }: { birthday: Birthday }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      await postJson("/api/reminders", { email, month: birthday.m, day: birthday.d });
      setState("ok");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="card my-16 bg-lilac p-7 sm:p-10">
      <p className="mono-tag">Recordatorios</p>
      <h2 className="display mt-2 text-5xl sm:text-7xl">Te avisamos a tiempo</h2>
      <p className="mt-3 max-w-xl text-lg font-medium">Un correo cuando toque registrarte y otro cuando arranque tu mes. Nada de spam.</p>
      {!API_ENABLED && <p className="display mt-6 text-4xl">Muy pronto 📬</p>}
      <AnimatePresence mode="wait">
        {!API_ENABLED ? null : state === "ok" ? (
          <motion.p key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="display mt-6 text-4xl">
            ¡Listo! Nos vemos en tu bandeja 📬
          </motion.p>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Correo</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="field" />
            </label>
            <button type="submit" disabled={state === "sending"} className="btn btn-ink disabled:opacity-60">
              {state === "sending" ? "Guardando…" : "Avísenme"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {state === "error" && <p className="mt-3 font-semibold">No se pudo guardar. Intenta en un rato.</p>}
      <p className="mt-6 text-sm opacity-70">* Fecha estimada: la marca no publica la anticipación, así que calculamos 30 días por seguridad.</p>
    </section>
  );
}
