## Problema

Os jogos cadastrados aparecem corretamente na home (seção "Featured games") e na aba **Games** do admin — onde já existem os botões **Edit** e **lixeira** para alterar/excluir cada jogo. Mas a rota pública **`/games`** mostra "No games match your search." mesmo com o filtro em "All".

Como home e `/games` usam exatamente o mesmo `useGames()` (Lovable Cloud, tabela `games`), o bug está no filtro/render dessa página, não nos dados.

## Causa provável

`src/routes/games.index.tsx` filtra por categoria com comparação **case/whitespace-sensitive**:

```ts
games.filter((g) =>
  (cat === "All" || g.category === cat) && ...
)
```

E a lista de chips de categoria é construída a partir da constante fixa `GAME_CATEGORIES = ["Classic", "Adventure", "Fantasy", "Fruits"]`. Se a categoria de um jogo no banco veio com case diferente, espaço extra, ou um valor fora dessa lista (ex.: "classic", "Slots", "Megaways"), o jogo:

1. Some quando o usuário clica em qualquer chip,
2. E o chip dele nunca aparece nas opções.

Hipótese secundária: o estado inicial `cat = "All"` poderia estar sendo sobrescrito por algum efeito/hidratação SSR, mas isso é menos provável — a verificação abaixo confirma.

## Plano

### 1. Confirmar a causa (diagnóstico rápido)

- Abrir `/games` via Playwright autenticado, capturar console + os valores reais de `category` que o `useGames()` retorna (via `window` debug ou snapshot).
- Comparar com `GAME_CATEGORIES`.

### 2. Corrigir `/games` para ser tolerante a dados reais

Em `src/routes/games.index.tsx`:

- **Derivar a lista de categorias dos jogos do banco** (união de `GAME_CATEGORIES` + categorias distintas presentes em `games`), em vez de usar só a constante hardcoded. Assim qualquer categoria nova cadastrada via admin aparece como chip.
- **Comparar categoria case-insensitive e com `trim()`**, para não esconder jogos por diferença de capitalização.
- **Buscar também em `tagline` e `category`** (não só `title`) para o input de busca, comportamento esperado de uma vitrine.
- Manter `cat === "All"` como default mostrando tudo.

### 3. Padronizar a entrada no admin

Em `src/components/admin/AdminPanel.tsx` (form de jogo) e/ou `src/lib/games-api.ts`:

- No `toRow()` do upsert, normalizar `category` e `volatility` com `trim()` para nunca salvar espaços extras.
- O `Select` do form já restringe à lista oficial, então cadastros novos ficam consistentes; a normalização cobre os registros antigos editados.

### 4. Reforçar a aba Games do admin (clareza, não funcionalidade)

A funcionalidade de editar/excluir já existe, mas o usuário não notou. Pequenos ajustes:

- Trocar o ícone só-lixeira por **"Excluir" + ícone** para deixar a ação explícita.
- Adicionar um cabeçalho curto acima da lista: *"Clique em **Editar** para alterar os campos ou na lixeira para remover. Mudanças vão ao ar imediatamente."*
- Mostrar `position` (ordem) no card, já que ela controla a ordem da vitrine.

### 5. Verificação

- Playwright em `/games`: confirmar que todos os jogos cadastrados aparecem com filtro "All" e que filtrar por uma categoria existente mantém os respectivos jogos visíveis.
- Confirmar no admin que Editar abre o form e Excluir remove (após confirmação) — sem regressão.

## Fora do escopo

- Não estou alterando o schema da tabela `games` nem as policies RLS — os dados já estão sendo lidos corretamente em outras telas.
- Não estou adicionando uma seção separada "Featured na home"; a home já mostra os 4 primeiros por `position`, então editar o campo **Display order** no admin controla isso.
