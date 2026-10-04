"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Birthday } from "./plan";

// Estado local del visitante (su fecha y qué ya registró). Nada sensible: vive solo en su navegador.

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {}
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    if (raw) value = JSON.parse(raw) as T;
  } catch {}
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const BIRTHDAY = "cg:birthday";
const DONE = "cg:done";
const NO_DONE: string[] = [];

export const useStoredBirthday = () =>
  useSyncExternalStore(subscribe, () => read<Birthday | null>(BIRTHDAY, null), () => null);

export const saveBirthday = (b: Birthday) => write(BIRTHDAY, b);

export const useDone = () => useSyncExternalStore(subscribe, () => read<string[]>(DONE, NO_DONE), () => NO_DONE);

export const toggleDone = (slug: string) => {
  const done = read<string[]>(DONE, NO_DONE);
  write(DONE, done.includes(slug) ? done.filter((s) => s !== slug) : [...done, slug]);
};

export function useMediaQuery(q: string) {
  const subscribeQuery = useCallback(
    (l: () => void) => {
      const mq = window.matchMedia(q);
      mq.addEventListener("change", l);
      return () => mq.removeEventListener("change", l);
    },
    [q],
  );
  return useSyncExternalStore(subscribeQuery, () => window.matchMedia(q).matches, () => false);
}
