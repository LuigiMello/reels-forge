import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformContentAudit } from "@/components/platform/PlatformContentAudit";
import { Footer } from "@/components/layout/Footer";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Avaliar Short — Reels Forge" };

export default function YouTubeShortsPage() {
  const cfg = PLATFORM_CONFIG.youtube;
  return (
    <>
      <PlatformHeader
        cfg={cfg}
        eyebrow="avaliação de conteúdo"
        title="Avaliar um Short"
        description="Cole o link de um Short e receba diagnóstico de hook, ritmo, legenda, hashtags, som e CTA."
      />
      <PlatformContentAudit cfg={cfg} />
      <Footer />
    </>
  );
}
