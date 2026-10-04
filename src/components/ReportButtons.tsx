"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { postJson } from "./SuggestForm";
import { burst } from "./BirthdayPicker";

export function ReportButtons({ slug }: { slug: string }) {
  const [sent, setSent] = useState<"works" | "broken" | null>(null);

  const report = async (kind: "works" | "broken", e: React.MouseEvent) => {
    setSent(kind);
    if (kind === "works") burst({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    postJson("/api/reports", { slug, kind }).catch(() => {});
  };

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.p key="thanks" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="display text-4xl">
          {sent === "works" ? "¡Gracias! Le avisamos a los demás 🙌" : "Gracias, la revisamos pronto 🕵️"}
        </motion.p>
      ) : (
        <motion.div key="ask" exit={{ opacity: 0, y: -10 }} className="flex flex-wrap gap-3">
          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={(e) => report("works", e)} className="btn btn-acid">
            👍 Sí me la dieron
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={(e) => report("broken", e)} className="btn btn-paper">
            👎 Ya no existe
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
