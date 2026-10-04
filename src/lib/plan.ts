import { promos, type Promo } from "./promos";

export type Birthday = { m: number; d: number };
export type PlanStatus = "urgente" | "tarde" | "despues" | "sin-registro";

export type PlanItem = {
  promo: Promo;
  status: PlanStatus;
  registerBy: Date | null;
  /** La marca no publica la anticipación; usamos 30 días por seguridad. */
  estimated: boolean;
};

/** Días de anticipación que asumimos cuando la marca no lo dice. */
export const SAFE_DAYS = 30;
const URGENT_DAYS = 14;
const DAY = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

const birthdayIn = (year: number, { m, d }: Birthday) => {
  const leap = new Date(year, 1, 29).getMonth() === 1;
  return new Date(year, m - 1, m === 2 && d === 29 && !leap ? 28 : d);
};

export function nextBirthday(b: Birthday, today = new Date()) {
  const thisYear = birthdayIn(today.getFullYear(), b);
  return daysBetween(today, thisYear) >= 0 ? thisYear : birthdayIn(today.getFullYear() + 1, b);
}

export function buildPlan(b: Birthday, list: Promo[] = promos, today = new Date()) {
  const birthday = nextBirthday(b, today);
  const items: PlanItem[] = list.map((promo) => {
    if (!promo.program) return { promo, status: "sin-registro", registerBy: null, estimated: false };
    const lead = promo.registerDaysBefore ?? SAFE_DAYS;
    const registerBy = new Date(birthday.getTime() - lead * DAY);
    const left = daysBetween(today, registerBy);
    const status: PlanStatus = left < 0 ? "tarde" : left <= URGENT_DAYS ? "urgente" : "despues";
    return { promo, status, registerBy, estimated: promo.registerDaysBefore == null };
  });
  const byDeadline = (a: PlanItem, b: PlanItem) => (a.registerBy?.getTime() ?? 0) - (b.registerBy?.getTime() ?? 0);
  return {
    birthday,
    daysLeft: daysBetween(today, birthday),
    now: items.filter((i) => i.status === "urgente" || i.status === "tarde").sort(byDeadline),
    later: items.filter((i) => i.status === "despues").sort(byDeadline),
    walkIn: items.filter((i) => i.status === "sin-registro"),
    total: items.length,
  };
}

export const formatDate = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
