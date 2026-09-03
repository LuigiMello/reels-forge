import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SideDock } from "@/components/layout/SideDock";
import { TopTicker } from "@/components/layout/TopTicker";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { GradientDefs } from "@/components/layout/GradientDefs";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Reels Forge — Ateliê de Roteiros Virais",
  description:
    "Builder de roteiros para Reels, TikToks e Shorts. Pesquisa diária automática dos conteúdos virais e ferramentas de avaliação de contas e vídeos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-paper font-sans">
        <GradientDefs />
        <GrainOverlay />
        <TopTicker />
        <div className="flex">
          <SideDock />
          <main className="min-h-screen w-full pl-0 md:pl-[76px]">{children}</main>
        </div>
      </body>
    </html>
  );
}
