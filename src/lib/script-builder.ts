import { Rng } from "./prng";
import { CTA_POOL, HOOK_TEMPLATES, PRODUCTION_NOTES_POOL, SOUND_POOL } from "./mock/pools";
import type { GeneratedScript, Platform, ScriptBlock } from "./types";

export type ScriptAngle =
  | "storytime"
  | "tutorial"
  | "lista"
  | "antes-depois"
  | "bastidores"
  | "polemico";

export const SCRIPT_ANGLES: { id: ScriptAngle; label: string; description: string }[] = [
  { id: "storytime", label: "Storytime com virada", description: "Narrativa pessoal que constrói tensão até uma virada surpreendente." },
  { id: "tutorial", label: "Tutorial rápido", description: "Ensina algo aplicável em passos curtos e diretos." },
  { id: "lista", label: "Lista polêmica", description: "Formato 'X coisas que...' com uma opinião forte no meio." },
  { id: "antes-depois", label: "Antes / Depois", description: "Contraste visual ou de resultado que prova uma transformação." },
  { id: "bastidores", label: "Bastidores + revelação", description: "Mostra o processo real por trás de algo e revela o resultado." },
  { id: "polemico", label: "Opinião polêmica", description: "Declaração que divide opinião e puxa comentários." },
];

interface BlockTemplateInput {
  angle: ScriptAngle;
  niche: string;
  hook: string;
  cta: string;
  platform: Platform;
}

function buildBlocks({ angle, niche, hook, cta }: BlockTemplateInput): ScriptBlock[] {
  const hookBlock: ScriptBlock = {
    label: "Gancho",
    timeframe: "0s – 3s",
    instruction: "Entre já na ação/conflito. Sem logo, sem introdução, sem 'oi gente'.",
    onScreenText: hook,
    vo: hook,
  };

  const templates: Record<ScriptAngle, ScriptBlock[]> = {
    storytime: [
      hookBlock,
      {
        label: "Contexto",
        timeframe: "3s – 10s",
        instruction: `Situe rapidamente a cena: onde, quando, e por que isso sobre ${niche.toLowerCase()} importa pra quem assiste.`,
        onScreenText: "Deixa eu te contar o que aconteceu...",
      },
      {
        label: "Tensão",
        timeframe: "10s – 20s",
        instruction: "Aumente a aposta — o que estava em jogo, o que podia dar errado.",
      },
      {
        label: "Virada",
        timeframe: "20s – 28s",
        instruction: "Revele o desfecho inesperado em uma frase curta e direta.",
      },
      {
        label: "CTA",
        timeframe: "28s – 32s",
        instruction: "Feche com o call-to-action falado e escrito na tela.",
        onScreenText: cta,
        vo: cta,
      },
    ],
    tutorial: [
      hookBlock,
      {
        label: "Promessa",
        timeframe: "3s – 6s",
        instruction: `Declare exatamente o que a pessoa vai aprender sobre ${niche.toLowerCase()} em menos de 30s.`,
      },
      {
        label: "Passo 1",
        timeframe: "6s – 13s",
        instruction: "Mostre a ação, não apenas explique. Corte no exato momento do resultado.",
      },
      {
        label: "Passo 2",
        timeframe: "13s – 20s",
        instruction: "Adicione o detalhe que a maioria erra — é o que gera comentários.",
      },
      {
        label: "Passo 3 + resultado",
        timeframe: "20s – 26s",
        instruction: "Feche com o resultado final visível em tela.",
      },
      {
        label: "CTA",
        timeframe: "26s – 30s",
        instruction: "Convide para salvar o vídeo (conteúdo de valor salva mais que curte).",
        onScreenText: cta,
        vo: cta,
      },
    ],
    lista: [
      hookBlock,
      {
        label: "Enquadramento",
        timeframe: "3s – 6s",
        instruction: "Anuncie o número de itens e o critério (ex.: 'os 3 erros mais comuns em...').",
      },
      {
        label: "Item 1 e 2",
        timeframe: "6s – 16s",
        instruction: "Um corte de cena por item. Ritmo rápido, sem enrolação.",
      },
      {
        label: "Item polêmico",
        timeframe: "16s – 24s",
        instruction: "Guarde o item mais controverso para o meio/fim — é o que trava o scroll e gera comentário.",
      },
      {
        label: "CTA",
        timeframe: "24s – 28s",
        instruction: "Pergunte qual item a pessoa também faz — gera resposta em comentário.",
        onScreenText: cta,
        vo: cta,
      },
    ],
    "antes-depois": [
      hookBlock,
      {
        label: "Estado 'antes'",
        timeframe: "3s – 9s",
        instruction: "Mostre o ponto de partida sem filtro — quanto mais real, mais crível a transformação.",
      },
      {
        label: "Processo",
        timeframe: "9s – 18s",
        instruction: "Corte acelerado do processo, 2-3 cenas curtas mostrando o esforço.",
      },
      {
        label: "Reveal 'depois'",
        timeframe: "18s – 24s",
        instruction: "Corte seco (sem transição suave) para o resultado — o contraste é o gancho visual.",
      },
      {
        label: "CTA",
        timeframe: "24s – 28s",
        instruction: "Convide a pessoa a começar o próprio processo hoje.",
        onScreenText: cta,
        vo: cta,
      },
    ],
    bastidores: [
      hookBlock,
      {
        label: "Processo real",
        timeframe: "3s – 14s",
        instruction: "Mostre o que normalmente ninguém vê — o erro, o retrabalho, o tempo real gasto.",
      },
      {
        label: "Obstáculo",
        timeframe: "14s – 20s",
        instruction: "Inclua um contratempo genuíno — aumenta identificação e retenção.",
      },
      {
        label: "Revelação final",
        timeframe: "20s – 27s",
        instruction: "Mostre o resultado e conecte de volta com o hook inicial.",
      },
      {
        label: "CTA",
        timeframe: "27s – 30s",
        instruction: "Convide a seguir para acompanhar o próximo bastidor.",
        onScreenText: cta,
        vo: cta,
      },
    ],
    polemico: [
      hookBlock,
      {
        label: "Declaração",
        timeframe: "3s – 8s",
        instruction: `Diga a opinião polêmica sobre ${niche.toLowerCase()} sem suavizar — meio-termo não viraliza.`,
      },
      {
        label: "Argumento 1",
        timeframe: "8s – 16s",
        instruction: "Justifique com um exemplo concreto, de preferência pessoal.",
      },
      {
        label: "Contra-argumento antecipado",
        timeframe: "16s – 23s",
        instruction: "Responda à objeção óbvia antes que alguém comente — isso reduz hate e aumenta autoridade.",
      },
      {
        label: "CTA",
        timeframe: "23s – 27s",
        instruction: "Pergunte diretamente se a pessoa concorda ou discorda.",
        onScreenText: cta,
        vo: cta,
      },
    ],
  };

  return templates[angle];
}

