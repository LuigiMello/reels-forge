import { Rng } from "./prng";
import type { ContentAudit, Platform } from "./types";

const DIAGNOSIS_POOL = [
  "O hook demora mais de 2s para apresentar o conflito ou promessa",
  "A legenda não reforça o gancho do vídeo, é só descritiva",
  "Hashtags genéricas demais, competindo com milhões de vídeos",
  "Ritmo de corte constante — sem variação para pontuar o clímax",
  "CTA ausente ou colocado tarde demais (depois dos 80% do vídeo)",
  "Áudio fora de tendência para o nicho, reduzindo alcance por som",
  "Duração acima do ideal, derruba a retenção na segunda metade",
  "Abertura sem texto na tela — perde quem assiste no mudo",
] as const;

const FIXES_POOL = [
  "Reescreva o hook para uma frase de até 6 palavras com verbo de ação",
  "Corte os primeiros 1.5s — comece direto na cena de maior impacto",
  "Adicione 2-3 hashtags de nicho específico junto das genéricas",
  "Insira um corte extra no segundo 4 e no segundo 9 para reforçar ritmo",
  "Mova o CTA para os últimos 3s e repita no texto da legenda",
  "Troque o áudio por um em alta nas últimas 48h no nicho",
  "Corte a duração para até 70% do tempo atual",
  "Adicione legenda dinâmica desde o primeiro frame",
] as const;

export function auditContentUrl(platform: Platform, url: string): ContentAudit {
  const rng = new Rng(`${platform}:content:${url.trim().toLowerCase()}`);

  const hookScore = rng.int(30, 98);
  const pacingScore = rng.int(30, 96);
  const captionScore = rng.int(30, 95);
  const hashtagScore = rng.int(30, 92);
  const soundScore = rng.int(30, 97);
  const ctaScore = rng.int(20, 95);

  const overallScore = Math.round(
    hookScore * 0.3 +
      pacingScore * 0.2 +
      captionScore * 0.15 +
      hashtagScore * 0.1 +
      soundScore * 0.1 +
      ctaScore * 0.15
  );

  const predictedRetention = Math.min(0.98, Math.max(0.1, overallScore / 100 - rng.float(-0.05, 0.05)));
  const predictedViralScore = Math.round(Math.min(100, overallScore * rng.float(0.85, 1.15)));

  return {
    platform,
    url,
    hookScore,
    pacingScore,
    captionScore,
    hashtagScore,
    soundScore,
    ctaScore,
    overallScore,
    predictedRetention,
    predictedViralScore,
    diagnosis: rng.pickMany(DIAGNOSIS_POOL, 3),
    fixes: rng.pickMany(FIXES_POOL, 3),
  };
}
