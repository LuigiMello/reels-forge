import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PLATFORM_CONFIG, PLATFORMS } from "@/lib/platform-config";
import { generateAllDailyViral } from "@/lib/mock/generator";
import { todayKey } from "@/lib/date";
import { formatCompact, formatPercent } from "@/lib/format";
import { Card, Chip, SectionLabel, StatNumber } from "@/components/ui/primitives";

export function TodaySnapshot() {
  const dateKey = todayKey();
  const all = generateAllDailyViral(dateKey);

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionLabel index="01">Resumo automático de hoje</SectionLabel>
      <div className="grid gap-5 md:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const cfg = PLATFORM_CONFIG[platform];
          const top = all[platform][0];
          return (
            <Card key={platform} accent={cfg.colorA} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Chip color={cfg.colorA}>{cfg.name}</Chip>
                <span className="tape-label text-paper/40">#1 do dia</span>
              </div>

              <div>
                <p className="text-sm text-paper/50">{top.handle}</p>
                <p className="mt-1 font-display text-xl font-bold leading-snug text-paper">
                  “{top.hook}”
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-line pt-4">
                <StatNumber label="Views" value={formatCompact(top.raw.views)} />
                <StatNumber
                  label="Engaj."
                  value={formatPercent(top.derived.engagementRate)}
                  accent={cfg.colorA}
                />
                <StatNumber label="Score" value={String(top.derived.viralScore)} />
              </div>

              <Link
                href={cfg.contentHref}
                className="tape-label mt-2 inline-flex items-center gap-1.5 text-paper/70 transition-colors hover:text-acid"
              >
                Ver e avaliar {cfg.contentLabelPlural.toLowerCase()}
                <ArrowUpRight size={13} />
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
