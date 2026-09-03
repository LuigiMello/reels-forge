import type { AccountAudit, Platform, ViralPost } from "../types";
import type { PlatformConnector } from "./types";

/**
 * Stub for a live data source. Not wired in yet — flip a platform to "live"
 * in `registry.ts` once the relevant env vars below are set, and implement
 * the two fetch methods against the real provider.
 *
 * Suggested providers per platform (none are called yet):
 * - Instagram: RapidAPI "Instagram Scraper" / Apify actor + INSTAGRAM_SESSION or RAPIDAPI_KEY
 * - TikTok:    RapidAPI "TikTok API" / Apify actor + RAPIDAPI_KEY or APIFY_TOKEN
 * - YouTube:   Official YouTube Data API v3 + YOUTUBE_API_KEY (search.list + videos.list,
 *              ordered by viewCount, filtered to videoDuration=short)
 *
 * Login-based account auditing (reading a user's own private insights) needs
 * OAuth against each platform's official API (Instagram Graph API / TikTok
 * for Developers / YouTube Data API with a connected channel) rather than
 * scraping — that flow is intentionally not built here yet.
 */
export class RealConnector implements PlatformConnector {
  constructor(public platform: Platform) {}

  async fetchDailyViral(_dateKey: string): Promise<ViralPost[]> {
    throw new Error(
      `RealConnector.fetchDailyViral não implementado para "${this.platform}". ` +
        "Configure as credenciais e implemente a chamada real em real-connector.ts."
    );
  }

  async fetchAccountAudit(_handle: string): Promise<AccountAudit> {
    throw new Error(
      `RealConnector.fetchAccountAudit não implementado para "${this.platform}". ` +
        "Configure as credenciais e implemente a chamada real em real-connector.ts."
    );
  }
}

export const REQUIRED_ENV: Record<Platform, string[]> = {
  instagram: ["RAPIDAPI_KEY"],
  tiktok: ["RAPIDAPI_KEY"],
  youtube: ["YOUTUBE_API_KEY"],
};
