"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/lib/favorites-store";

/** Rehydrates the favorites store from localStorage once, client-side only (avoids SSR touching localStorage). */
export function FavoritesHydrator() {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
  }, []);
  return null;
}
