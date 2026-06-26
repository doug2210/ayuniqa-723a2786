## Problema

O vídeo do hero (Astronaut) tem barras pretas embutidas nas laterais do arquivo `.mp4`. A solução atual usa `transform: scale(1.8)`, que amplia o vídeo **uniformemente** — por isso ele aparece "muito zoomed/desproporcional" verticalmente, e dependendo da largura da tela ainda sobra borda à esquerda.

A forma correta é recortar **somente** o eixo horizontal, mantendo a proporção do conteúdo intacta.

## Solução

Trocar a prop `scale` por uma prop `sideCropPct` (percentual de barra preta a cortar em cada lado). O `<video>` passa a ser:

- `width: 100% / (1 - 2 * sideCropPct/100)` → o vídeo fica mais largo que o container exatamente o suficiente para empurrar as barras pretas para fora.
- `left: -sideCropPct%` → centraliza o conteúdo útil.
- `height: 100%`, `object-fit: cover` → mantém a altura preenchendo a seção, sem zoom vertical extra.
- O wrapper já tem `overflow-hidden`, então o excedente lateral (as barras) some.

Sem `transform: scale`, sem distorção: o miolo do vídeo ocupa 100% da largura da tela em qualquer breakpoint, e a altura segue o `object-cover` natural.

## Valor inicial e ajuste fino

Como cada vídeo enviado pelo admin pode ter barras de tamanhos diferentes, vou:

1. Aplicar um padrão de **18%** de corte lateral quando a URL contém `Astronaut-hero` (estimativa baseada em vídeos quadrados 624×624 desse tipo de asset; refinamos visualmente).
2. Adicionar um campo no **AdminPanel** ("Corte lateral do vídeo (%)") com slider 0–30 para o usuário ajustar ao vivo o quanto cortar de cada lado, persistido em `site-config` como `hero.scrollVideoSideCropPct`.

## Arquivos a alterar

- `src/components/site/HeroScrollVideo.tsx` — remover prop `scale`, adicionar `sideCropPct`; aplicar via `style.width` + `style.left` (com `position: absolute`) em vez de `transform: scale`.
- `src/routes/index.tsx` — passar `sideCropPct={h.scrollVideoSideCropPct ?? (URL contém Astronaut ? 18 : 0)}`.
- `src/lib/site-config.ts` — adicionar campo `scrollVideoSideCropPct: number` ao tipo/default/parser do hero.
- `src/components/admin/AdminPanel.tsx` — adicionar slider 0–30% para ajustar.

## Verificação

- Build passa.
- Playwright em 1280×1800 e 375×800: nenhuma borda preta visível à esquerda/direita, vídeo ocupa 100% da largura, altura sem zoom exagerado (proporção natural do conteúdo).
