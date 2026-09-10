import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeneratedScript } from "./types";

export interface SavedScript {
  script: GeneratedScript;
  savedAt: string; // ISO
}

interface ScriptHistoryState {
  items: SavedScript[];
  save: (script: GeneratedScript) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_HISTORY = 20;

export const useScriptHistoryStore = create<ScriptHistoryState>()(
  persist(
    (set) => ({
      items: [],
      save: (script) =>
        set((state) => ({
          items: [{ script, savedAt: new Date().toISOString() }, ...state.items.filter((i) => i.script.id !== script.id)].slice(
            0,
            MAX_HISTORY
          ),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.script.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "reels-forge-script-history", skipHydration: true }
  )
);
