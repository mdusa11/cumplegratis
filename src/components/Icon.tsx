import type { ReactNode } from "react";
import { cn } from "@/lib/site";

// Íconos propios: contorno negro grueso + rellenos planos de la paleta, mismo lenguaje que tarjetas y stickers.

const C = {
  ink: "var(--color-ink)",
  paper: "var(--color-paper)",
  accent: "var(--color-acid)",
  hot: "var(--color-hot)",
  lilac: "var(--color-lilac)",
  sky: "var(--color-sky)",
  sun: "var(--color-sun)",
  pink: "var(--color-pink)",
  green: "#2fb36b",
};

function thumb(t: string) {
  return (
    <>
      <path d="M7 10.5V20.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" fill={C.paper} />
      <path d="M7 10.5l3.4-7a2 2 0 0 1 2.6 2.3l-.8 3.7H18a2 2 0 0 1 2 2.4l-1.3 6.8a2.2 2.2 0 0 1-2.1 1.8H7z" fill={t} />
    </>
  );
}

const ICONS = {
  pin: (t = C.hot) => (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z" fill={t} />
      <circle cx="12" cy="10" r="2.4" fill={C.paper} />
    </>
  ),
  calendar: (t = C.hot) => (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill={C.paper} />
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12a2.5 2.5 0 0 1 2.5 2.5V10h-17z" fill={t} />
      <path d="M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" strokeWidth={2.6} />
    </>
  ),
  party: (t = C.sun) => (
    <>
      <path d="M4 20.5l4.2-11.3 7.1 7.1z" fill={t} />
      <path d="M6.2 15l2.9 2.9M7.4 11.7l4.9 4.9" />
      <path d="M13 3.5l.6 2M19.5 6.5l-2 .8M20.5 12l-2-.3M11.2 7.8c1-1.3 2.5-1.6 3.3-.6M15.6 11.5c1-.9 2.3-.6 2.6.3" />
      <circle cx="17" cy="3.8" r="1" fill={C.hot} />
      <circle cx="21" cy="9" r="0.9" fill={C.sky} />
    </>
  ),
  check: (t = C.accent) => (
    <>
      <circle cx="12" cy="12" r="9" fill={t} />
      <path d="M7.5 12.3l3 3 6-6.3" />
    </>
  ),
  install: (t = C.sky) => (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" fill={t} />
      <path d="M12 7v7M9 11.2l3 3 3-3" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  gift: (t = C.hot) => (
    <>
      <rect x="4" y="10.5" width="16" height="10" rx="1.5" fill={t} />
      <rect x="3" y="7.2" width="18" height="4" rx="1.5" fill={t} />
      <path d="M12 7.2v13.3" />
      <path d="M12 7.2c-1.4-3-5-3.6-5-1.3 0 1.3 2.5 1.3 5 1.3zm0 0c1.4-3 5-3.6 5-1.3 0 1.3-2.5 1.3-5 1.3z" fill={C.paper} />
    </>
  ),
  id: (t = C.sky) => (
    <>
      <rect x="3" y="5.5" width="18" height="13.5" rx="2" fill={C.paper} />
      <rect x="6" y="9" width="4.5" height="6" rx="1" fill={t} />
      <path d="M13 10.5h5M13 13.5h3.5" />
    </>
  ),
  register: (t = C.accent) => (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" fill={C.paper} />
      <rect x="9" y="2.8" width="6" height="3.6" rx="1" fill={t} />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </>
  ),
  card: (t = C.sun) => (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2" fill={t} />
      <path d="M2.8 9.8h18.4M6.5 14.8h4" />
    </>
  ),
  sparkle: (t = C.sun) => <path d="M12 2.8l2 5.7 5.7 2-5.7 2-2 5.7-2-5.7-5.7-2 5.7-2z" fill={t} />,
  mexico: () => (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2" fill={C.paper} />
      <path d="M4.8 5.5h3.6v13H4.8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill={C.green} />
      <path d="M15.6 5.5h3.6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.6z" fill={C.hot} />
      <circle cx="12" cy="12" r="1.6" fill={C.sun} />
    </>
  ),
  cake: (t = C.pink) => (
    <>
      <rect x="4" y="11" width="16" height="9.5" rx="2" fill={t} />
      <path d="M4 14.5c1.6 1.4 2.7-1 4 0s2.4 1.4 4 0 2.4 1.4 4 0 2.4-1.2 4 0" fill="none" />
      <rect x="10.9" y="6.3" width="2.2" height="4.7" rx="0.6" fill={C.lilac} />
      <path d="M12 2.3c1.2 1.4 1.6 2.3 1.6 2.9a1.6 1.6 0 0 1-3.2 0c0-.6.4-1.5 1.6-2.9z" fill={C.hot} />
    </>
  ),
  coffee: (t = C.sky) => (
    <>
      <path d="M4.5 9h11.5v5a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-5-5z" fill={t} />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8.5 3.3c-.8 1 .8 2 0 3.2M12.5 3.3c-.8 1 .8 2 0 3.2" />
      <path d="M3.5 21.2h14" />
    </>
  ),
  plate: (t = C.hot) => (
    <>
      <circle cx="12" cy="12.5" r="6.5" fill={C.paper} />
      <circle cx="12" cy="12.5" r="3.4" fill={t} />
      <path d="M3 3.5v4.8a1.6 1.6 0 0 0 1.6 1.6V20.5M4.6 3.5v4M6.2 3.5v4.8a1.6 1.6 0 0 1-1.6 1.6" />
      <path d="M21 3.5c-1.6 1.5-2.2 4-2.2 6.8H21v10.2" />
    </>
  ),
  hourglass: (t = C.sun) => (
    <>
      <path d="M6 2.8h12M6 21.2h12" />
      <path d="M7 2.8c0 5 5 6.2 5 9.2s-5 4.2-5 9.2h10c0-5-5-6.2-5-9.2s5-4.2 5-9.2z" fill={C.paper} />
      <path d="M8.6 20h6.8L12 16.6z" fill={t} />
    </>
  ),
  mail: (t = C.lilac) => (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13.5" rx="2" fill={t} />
      <path d="M3.4 7l8.6 6.2L20.6 7" />
    </>
  ),
  donut: (t = C.pink) => (
    <>
      <circle cx="12" cy="12" r="8.5" fill={C.sun} />
      <path d="M4.2 11a7.8 7.8 0 0 1 15.6 0c0 2.2-1.6 3.1-3.2 2.6s-2.3 1.6-4.4 1.1-2.6-1.6-4.3-1.1-3.7-.4-3.7-2.6z" fill={t} />
      <circle cx="12" cy="11" r="2.3" fill={C.paper} />
      <path d="M8 8.5l1 .6M15.3 7.8l-.5 1.1M17 11.3l-1.1.3" />
    </>
  ),
  bag: (t = C.lilac) => (
    <>
      <path d="M5 8h14l-1.1 12.5H6.1z" fill={t} />
      <path d="M9 8V6.3a3 3 0 0 1 6 0V8" />
    </>
  ),
  ferris: (t = C.sky) => (
    <>
      <path d="M12 10.5l-4.5 10.7M12 10.5l4.5 10.7M5.5 21.2h13" />
      <circle cx="12" cy="10.5" r="7" fill={C.paper} />
      <path d="M12 3.5v14M5 10.5h14M7 5.5l10 10M17 5.5l-10 10" strokeWidth={1.4} />
      <circle cx="12" cy="10.5" r="2" fill={t} />
    </>
  ),
  people: (t = C.lilac) => (
    <>
      <circle cx="16.5" cy="8.6" r="2.6" fill={C.paper} />
      <path d="M13.2 19.8h7.6a4.4 4.4 0 0 0-7.6-3" fill={C.paper} />
      <circle cx="9" cy="8" r="3.2" fill={t} />
      <path d="M3.2 19.8a5.8 5.8 0 0 1 11.6 0z" fill={t} />
    </>
  ),
  swipe: (t = C.accent) => (
    <>
      <rect x="2.8" y="6.5" width="18.4" height="11" rx="5.5" fill={t} />
      <path d="M7.5 12h9M9.8 9.6L7.4 12l2.4 2.4M14.2 9.6l2.4 2.4-2.4 2.4" />
    </>
  ),
  warning: (t = C.sun) => (
    <>
      <path d="M12 3.2l9.3 16.6H2.7z" fill={t} />
      <path d="M12 9.5v4.5M12 16.9v.2" strokeWidth={2.4} />
    </>
  ),
  question: (t = C.paper) => (
    <>
      <circle cx="12" cy="12" r="9" fill={t} />
      <path d="M9.4 9.4a2.6 2.6 0 1 1 3.7 2.4c-.7.3-1.1.8-1.1 1.6v.6M12 16.8v.2" strokeWidth={2.2} />
    </>
  ),
  offline: (t = C.hot) => (
    <>
      <path d="M2.5 8.8a14 14 0 0 1 19 0M5.8 12.2a9.3 9.3 0 0 1 12.4 0M9 15.6a4.6 4.6 0 0 1 6 0" />
      <circle cx="12" cy="19" r="1.2" fill={C.ink} />
      <path d="M3.5 3.5l17 17" stroke={t} strokeWidth={2.6} />
    </>
  ),
  search: (t = C.sky) => (
    <>
      <circle cx="10.5" cy="10.5" r="6.2" fill={t} />
      <path d="M15.2 15.2l5.6 5.6" strokeWidth={2.6} />
    </>
  ),
  thumbsUp: (t = C.accent) => thumb(t),
  thumbsDown: (t = C.paper) => <g transform="rotate(180 12 12)">{thumb(t)}</g>,
  alarm: (t = C.lilac) => (
    <>
      <path d="M3.8 6.3l3-2.6M20.2 6.3l-3-2.6M7.2 19.5l-1.6 1.8M16.8 19.5l1.6 1.8" />
      <circle cx="12" cy="13" r="7" fill={t} />
      <path d="M12 9.3V13l2.6 1.6" />
    </>
  ),
  bulb: (t = C.sun) => (
    <>
      <path d="M9 17v-1.4c0-1.2-.6-2-1.4-2.9A5.5 5.5 0 1 1 16.4 12.7c-.8.9-1.4 1.7-1.4 2.9V17z" fill={t} />
      <path d="M9.5 20.3h5M9.8 17.2h4.4" />
    </>
  ),
  fire: (t = C.hot) => (
    <>
      <path d="M12 21.2c-4 0-6.5-2.6-6.5-6 0-3.6 3-5.6 3-9.4 2 1.2 3.4 3 3.5 5.2.8-.8 1.3-2 1.3-3.3 2.4 1.8 4.2 4.5 4.2 7.5 0 3.4-2.5 6-5.5 6z" fill={t} />
      <path d="M12 21.2c-1.7 0-2.8-1.2-2.8-2.7 0-1.6 1.3-2.4 2.8-4.3 1.5 1.9 2.8 2.7 2.8 4.3 0 1.5-1.1 2.7-2.8 2.7z" fill={C.sun} />
    </>
  ),
  balloon: (t = C.hot) => (
    <>
      <path d="M12 15.2c-3.3 0-6-3-6-6.6S8.7 2.5 12 2.5s6 2.6 6 6.1-2.7 6.6-6 6.6z" fill={t} />
      <path d="M11 15.4h2l-1 1.6z" fill={t} />
      <path d="M12 17c-1.1 1.5 1.1 2.6 0 4.5" />
      <path d="M9 6.5c.4-1 1.1-1.6 2-1.9" stroke={C.paper} />
    </>
  ),
  burger: (t = C.sun) => (
    <>
      <path d="M4 11.2a8 6.4 0 0 1 16 0z" fill={t} />
      <rect x="3.3" y="13" width="17.4" height="3" rx="1.5" fill={C.hot} />
      <path d="M4.4 18h15.2a1.6 1.6 0 0 1-1.6 2.2H6a1.6 1.6 0 0 1-1.6-2.2z" fill={t} />
      <path d="M9 8h.01M12.5 7h.01M15 9h.01" strokeWidth={2.4} />
    </>
  ),
  lipstick: (t = C.hot) => (
    <>
      <rect x="8" y="12.5" width="8" height="8.7" rx="1" fill={C.lilac} />
      <rect x="8.6" y="10" width="6.8" height="2.6" fill={C.paper} />
      <path d="M9.6 10V6.2l4.8-3.3V10z" fill={t} />
    </>
  ),
  sneaker: (t = C.sky) => (
    <>
      <path d="M2.8 17.2v-4.4l4.4-.8 2-4.3 3 3 4.1 1.5c3 .8 4.9 2.5 4.9 4.2v.8z" fill={t} />
      <path d="M2.8 17.2h18.4v2.4H2.8z" fill={C.paper} />
      <path d="M9.6 10.6l1.6 1M11.2 9.1l1.6 1" />
    </>
  ),
  phone: (t = C.sky) => (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" fill={t} />
      <rect x="8.2" y="5" width="7.6" height="12.4" rx="1" fill={C.paper} />
      <path d="M11 19.5h2" />
    </>
  ),
  paw: (t = C.sun) => (
    <>
      <path d="M12 12c-3 0-5 2.5-5 4.6 0 1.8 1.6 2.6 3 2.6 1 0 1.3-.6 2-.6s1 .6 2 .6c1.4 0 3-.8 3-2.6 0-2.1-2-4.6-5-4.6z" fill={t} />
      <circle cx="6.2" cy="10" r="1.9" fill={t} />
      <circle cx="9.6" cy="6" r="1.9" fill={t} />
      <circle cx="14.4" cy="6" r="1.9" fill={t} />
      <circle cx="17.8" cy="10" r="1.9" fill={t} />
    </>
  ),
  popcorn: (t = C.hot) => (
    <>
      <path d="M5.5 9.5h13l-1.6 11.7H7.1z" fill={t} />
      <path d="M9.6 9.5l.6 11.7M14.4 9.5l-.6 11.7" stroke={C.paper} strokeWidth={1.6} />
      <path d="M5.5 9.5h13l-1.6 11.7H7.1z" fill="none" />
      <path d="M5.3 9.5a2 2 0 0 1 1.6-3 2.4 2.4 0 0 1 3.9-1.7 2.4 2.4 0 0 1 3.9 0 2.4 2.4 0 0 1 3.9 1.7 2 2 0 0 1 1.6 3z" fill={C.sun} />
    </>
  ),
  ticket: (t = C.sky) => (
    <>
      <path d="M2.8 7.5h18.4v3.2a1.8 1.8 0 0 0 0 3.6v3.2H2.8v-3.2a1.8 1.8 0 0 0 0-3.6z" fill={t} />
      <path d="M15.2 8.2v1.4M15.2 11.3v1.4M15.2 14.4v1.4" />
    </>
  ),
  beer: (t = C.sun) => (
    <>
      <path d="M5 7.5h10v11.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill={t} />
      <path d="M15 10h2a2 2 0 0 1 2 2v2.3a2 2 0 0 1-2 2h-2" />
      <path d="M4.4 7.7a2.5 2.5 0 0 1 3-2.6 3 3 0 0 1 5.2 0 2.5 2.5 0 0 1 3 2.6z" fill={C.paper} />
      <path d="M8.5 11v6M11.5 11v6" />
    </>
  ),
  plane: (t = C.sky) => (
    <>
      <path d="M21.2 3.8L3 11.2l6.3 2.2 2.2 6.3 3.1-4.6 4.6 3.1z" fill={t} />
      <path d="M9.3 13.4L21.2 3.8" />
    </>
  ),
  cakeSlice: (t = C.pink) => (
    <>
      <path d="M3 19V13.2L19.5 6.8V19z" fill={t} />
      <path d="M3 13.2L19.5 6.8M3 16.2h16.5" />
      <circle cx="15.5" cy="5.2" r="1.7" fill={C.hot} />
    </>
  ),
  walk: (t = C.accent) => (
    <>
      <circle cx="13.5" cy="4.6" r="2.1" fill={t} />
      <path d="M11.6 8.6l-1.8 5 3.2 2.3.8 5.6M11.6 8.6l3.2 1.2 2 3M12.4 15.2l-2.7 6.3M11.6 8.6l-3.1 2.2v3" />
    </>
  ),
  heart: (t = C.hot) => (
    <path d="M12 20.5s-7.8-4.7-7.8-10.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.8 2.6c0 5.6-7.8 10.3-7.8 10.3z" fill={t} />
  ),
  close: () => <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeWidth={2.6} />,
  tick: () => <path d="M5 12.6l4.6 4.6L19.2 7.6" strokeWidth={2.6} />,
  arrowRight: () => <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" strokeWidth={2.4} />,
  external: () => <path d="M8 16l9-9M9.5 7H17v7.5" strokeWidth={2.4} />,
} satisfies Record<string, (tone?: string) => ReactNode>;


export type IconName = keyof typeof ICONS;

/** Mide 1.15em y se alinea al texto. `tone` cambia el relleno principal; `shadow` agrega la sombra dura. */
export function Icon({ name, className, tone, shadow, title, weight = 1.9 }: { name: IconName; className?: string; tone?: string; shadow?: boolean; title?: string; weight?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.ink}
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("inline-block size-[1.15em] shrink-0 align-[-0.2em]", shadow && "drop-shadow-[2px_2px_0_var(--color-ink)]", className)}
    >
      {ICONS[name](tone)}
    </svg>
  );
}
