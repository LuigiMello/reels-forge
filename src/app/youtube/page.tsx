import type { Metadata } from "next";
import { PlatformOverview } from "@/components/platform/PlatformOverview";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "YouTube Shorts — Reels Forge" };
// Real trending data (YouTube Data API) — refetch periodically instead of
// freezing "today's real videos" at build time forever.
export const revalidate = 3600;

export default function YouTubePage() {
  return <PlatformOverview cfg={PLATFORM_CONFIG.youtube} />;
}
