"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import type { Platform, ViralPost } from "@/lib/types";
import { PLATFORM_CONFIG, PLATFORMS } from "@/lib/platform-config";
import { TrendCard } from "./TrendCard";
import { cn } from "@/lib/utils";

type SortKey = "score" | "views" | "engagement" | "velocity";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "score", label: "Score viral" },
  { id: "views", label: "Views" },
  { id: "engagement", label: "Engajamento" },
  { id: "velocity", label: "Velocidade" },
];

export function ResearchBoard({ all }: { all: Record<Platform, ViralPost[]> }) {
  const [platformFilter, setPlatformFilter] = useState<Platform | "todas">("todas");
  const [niche, setNiche] = useState<string>("todas");
  const [sort, setSort] = useState<SortKey>("score");
  const [metricsMode, setMetricsMode] = useState<"separadas" | "combinada">("separadas");
  const [search, setSearch] = useState("");

  const flat = useMemo(() => {
    const posts = platformFilter === "todas" ? [...all.instagram, ...all.tiktok, ...all.youtube] : all[platformFilter];
    return posts;
  }, [all, platformFilter]);

  const niches = useMemo(() => {
    const set = new Set(flat.map((p) => p.niche));
    return ["todas", ...Array.from(set).sort()];
  }, [flat]);

  const filtered = useMemo(() => {
    const byNiche = niche === "todas" ? flat : flat.filter((p) => p.niche === niche);
    const q = search.trim().toLowerCase();
    const bySearch = q
      ? byNiche.filter(
          (p) =>
            p.hook.toLowerCase().includes(q) ||
            p.handle.toLowerCase().includes(q) ||
            p.creator.toLowerCase().includes(q)
        )
      : byNiche;
    const sorted = [...bySearch].sort((a, b) => {
      if (sort === "score") return b.derived.viralScore - a.derived.viralScore;
      if (sort === "views") return b.raw.views - a.raw.views;
      if (sort === "engagement") return b.derived.engagementRate - a.derived.engagementRate;
      return b.derived.velocityPerHour - a.derived.velocityPerHour;
    });
    return sorted;
  }, [flat, niche, sort, search]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border border-line bg-ink-2 p-4">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por hook, criador ou @handle..."
            className="min-h-11 w-full border border-line-strong bg-ink py-2.5 pl-9 pr-3 text-sm text-paper placeholder:text-paper/30 focus:border-acid focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <FilterButton active={platformFilter === "todas"} onClick={() => setPlatformFilter("todas")}>
              Todas
            </FilterButton>
            {PLATFORMS.map((p) => (
              <FilterButton
                key={p}
                active={platformFilter === p}
                accent={PLATFORM_CONFIG[p].colorA}
                onClick={() => setPlatformFilter(p)}
              >
                {PLATFORM_CONFIG[p].name}
              </FilterButton>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filtrar por nicho"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="tape-label border border-line-strong bg-ink px-3 py-2 text-[10px] text-paper"
          >
            {niches.map((n) => (
              <option key={n} value={n}>
                {n === "todas" ? "Todos os nichos" : n}
              </option>
            ))}
          </select>

          <select
            aria-label="Ordenar por"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="tape-label border border-line-strong bg-ink px-3 py-2 text-[10px] text-paper"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Ordenar: {s.label}
              </option>
            ))}
          </select>

          <div className="flex border border-line-strong">
            <button
              onClick={() => setMetricsMode("separadas")}
              className={cn(
                "tape-label px-3 py-2 text-[10px] transition-colors",
                metricsMode === "separadas" ? "bg-grad-ig text-white" : "text-paper/60"
              )}
            >
              Métricas separadas
            </button>
            <button
              onClick={() => setMetricsMode("combinada")}
              className={cn(
                "tape-label px-3 py-2 text-[10px] transition-colors",
                metricsMode === "combinada" ? "bg-grad-ig text-white" : "text-paper/60"
              )}
            >
              Métricas combinadas
            </button>
          </div>
          </div>
        </div>
      </div>

      <p className="tape-label mb-4 text-paper/40">{filtered.length} vídeos encontrados hoje</p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed border-line-strong px-6 py-16 text-center">
          <SearchX size={26} className="text-paper/20" />
          <p className="max-w-sm text-sm text-paper/40">
            Nada encontrado com esses filtros. Tente outro termo de busca ou limpe o nicho
            selecionado.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post, i) => (
            <TrendCard key={post.id} post={post} rank={i + 1} metricsMode={metricsMode} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  accent,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  accent?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "tape-label border px-3 py-2 text-[10px] transition-colors",
        active ? cn("border-transparent text-white", !accent && "bg-grad-ig") : "border-line-strong text-paper/60 hover:text-paper"
      )}
      style={active && accent ? { background: accent, borderColor: accent } : undefined}
    >
      {children}
    </button>
  );
}
