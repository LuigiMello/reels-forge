import type { Platform, PlatformConfig } from "./types";

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    contentLabel: "Reel",
    contentLabelPlural: "Reels",
    accountLabel: "Conta",
    colorA: "var(--ig-1)",
    colorB: "var(--ig-2)",
    href: "/instagram",
    contentHref: "/instagram/reels",
    accountHref: "/instagram/contas",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    contentLabel: "Vídeo",
    contentLabelPlural: "Vídeos",
    accountLabel: "Conta",
    colorA: "var(--tt-1)",
    colorB: "var(--tt-2)",
    href: "/tiktok",
    contentHref: "/tiktok/videos",
    accountHref: "/tiktok/contas",
  },
  youtube: {
    id: "youtube",
    name: "YouTube Shorts",
    contentLabel: "Short",
    contentLabelPlural: "Shorts",
    accountLabel: "Canal",
    colorA: "var(--yt-1)",
    colorB: "var(--yt-1)",
    href: "/youtube",
    contentHref: "/youtube/shorts",
    accountHref: "/youtube/canais",
  },
};

export const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube"];
