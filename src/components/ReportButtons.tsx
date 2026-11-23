"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { AnimatePresence, motion } from "motion/react";
import { postJson } from "./SuggestForm";
import { burst } from "./BirthdayPicker";
import { track } from "@/lib/track";
import { SITE } from "@/lib/site";

type Votes = Record<string, number>;
let votesReq: Promise<Votes> | null = null;
const loadVotes = () =>
  (votesReq ??= fetch("/api/votes")
    .then((r): Promise<Votes> | Votes => (r.ok ? r.json() : {}))
    .catch((): Votes => ({})));

const voted = (slug: string) => {
  try {
    return localStorage.getItem(`cg:worked:${slug}`) === "1";
  } catch {
    return false;
  }
};

export function ReportButtons({ slug, brand }: { slug: string; brand: string }) {
  const [sent, setSent] = useState<"works" | "broken" | null>(null);
  const [count, setCount] = useState(0);
  // Solo se muestra cuando count > 0, que en el HTML estático siempre es 0: no hay desajuste al hidratar.
  const [mine, setMine] = useState(() => typeof window !== "undefined" && voted(slug));

  useEffect(() => {
    loadVotes().then((v) => setCount(v[slug] ?? 0));
  }, [slug]);

  const report = async (kind: "works" | "broken", e: React.MouseEvent) => {
    setSent(kind);
    if (kind === "works") burst({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    // «Sí me la dieron» es una señal anónima (se cuenta una por navegador); «Ya no existe» cae en la bandeja del panel.
    if (kind === "works" && !mine) {
      track("worked", { target: slug });
      setCount((c) => c + 1);
      setMine(true);
      try {
        localStorage.setItem(`cg:worked:${slug}`, "1");
      } catch {}
    }
    if (kind === "broken") postJson("/api/suggest", { kind: "cambio", brand, note: "Reportada desde la ficha: ya no existe", url: `${SITE.url}/promos/${slug}/` }).catch(() => {});
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.p key="thanks" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="display text-4xl">
            {sent === "works" ? (
              <>
                ¡Gracias! Le avisamos a los demás <Icon name="heart" shadow />
              </>
            ) : (
              <>
                Gracias, la revisamos pronto <Icon name="search" shadow />
              </>
            )}
          </motion.p>
        ) : (
          <motion.div key="ask" exit={{ opacity: 0, y: -10 }} className="flex flex-wrap gap-3">
            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={(e) => report("works", e)} className="btn btn-acid">
              <Icon name="thumbsUp" tone="var(--color-paper)" /> Sí me la dieron
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={(e) => report("broken", e)} className="btn btn-paper">
              <Icon name="thumbsDown" /> Ya no existe
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {count > 0 && (
        <p className="mono-tag mt-4" aria-live="polite">
          {count === 1 ? "A 1 persona ya se la dieron" : `A ${count} personas ya se la dieron`}
          {mine ? " (contándote a ti)" : ""}
        </p>
      )}
    </>
  );
}
