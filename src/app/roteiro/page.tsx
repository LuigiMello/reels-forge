import type { Metadata } from "next";
import { ScriptBuilder } from "@/components/script/ScriptBuilder";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Builder de roteiro — Reels Forge" };

export default function RoteiroPage() {
  return (
    <>
      <header className="border-b border-line px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="tape-label mb-4 text-flame">ateliê de roteiro</p>
          <h1 className="font-display text-5xl font-bold leading-none text-paper sm:text-6xl">
            Monte seu <span className="text-grad-ig">roteiro viral</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/60">
            Escolha a plataforma, o nicho e o ângulo da história — a Reels Forge monta hook,
            blocos de tempo, legenda, hashtags, trilha e CTA prontos para gravar hoje.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <ScriptBuilder />
      </section>

      <Footer />
    </>
  );
}