export interface ScriptRequest {
  platform: Platform;
  niche: string;
  angle: ScriptAngle;
  tone?: string;
  keyword?: string;
}

export function buildScript(req: ScriptRequest): GeneratedScript {
  const seed = `script:${req.platform}:${req.niche}:${req.angle}:${req.keyword ?? ""}:${Date.now()}`;
  const rng = new Rng(seed);

  const hookOptions = rng
    .pickMany(HOOK_TEMPLATES, 3)
    .map((t) => t.replace("{niche}", req.niche.toLowerCase()));
  const primaryHook = hookOptions[0];
  const cta = rng.pick(CTA_POOL);
  const sound = rng.pick(SOUND_POOL);
  const angleMeta = SCRIPT_ANGLES.find((a) => a.id === req.angle)!;

  const blocks = buildBlocks({
    angle: req.angle,
    niche: req.niche,
    hook: primaryHook,
    cta,
    platform: req.platform,
  });

  const totalSec = blocks.reduce((acc, b) => {
    const match = b.timeframe.match(/–\s*(\d+)s/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);

  const hashtagBase = req.niche
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "");

  const platformTag =
    req.platform === "instagram" ? "reels" : req.platform === "tiktok" ? "tiktok" : "shorts";

  return {
    id: `${req.platform}-${req.angle}-${Date.now()}`,
    platform: req.platform,
    niche: req.niche,
    angle: angleMeta.label,
    title: `${angleMeta.label} — ${req.niche}`,
    hookOptions,
    blocks,
    caption: `${primaryHook}\n\n${cta} 👇\n\n#${hashtagBase} #${platformTag} #viral`,
    hashtags: [hashtagBase, platformTag, "viral", "fyp", req.keyword?.toLowerCase().replace(/\s+/g, "") ?? ""].filter(Boolean),
    soundSuggestion: sound,
    cta,
    estimatedDurationSec: totalSec || 30,
    productionNotes: rng.pickMany(PRODUCTION_NOTES_POOL, 4),
  };
}
