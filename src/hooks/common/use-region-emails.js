"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createRegionEmailStore } from "@/util/region-email-store.mjs";

const directory = createRegionEmailStore();

export function useRegionEmails() {
  const state = useSyncExternalStore(directory.subscribe, directory.getSnapshot, directory.getServerSnapshot);
  useEffect(() => { void directory.load(); }, []);
  return { ...state, retry: directory.retry };
}
