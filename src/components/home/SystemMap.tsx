import Link from "next/link";
import { ArrowUpRight, Compass, Feather, ScanSearch, UserSearch } from "lucide-react";
import { SectionLabel } from "@/components/ui/primitives";

const ITEMS = [
  {
    n: "01",
    icon: Compass,
    title: "Pesquisa diária",
    desc: "Ranking automático dos vídeos com maior engajamento do dia, nas três plataformas, com métricas separadas e combinadas.",
    href: "/pesquisa",
    cta: "Abrir painel de pesquisa",
  },
  {
    n: "02",
    icon: Feather,
    title: "Builder de roteiro",
    desc: "Escolha nicho e ângulo — a IA monta hook, blocos de tempo, legenda, hashtags, trilha e CTA prontos para gravar.",
    href: "/roteiro",
    cta: "Montar roteiro",
  },
  {
    n: "03",
    icon: ScanSearch,
    title: "Avaliar um vídeo",
    desc: "Cole o link de um Reel, TikTok ou Short e receba diagnóstico de hook, ritmo, legenda, hashtag, som e CTA.",
    href: "/instagram/reels",
    cta: "Avaliar conteúdo",
  },
  {
    n: "04",
    icon: UserSearch,
    title: "Avaliar uma conta",
    desc: "Audite handle por handle: crescimento, consistência, formato-chave e melhor horário de postagem.",
    href: "/instagram/contas",
    cta: "Avaliar conta",
  },
];

export function SystemMap() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionLabel index="02">O que dá pra fazer aqui</SectionLabel>
      <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
        {ITEMS.map(({ n, icon: Icon, title, desc, href, cta }) => (
          <Link
            key={n}
            href={href}
            className="group relative flex flex-col gap-4 bg-ink p-8 transition-colors hover:bg-ink-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl font-bold text-paper/20 transition-colors group-hover:text-acid">
                {n}
              </span>
              <Icon size={20} strokeWidth={1.5} className="text-paper/40 group-hover:text-paper" />
            </div>
            <h3 className="font-display text-2xl font-bold text-paper">{title}</h3>
            <p className="text-sm leading-relaxed text-paper/60">{desc}</p>
            <span className="tape-label mt-2 inline-flex items-center gap-1.5 text-paper/50 group-hover:text-acid">
              {cta}
              <ArrowUpRight size={13} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
