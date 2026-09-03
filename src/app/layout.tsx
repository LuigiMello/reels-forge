import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SideDock } from "@/components/layout/SideDock";
import { TopTicker } from "@/components/layout/TopTicker";
import { GrainOverlay } from "@/components/layout/GrainOverlay";

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
