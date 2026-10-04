import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = {
  title: "Mi plan de cumpleaños",
  description: "Pon tu fecha y descubre en qué programas registrarte y hasta cuándo para cobrar todos tus regalos de cumpleaños.",
  alternates: { canonical: "/mi-cumple" },
};

export default function MiCumplePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-10 sm:px-8 md:pt-40">
      <Suspense>
        <PlanView />
      </Suspense>
    </div>
  );
}
