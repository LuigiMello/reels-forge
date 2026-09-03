import type { Metadata } from "next";
import { PlatformOverview } from "@/components/platform/PlatformOverview";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "YouTube Shorts — Reels Forge" };

export default function YouTubePage() {
  return <PlatformOverview cfg={PLATFORM_CONFIG.youtube} />;
}
