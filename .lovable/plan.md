# Plano: Corrigir overflow horizontal em mobile

## Problema
Em telas mobile, o conteúdo do site (menu, texto, cards, grids) vaza para a direita, criando scroll horizontal indesejado em todas as páginas.

## Diagnóstico
A causa típica é algum elemento filho excedendo a largura da viewport — seja por `min-width`, `width: 100vw` com padding/margin, posicionamento absoluto, imagens não responsivas, ou grids que não quebram corretamente em breakpoints pequenos.

## Etapas

### 1. Proteção global contra overflow
Adicionar `overflow-x: hidden` no `html` e `body` via `src/styles.css`. Isso não esconde conteúdo legítimo, apenas impede que elementos excedentes criem scroll horizontal. Isso é a primeira linha de defesa e resolve 80% dos casos de vazamento.

### 2. Revisão de componentes globais
Verificar se algum dos elementos fixos/absolute está causando expansão do body:
- `SiteBackground` — `inset-y-[-10%]` pode vazar se o pai não contiver. Já tem `overflow-hidden`, mas confirmar.
- `FloatingSlotItems` — posiciona itens com `calc(...vw)` e offsets. O container é `overflow-hidden`, mas precisamos garantir que nenhum item extrapole o viewport.
- `CursorGlow` — posicionamento `fixed` não deveria expandir o body, mas verificar.
- `HeroScrollVideo` — verificar se o vídeo ou seus overlays usam dimensões que extrapolam a viewport em mobile.

### 3. Revisão de layouts de página (todas as rotas)
Verificar cada rota principal para identificar elementos responsivos quebrados:
- **`/` (index)** — Hero stats grid (`grid-cols-3`), sections com `max-w-7xl`, cards de jogos (`grid-cols-4` -> `sm:grid-cols-2` -> `lg:grid-cols-4`). Verificar se `landscape:w-1/2` no hero cria problemas em mobile landscape.
- **`/games`** — grid de jogos, filtros, detalhes.
- **`/games/$slug`** — página de detalhe do jogo, possíveis imagens grandes.
- **`/about`** — conteúdo textual e imagens.
- **`/services`** — cards e grids.
- **`/contact`** — form com `grid-cols-2` em `sm:`, mas pode ter elementos largos em < sm.
- **`/admin`** — painel admin, tabelas, grids.

### 4. Correções específicas prováveis
Baseado no código já visto, ajustes prováveis incluem:
- Hero: o gradiente overlay `max-w-[900px]` e os stats `grid-cols-3` podem não se adaptar bem em telas muito estreitas.
- Header: o mobile menu usa `max-h-96` — confirmar que não há elementos fixos largos.
- Footer: grid `lg:grid-cols-4` — em mobile vira stack automático (grid padrão), mas confirmar.
- Títulos grandes (`text-5xl`, `text-6xl`) com palavras longas podem vazar se não houver `word-break` ou `min-w-0`.

### 5. Teste
Após as correções, simular viewport mobile (375px e 390px) via Playwright e verificar se não há mais scroll horizontal em nenhuma página principal.

## Entregável
Site sem scroll horizontal em mobile, com conteúdo e menu respeitando os limites da tela em todas as páginas.