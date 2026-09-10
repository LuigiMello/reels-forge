# Reels Forge

Ateliê de roteiros virais para Reels (Instagram), TikTok e YouTube Shorts.

Todos os dias, sem precisar pedir, o app "pesquisa" automaticamente o que está
viralizando nas três plataformas (views, curtidas, comentários, engajamento —
separados e combinados), permite avaliar um vídeo específico ou uma conta, e
monta roteiros completos (hook, blocos de tempo, legenda, hashtags, trilha e
CTA) prontos para gravar.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Recharts

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Avaliação de vídeo/conta com IA real

As páginas "Avaliar Reel/Vídeo/Short" e "Avaliar conta/canal" usam IA de
verdade — não são mock. Suporta três provedores (usa o primeiro que
encontrar configurado, nesta ordem):

1. **Google Gemini** (`GEMINI_API_KEY`) — gratuito, sem cartão de crédito.
2. **Groq** (`GROQ_API_KEY`) — gratuito, sem cartão de crédito, modelos Llama.
3. **Anthropic Claude** (`ANTHROPIC_API_KEY`) — pago (créditos grátis iniciais
   em contas novas).

A IA nunca finge ter assistido ao vídeo: ela só analisa o que consegue buscar
publicamente, e é transparente sobre isso na própria resposta (`dataNote` +
selo "dados reais" / "metadados públicos" / "orientação geral").

Fontes de dados reais usadas, por plataforma:

- **YouTube**: com `YOUTUBE_API_KEY`, busca estatísticas reais do vídeo
  (views/likes/comentários/duração) e do canal (inscritos, views totais,
  uploads recentes) via YouTube Data API v3 — oficial e gratuita até um
  limite generoso. Sem a chave, cai para o oEmbed público (só título/autor).
- **TikTok**: usa o oEmbed público do TikTok (título/autor/thumbnail, sem
  chave). Métricas de views/likes exigiriam uma API paga (RapidAPI/Apify),
  não incluída.
- **Instagram**: não tem oEmbed público nem API gratuita de conta — a IA
  avalia com base em boas práticas gerais e diz isso claramente.

Sem nenhuma chave de IA configurada, essas páginas caem para um exemplo de
demonstração gerado localmente (com um aviso visível de que não é uma
análise real), em vez de quebrar.

Configuração: copie `.env.example` para `.env.local` e preencha
`GEMINI_API_KEY` (gratuita — [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
e `YOUTUBE_API_KEY` (também gratuita, para dados reais do YouTube).

## Como funciona a pesquisa diária

Não há scraping real ligado ainda. Os dados são gerados por um simulador
estatístico determinístico (`src/lib/mock`): a mesma data + plataforma sempre
produz o mesmo ranking, então o app se comporta como se tivesse rodado uma
pesquisa real todos os dias, sem banco de dados.

Para conectar dados reais:

1. Preencha as chaves em `.env.example` → `.env.local` (veja sugestões de
   provedores nos comentários do arquivo).
2. Implemente as chamadas reais em `src/lib/connectors/real-connector.ts`.
3. Ligue a plataforma correspondente em `LIVE_ENABLED` dentro de
   `src/lib/connectors/registry.ts`.

Nenhuma outra parte do app precisa mudar — todas as páginas consomem os dados
através de `getConnector(platform)`.

## Estrutura

- `src/app` — rotas (home, `/pesquisa`, `/roteiro`, e `/instagram`,
  `/tiktok`, `/youtube` com subpáginas de avaliação de conteúdo e de conta).
- `src/components` — UI (layout, home, research, platform, script).
- `src/lib` — tipos, geração de dados mock, connectors, motor do builder de
  roteiro e de auditoria de conteúdo/conta.
