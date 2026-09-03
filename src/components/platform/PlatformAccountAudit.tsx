"use client";

import { useState } from "react";
import { Search, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import type { PlatformConfig } from "@/lib/types";
import { generateAccountAudit } from "@/lib/mock/generator";
import type { AccountAudit } from "@/lib/types";
import { Button, Card, ScoreGauge, SectionLabel, StatNumber } from "@/components/ui/primitives";
import { formatCompact } from "@/lib/format";

const SUB_SCORES: { key: keyof AccountAudit; label: string }[] = [
  { key: "growthScore", label: "Crescimento" },
  { key: "consistencyScore", label: "Consistência" },
  { key: "hookScore", label: "Ganchos" },
  { key: "formatScore", label: "Variedade de formato" },
];

export function PlatformAccountAudit({ cfg }: { cfg: PlatformConfig }) {
  const [handle, setHandle] = useState("");
  const [audit, setAudit] = useState<AccountAudit | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    setAudit(generateAccountAudit(cfg.id, handle.trim()));
  }

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
          placeholder={`@seu.usuario`}
          className="min-h-11 flex-1 border border-line-strong bg-ink-2 px-4 py-3 text-sm text-paper placeholder:text-paper/30 focus:border-acid focus:outline-none"
        />
        <Button type="submit" className="shrink-0">
          <Search size={14} />
          Auditar {cfg.accountLabel.toLowerCase()}
        </Button>
      </form>
      <p className="mt-3 text-xs text-paper/40">
        Modo demonstração — para ler dados privados reais da sua conta, será necessário login
        oficial (OAuth) da plataforma, ainda não conectado.
      </p>

      {audit && (
        <div className="mt-10 flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <Card className="flex flex-col items-center gap-3 text-center">
              <ScoreGauge score={audit.overallScore} size={110} />
              <p className="tape-label text-paper/50">Score geral da conta</p>
              <p className="font-display text-lg font-bold text-paper">{audit.handle}</p>
            </Card>

            <Card>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <StatNumber label="Seguidores" value={formatCompact(audit.followers)} />
                <StatNumber label="Views médias" value={formatCompact(audit.avgViews)} />
                <StatNumber label="Posts/semana" value={String(audit.postsPerWeek)} />
                <StatNumber label="Melhor horário" value={audit.bestPostingWindow} />
                <StatNumber label="Formato-chave" value={audit.topFormat} />
              </div>
            </Card>
          </div>

          <Card>
            <p className="tape-label mb-4 flex items-center gap-1.5 text-paper/50">
              <TrendingUp size={13} className="text-signal" />
              Notas por dimensão
            </p>
            <div className="flex flex-col gap-3">
              {SUB_SCORES.map(({ key, label }) => {
                const value = audit[key] as number;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-xs text-paper/60">{label}</span>
                    <div className="h-2 flex-1 bg-ink">
                      <div className="h-2" style={{ width: `${value}%`, background: cfg.colorA }} />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-xs text-paper">{value}</span>
                  </div>
                );
              })}
            </div>
          </Card>

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
        </div>
      )}
    </section>
  );
}
