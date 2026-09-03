import { generateDailyViral } from "@/lib/mock/generator";
import { todayKey } from "@/lib/date";
import type { PlatformConfig } from "@/lib/types";
import { PlatformHeader } from "./PlatformHeader";
import { TrendCard } from "@/components/research/TrendCard";
import { SectionLabel } from "@/components/ui/primitives";
import { Footer } from "@/components/layout/Footer";

export function PlatformOverview({ cfg }: { cfg: PlatformConfig }) {
  const posts = generateDailyViral(cfg.id, todayKey()).slice(0, 6);

  return (
    <>
      <PlatformHeader
        cfg={cfg}
        eyebrow={`central ${cfg.name}`}
        title={`${cfg.name} em foco`}
        description={`Tudo o que envolve ${cfg.name} num só lugar: os ${cfg.contentLabelPlural.toLowerCase()} virais de hoje, avaliação de ${cfg.contentLabel.toLowerCase()} específico e auditoria de ${cfg.accountLabel.toLowerCase()}.`}
        links={[
          { href: cfg.contentHref, label: `Avaliar ${cfg.contentLabel.toLowerCase()}` },
          { href: cfg.accountHref, label: `Avaliar ${cfg.accountLabel.toLowerCase()}` },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <SectionLabel index="Top 6">Virais de hoje em {cfg.name}</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, i) => (
            <TrendCard key={post.id} post={post} rank={i + 1} metricsMode="separadas" />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
