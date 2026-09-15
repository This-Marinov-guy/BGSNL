"use client";

import { useSearchParams } from "next/navigation";
import { updateFilterSearchParams } from "../../util/filter-search-params.mjs";

// The setter reads the current URL when invoked, so rapid changes compose even
// before React renders again. Native history also preserves back/forward support.
export function useFilterSearchParams() {
  return [useSearchParams(), updateFilterSearchParams];
}
