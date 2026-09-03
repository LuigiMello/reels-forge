import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformAccountAudit } from "@/components/platform/PlatformAccountAudit";
import { Footer } from "@/components/layout/Footer";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Avaliar canal do YouTube — Reels Forge" };

export default function YouTubeCanaisPage() {
  const cfg = PLATFORM_CONFIG.youtube;
  return (
    <>
      <PlatformHeader
        cfg={cfg}
        eyebrow="avaliação de canal"
        title="Avaliar um canal"
        description="Audite o canal: crescimento, consistência, variedade de formato e o melhor horário para postar Shorts."
      />
      <PlatformAccountAudit cfg={cfg} />
      <Footer />
    </>
  );
}
