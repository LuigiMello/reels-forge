import type { Metadata } from "next";
import { ScriptBuilder } from "@/components/script/ScriptBuilder";
import { Footer } from "@/components/layout/Footer";
import { generateAllDailyViral } from "@/lib/mock/generator";
import { todayKey } from "@/lib/date";
import type { Platform, ViralPost } from "@/lib/types";

export const metadata: Metadata = { title: "Builder de roteiro — Reels Forge" };

export default function RoteiroPage() {
  const all = generateAllDailyViral(todayKey());
  const topOfDay: Record<Platform, ViralPost | undefined> = {
    instagram: all.instagram[0],
    tiktok: all.tiktok[0],
    youtube: all.youtube[0],
  };

  return (
    <>
      <header className="border-b border-line px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="tape-label mb-4 text-flame">ateliê de roteiro</p>
          <h1 className="font-display text-5xl font-bold leading-none text-paper sm:text-6xl">
            Monte seu <span className="text-grad-ig">roteiro viral</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/60">
            Escolha plataforma, nicho, ângulo, tom de voz e duração — a Reels Forge monta hook,
            blocos de tempo com sugestão de plano de câmera, capa, legenda, trilhas e CTA prontos
            para gravar hoje. Ou parta do vídeo #1 do dia como inspiração.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <ScriptBuilder topOfDay={topOfDay} />
      </section>

      <Footer />
    </>
  );
}
