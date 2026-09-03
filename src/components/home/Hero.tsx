"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";
import { todayLabel } from "@/lib/date";
import type { ViralPost } from "@/lib/types";
import { VideoWall } from "./VideoWall";

export function Hero({ wallPosts }: { wallPosts: ViralPost[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yWall = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "var(--grad-ig-text)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-0 lg:min-h-[88vh]">
        <motion.div style={{ y: yText, opacity }} className="max-w-xl">
          <p className="tape-label mb-5 inline-flex items-center gap-2 border border-line-strong px-3 py-1.5 text-paper/70">
            <Radar size={12} className="text-acid" />
            varredura automática ativa — {todayLabel()}
          </p>

          <h1 className="font-display text-[13vw] font-extrabold leading-[0.95] tracking-tight text-paper sm:text-6xl lg:text-7xl">
            Ache o vídeo
            <br />
            que vai <span className="text-grad-ig">explodir</span>.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-paper/60 sm:text-lg">
            Todo dia, sem você pedir, a Reels Forge vasculha Instagram, TikTok e YouTube Shorts
            atrás do que está bombando agora — e transforma isso em roteiro pronto pra gravar.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/pesquisa"
              className="tape-label bg-grad-ig inline-flex min-h-11 items-center gap-2 px-5 py-3 text-[11px] text-white transition-opacity hover:opacity-90"
            >
              Ver pesquisa de hoje
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/roteiro"
              className="tape-label inline-flex min-h-11 items-center gap-2 border border-line-strong px-5 py-3 text-[11px] text-paper transition-colors hover:border-acid hover:text-acid"
            >
              Criar roteiro agora
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-line pt-6 text-paper/40">
            <Stat value="3" label="plataformas" />
            <Stat value="36" label="vídeos rastreados hoje" />
            <Stat value="24h" label="atualização" />
          </div>
        </motion.div>

        <motion.div style={{ y: yWall }} className="h-[380px] lg:h-[78vh]">
          <VideoWall posts={wallPosts} columns={4} />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-lg font-semibold text-paper">{value}</p>
      <p className="tape-label text-[9px]">{label}</p>
    </div>
  );
}
