# Animações "cassino imersivo" em todo o site

Objetivo: deixar o site da Ayuniqa lúdico, vivo e com personalidade de cassino — sem quebrar legibilidade, performance ou a identidade laranja/amarelo já existente. Aplicado em todas as páginas (Home, Games, Services, About, Contact, Client Zone, Admin) e em Header/Footer.

## Bibliotecas

- **Motion for React** (`motion`) — animações declarativas, gestos `whileHover`/`whileTap`, transições de página com `AnimatePresence`.
- **MagicUI** — componentes prontos via instalação manual (copiados para `src/components/magicui/`): `Meteors`, `Particles`, `BorderBeam`, `ShimmerButton`, `AuroraText`, `NumberTicker`, `BlurFade`, `AnimatedGridPattern`.
- Sem `prefers-reduced-motion` (por escolha do usuário) — animações sempre ativas.

## Camadas globais (uma vez, valem para todas as páginas)

1. **Fundo animado do site**
   - `AnimatedGridPattern` discreto no `__root.tsx` atrás de todo o conteúdo, com fade nas bordas.
   - Camada opcional de `Particles` douradas/laranjas com baixa densidade.
2. **Cursor com brilho** — pequeno halo radial laranja que segue o mouse (desktop apenas), implementado com `pointer-events: none`.
3. **Transições de página** — `AnimatePresence` no `__root.tsx` envolvendo o `<Outlet/>`: fade + leve slide/scale ao trocar de rota.
4. **Header**
   - Logo Ayuniqa com micro-rotação contínua + pulso de brilho ao hover.
   - Links com sublinhado animado (já existe `story-link`) + bounce no item ativo.
   - Header encolhe e ganha blur/glow ao rolar (já há scroll; reforçar com transição suave).
5. **Footer** — `BorderBeam` correndo pela borda superior; ícones sociais com `whileHover` (scale + rotate).
6. **Botões CTA** — variante `ShimmerButton` (brilho deslizando) para todos os botões com `bg-gradient-brand`. CTAs principais disparam um burst de confete (lib `canvas-confetti`) ao clicar.

## Por página

### Home (`src/routes/index.tsx`)
- **Hero**: título com `AuroraText` nas palavras-chave; subtítulo com `BlurFade` em cascata; `Meteors` sobre o hero; o `HeroStage` (anel com reels) ganha um leve tilt 3D acompanhando o scroll.
- **Stats / números**: `NumberTicker` que conta de 0 ao valor quando entra na viewport.
- **Cards de features**: hover com tilt 3D (Motion), `BorderBeam` no card em destaque, ícone faz "spin" rápido no hover.
- **Seções**: cada seção usa `ScrollReveal` com variações (fade-up, scale-in, flip-up) alternadas para ritmo visual.

### Games (`games.tsx` e `games.$slug.tsx`)
- Grid de jogos com entrada em cascata (stagger) e hover 3D nos cards + brilho na borda.
- Badges ("Hot", "New") com pulso.
- Página de detalhe: cover com efeito parallax no scroll, título com shimmer, seções reveladas em sequência.

### Services (`services.tsx`)
- Ícones de serviço animados (loop sutil — girar, pulsar, balançar).
- Linha conectando os passos do processo desenhada com `AnimatedBeam`.

### About (`about.tsx`)
- Timeline com reveals laterais alternados (esquerda/direita).
- Foto/avatar da equipe com hover scale + tilt.

### Contact (`contact.tsx`)
- Inputs com foco animado (borda gradiente que "respira").
- Botão de envio: shimmer + confete em caso de sucesso.
- Ícones de contato com bounce no hover.

### Client Zone e Admin
- Cartão central com `BorderBeam` e ícone do cadeado pulsando.
- Mesmas transições de página globais.

## Detalhes técnicos

- Adicionar deps: `motion`, `canvas-confetti` (+ tipos).
- Instalar componentes MagicUI manualmente em `src/components/magicui/` seguindo a doc oficial (cada componente é um arquivo isolado, sem dependências extras além de `motion` e `clsx`).
- Novo wrapper `src/components/site/PageTransition.tsx` para envolver `<Outlet/>` no `__root.tsx`.
- Novo `src/components/site/SiteBackground.tsx` (grid + partículas) montado uma vez no `__root.tsx`.
- Novo `src/components/site/CursorGlow.tsx` montado globalmente.
- Estender `ScrollReveal` com variantes de "bounce" e "flip" usando Motion (mantendo a API atual).
- Botão: nova variante `shimmer` em `src/components/ui/button.tsx` (sem quebrar variantes existentes).
- Todos os tokens de cor continuam vindo de `src/styles.css` (laranja/amarelo/cinza) — nada hardcoded.
- Performance: limitar densidade de partículas/meteoros, usar `will-change` apenas onde necessário, animações 100% CSS/transform (sem layout thrash).

## Fora do escopo

- Lógica de backend, dados, formulários reais — apenas camada visual.
- Mudanças de layout/estrutura das páginas — só adicionamos animação ao que já existe.
