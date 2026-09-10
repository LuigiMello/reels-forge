"use client";

import { useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  TimerReset,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { ViralPost } from "@/lib/types";
import { PLATFORM_CONFIG } from "@/lib/platform-config";
import { formatCompact, formatHoursAgo, formatPercent } from "@/lib/format";
import { Chip, ScoreGauge } from "@/components/ui/primitives";
import { useFavoritesStore } from "@/lib/favorites-store";
import { cn } from "@/lib/utils";
import { VideoPreview } from "./VideoPreview";

const METRIC_ICONS = {
  likes: Heart,
  comments: MessageCircle,
  shares: Share2,
  saves: Bookmark,
};

export function TrendCard({
  post,
  rank,
  metricsMode,
}: {
  post: ViralPost;
  rank: number;
  metricsMode: "separadas" | "combinada";
}) {
  const cfg = PLATFORM_CONFIG[post.platform];
  const [copied, setCopied] = useState(false);
  const isFavorite = useFavoritesStore((s) => Boolean(s.items[post.id]));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const trendUp = (post.derived.trendPct ?? 0) >= 0;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(post.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — the link is still visible to select manually
    }
  }

  return (
    <article className="group flex flex-col border border-line bg-ink-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-paper/40">#{rank.toString().padStart(2, "0")}</span>
          <Chip color={cfg.colorA}>{cfg.name}</Chip>
          <Chip>{post.niche}</Chip>
          {post.isReal && (
            <Chip color="var(--acid)" className="hidden sm:inline-flex">
              dados reais
            </Chip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="tape-label text-paper/40">{formatHoursAgo(post.raw.postedHoursAgo)}</span>
          <button
            onClick={() => toggleFavorite(post)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            className={cn(
              "flex h-6 w-6 items-center justify-center transition-colors",
              isFavorite ? "text-acid" : "text-paper/30 hover:text-paper"
            )}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 p-4">
        <div className="w-24 shrink-0 overflow-hidden">
          <div className="transition-transform duration-300 group-hover:scale-[1.04]">
            <VideoPreview post={post} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-paper">{post.handle}</p>
              <p className="text-xs text-paper/40">{formatCompact(post.followers)} seguidores</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <ScoreGauge score={post.derived.viralScore} size={48} />
              {post.derived.trendPct !== undefined && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-mono text-[9px] font-semibold",
                    trendUp ? "text-emerald-400" : "text-flame"
                  )}
                  title="Variação de views vs. a mesma faixa de horário ontem"
                >
                  {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {trendUp ? "+" : ""}
                  {Math.round(post.derived.trendPct)}%
                </span>
              )}
            </div>
          </div>

          <p className="font-display text-sm font-semibold leading-snug text-paper">“{post.hook}”</p>

          <div className="flex flex-wrap gap-1.5 text-[10px] text-paper/40">
            {post.hashtags.slice(0, 3).map((h) => (
              <span key={h} className="font-mono">
                #{h}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-1.5 font-mono text-[11px] text-paper/50 transition-colors hover:text-paper"
          title={post.url}
        >
          <ExternalLink size={11} className="shrink-0" />
          <span className="truncate">{post.url.replace(/^https?:\/\//, "")}</span>
        </a>
        <button
          onClick={copyUrl}
          className="tape-label flex shrink-0 items-center gap-1 text-paper/50 hover:text-acid"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "copiado" : "copiar"}
        </button>
      </div>

      <div className="border-t border-line p-4 pt-3">
        {metricsMode === "separadas" ? (
          <div className="grid grid-cols-3 gap-2">
            <MetricPill label="Views" value={formatCompact(post.raw.views)} />
            <MetricPill icon={METRIC_ICONS.likes} label="Likes" value={formatCompact(post.raw.likes)} />
            <MetricPill icon={METRIC_ICONS.comments} label="Coment." value={formatCompact(post.raw.comments)} />
            {post.raw.shares !== undefined && (
              <MetricPill icon={METRIC_ICONS.shares} label="Compart." value={formatCompact(post.raw.shares)} />
            )}
            {post.raw.saves !== undefined && (
              <MetricPill icon={METRIC_ICONS.saves} label="Salvos" value={formatCompact(post.raw.saves)} />
            )}
            <MetricPill label="Engaj." value={formatPercent(post.derived.engagementRate)} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <MetricPill icon={Zap} label="Engaj. combinado" value={formatPercent(post.derived.engagementRate)} />
            <MetricPill icon={TimerReset} label="Velocidade" value={`${formatCompact(post.derived.velocityPerHour)}/h`} />
            <MetricPill label="Views totais" value={formatCompact(post.raw.views)} />
          </div>
        )}
      </div>
    </article>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Heart;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-line bg-ink px-2.5 py-2">
      <span className="tape-label flex items-center gap-1 text-[9px] text-paper/40">
        {Icon && <Icon size={11} />}
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-paper">{value}</span>
    </div>
  );
}
