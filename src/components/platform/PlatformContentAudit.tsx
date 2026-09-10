"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, Sparkles, Wand2 } from "lucide-react";
import type { AiContentAudit, PlatformConfig } from "@/lib/types";
import { auditContentUrl } from "@/lib/content-audit";
import { Button, Card, ScoreGauge, SectionLabel } from "@/components/ui/primitives";
import { formatCompact, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const SCORE_ROWS: { key: keyof AiContentAudit; label: string }[] = [
  { key: "hookScore", label: "Força do gancho" },
  { key: "pacingScore", label: "Ritmo de edição" },
  { key: "captionScore", label: "Legenda" },
  { key: "hashtagScore", label: "Hashtags" },
  { key: "soundScore", label: "Som/trilha" },
  { key: "ctaScore", label: "Call-to-action" },
];

const MODE_META: Record<AiContentAudit["mode"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  "real-data": { label: "análise com dados reais", color: "var(--acid)", icon: CheckCircle2 },
  "metadata-only": { label: "análise com metadados públicos", color: "var(--signal)", icon: Info },
  "guidance-only": { label: "orientação geral (sem dados do link)", color: "var(--flame)", icon: AlertTriangle },
};

export function PlatformContentAudit({ cfg }: { cfg: PlatformConfig }) {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<AiContentAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/analyze/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform: cfg.id, url: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Falha na análise (${res.status})`);
      }
      const data: AiContentAudit = await res.json();
      setAudit(data);
      setIsMock(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Falha ao analisar.");
      const mock = auditContentUrl(cfg.id, trimmed);
      setAudit({
        mode: "guidance-only",
        platform: cfg.id,
        url: trimmed,
        dataNote:
          "IA não configurada neste ambiente (ANTHROPIC_API_KEY ausente) — mostrando uma análise de demonstração gerada localmente, não uma avaliação real.",
        overallScore: mock.overallScore,
        hookScore: mock.hookScore,
        pacingScore: mock.pacingScore,
        captionScore: mock.captionScore,
        hashtagScore: mock.hashtagScore,
        soundScore: mock.soundScore,
        ctaScore: mock.ctaScore,
        predictedRetention: mock.predictedRetention,
        summary: "Análise de demonstração — configure ANTHROPIC_API_KEY para uma avaliação real.",
        diagnosis: mock.diagnosis,
        fixes: mock.fixes,
      });
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }

  const modeMeta = audit ? MODE_META[audit.mode] : null;
  const ModeIcon = modeMeta?.icon ?? Info;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <SectionLabel index="01">
        Avaliar {cfg.contentLabel.toLowerCase()} do {cfg.name}
      </SectionLabel>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="content-url">
          Link do {cfg.contentLabel.toLowerCase()}
        </label>
        <input
          id="content-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`Cole o link do ${cfg.contentLabel.toLowerCase()} (ex: https://...)`}
          className="min-h-11 flex-1 border border-line-strong bg-ink-2 px-4 py-3 text-sm text-paper placeholder:text-paper/30 focus:border-acid focus:outline-none"
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {loading ? "Analisando..." : "Analisar com IA"}
        </Button>
      </form>
      <p className="mt-3 text-xs text-paper/40">
        A IA usa dados públicos reais quando consegue buscá-los (YouTube Data API, oEmbed) e é
        transparente quando não consegue — nunca finge ter assistido ao vídeo.
      </p>

      {audit && (
        <div className="mt-10 flex flex-col gap-6">
          {modeMeta && (
            <div
              className="flex items-start gap-2.5 border px-3 py-2.5 text-xs"
              style={{ borderColor: modeMeta.color, color: modeMeta.color }}
            >
              <ModeIcon size={14} className="mt-0.5 shrink-0" />
              <div>
                <span className="tape-label block text-[10px]">{modeMeta.label}</span>
                <span className="mt-1 block text-paper/60">{audit.dataNote}</span>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <Card className="flex flex-col items-center gap-4 text-center">
              <ScoreGauge score={audit.overallScore} size={110} />
              <div>
                <p className="tape-label text-paper/50">Score geral</p>
                <p className="mt-2 font-mono text-xs text-paper/60">
                  Retenção prevista: {formatPercent(audit.predictedRetention)}
                </p>
                {audit.realStats?.views !== undefined && (
                  <p className="font-mono text-xs text-paper/60">
                    {formatCompact(audit.realStats.views)} views reais
                  </p>
                )}
              </div>
              {audit.summary && <p className="text-xs leading-relaxed text-paper/50">{audit.summary}</p>}
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <p className="tape-label mb-4 text-paper/50">Notas por critério</p>
                <div className="flex flex-col gap-3">
                  {SCORE_ROWS.map(({ key, label }) => {
                    const value = audit[key] as number;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-xs text-paper/60">{label}</span>
                        <div className="h-2 flex-1 bg-ink">
                          <div className="h-2" style={{ width: `${value}%`, background: cfg.colorA }} />
                        </div>
                        <span className="w-8 shrink-0 text-right font-mono text-xs text-paper">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <p className="tape-label mb-3 flex items-center gap-1.5 text-paper/50">
                    <AlertTriangle size={13} className="text-flame" />
                    Diagnóstico
                  </p>
                  <ul className="flex flex-col gap-2 text-sm text-paper/70">
                    {audit.diagnosis.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 bg-flame" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <p className="tape-label mb-3 flex items-center gap-1.5 text-paper/50">
                    <Sparkles size={13} className="text-acid" />
                    Como melhorar
                  </p>
                  <ul className="flex flex-col gap-2 text-sm text-paper/70">
                    {audit.fixes.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 bg-acid" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>

          {isMock && aiError && (
            <p className={cn("text-xs text-paper/30")}>Detalhe técnico: {aiError}</p>
          )}
        </div>
      )}
    </section>
  );
}
