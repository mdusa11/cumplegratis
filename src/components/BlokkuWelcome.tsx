"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "./Icon";
import { useHydrated } from "@/lib/storage";
import { BASE_PATH, MONTHS } from "@/lib/site";

// Quien llega desde el cofre de cumpleaños de Blokku (?ref=blokku&m=MES&d=DIA). Sin ref no pinta nada.
function useFromBlokku() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const m = Number(params.get("m"));
  const d = Number(params.get("d"));
  const date = m >= 1 && m <= 12 && d >= 1 && d <= new Date(2024, m, 0).getDate() ? { m, d } : null;
  if (!hydrated || params.get("ref") !== "blokku") return null;
  const now = new Date();
  return { date, today: !!date && date.m === now.getMonth() + 1 && date.d === now.getDate() };
}

const Blokki = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`${BASE_PATH}/blokki-cumple.webp`} alt="Blokki, la mascota de Blokku, con corona y confeti" width={140} height={140} className="size-28 shrink-0 sm:size-[140px]" />
);

/** Franja de bienvenida dentro de /mi-cumple; aparece junto con el plan, así que no mueve nada ya pintado. */
export function BlokkuWelcome() {
  const from = useFromBlokku();
  if (!from) return null;
  const { date, today } = from;
  return (
    <aside role="status" className="card relative mb-8 flex items-center gap-3 overflow-hidden bg-sun p-4 sm:gap-6 sm:p-5">
      <Blokki />
      <div className="min-w-0">
        <p className="mono-tag">Desde Blokku</p>
        <p className="display mt-1 text-3xl sm:text-5xl">{today ? "¡Feliz cumple!" : "¡Blokki te armó un plan!"}</p>
        <p className="mt-1 text-base leading-snug font-medium sm:text-lg">
          {today
            ? "Blokki te manda aquí: estos son los regalos que te esperan hoy."
            : date
              ? `Blokki te armó tu plan de cumpleaños para el ${date.d} de ${MONTHS[date.m - 1]}: estos son los regalos que te esperan.`
              : "Blokki te manda aquí. Pon tu fecha y arma tu plan de cumpleaños."}
        </p>
      </div>
    </aside>
  );
}

/** Portada: tarjeta flotante (no mueve el diseño) para quien llega con ?ref=blokku sin fecha. */
export function BlokkuHomeCard() {
  const from = useFromBlokku();
  const [closed, setClosed] = useState(false);
  if (!from || from.date || closed) return null;
  return (
    <aside role="status" className="card fixed inset-x-3 top-[88px] z-40 mx-auto flex max-w-xl items-center gap-3 bg-sun p-3 sm:p-4">
      <Blokki />
      <div className="min-w-0 flex-1">
        <p className="display text-2xl sm:text-3xl">¡Feliz cumple!</p>
        <p className="text-sm leading-snug font-medium sm:text-base">Blokki te manda aquí. Pon tu fecha y mira qué te regalan hoy.</p>
        <Link href="/mi-cumple?ref=blokku" className="btn btn-ink mt-2 !px-4 !py-2 !text-base">
          Armar mi plan <Icon name="arrowRight" />
        </Link>
      </div>
      <button type="button" onClick={() => setClosed(true)} aria-label="Cerrar" className="absolute top-1 right-1 grid size-11 place-items-center">
        <Icon name="close" />
      </button>
    </aside>
  );
}
