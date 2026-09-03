export type Platform = "instagram" | "tiktok" | "youtube";

export interface PlatformConfig {
  id: Platform;
  name: string;
  contentLabel: string; // "Reel" | "Vídeo" | "Short"
  contentLabelPlural: string;
  accountLabel: string; // "Conta" | "Conta" | "Canal"
  colorA: string;
  colorB: string;
  href: string;
  contentHref: string;
  accountHref: string;
}

export interface RawMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchTimeAvgSec: number;
  durationSec: number;
  postedHoursAgo: number;
}

export interface DerivedMetrics {
  engagementRate: number; // (likes+comments+shares+saves)/views
  velocityPerHour: number; // views / hours since posted
  retentionRate: number; // watchTimeAvg / duration
  viralScore: number; // composite 0-100
}

export interface ViralPost {
  id: string;
  platform: Platform;
  niche: string;
  creator: string;
  handle: string;
  followers: number;
  caption: string;
  hook: string;
  sound: string;
  hashtags: string[];
  postedAt: string; // ISO
  raw: RawMetrics;
  derived: DerivedMetrics;
  thumbnailSeed: string;
  url: string;
  thumbHue: number; // 0-360, drives the preview gradient placeholder
}

export interface AccountAudit {
  handle: string;
  platform: Platform;
  followers: number;
  avgViews: number;
  postsPerWeek: number;
  growthScore: number;
  consistencyScore: number;
  hookScore: number;
  formatScore: number;
  overallScore: number;
  bestPostingWindow: string;
  topFormat: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

export interface ContentAudit {
  platform: Platform;
  url: string;
  hookScore: number;
  pacingScore: number;
  captionScore: number;
  hashtagScore: number;
  soundScore: number;
  ctaScore: number;
  overallScore: number;
  predictedRetention: number;
  predictedViralScore: number;
  diagnosis: string[];
  fixes: string[];
}

export interface ScriptBlock {
  label: string;
  timeframe: string;
  instruction: string;
  onScreenText?: string;
  vo?: string;
}

export interface GeneratedScript {
  id: string;
  platform: Platform;
  niche: string;
  angle: string;
  title: string;
  hookOptions: string[];
  blocks: ScriptBlock[];
  caption: string;
  hashtags: string[];
  soundSuggestion: string;
  cta: string;
  estimatedDurationSec: number;
  productionNotes: string[];
}
