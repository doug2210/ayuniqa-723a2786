## Problema

O `SiteConfigProvider` inicializa com `DEFAULT_SITE_CONFIG` (que contém ícones antigos hardcoded: 💎, 7️⃣, 🎰, etc.) e só depois busca o config real do Supabase. O resultado é que, ao abrir a página, esses defaults renderizam por alguns milissegundos antes de serem substituídos pelo estado atual — o usuário vê um "flash" dos ícones antigos.

Além disso, há texto obsoleto no painel admin que diz não haver backend conectado, apesar do Supabase já estar funcionando.

## Plano

### 1. Suprimir flash dos floating icons

- **Arquivo:** `src/components/site-config/SiteConfigProvider.tsx`
  - Adicionar `loaded: boolean` no contexto, inicialmente `false`.
  - Setar `loaded = true` após a primeira resposta do Supabase (mesmo em caso de erro ou dados vazios — "já tentei, pode usar defaults").
  - Expor `loaded` no retorno de `useSiteConfig()`.

- **Arquivo:** `src/components/site/FloatingSlotItems.tsx`
  - Ler `loaded` do contexto.
  - Se `!loaded` e nenhuma prop `items` foi passada, retornar `null` — nada aparece até que o config real esteja disponível.

### 2. Remover texto obsoleto do admin

- **Arquivo:** `src/components/admin/AdminPanel.tsx` (linha ~106)
  - Remover o trecho: `"Changes save instantly to your browser. No backend yet — use export/import to share."`
  - Substituir por texto apropriado (ex.: config salvo em tempo real via Lovable Cloud / Supabase).

### Rejeitado (não incluído)

Reintroduzir cache de `localStorage` para hidratar o estado instantaneamente. Isso violaria a regra estabelecida anteriormente de que o Supabase é a única fonte da verdade, e traria de volta o bug dos ícones obsoletos.