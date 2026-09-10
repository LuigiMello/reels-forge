"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, Search, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import type { AiAccountAudit, AuditCriterion, PlatformConfig } from "@/lib/types";
import { generateAccountAudit } from "@/lib/mock/generator";
import { Button, Card, ScoreGauge, SectionLabel, StatNumber } from "@/components/ui/primitives";
import { formatCompact } from "@/lib/format";

const CRITERIA_ROWS: { key: keyof AiAccountAudit["criteria"]; label: string }[] = [
  { key: "growth", label: "Crescimento" },
  { key: "consistency", label: "Consistência" },
  { key: "hook", label: "Ganchos (títulos)" },
  { key: "format", label: "Variedade de formato" },
];

const MODE_META: Record<AiAccountAudit["mode"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  "real-data": { label: "análise com dados reais da conta", color: "var(--acid)", icon: CheckCircle2 },
  "guidance-only": { label: "orientação geral (conta não encontrada / API não disponível)", color: "var(--flame)", icon: AlertTriangle },
};

function mockCriterion(score: number, note: string): AuditCriterion {
  return { score, note };
}

export function PlatformAccountAudit({ cfg }: { cfg: PlatformConfig }) {
  const [handle, setHandle] = useState("");
  const [audit, setAudit] = useState<AiAccountAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = handle.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/analyze/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform: cfg.id, handle: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Falha na análise (${res.status})`);
      }
      const data: AiAccountAudit = await res.json();
      setAudit(data);
      setIsMock(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Falha ao analisar.");
      const mock = generateAccountAudit(cfg.id, trimmed);
      const demoNote = "estimativa genérica — modo demonstração, configure uma chave de IA para uma nota real";
      setAudit({
        mode: "guidance-only",
        platform: cfg.id,
        handle: mock.handle,
        dataNote:
          "IA não configurada neste ambiente (GEMINI_API_KEY/GROQ_API_KEY ausentes) — mostrando uma auditoria de demonstração gerada localmente, não uma avaliação real.",
        overallScore: mock.overallScore,
        growthScore: mock.growthScore,
        consistencyScore: mock.consistencyScore,
        hookScore: mock.hookScore,
        formatScore: mock.formatScore,
        bestPostingWindow: mock.bestPostingWindow,
        topFormat: mock.topFormat,
        summary: "Auditoria de demonstração — configure GEMINI_API_KEY (gratuita, e YOUTUBE_API_KEY para YouTube) para uma avaliação real.",
        criteria: {
          growth: mockCriterion(mock.growthScore, demoNote),
          consistency: mockCriterion(mock.consistencyScore, demoNote),
          hook: mockCriterion(mock.hookScore, demoNote),
          format: mockCriterion(mock.formatScore, demoNote),
        },
        strengths: mock.strengths,
        risks: mock.risks,
        recommendations: mock.recommendations,
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
      <SectionLabel index="02">
        Avaliar {cfg.accountLabel.toLowerCase()} do {cfg.name}
      </SectionLabel>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="account-handle">
          @handle
        </label>
        <input
          id="account-handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="@seu.usuario"
          className="min-h-11 flex-1 border border-line-strong bg-ink-2 px-4 py-3 text-sm text-paper placeholder:text-paper/30 focus:border-acid focus:outline-none"
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {loading ? "Auditando..." : `Auditar ${cfg.accountLabel.toLowerCase()}`}
        </Button>
      </form>
      <p className="mt-3 text-xs text-paper/40">
        {loading
          ? "Buscando inscritos, views, uploads recentes e analisando crescimento, consistência, ganchos e formato — pode levar até 1 minuto pra ser bem detalhado."
          : cfg.id === "youtube"
          ? "Busca o canal real via YouTube Data API (inscritos, views, descrição, uploads recentes com views reais e frequência de postagem calculada) e usa tudo isso na análise."
          : "Instagram e TikTok não têm API pública gratuita de conta — a IA avalia com base em boas práticas gerais e é honesta sobre essa limitação."}
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
            <Card className="flex flex-col items-center gap-3 text-center">
              <ScoreGauge score={audit.overallScore} size={110} />
              <p className="tape-label text-paper/50">Score geral da conta</p>
              <p className="font-display text-lg font-bold text-paper">{audit.channelTitle ?? audit.handle}</p>
            </Card>

            <Card>
              {audit.realStats ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <StatNumber label="Inscritos" value={audit.realStats.subscribers ? formatCompact(audit.realStats.subscribers) : "—"} />
                  <StatNumber label="Views totais" value={audit.realStats.totalViews ? formatCompact(audit.realStats.totalViews) : "—"} />
                  <StatNumber label="Vídeos" value={audit.realStats.videoCount ? formatCompact(audit.realStats.videoCount) : "—"} />
                  <StatNumber
                    label="Posts/semana"
                    value={audit.uploadsPerWeek !== undefined ? String(audit.uploadsPerWeek) : "—"}
                  />
                  <StatNumber label="Melhor horário" value={audit.bestPostingWindow} />
                  <StatNumber label="Formato-chave" value={audit.topFormat} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <StatNumber label="Melhor horário" value={audit.bestPostingWindow} />
                  <StatNumber label="Formato-chave" value={audit.topFormat} />
                </div>
              )}
              {audit.summary && <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-paper/50">{audit.summary}</p>}
            </Card>
          </div>

          <Card>
            <p className="tape-label mb-4 flex items-center gap-1.5 text-paper/50">
              <TrendingUp size={13} className="text-signal" />
              Notas por dimensão
            </p>
            <div className="flex flex-col gap-4">
              {CRITERIA_ROWS.map(({ key, label }) => {
                const c = audit.criteria?.[key];
                if (!c) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-xs text-paper/60">{label}</span>
                      <div className="h-2 flex-1 bg-ink">
                        <div className="h-2" style={{ width: `${c.score}%`, background: cfg.colorA }} />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-xs text-paper">{c.score}</span>
                    </div>
                    {c.note && <p className="mt-1.5 pl-[10.5rem] text-xs leading-relaxed text-paper/45">{c.note}</p>}
                  </div>
                );
              })}
            </div>
          </Card>

          {audit.recentUploads && audit.recentUploads.length > 0 && (
            <Card>
              <p className="tape-label mb-3 text-paper/50">Uploads recentes usados na análise</p>
              <ul className="flex flex-col gap-2 text-sm text-paper/70">
                {audit.recentUploads.map((u) => (
                  <li key={u.title + u.publishedAt} className="flex items-center justify-between gap-3 border-t border-line pt-2 first:border-t-0 first:pt-0">
                    <span className="truncate">{u.title}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      {u.viewCount !== undefined && (
                        <span className="font-mono text-xs text-paper/50">{formatCompact(u.viewCount)} views</span>
                      )}
                      <span className="tape-label text-paper/30">
                        {new Date(u.publishedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <p className="tape-label mb-3 flex items-center gap-1.5 text-paper/50">
                <Sparkles size={13} className="text-acid" />
                Pontos fortes
              </p>
              <ul className="flex flex-col gap-2 text-sm text-paper/70">
                {audit.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-acid" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="tape-label mb-3 flex items-center gap-1.5 text-paper/50">
                <ShieldAlert size={13} className="text-flame" />
                Riscos
              </p>
              <ul className="flex flex-col gap-2 text-sm text-paper/70">
                {audit.risks.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-flame" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="tape-label mb-3 flex items-center gap-1.5 text-paper/50">
                <TrendingUp size={13} className="text-signal" />
                Recomendações
              </p>
              <ul className="flex flex-col gap-2 text-sm text-paper/70">
                {audit.recommendations.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-signal" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {isMock && aiError && <p className="text-xs text-paper/30">Detalhe técnico: {aiError}</p>}
        </div>
      )}
    </section>
  );
}
