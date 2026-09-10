import { generateDailyViral } from "@/lib/mock/generator";
import { fetchRealTrendingShorts } from "@/lib/youtube/real-shorts";
import { todayKey } from "@/lib/date";
import type { PlatformConfig } from "@/lib/types";
import { PlatformHeader } from "./PlatformHeader";
import { TrendCard } from "@/components/research/TrendCard";
import { Card, SectionLabel } from "@/components/ui/primitives";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Info } from "lucide-react";

export async function PlatformOverview({ cfg }: { cfg: PlatformConfig }) {
  let posts = generateDailyViral(cfg.id, todayKey()).slice(0, 6);
  let isReal = false;

  if (cfg.id === "youtube") {
    try {
      const real = await fetchRealTrendingShorts(6);
      if (real.length > 0) {
        posts = real;
        isReal = true;
      }
    } catch {
      // stays on the mock fallback
    }
  }

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

        <Card
          className="mb-6 flex items-start gap-2.5 !p-3 text-xs"
          accent={isReal ? "var(--acid)" : "var(--flame)"}
        >
          {isReal ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-acid" />
          ) : (
            <Info size={14} className="mt-0.5 shrink-0 text-flame" />
          )}
          <span className="text-paper/60">
            {isReal
              ? "Vídeos reais, em alta agora no YouTube (Brasil), via YouTube Data API — título, thumbnail, views, likes, comentários e canal verdadeiros."
              : `Exemplos simulados: ${cfg.name} não tem uma API pública gratuita de "em alta" — mostrar vídeos reais aqui exigiria uma chave paga (RapidAPI/Apify).`}
          </span>
        </Card>

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
