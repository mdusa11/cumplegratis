import type { PlanItem } from "./plan";

export const SITE_ORIGIN = "https://cumplegratis.fun";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const utc = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// RFC 5545 §3.1: máx. 75 octetos por línea; las continuaciones llevan un espacio inicial (que también cuenta). No se parte un carácter UTF-8.
export function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

type Ev = { uid: string; day: Date; title: string; description: string; alarm?: boolean };

function event(e: Ev, stamp: string): string[] {
  const end = new Date(e.day.getFullYear(), e.day.getMonth(), e.day.getDate() + 1);
  return [
    "BEGIN:VEVENT",
    `UID:${e.uid}@cumplegratis.fun`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(e.day)}`,
    `DTEND;VALUE=DATE:${ymd(end)}`,
    `SUMMARY:${escape(e.title)}`,
    `DESCRIPTION:${escape(e.description)}`,
    "TRANSP:TRANSPARENT",
    ...(e.alarm ? ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escape(e.title)}`, "TRIGGER;RELATED=START:PT10H", "END:VALARM"] : []),
    "END:VEVENT",
  ];
}

/** Un evento por registro pendiente (en su fecha límite, o hoy si ya pasó) y otro el día del cumpleaños. */
export function buildIcs(items: PlanItem[], birthday: Date, today = new Date()): string {
  const stamp = utc(today);
  const events: Ev[] = items.map(({ promo, registerBy, status }) => {
    const day = status === "tarde" || !registerBy ? today : registerBy;
    return {
      uid: `registro-${promo.slug}-${ymd(day)}`,
      day,
      title: eventTitle(promo.program, promo.brand),
      description: `${promo.benefit}\n${SITE_ORIGIN}/promos/${promo.slug}/`,
      alarm: true,
    };
  });
  events.push({
    uid: `cumple-${ymd(birthday)}`,
    day: birthday,
    title: "Cobra tus regalos de cumpleaños",
    description: `Tu plan con todo lo que puedes cobrar hoy:\n${SITE_ORIGIN}/mi-cumple/`,
  });
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cumplegratis//Mi cumple//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events.flatMap((e) => event(e, stamp)), "END:VCALENDAR"];
  return lines.map(fold).join("\r\n") + "\r\n";
}

// «Registrarme en Starbucks Rewards», o «… en Ten Card (Studio F México)» cuando el programa no nombra la marca.
function eventTitle(program: string | null, brand: string) {
  const name = brand.replace(/\s*\([^)]*\)/g, "");
  if (!program) return `Registrarme en ${name}`;
  const p = program.toLowerCase(), b = name.toLowerCase();
  return p.includes(b) || b.includes(p) ? `Registrarme en ${program}` : `Registrarme en ${program} (${name})`;
}
