import { Rng } from "../prng";
import type {
  AccountAudit,
  DerivedMetrics,
  Platform,
  RawMetrics,
  ViralPost,
} from "../types";
import {
  CTA_POOL,
  FIRST_NAMES,
  HANDLE_SUFFIXES,
  HOOK_TEMPLATES,
  NICHES,
  SOUND_POOL,
} from "./pools";

function deriveMetrics(raw: RawMetrics): DerivedMetrics {
  const interactions = raw.likes + raw.comments + raw.shares + raw.saves;
  const engagementRate = raw.views > 0 ? interactions / raw.views : 0;
  const velocityPerHour = raw.views / Math.max(raw.postedHoursAgo, 0.5);
  const retentionRate = Math.min(raw.watchTimeAvgSec / raw.durationSec, 1);

  // Composite viral score: weighted blend of engagement, retention and
  // growth velocity, normalized against rough platform benchmarks.
  const engagementScore = Math.min(engagementRate / 0.12, 1) * 40;
  const retentionScore = retentionRate * 35;
  const velocityScore = Math.min(velocityPerHour / 250000, 1) * 25;
  const viralScore = Math.round(engagementScore + retentionScore + velocityScore);

  return { engagementRate, velocityPerHour, retentionRate, viralScore };
}

function buildRawMetrics(rng: Rng, platform: Platform): RawMetrics {
  const baseViews =
    platform === "tiktok"
      ? rng.float(400_000, 18_000_000)
      : platform === "instagram"
      ? rng.float(250_000, 12_000_000)
      : rng.float(300_000, 9_000_000);

  const engagementBias = rng.float(0.02, 0.14);
  const likes = baseViews * engagementBias * rng.float(0.75, 1);
  const comments = likes * rng.float(0.02, 0.09);
  const shares = likes * rng.float(0.05, 0.22);
  const saves = likes * rng.float(0.08, 0.3);

  const durationSec =
    platform === "youtube" ? rng.int(15, 60) : rng.int(7, 45);
  const watchTimeAvgSec = durationSec * rng.float(0.45, 0.97);
  const postedHoursAgo = rng.float(1, 30);

  return {
    views: Math.round(baseViews),
    likes: Math.round(likes),
    comments: Math.round(comments),
    shares: Math.round(shares),
    saves: Math.round(saves),
    watchTimeAvgSec,
    durationSec,
    postedHoursAgo,
  };
}

function buildHandle(rng: Rng, name: string): string {
  const suffix = rng.pick(HANDLE_SUFFIXES);
  const num = rng.bool(0.3) ? rng.int(1, 99) : "";
  return `@${name.toLowerCase()}.${suffix}${num}`;
}

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function buildShortCode(rng: Rng, length = 11): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_CHARS[rng.int(0, CODE_CHARS.length - 1)];
  return out;
}

function buildUrl(rng: Rng, platform: Platform, handle: string): string {
  const bareHandle = handle.replace(/^@/, "");
  if (platform === "instagram") return `https://www.instagram.com/reel/${buildShortCode(rng)}/`;
  if (platform === "tiktok") return `https://www.tiktok.com/@${bareHandle}/video/7${rng.int(100000000000000000, 399999999999999999)}`;
  return `https://www.youtube.com/shorts/${buildShortCode(rng)}`;
}

function buildOnePost(rng: Rng, platform: Platform, index: number, dateKey: string): ViralPost {
  const niche = rng.pick(NICHES);
  const name = rng.pick(FIRST_NAMES);
  const handle = buildHandle(rng, name);
  const hookTemplate = rng.pick(HOOK_TEMPLATES);
  const hook = hookTemplate.replace("{niche}", niche.toLowerCase());
  const cta = rng.pick(CTA_POOL);
  const sound = rng.pick(SOUND_POOL);
  const followers = Math.round(rng.float(8_000, 4_500_000));
  const raw = buildRawMetrics(rng, platform);
  const derived = deriveMetrics(raw);

  const hashtagBase = niche
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "");

  return {
    id: `${platform}-${dateKey}-${index}`,
    platform,
    niche,
    creator: name,
    handle,
    followers,
    hook,
    caption: `${hook} ${cta} #${hashtagBase}`,
    sound,
    hashtags: [hashtagBase, "fyp", "viral", platform === "instagram" ? "reels" : platform === "tiktok" ? "tiktok" : "shorts"],
    postedAt: new Date(Date.now() - raw.postedHoursAgo * 3600_000).toISOString(),
    raw,
    derived,
    thumbnailSeed: `${platform}-${index}-${dateKey}`,
    url: buildUrl(rng, platform, handle),
    thumbHue: rng.int(0, 359),
  };
}

