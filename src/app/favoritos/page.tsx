"use client";

import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/lib/favorites-store";
import { TrendCard } from "@/components/research/TrendCard";
import { Footer } from "@/components/layout/Footer";

export default function FavoritosPage() {
  const items = useFavoritesStore((s) => s.items);
  const clear = useFavoritesStore((s) => s.clear);
  const posts = Object.values(items).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
  const [metricsMode] = useState<"separadas" | "combinada">("separadas");

  return (
    <>
      <header className="border-b border-line px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="tape-label mb-4 text-acid">sua coleção</p>
          <h1 className="font-display text-5xl font-bold leading-none text-paper sm:text-6xl">
            Vídeos <span className="text-grad-ig">favoritados</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/60">
            Salvos direto no seu navegador — continuam aqui mesmo depois que saírem do ranking do
            dia. Use pra reunir referências antes de montar um roteiro.
          </p>
          {posts.length > 0 && (
            <button
              onClick={clear}
              className="tape-label mt-6 inline-flex items-center gap-1.5 text-paper/40 transition-colors hover:text-flame"
            >
              <Trash2 size={13} />
              limpar todos os favoritos
            </button>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-line-strong px-6 py-20 text-center">
            <Heart size={28} className="text-paper/20" />
            <p className="max-w-sm text-sm text-paper/40">
              Você ainda não salvou nenhum vídeo. Clique no coração em qualquer card da{" "}
              <a href="/pesquisa" className="text-acid hover:underline">
                pesquisa diária
              </a>{" "}
              pra guardar aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, i) => (
              <TrendCard key={post.id} post={post} rank={i + 1} metricsMode={metricsMode} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
