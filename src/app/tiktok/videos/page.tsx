import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformContentAudit } from "@/components/platform/PlatformContentAudit";
import { Footer } from "@/components/layout/Footer";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Avaliar vídeo do TikTok — Reels Forge" };

export default function TikTokVideosPage() {
  const cfg = PLATFORM_CONFIG.tiktok;
  return (
    <>
      <PlatformHeader
        cfg={cfg}
        eyebrow="avaliação de conteúdo"
        title="Avaliar um vídeo"
        description="Cole o link de um vídeo do TikTok e receba diagnóstico de hook, ritmo, legenda, hashtags, som e CTA."
      />
      <PlatformContentAudit cfg={cfg} />
      <Footer />
    </>
  );
}
