import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformAccountAudit } from "@/components/platform/PlatformAccountAudit";
import { Footer } from "@/components/layout/Footer";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Avaliar conta do TikTok — Reels Forge" };

export default function TikTokContasPage() {
  const cfg = PLATFORM_CONFIG.tiktok;
  return (
    <>
      <PlatformHeader
        cfg={cfg}
        eyebrow="avaliação de conta"
        title="Avaliar uma conta"
        description="Audite o handle: crescimento, consistência, variedade de formato e o melhor horário para postar."
      />
      <PlatformAccountAudit cfg={cfg} />
      <Footer />
    </>
  );
}
