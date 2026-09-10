import type { Metadata } from "next";
import { PlatformOverview } from "@/components/platform/PlatformOverview";
import { PLATFORM_CONFIG } from "@/lib/platform-config";

export const metadata: Metadata = { title: "YouTube Shorts — Reels Forge" };
// Real trending data (YouTube Data API) — refetch periodically instead of
// freezing "today's real videos" at build time forever. Cheap (2 quota
// units/fetch — see real-shorts.ts), so 15min is safely sustainable.
// Kept in sync with REAL_DATA_REFRESH_MS in PlatformOverview.tsx.
export const revalidate = 900;

export default function YouTubePage() {
  return <PlatformOverview cfg={PLATFORM_CONFIG.youtube} />;
}
