"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/lib/favorites-store";
import { useScriptHistoryStore } from "@/lib/script-history-store";

/** Rehydrates persisted client stores from localStorage once (avoids SSR touching localStorage). */
export function FavoritesHydrator() {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
    useScriptHistoryStore.persist.rehydrate();
  }, []);
  return null;
}
