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
  Zap,
} from "lucide-react";
import type { ViralPost } from "@/lib/types";
import { PLATFORM_CONFIG } from "@/lib/platform-config";
import { formatCompact, formatDuration, formatHoursAgo, formatPercent } from "@/lib/format";
import { Chip, ScoreGauge } from "@/components/ui/primitives";
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
    <article className="flex flex-col border border-line bg-ink-2">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-paper/40">#{rank.toString().padStart(2, "0")}</span>
          <Chip color={cfg.colorA}>{cfg.name}</Chip>
          <Chip>{post.niche}</Chip>
        </div>
        <span className="tape-label text-paper/40">{formatHoursAgo(post.raw.postedHoursAgo)}</span>
      </div>

      <div className="flex gap-3 p-4">
        <VideoPreview post={post} className="w-24 shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-paper">{post.handle}</p>
              <p className="text-xs text-paper/40">{formatCompact(post.followers)} seguidores</p>
            </div>
            <ScoreGauge score={post.derived.viralScore} size={48} />
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            <MetricPill label="Views" value={formatCompact(post.raw.views)} />
            <MetricPill icon={METRIC_ICONS.likes} label="Likes" value={formatCompact(post.raw.likes)} />
            <MetricPill icon={METRIC_ICONS.comments} label="Coment." value={formatCompact(post.raw.comments)} />
            <MetricPill icon={METRIC_ICONS.shares} label="Compart." value={formatCompact(post.raw.shares)} />
            <MetricPill icon={METRIC_ICONS.saves} label="Salvos" value={formatCompact(post.raw.saves)} />
            <MetricPill label="Duração" value={formatDuration(post.raw.durationSec)} />
            <MetricPill label="Retenção" value={formatPercent(post.derived.retentionRate)} />
            <MetricPill label="Engaj." value={formatPercent(post.derived.engagementRate)} />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-acid" />
              <span className="font-mono text-sm font-semibold text-paper">
                {formatPercent(post.derived.engagementRate)}
              </span>
              <span className="tape-label text-paper/40">engaj. combinado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TimerReset size={14} className="text-signal" />
              <span className="font-mono text-sm font-semibold text-paper">
                {formatCompact(post.derived.velocityPerHour)}/h
              </span>
              <span className="tape-label text-paper/40">velocidade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-paper">
                {formatCompact(post.raw.views)}
              </span>
              <span className="tape-label text-paper/40">views totais</span>
            </div>
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
    <div className="flex items-center gap-1.5">
      {Icon && <Icon size={13} className="text-paper/40" />}
      <span className="font-mono text-sm text-paper">{value}</span>
      <span className="tape-label text-[9px] text-paper/40">{label}</span>
    </div>
  );
}
