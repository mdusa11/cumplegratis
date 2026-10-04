"use client";

import { motion } from "motion/react";
import { useLocation } from "./LocationProvider";
import { burst } from "./BirthdayPicker";
import { CITIES, type CitySlug } from "@/lib/places";
import { saveLocation } from "@/lib/storage";

export function SetCityButton({ city }: { city: CitySlug }) {
  const { location } = useLocation();
  const mine = location?.city === city;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      disabled={mine}
      onClick={(e) => {
        saveLocation({ state: CITIES[city].state, city });
        burst({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
      }}
      className="btn btn-ink disabled:bg-acid disabled:text-ink"
    >
      {mine ? "✓ Es tu ciudad" : `📍 Vivo en ${CITIES[city].name}`}
    </motion.button>
  );
}
