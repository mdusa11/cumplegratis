"use client";

/** Chips de ancla. Las tarjetas con content-visibility cambian de alto al pintarse, así que se corrige la posición una vez más al terminar el salto. */
export function GuideNav({ items }: { items: { id: string; title: string }[] }) {
  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.replaceState(null, "", `#${id}`);
    el.scrollIntoView({ behavior: "instant" });
    setTimeout(() => el.scrollIntoView({ behavior: "instant" }), 250);
  };
  return (
    <nav className="mt-8" aria-label="En esta guía">
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {items.map((s) => (
          <li key={s.id} className="shrink-0">
            <a href={`#${s.id}`} onClick={(e) => go(e, s.id)} className="chip bg-paper whitespace-nowrap transition-colors hover:bg-acid">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