const COUNT_PER_PLATFORM = 12;

/**
 * Deterministic "daily research" — same date + platform always yields the
 * same ranked set, so the feed reads as a stable daily snapshot rather than
 * random noise on every reload. Swap this for a real connector call
 * (see src/lib/connectors) once API credentials are configured.
 */
export function generateDailyViral(platform: Platform, dateKey: string): ViralPost[] {
  const rng = new Rng(`${platform}:${dateKey}:viral`);
  const posts = Array.from({ length: COUNT_PER_PLATFORM }, (_, i) =>
    buildOnePost(rng, platform, i, dateKey)
  );
  return posts.sort((a, b) => b.derived.viralScore - a.derived.viralScore);
}

export function generateAllDailyViral(dateKey: string): Record<Platform, ViralPost[]> {
  return {
    instagram: generateDailyViral("instagram", dateKey),
    tiktok: generateDailyViral("tiktok", dateKey),
    youtube: generateDailyViral("youtube", dateKey),
  };
}

const STRENGTH_POOL = [
  "Hook consistente nos primeiros 2 segundos",
  "Ritmo de corte acima da média do nicho",
  "Boa taxa de salvamento — conteúdo de valor percebido",
  "Presença de voz autêntica e reconhecível",
  "Uso recorrente de ganchos de curiosidade",
  "Thumbnails/capas com contraste alto",
] as const;

const RISK_POOL = [
  "Frequência de postagem irregular reduz o alcance orgânico",
  "Primeiros 3s ainda dependem de texto de abertura, não de ação",
  "Baixa variação de formato — risco de fadiga de audiência",
  "CTA fraco ou ausente na maioria dos vídeos recentes",
  "Duração acima do ideal para o nicho, prejudicando retenção",
] as const;

const RECOMMENDATION_POOL = [
  "Teste 3 hooks diferentes para o mesmo conteúdo antes de escalar produção",
  "Concentre publicações no horário de pico identificado abaixo",
  "Adicione legenda dinâmica para reter quem assiste sem som",
  "Recicle os 3 formatos de maior viralização em uma série fixa",
  "Feche com loop visual para aumentar replays",
  "Padronize a primeira palavra do hook com um verbo de ação",
] as const;

const WINDOWS = [
  "Ter/Qui, 18h–20h",
  "Seg/Qua/Sex, 12h–13h",
  "Todos os dias, 19h30–21h",
  "Fim de semana, 10h–12h",
  "Seg/Ter, 7h–8h30",
] as const;

const TOP_FORMATS = [
  "Storytime com virada no final",
  "Tutorial rápido em 3 passos",
  "Lista polêmica ('X coisas que...')",
  "Antes/depois",
  "Bastidores + revelação",
  "Reação a comentário/duet",
] as const;

export function generateAccountAudit(platform: Platform, handleInput: string): AccountAudit {
  const cleanHandle = handleInput.trim().replace(/^@/, "") || "sua.conta";
  const rng = new Rng(`${platform}:account:${cleanHandle.toLowerCase()}`);

  const followers = Math.round(rng.float(3_000, 3_800_000));
  const avgViews = Math.round(followers * rng.float(0.3, 4.2));
  const postsPerWeek = rng.int(2, 12);

  const growthScore = rng.int(35, 96);
  const consistencyScore = rng.int(30, 95);
  const hookScore = rng.int(40, 98);
  const formatScore = rng.int(35, 95);
  const overallScore = Math.round(
    growthScore * 0.3 + consistencyScore * 0.2 + hookScore * 0.3 + formatScore * 0.2
  );

  return {
    handle: `@${cleanHandle}`,
    platform,
    followers,
    avgViews,
    postsPerWeek,
    growthScore,
    consistencyScore,
    hookScore,
    formatScore,
    overallScore,
    bestPostingWindow: rng.pick(WINDOWS),
    topFormat: rng.pick(TOP_FORMATS),
    strengths: rng.pickMany(STRENGTH_POOL, 3),
    risks: rng.pickMany(RISK_POOL, 2),
    recommendations: rng.pickMany(RECOMMENDATION_POOL, 3),
  };
}
