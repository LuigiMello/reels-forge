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
