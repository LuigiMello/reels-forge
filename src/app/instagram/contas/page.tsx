import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformAccountAudit } from "@/components/platform/PlatformAccountAudit";
import { Footer } from "@/components/layout/Footer";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Avaliar conta do Instagram — Reels Forge" };

export default function InstagramContasPage() {
  const cfg = PLATFORM_CONFIG.instagram;
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
