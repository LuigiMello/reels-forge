"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Clapperboard,
  Clock,
  Copy,
  Dices,
  Download,
  Flame,
  History,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Trash2,
  Wand2,
} from "lucide-react";
import { PLATFORM_CONFIG, PLATFORMS } from "@/lib/platform-config";
import { NICHES } from "@/lib/mock/pools";
import {
  DURATION_OPTIONS,
  SCRIPT_ANGLES,
  SCRIPT_TONES,
  buildScript,
  formatScriptAsText,
  rerollCta,
  rerollHooks,
  rerollSound,
  type DurationOption,
  type ScriptAngle,
} from "@/lib/script-builder";
import type { AiScriptInsight, GeneratedScript, Platform, ScriptTone, ViralPost } from "@/lib/types";
import { useScriptHistoryStore } from "@/lib/script-history-store";
import { Button, Card, Chip, ScoreGauge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { formatCompact, formatHoursAgo } from "@/lib/format";
import { ScriptCoverPreview } from "./ScriptCoverPreview";

type Tab = "criar" | "historico";

export function ScriptBuilder({ topOfDay }: { topOfDay: Record<Platform, ViralPost | undefined> }) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [niche, setNiche] = useState<string>(NICHES[0]);
  const [angle, setAngle] = useState<ScriptAngle>("storytime");
  const [tone, setTone] = useState<ScriptTone>("serio");
  const [duration, setDuration] = useState<DurationOption>(30);
  const [keyword, setKeyword] = useState("");
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("criar");
  const [insight, setInsight] = useState<AiScriptInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const historyItems = useScriptHistoryStore((s) => s.items);
  const saveToHistory = useScriptHistoryStore((s) => s.save);
  const removeFromHistory = useScriptHistoryStore((s) => s.remove);
  const clearHistory = useScriptHistoryStore((s) => s.clear);

  const inspiration = topOfDay[platform];

  function generate(useInspiration = false) {
    const next = buildScript({
      platform,
      niche,
      angle,
      tone,
      targetDurationSec: duration,
      keyword: keyword || undefined,
      inspiration:
        useInspiration && inspiration
          ? { hook: inspiration.hook, handle: inspiration.handle, score: inspiration.derived.viralScore }
          : undefined,
    });
    setScript(next);
    setCopied(false);
    setInsight(null);
    setInsightError(null);
    saveToHistory(next);
  }

  function applyInspiration() {
    if (!inspiration) return;
    setNiche(inspiration.niche);
    generate(true);
  }

  async function copyCaption() {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently ignore, the text is on screen either way
    }
  }

  function downloadScript() {
    if (!script) return;
    const blob = new Blob([formatScriptAsText(script)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro-${script.platform}-${script.angle.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function doRerollHooks() {
    if (!script) return;
    const next = rerollHooks(script, niche, tone);
    setScript(next);
    saveToHistory(next);
  }

  function doRerollSound() {
    if (!script) return;
    const next = rerollSound(script);
    setScript(next);
    saveToHistory(next);
  }

  function doRerollCta() {
    if (!script) return;
    const next = rerollCta(script, tone);
    setScript(next);
    saveToHistory(next);
  }

  async function analyzeWithAi() {
    if (!script || insightLoading) return;
    setInsightLoading(true);
    setInsightError(null);
    try {
      const res = await fetch("/api/analyze/script", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ script, request: { platform, niche, angle, tone, keyword: keyword || undefined } }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Falha na análise (${res.status})`);
      }
      const data: AiScriptInsight = await res.json();
      setInsight(data);
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : "Falha ao analisar tendências.");
      setInsight(null);
    } finally {
      setInsightLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex border border-line-strong">
        <button
          onClick={() => setTab("criar")}
          className={cn(
            "tape-label flex flex-1 items-center justify-center gap-1.5 px-4 py-3 transition-colors",
            tab === "criar" ? "bg-grad-ig text-white" : "text-paper/60 hover:text-paper"
          )}
        >
          <Clapperboard size={13} />
          Criar roteiro
        </button>
        <button
          onClick={() => setTab("historico")}
          className={cn(
            "tape-label flex flex-1 items-center justify-center gap-1.5 px-4 py-3 transition-colors",
            tab === "historico" ? "bg-grad-ig text-white" : "text-paper/60 hover:text-paper"
          )}
        >
          <History size={13} />
          Meus roteiros ({historyItems.length})
        </button>
      </div>

      {tab === "historico" ? (
        <ScriptHistoryPanel
          items={historyItems}
          onRemove={removeFromHistory}
          onClear={clearHistory}
          onLoad={(s) => {
            setScript(s);
            setInsight(null);
            setInsightError(null);
            setPlatform(s.platform);
            setNiche(s.niche);
            setTone(s.tone);
            setTab("criar");
          }}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <Card className="flex h-fit flex-col gap-6">
            <div>
              <p className="tape-label mb-3 text-paper/50">Plataforma</p>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => {
                  const cfg = PLATFORM_CONFIG[p];
                  const active = platform === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={cn(
                        "tape-label flex-1 border px-2 py-2.5 text-[10px] transition-colors",
                        active ? "text-white" : "border-line-strong text-paper/60"
                      )}
                      style={active ? { background: cfg.colorA, borderColor: cfg.colorA } : undefined}
                    >
                      {cfg.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {inspiration && (
              <button
                onClick={applyInspiration}
                className="flex items-start gap-2.5 border border-line-strong bg-ink px-3 py-2.5 text-left transition-colors hover:border-acid"
              >
                <Flame size={14} className="mt-0.5 shrink-0 text-flame" />
                <span className="text-xs text-paper/60">
                  <span className="tape-label block text-[9px] text-flame">inspirar no #1 de hoje</span>
                  <span className="mt-1 block text-paper/80">“{inspiration.hook}”</span>
                  <span className="mt-1 block text-paper/40">
                    {inspiration.handle} · {formatCompact(inspiration.raw.views)} views · score{" "}
                    {inspiration.derived.viralScore} · {formatHoursAgo(inspiration.raw.postedHoursAgo)}
                  </span>
                </span>
              </button>
            )}

            <div>
              <label className="tape-label mb-2 block text-paper/50" htmlFor="niche-select">
                Nicho
              </label>
              <select
                id="niche-select"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="min-h-11 w-full border border-line-strong bg-ink px-3 py-2 text-sm text-paper"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="tape-label mb-2 text-paper/50">Ângulo do roteiro</p>
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
                {SCRIPT_ANGLES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAngle(a.id)}
                    className={cn(
                      "border px-3 py-2.5 text-left text-xs transition-colors",
                      angle === a.id
                        ? "border-acid bg-ink text-paper"
                        : "border-line-strong text-paper/50 hover:text-paper"
                    )}
                  >
                    <span className="tape-label block text-[10px]" style={angle === a.id ? { color: "var(--acid)" } : undefined}>
                      {a.label}
                    </span>
                    <span className="mt-1 block text-paper/40">{a.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="tape-label mb-2 text-paper/50">Tom de voz</p>
              <div className="grid grid-cols-2 gap-2">
                {SCRIPT_TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    title={t.description}
                    className={cn(
                      "tape-label border px-2 py-2.5 text-[10px] transition-colors",
                      tone === t.id ? "text-white" : "border-line-strong text-paper/60 hover:text-paper"
                    )}
                    style={tone === t.id ? { background: "var(--grad-ig-solid)", borderColor: "transparent" } : undefined}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="tape-label mb-2 flex items-center gap-1.5 text-paper/50">
                <Clock size={11} />
                Duração alvo
              </p>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "tape-label flex-1 border px-2 py-2.5 text-[10px] transition-colors",
                      duration === d ? "border-acid text-acid" : "border-line-strong text-paper/60 hover:text-paper"
                    )}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="tape-label mb-2 block text-paper/50" htmlFor="keyword-input">
                Palavra-chave (opcional)
              </label>
              <input
                id="keyword-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ex: cartão de crédito, treino em casa..."
                className="min-h-11 w-full border border-line-strong bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-acid focus:outline-none"
              />
            </div>

            <Button onClick={() => generate(false)} className="w-full">
              <Clapperboard size={14} />
              {script ? "Gerar outro roteiro" : "Gerar roteiro"}
            </Button>
          </Card>

          <div>
            {!script ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 border border-dashed border-line-strong p-12 text-center">
                <Clapperboard size={28} className="text-paper/20" />
                <p className="max-w-sm text-sm text-paper/40">
                  Escolha plataforma, nicho, ângulo, tom e duração ao lado e clique em gerar — o
                  roteiro completo aparece aqui, com hook, blocos de tempo, capa sugerida, legenda
                  e trilhas.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-[140px_1fr]">
                  <ScriptCoverPreview
                    platform={script.platform}
                    hook={script.hookOptions[0]}
                    coverSeed={script.coverSeed}
                    durationSec={script.estimatedDurationSec}
                  />
                  <Card>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Chip color={PLATFORM_CONFIG[script.platform].colorA}>
                          {PLATFORM_CONFIG[script.platform].name}
                        </Chip>
                        <h2 className="mt-3 font-display text-2xl font-bold text-paper">{script.title}</h2>
                        <p className="tape-label mt-1 text-paper/40">
                          tom: {SCRIPT_TONES.find((t) => t.id === script.tone)?.label} · {script.estimatedDurationSec}s
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <ScoreGauge score={script.predictedScore} size={56} />
                        <span className="tape-label text-paper/40">score previsto</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
                      <button
                        onClick={downloadScript}
                        className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                      >
                        <Download size={13} />
                        baixar .txt
                      </button>
                      <button
                        onClick={() => generate(false)}
                        className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                      >
                        <RefreshCw size={13} />
                        gerar novo
                      </button>
                      <button
                        onClick={analyzeWithAi}
                        disabled={insightLoading}
                        className="tape-label flex items-center gap-1.5 text-signal hover:opacity-80 disabled:opacity-50"
                      >
                        {insightLoading ? <Loader2 size={13} className="animate-spin" /> : <TrendingUp size={13} />}
                        {insightLoading ? "analisando tendências..." : "analisar tendências + roteiro com IA"}
                      </button>
                    </div>
                  </Card>
                </div>

                {insightError && !insight && (
                  <div className="flex items-start gap-2.5 border border-flame px-3 py-2.5 text-xs text-flame">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{insightError}</span>
                  </div>
                )}

                {insight && (
                  <Card>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <p className="tape-label flex items-center gap-1.5 text-signal">
                        <TrendingUp size={13} />
                        Análise de tendências + crítica da IA
                      </p>
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <ScoreGauge score={insight.score} size={44} />
                        <span className="tape-label text-paper/40">potencial agora</span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "mb-4 flex items-start gap-2.5 border px-3 py-2.5 text-xs",
                        insight.hasRealTrendData ? "border-acid text-acid" : "border-flame text-flame"
                      )}
                    >
                      {insight.hasRealTrendData ? <Wand2 size={13} className="mt-0.5 shrink-0" /> : <AlertTriangle size={13} className="mt-0.5 shrink-0" />}
                      <span className="text-paper/60">{insight.dataNote}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="tape-label mb-1.5 text-paper/50">O que está em alta agora</p>
                        <p className="text-sm leading-relaxed text-paper/70">{insight.trendsSummary}</p>
                      </div>

                      {insight.trendingExamples.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {insight.trendingExamples.slice(0, 6).map((ex) => (
                            <span
                              key={ex.title + ex.channel}
                              className="border border-line px-2 py-1 text-xs text-paper/60"
                              title={`${ex.channel} · ${formatCompact(ex.views)} views`}
                            >
                              {ex.category === "música" ? "🎵 " : "🔥 "}
                              {ex.title.length > 40 ? ex.title.slice(0, 40) + "…" : ex.title}
                            </span>
                          ))}
                        </div>
                      )}

                      <div>
                        <p className="tape-label mb-1.5 text-paper/50">Estilo recomendado agora</p>
                        <p className="text-sm leading-relaxed text-paper/70">{insight.recommendedStyle}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="border-t border-line pt-4">
                          <p className="tape-label mb-1.5 text-paper/50">Crítica da sua ideia</p>
                          <p className="text-sm leading-relaxed text-paper/70">{insight.ideaCritique}</p>
                        </div>
                        <div className="border-t border-line pt-4">
                          <p className="tape-label mb-1.5 text-paper/50">Crítica deste roteiro</p>
                          <p className="text-sm leading-relaxed text-paper/70">{insight.scriptCritique}</p>
                        </div>
                      </div>

                      {insight.hookRewrite && (
                        <div className="border-t border-line pt-4">
                          <p className="tape-label mb-1.5 text-paper/50">Sugestão de hook mais alinhada</p>
                          <p className="border-l-2 border-acid pl-3 text-sm text-paper">“{insight.hookRewrite}”</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {script.inspiration && (
                  <div className="flex items-center gap-2 border border-line-strong bg-ink px-3 py-2.5 text-xs text-paper/60">
                    <Flame size={13} className="shrink-0 text-flame" />
                    Inspirado no vídeo #1 de hoje de {script.inspiration.handle} (score {script.inspiration.score})
                  </div>
                )}

                <Card>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="tape-label text-paper/50">Opções de hook</p>
                    <button
                      onClick={doRerollHooks}
                      className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                    >
                      <Dices size={13} />
                      rerolar
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {script.hookOptions.map((h, i) => (
                      <p
                        key={h + i}
                        className={cn(
                          "border-l-2 pl-3 text-sm",
                          i === 0 ? "border-acid text-paper" : "border-line text-paper/50"
                        )}
                      >
                        “{h}”
                      </p>
                    ))}
                  </div>
                </Card>

                <Card>
                  <p className="tape-label mb-4 text-paper/50">Linha do tempo do roteiro</p>
                  <ol className="flex flex-col gap-4">
                    {script.blocks.map((b, i) => (
                      <li key={i} className="grid grid-cols-[90px_1fr] gap-4 border-t border-line pt-4 first:border-t-0 first:pt-0">
                        <div>
                          <p className="tape-label text-acid">{b.timeframe}</p>
                          <p className="mt-1 text-xs font-semibold text-paper">{b.label}</p>
                        </div>
                        <div className="text-sm text-paper/70">
                          <p>{b.instruction}</p>
                          {b.shot && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-signal">
                              <Sparkles size={11} />
                              {b.shot}
                            </p>
                          )}
                          {b.onScreenText && (
                            <p className="mt-1.5 text-xs text-paper/40">
                              texto em tela: <span className="text-paper/60">“{b.onScreenText}”</span>
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Card>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="tape-label text-paper/50">Legenda pronta</p>
                      <button
                        onClick={copyCaption}
                        className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "copiado" : "copiar"}
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-sm text-paper/70">{script.caption}</p>
                  </Card>

                  <Card>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="tape-label text-paper/50">Trilhas sugeridas</p>
                      <button
                        onClick={doRerollSound}
                        className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                      >
                        <Dices size={13} />
                        rerolar
                      </button>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {script.soundOptions.map((s) => (
                        <li key={s} className="text-sm text-paper/70">
                          {s}
                        </li>
                      ))}
                    </ul>

                    <div className="mb-3 mt-5 flex items-center justify-between">
                      <p className="tape-label text-paper/50">CTA</p>
                      <button
                        onClick={doRerollCta}
                        className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                      >
                        <Dices size={13} />
                        rerolar
                      </button>
                    </div>
                    <p className="text-sm text-paper/70">{script.cta}</p>
                  </Card>
                </div>

                <Card>
                  <p className="tape-label mb-3 text-paper/50">Notas de produção</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {script.productionNotes.map((n) => (
                      <li key={n} className="flex gap-2 text-sm text-paper/70">
                        <span className="mt-1.5 h-1 w-1 shrink-0 bg-signal" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptHistoryPanel({
  items,
  onRemove,
  onClear,
  onLoad,
}: {
  items: { script: GeneratedScript; savedAt: string }[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onLoad: (s: GeneratedScript) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed border-line-strong px-6 py-16 text-center">
        <History size={26} className="text-paper/20" />
        <p className="max-w-sm text-sm text-paper/40">
          Todo roteiro que você gerar fica salvo aqui automaticamente, no seu navegador.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={onClear}
          className="tape-label flex items-center gap-1.5 text-paper/40 hover:text-flame"
        >
          <Trash2 size={13} />
          limpar histórico
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ script, savedAt }) => (
          <Card key={script.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <Chip color={PLATFORM_CONFIG[script.platform].colorA}>{PLATFORM_CONFIG[script.platform].name}</Chip>
              <ScoreGauge score={script.predictedScore} size={36} />
            </div>
            <p className="font-display text-sm font-semibold text-paper">{script.title}</p>
            <p className="line-clamp-2 text-xs text-paper/50">“{script.hookOptions[0]}”</p>
            <p className="tape-label text-paper/30">
              {new Date(savedAt).toLocaleDateString("pt-BR")} · {script.estimatedDurationSec}s
            </p>
            <div className="mt-1 flex items-center gap-4 border-t border-line pt-3">
              <button onClick={() => onLoad(script)} className="tape-label text-paper/60 hover:text-acid">
                abrir
              </button>
              <button onClick={() => onRemove(script.id)} className="tape-label text-paper/60 hover:text-flame">
                remover
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
