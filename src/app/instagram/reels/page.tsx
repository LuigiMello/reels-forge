import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformContentAudit } from "@/components/platform/PlatformContentAudit";
import { Footer } from "@/components/layout/Footer";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Avaliar Reels — Reels Forge" };

export default function InstagramReelsPage() {
  const cfg = PLATFORM_CONFIG.instagram;
  return (
    <>
      <PlatformHeader
        cfg={cfg}
        eyebrow="avaliação de conteúdo"
        title="Avaliar um Reel"
        description="Cole o link de um Reel e receba diagnóstico de hook, ritmo, legenda, hashtags, som e CTA — com sugestões práticas de ajuste."
      />
      <PlatformContentAudit cfg={cfg} />
      <Footer />
    </>
  );
}
