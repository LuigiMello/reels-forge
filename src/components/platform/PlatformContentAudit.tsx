"use client";

import { useState } from "react";
import { AlertTriangle, Sparkles, Wand2 } from "lucide-react";
import type { PlatformConfig } from "@/lib/types";
import { auditContentUrl } from "@/lib/content-audit";
import type { ContentAudit } from "@/lib/types";
import { Button, Card, ScoreGauge, SectionLabel } from "@/components/ui/primitives";
import { formatPercent } from "@/lib/format";

const SCORE_ROWS: { key: keyof ContentAudit; label: string }[] = [
  { key: "hookScore", label: "Força do gancho" },
  { key: "pacingScore", label: "Ritmo de edição" },
  { key: "captionScore", label: "Legenda" },
  { key: "hashtagScore", label: "Hashtags" },
  { key: "soundScore", label: "Som/trilha" },
  { key: "ctaScore", label: "Call-to-action" },
];

export function PlatformContentAudit({ cfg }: { cfg: PlatformConfig }) {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<ContentAudit | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setAudit(auditContentUrl(cfg.id, url.trim()));
  }

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
        <Button type="submit" className="shrink-0">
          <Wand2 size={14} />
          Analisar
        </Button>
      </form>
      <p className="mt-3 text-xs text-paper/40">
        Modo demonstração: a análise é gerada a partir do link (determinística), sem acessar a
        plataforma de verdade ainda. Pronta para plugar a leitura real quando você conectar sua
        conta.
      </p>

      {audit && (
        <div className="mt-10 grid gap-6 lg:grid-cols-[220px_1fr]">
          <Card className="flex flex-col items-center gap-4 text-center">
            <ScoreGauge score={audit.overallScore} size={110} />
            <div>
              <p className="tape-label text-paper/50">Score geral</p>
              <p className="mt-2 font-mono text-xs text-paper/60">
                Retenção prevista: {formatPercent(audit.predictedRetention)}
              </p>
              <p className="font-mono text-xs text-paper/60">
                Score viral previsto: {audit.predictedViralScore}
              </p>
            </div>
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
                        <div
                          className="h-2"
                          style={{ width: `${value}%`, background: cfg.colorA }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-xs text-paper">
                        {value}
                      </span>
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
      )}
    </section>
  );
}
