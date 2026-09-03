import { generateAllDailyViral } from "@/lib/mock/generator";
import { todayKey, todayLabel } from "@/lib/date";
import { ResearchBoard } from "@/components/research/ResearchBoard";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesquisa diária — Reels Forge",
};

export default function PesquisaPage() {
  const dateKey = todayKey();
  const all = generateAllDailyViral(dateKey);

  return (
    <>
      <header className="border-b border-line px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="tape-label mb-4 flex items-center gap-2 text-flame">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-flame" />
            atualizado automaticamente — {todayLabel()}
          </p>
          <h1 className="font-display text-5xl italic leading-none text-paper sm:text-6xl">
            Pesquisa de virais <span className="text-acid">do dia</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/60">
            Ranking gerado automaticamente todos os dias com os conteúdos de maior views,
            curtidas, comentários e engajamento em Instagram, TikTok e YouTube Shorts. Alterne
            entre métricas separadas (uma a uma) ou combinadas (visão consolidada).
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <ResearchBoard all={all} />
      </section>

      <Footer />
    </>
  );
}
