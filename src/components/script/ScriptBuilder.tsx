"use client";

import { useState } from "react";
import { Check, Clapperboard, Copy, RefreshCw } from "lucide-react";
import { PLATFORM_CONFIG, PLATFORMS } from "@/lib/platform-config";
import { NICHES } from "@/lib/mock/pools";
import { SCRIPT_ANGLES, buildScript, type ScriptAngle } from "@/lib/script-builder";
import type { GeneratedScript, Platform } from "@/lib/types";
import { Button, Card, Chip } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function ScriptBuilder() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [niche, setNiche] = useState<string>(NICHES[0]);
  const [angle, setAngle] = useState<ScriptAngle>("storytime");
  const [keyword, setKeyword] = useState("");
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    setScript(buildScript({ platform, niche, angle, keyword: keyword || undefined }));
    setCopied(false);
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

  return (
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
          <div className="flex flex-col gap-2">
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

        <Button onClick={generate} className="w-full">
          <Clapperboard size={14} />
          {script ? "Gerar outro roteiro" : "Gerar roteiro"}
        </Button>
      </Card>

      <div>
        {!script ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 border border-dashed border-line-strong p-12 text-center">
            <Clapperboard size={28} className="text-paper/20" />
            <p className="max-w-sm text-sm text-paper/40">
              Escolha plataforma, nicho e ângulo ao lado e clique em gerar — o roteiro completo
              aparece aqui, com hook, blocos de tempo, legenda e trilha sugerida.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Chip color={PLATFORM_CONFIG[script.platform].colorA}>
                    {PLATFORM_CONFIG[script.platform].name}
                  </Chip>
                  <h2 className="mt-3 font-display text-2xl font-bold text-paper">{script.title}</h2>
                </div>
                <button
                  onClick={generate}
                  className="tape-label flex items-center gap-1.5 text-paper/50 hover:text-acid"
                >
                  <RefreshCw size={13} />
                  regenerar
                </button>
              </div>

              <div className="mt-5">
                <p className="tape-label mb-2 text-paper/50">Opções de hook</p>
                <div className="flex flex-col gap-2">
                  {script.hookOptions.map((h, i) => (
                    <p
                      key={h}
                      className={cn(
                        "border-l-2 pl-3 text-sm",
                        i === 0 ? "border-acid text-paper" : "border-line text-paper/50"
                      )}
                    >
                      “{h}”
                    </p>
                  ))}
                </div>
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
                      {b.onScreenText && (
                        <p className="mt-1.5 text-xs text-paper/40">
                          texto em tela: <span className="text-paper/60">“{b.onScreenText}”</span>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="tape-label mt-4 text-paper/40">
                duração estimada: {script.estimatedDurationSec}s
              </p>
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
                <p className="tape-label mb-3 text-paper/50">Trilha sugerida</p>
                <p className="text-sm text-paper/70">{script.soundSuggestion}</p>
                <p className="tape-label mb-3 mt-5 text-paper/50">CTA</p>
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
  );
}
