"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { ShareButton } from "./ShareButton";
import { MONTHS } from "@/lib/site";

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Arma el enlace al plan de otra persona sin tocar la fecha guardada de quien lo manda. */
export function GiftPlan({ total }: { total: number }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState(0);
  const [m, setM] = useState(0);
  const ready = m > 0 && d > 0 && d <= DAYS_IN_MONTH[m - 1];

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-paper gap-2 !text-lg">
        <Icon name="party" /> Regálale su plan a un amigo
      </button>
    );
  return (
    <div className="card flex w-full flex-col gap-3 bg-paper p-4 sm:flex-row sm:items-center">
      <p className="font-semibold sm:mr-2">¿Cuándo cumple tu amigo?</p>
      <div className="flex gap-2">
        <select aria-label="Día" value={d} onChange={(e) => setD(Number(e.target.value))} className="field w-24 cursor-pointer !py-2 !text-base">
          <option value={0}>Día</option>
          {Array.from({ length: m ? DAYS_IN_MONTH[m - 1] : 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <select aria-label="Mes" value={m} onChange={(e) => setM(Number(e.target.value))} className="field w-40 cursor-pointer !py-2 !text-base">
          <option value={0}>Mes</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name[0].toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <ShareButton
        path={`/mi-cumple/?m=${m}&d=${d}`}
        text={`Te armé tu plan de cumpleaños: ${total} regalos te esperan.`}
        label="Enviar por WhatsApp"
        disabled={!ready}
        className="!px-4 !py-2 !text-base"
      />
    </div>
  );
}
