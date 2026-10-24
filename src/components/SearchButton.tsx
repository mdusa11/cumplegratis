"use client";

import { Icon } from "./Icon";
import { openSearch } from "./Search";

export function SearchButton() {
  return (
    <button type="button" onClick={openSearch} className="btn btn-ink gap-2">
      <Icon name="search" /> Buscar una promo
    </button>
  );
}
