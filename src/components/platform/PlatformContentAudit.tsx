"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  MessageCircle,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { AiContentAudit, AuditCriterion, PlatformConfig } from "@/lib/types";
import { auditContentUrl } from "@/lib/content-audit";
import { Button, Card, ScoreGauge, SectionLabel } from "@/components/ui/primitives";
import { formatCompact, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const CRITERIA_ROWS: { key: keyof AiContentAudit["criteria"]; label: string }[] = [
  { key: "hook", label: "Gancho / hook" },
  { key: "caption", label: "Legenda / descrição" },
  { key: "hashtags", label: "Hashtags" },
  { key: "cta", label: "Call-to-action" },
  { key: "pacing", label: "Ritmo de edição" },
  { key: "sound", label: "Som / trilha" },
  { key: "style", label: "Estilo visual" },
];

const MODE_META: Record<AiContentAudit["mode"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  "real-data": { label: "análise com dados reais", color: "var(--acid)", icon: CheckCircle2 },
  "metadata-only": { label: "análise com metadados públicos", color: "var(--signal)", icon: Info },
  "guidance-only": { label: "orientação geral (sem dados do link)", color: "var(--flame)", icon: AlertTriangle },
};

function mockCriterion(score: number, note: string): AuditCriterion {
  return { score, note };
}

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
      const demoNote = "estimativa genérica — modo demonstração, configure uma chave de IA para uma nota real";
      setAudit({
        mode: "guidance-only",
        platform: cfg.id,
        url: trimmed,
        dataNote:
          "IA não configurada neste ambiente (GEMINI_API_KEY/GROQ_API_KEY/ANTHROPIC_API_KEY ausentes) — mostrando uma análise de demonstração gerada localmente, não uma avaliação real.",
        overallScore: mock.overallScore,
        hookScore: mock.hookScore,
        pacingScore: mock.pacingScore,
        captionScore: mock.captionScore,
        hashtagScore: mock.hashtagScore,
        soundScore: mock.soundScore,
        ctaScore: mock.ctaScore,
        styleScore: mock.pacingScore,
        predictedRetention: mock.predictedRetention,
        summary: "Análise de demonstração — configure GEMINI_API_KEY (gratuita) para uma avaliação real.",
        criteria: {
          hook: mockCriterion(mock.hookScore, demoNote),
          pacing: mockCriterion(mock.pacingScore, demoNote),
          caption: mockCriterion(mock.captionScore, demoNote),
          hashtags: mockCriterion(mock.hashtagScore, demoNote),
          sound: mockCriterion(mock.soundScore, demoNote),
          cta: mockCriterion(mock.ctaScore, demoNote),
          style: mockCriterion(mock.pacingScore, demoNote),
        },
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
        {loading
          ? "Buscando dados públicos reais e analisando gancho, legenda, hashtags, CTA, ritmo, som e estilo — pode levar até 1 minuto pra ser bem detalhado."
          : "Análise detalhada de gancho, legenda, hashtags, CTA, ritmo, som e estilo — com dados públicos reais quando consegue buscá-los (YouTube Data API, oEmbed). Nunca finge ter assistido ao vídeo."}
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
                {audit.channelAvgViews !== undefined && audit.realStats?.views !== undefined && (
                  <p className="font-mono text-xs text-paper/60">
                    {audit.realStats.views >= audit.channelAvgViews ? "acima" : "abaixo"} da média
                    do canal ({formatCompact(audit.channelAvgViews)})
                  </p>
                )}
              </div>
              {audit.summary && <p className="text-xs leading-relaxed text-paper/50">{audit.summary}</p>}
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <p className="tape-label mb-4 text-paper/50">Notas por critério</p>
                <div className="flex flex-col gap-4">
                  {CRITERIA_ROWS.map(({ key, label }) => {
                    const c = audit.criteria?.[key];
                    if (!c) return null;
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-3">
                          <span className="w-32 shrink-0 text-xs text-paper/60">{label}</span>
                          <div className="h-2 flex-1 bg-ink">
                            <div className="h-2" style={{ width: `${c.score}%`, background: cfg.colorA }} />
                          </div>
                          <span className="w-8 shrink-0 text-right font-mono text-xs text-paper">{c.score}</span>
                        </div>
                        {c.note && <p className="mt-1.5 pl-[8.5rem] text-xs leading-relaxed text-paper/45">{c.note}</p>}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {(audit.caption || (audit.hashtags && audit.hashtags.length > 0)) && (
                <Card>
                  <p className="tape-label mb-3 text-paper/50">Legenda e hashtags analisadas</p>
                  {audit.caption && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-paper/70">{audit.caption}</p>
                  )}
                  {audit.hashtags && audit.hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {audit.hashtags.map((h) => (
                        <span key={h} className="font-mono text-xs text-signal">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {audit.commentSamples && audit.commentSamples.length > 0 && (
                <Card>
                  <p className="tape-label mb-3 flex items-center gap-1.5 text-paper/50">
                    <MessageCircle size={13} className="text-signal" />
                    Comentários reais analisados
                  </p>
                  {audit.commentInsight && (
                    <p className="mb-3 text-sm text-paper/70">{audit.commentInsight}</p>
                  )}
                  <ul className="flex flex-col gap-2 border-t border-line pt-3 text-xs text-paper/50">
                    {audit.commentSamples.map((c) => (
                      <li key={c} className="italic">
                        “{c}”
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

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
