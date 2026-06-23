## O que mudar

### 1. Restaurar a logo no Header
`src/components/site/Header.tsx`:
- Remover `import { AstronautMascot }`.
- Voltar a importar a logo (`import logoAsset from "@/assets/ayuniqa-logo.png"` — usando o asset json existente).
- Substituir `<AstronautMascot ... />` por `<img src={logoAsset} alt="Ayuniqa" className="h-9 w-auto transition-transform duration-300 group-hover:scale-110" />`.

### 2. Colocar o astronauta no HeroStage (lado direito do hero)
`src/components/site/HeroStage.tsx`:
- Importar `AstronautMascot`.
- Renderizar o astronauta como elemento central da stage, **substituindo visualmente o bloco de "reels"** quando o modo for `reels` (mantendo os anéis de glow, partículas, halo pontilhado e badges flutuantes ao redor — só o quadro de reels sai).
- O astronauta fica posicionado em `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`, com largura `~62%` da stage, recebendo o mesmo efeito de parallax já calculado (`parallax.x/y`) para inclinação sutil, além da rotação do capacete seguindo o mouse (já implementada no componente).
- Modo `character` continua funcionando como override caso o admin defina uma imagem própria.

### 3. Corrigir z-index do bloco de stats (UPTIME / MARKETS / …)
Problema: no breakpoint mobile/tablet o HeroStage fica empilhado e o glow/partículas passam por cima dos números.

`src/routes/index.tsx`:
- Na `<section>` do Hero, adicionar `isolate` para criar contexto de empilhamento.
- No bloco da coluna de texto (`<div className="animate-fade-up">`) adicionar `relative z-20`.
- No container do `<HeroStage />` (`<div className="relative">`) usar `relative z-0`.
- Subir o grid dos stats de `z-10` para `z-30` e o componente `Stat` também para `z-30`, garantindo que números e labels fiquem sempre na frente do astronauta/glow.

### 4. Sem mudanças em lógica/backend
Apenas presentation. Nenhuma alteração em config providers, rotas ou APIs.

## Arquivos afetados
- `src/components/site/Header.tsx` (revert para logo)
- `src/components/site/HeroStage.tsx` (injetar `AstronautMascot`)
- `src/routes/index.tsx` (z-index dos stats e isolamento do hero)
