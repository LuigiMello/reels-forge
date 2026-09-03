import type { Metadata } from "next";
import { PlatformOverview } from "@/components/platform/PlatformOverview";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "Instagram — Reels Forge" };

export default function InstagramPage() {
  return <PlatformOverview cfg={PLATFORM_CONFIG.instagram} />;
}
