import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViralPost } from "./types";

interface FavoritesState {
  items: Record<string, ViralPost>;
  toggle: (post: ViralPost) => void;
  isFavorite: (id: string) => boolean;
  clear: () => void;
}

// Favorites store the full post snapshot (not just an id) — the daily mock
// pool rotates by date, so an id-only reference would go stale the next
// day. Keeping the snapshot means a saved video stays visible even after
// it falls out of today's ranking.
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (post) =>
        set((state) => {
          const next = { ...state.items };
          if (next[post.id]) delete next[post.id];
          else next[post.id] = post;
          return { items: next };
        }),
      isFavorite: (id) => Boolean(get().items[id]),
      clear: () => set({ items: {} }),
    }),
    { name: "reels-forge-favorites", skipHydration: true }
  )
);
