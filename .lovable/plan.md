## Objetivo

1. Mover **todos os dados dos jogos** para o banco de dados (Lovable Cloud) — nada mais em `localStorage` ou em arquivo estático.
2. Tornar **todos os campos** que aparecem na página do jogo editáveis pelo painel admin: título, tagline, categoria, descrição, RTP, Volatility, Reels, Paylines, Features, capa, trailer, demo, screenshots, assets.
3. Permitir **criar e excluir** jogos pelo admin (CRUD completo).
4. Corrigir a sensação de "rota intermediária" ao navegar para `/admin` e `/games`.
5. Garantir que **todos os textos da UI estejam em inglês** (hoje há "Textos", "Palco", etc. no admin).

---

## 1. Tabela `games` no banco

Migração nova com schema completo (campos hoje só em `games-data.ts`):

```text
games
  id            uuid PK
  slug          text unique not null
  title         text not null
  tagline       text
  category      text         -- Classic | Adventure | Fantasy | Fruits
  volatility    text         -- Low | Medium | High
  rtp           numeric(5,2)
  reels         text         -- ex: "5x4"
  paylines      int
  cover_url     text
  description   text
  features      jsonb        -- string[]
  trailer_url   text
  demo_url      text
  screenshots   jsonb        -- string[]
  assets        jsonb        -- GameAsset[] (mantém formato atual)
  position      int          -- ordem de exibição
  created_at    timestamptz default now()
  updated_at    timestamptz default now()
```

- `GRANT SELECT` para `anon` e `authenticated` (lista pública).
- `GRANT INSERT/UPDATE/DELETE` apenas via `service_role` (escritas via server function autenticada que checa `has_role(uid,'admin')`).
- RLS: SELECT público; mutações bloqueadas no client (forçando passagem por server function).
- **Seed**: migrar os 4 jogos atuais (Cosmic Fortune, Dragon Blaze, Fruit Fiesta, Pharaoh's Gold) na mesma migration. Como as capas atuais são imports de assets, a seed usará as URLs dos assets buildados (movemos esses 4 PNGs para `public/games/` para terem URL estável; `cover_url` aponta para `/games/<file>.jpg`).

## 2. Server functions

Em `src/lib/games.functions.ts` (client-safe path):

- `listGames()` — pública, lê via cliente publishable server-side, retorna array completo ordenado por `position`.
- `getGameBySlug(slug)` — pública.
- `upsertGame(input)` — `requireSupabaseAuth` + check `has_role(uid,'admin')`; carrega `supabaseAdmin` dentro do handler para gravar.
- `deleteGame(slug)` — idem, admin only.
- `reorderGames(slugs[])` — admin only, atualiza `position`.

## 3. Frontend — leitura

Substituir todo uso de `games-data.ts` + `mergedGames` + `useSiteConfig().games`:

- `src/routes/games.index.tsx`: `loader` chama `listGames()` e usa `ensureQueryData` (TanStack Query já configurado).
- `src/routes/games.$slug.tsx`: `loader` chama `getGameBySlug(params.slug)`. `notFoundComponent` quando vier `null`. Remove a fusão com `useSiteConfig`.
- `src/routes/index.tsx` (se mostra games na home): mesma `listGames` via query.
- `games-data.ts` é mantido apenas como tipos (`Game`, `GameAsset`, `categories`) ou removido em favor de `Database['public']['Tables']['games']['Row']`.
- Remove `GameOverride[]` do `SiteConfig` e a chave `games` do `site-config.ts` (e do `mergeConfig`).

## 4. Frontend — admin (CRUD)

Reescrever `GamesEditor` em `AdminPanel.tsx`:

- Tabela/lista de jogos vinda de `listGames()` (TanStack Query).
- Botão **"Add game"** abre form com slug + todos os campos.
- Cada jogo tem: editar inline, **Delete**, **Duplicate**, e drag-or-arrow para reordenar.
- Form expõe **todos os campos da página de jogo**:
  - Title, Tagline, Category (select), Volatility (select Low/Medium/High), RTP (number), Reels (text), Paylines (number)
  - Description (textarea)
  - Cover image (ImageField, faz upload para Storage)
  - Features (lista editável de strings, add/remove)
  - Trailer URL, Demo URL
  - Screenshots (lista de URLs/uploads)
  - Assets (GameAssetUploader existente)
- Cada mutação chama a server function correspondente; em sucesso invalida `['games']` no QueryClient → site e admin atualizam.

## 5. Tradução de strings PT → EN no admin

Auditar `AdminPanel.tsx` e tabs internas. Trocas conhecidas:
- `"Textos"` → `"Text"`
- `"Palco"` → `"Stage"`
- Qualquer outro texto PT remanescente vira inglês. Varrer com `rg` por acentos e palavras-chave (`ã|ç|ê|õ|Palco|Textos|Jogos|Salvar|Exportar|Importar|Redes`).

## 6. Correção do "flash" de rota intermediária

Causa provável: `PageTransition` usa `key={pathname}` e remonta o subtree inteiro com `initial opacity:0 + blur`. Combinado com loaders síncronos, a página anterior fica visível 400ms antes da nova entrar — parece uma "rota intermediária".

Mudanças:
- Trocar `PageTransition` para usar `AnimatePresence mode="wait"` com `motion.div` filho keyed por pathname, ou simplesmente reduzir para `opacity` only (sem `y` nem `blur`) com `duration: 0.2`.
- Garantir que o loader das rotas de jogos use `ensureQueryData` (já cacheado em preload `intent`) — assim a navegação é instantânea.
- Ativar `defaultPreload: "intent"` no `createRouter` para que ao hover no link já busque os dados.

Se após esses ajustes o sintoma persistir, investigamos um caso específico (logs do replay) — mas as três mudanças acima eliminam o flash em 99% dos casos.

## 7. Limpeza

- Remover `games` de `SiteConfig`, `DEFAULT_SITE_CONFIG`, `mergeConfig` e `GamesEditor` antigo dependente de `GameOverride`.
- `games-data.ts` reduzido a tipos OU removido (atualizando imports).
- `localStorage` continua sendo usado **apenas** para hero/floating/about/contact/social (que já vão para Supabase também via `site_config`). Jogos saem completamente do `site_config`.

---

## Arquivos afetados

**Novos**
- `supabase/migrations/<ts>_create_games.sql` (schema + grants + RLS + seed)
- `src/lib/games.functions.ts` (server fns CRUD)

**Editados**
- `src/lib/site-config.ts` (remove `games`/`GameOverride`)
- `src/components/site-config/SiteConfigProvider.tsx` (idem)
- `src/components/admin/AdminPanel.tsx` (novo GamesEditor + traduções PT→EN)
- `src/routes/games.index.tsx`, `src/routes/games.$slug.tsx`, `src/routes/index.tsx` (carregar do DB)
- `src/components/site/PageTransition.tsx` (transição mais sutil)
- `src/router.tsx` (`defaultPreload: "intent"`)
- `src/lib/games-data.ts` (reduzido a tipos ou removido)

## Validação

- Build limpo (TS strict).
- `/games` lista os 4 jogos seedados.
- `/games/cosmic-fortune` mostra todos os campos.
- Admin: editar título de um jogo → recarregar `/games/<slug>` em aba anônima mostra o novo título (prova de que está no DB, não no localStorage).
- Admin: criar novo jogo "Test Slot" → aparece em `/games` sem precisar limpar cache.
- Admin: deletar → some da lista.
- Navegar `/` → `/games` → `/admin` sem o efeito de "rota intermediária".
- `rg` por strings em português no `src/components/admin/` retorna vazio.
