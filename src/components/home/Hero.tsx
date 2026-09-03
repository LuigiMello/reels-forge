"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { todayLabel } from "@/lib/date";

const FLOAT_CARDS = [
  { top: "8%", left: "6%", rot: -8, label: "IG · 4.2M views", speed: 60 },
  { top: "84%", left: "5%", rot: 6, label: "score viral 92", speed: 120 },
  { top: "14%", left: "80%", rot: 10, label: "TT · 9.1M views", speed: 90 },
  { top: "64%", left: "84%", rot: -6, label: "YT · retenção 87%", speed: 140 },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ySub = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Fixed-length array (FLOAT_CARDS), so calling useTransform once per slot
  // at the top level (not inside the render loop) keeps hook order stable.
  const floatY0 = useTransform(scrollYProgress, [0, 1], [0, -FLOAT_CARDS[0].speed]);
  const floatY1 = useTransform(scrollYProgress, [0, 1], [0, -FLOAT_CARDS[1].speed]);
  const floatY2 = useTransform(scrollYProgress, [0, 1], [0, -FLOAT_CARDS[2].speed]);
  const floatY3 = useTransform(scrollYProgress, [0, 1], [0, -FLOAT_CARDS[3].speed]);
  const floatYs = [floatY0, floatY1, floatY2, floatY3];

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden border-b border-line">
      <motion.div
        style={{ y: yBg }}
        className="halftone-bg pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
      />

      {FLOAT_CARDS.map((c, i) => (
        <motion.div
          key={i}
          style={{
            top: c.top,
            left: c.left,
            rotate: c.rot,
            y: floatYs[i],
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 * i }}
          className="tape-label pointer-events-none absolute z-0 hidden select-none border border-line-strong bg-ink-2 px-3 py-2 text-[10px] text-paper/70 shadow-[6px_6px_0_0_var(--line)] md:block"
        >
          {c.label}
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-6 py-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="tape-label mb-6 flex items-center gap-2 text-flame"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-flame" />
          pesquisa automática ativa — {todayLabel()}
        </motion.p>

        <motion.h1
          style={{ y: yTitle }}
          className="font-display text-[15vw] italic leading-[0.9] tracking-tight text-paper sm:text-[10vw] lg:text-[7.5rem]"
        >
          O que está
          <br />
          <span className="text-acid">viralizando</span> hoje.
        </motion.h1>

        <motion.div style={{ y: ySub, opacity }} className="mt-10 flex max-w-xl flex-col gap-6">
          <p className="text-base leading-relaxed text-paper/70 sm:text-lg">
            Todo dia, sem você pedir, a Reels Forge vasculha Instagram, TikTok e YouTube
            Shorts em busca do que está bombando — e transforma isso em roteiro pronto pra
            gravar.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/pesquisa"
              className="tape-label inline-flex min-h-11 items-center gap-2 bg-acid px-5 py-3 text-[11px] text-ink transition-colors hover:bg-paper"
            >
              Ver pesquisa de hoje
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/roteiro"
              className="tape-label inline-flex min-h-11 items-center gap-2 border border-line-strong px-5 py-3 text-[11px] text-paper transition-colors hover:border-acid hover:text-acid"
            >
              Criar roteiro agora
              <ArrowDownRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
