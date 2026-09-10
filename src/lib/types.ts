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
  /** Not publicly exposed by every platform's API (e.g. YouTube) — omit rather than fake a 0. */
  shares?: number;
  saves?: number;
  watchTimeAvgSec: number;
  durationSec: number;
  postedHoursAgo: number;
}

export interface DerivedMetrics {
  engagementRate: number; // (likes+comments[+shares+saves])/views
  velocityPerHour: number; // views / hours since posted
  retentionRate: number; // watchTimeAvg / duration
  viralScore: number; // composite 0-100
  /** Growth vs. the same slot yesterday — only known for the daily mock feed, not for a single real video lookup. */
  trendPct?: number;
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
  thumbHue: number; // 0-360, drives the preview gradient placeholder (fallback when no real thumbnailUrl)
  /** A real captured thumbnail — when present, the preview shows this image instead of the generated gradient. */
  thumbnailUrl?: string;
  /** True for posts pulled from a live API, not the daily mock generator. */
  isReal?: boolean;
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

/** One scored dimension with a one-sentence "why" — the vidIQ-style breakdown. */
export interface AuditCriterion {
  score: number;
  note: string;
}

/** Real, AI-written analysis — grounded in whatever public data could actually be fetched. */
export interface AiContentAudit {
  mode: "real-data" | "metadata-only" | "guidance-only";
  platform: Platform;
  url: string;
  title?: string;
  caption?: string;
  authorName?: string;
  thumbnailUrl?: string;
  hashtags?: string[];
  commentSamples?: string[];
  channelAvgViews?: number;
  realStats?: { views?: number; likes?: number; comments?: number; durationSec?: number };
  dataNote: string;
  overallScore: number;
  hookScore: number;
  pacingScore: number;
  captionScore: number;
  hashtagScore: number;
  soundScore: number;
  ctaScore: number;
  styleScore: number;
  predictedRetention: number;
  summary: string;
  criteria: {
    hook: AuditCriterion;
    pacing: AuditCriterion;
    caption: AuditCriterion;
    hashtags: AuditCriterion;
    sound: AuditCriterion;
    cta: AuditCriterion;
    style: AuditCriterion;
  };
  commentInsight?: string;
  diagnosis: string[];
  fixes: string[];
}

export interface AiAccountAudit {
  mode: "real-data" | "guidance-only";
  platform: Platform;
  handle: string;
  channelTitle?: string;
  realStats?: { subscribers?: number; totalViews?: number; videoCount?: number };
  recentUploads?: { title: string; publishedAt: string; viewCount?: number }[];
  uploadsPerWeek?: number;
  dataNote: string;
  overallScore: number;
  growthScore: number;
  consistencyScore: number;
  hookScore: number;
  formatScore: number;
  bestPostingWindow: string;
  topFormat: string;
  summary: string;
  criteria: {
    growth: AuditCriterion;
    consistency: AuditCriterion;
    hook: AuditCriterion;
    format: AuditCriterion;
  };
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

export interface ScriptBlock {
  label: string;
  timeframe: string;
  instruction: string;
  onScreenText?: string;
  vo?: string;
  shot?: string;
}

export type ScriptTone = "humor" | "serio" | "inspirador" | "sarcastico";

export interface ScriptInspiration {
  hook: string;
  handle: string;
  score: number;
}

export interface GeneratedScript {
  id: string;
  platform: Platform;
  niche: string;
  angle: string;
  tone: ScriptTone;
  title: string;
  hookOptions: string[];
  blocks: ScriptBlock[];
  caption: string;
  hashtags: string[];
  soundOptions: string[];
  cta: string;
  estimatedDurationSec: number;
  productionNotes: string[];
  predictedScore: number;
  coverSeed: number;
  inspiration?: ScriptInspiration;
}

export interface TrendExample {
  title: string;
  channel: string;
  views: number;
  category: "geral" | "música";
}

/** AI critique of the current trend landscape + the user's idea + the generated script. */
export interface AiScriptInsight {
  hasRealTrendData: boolean;
  dataNote: string;
  trendsSummary: string;
  trendingExamples: TrendExample[];
  recommendedStyle: string;
  ideaCritique: string;
  scriptCritique: string;
  hookRewrite?: string;
  score: number;
}
