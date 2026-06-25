# Hero video não toca no Safari até navegar e voltar

## Causa

O `<video>` é renderizado só depois que a config do Supabase resolve (`ready=true`), porque enquanto isso renderizamos um `<div>` placeholder. No primeiro carregamento, quando o elemento finalmente entra no DOM, o `video.play()` é disparado dentro de um `useEffect` assíncrono — fora do contexto do gesto inicial do usuário. O Safari (desktop e iOS) é mais rigoroso que Chrome/Firefox quanto a autoplay e bloqueia silenciosamente nesse cenário. Ao navegar para `/games` e voltar, o componente já remonta com `ready=true` desde o primeiro render e com o histórico de interação do usuário (clique no link), então o `play()` é aceito.

Pontos secundários que pioram o caso no Safari:
- Faltam atributos críticos `webkit-playsinline` e `muted` definido como atributo HTML (não só prop) antes do primeiro `play()`.
- Sem `poster`, o elemento fica preto até a primeira frame decodificar — reforça a percepção de "não funciona".
- Em modo `loop`, o `play()` só roda quando `loadeddata` dispara; no Safari, `loadeddata` pode demorar se `preload="auto"` competir com outros recursos.

## Plano

### 1. `src/components/site/HeroScrollVideo.tsx`
- Renderizar o `<video>` **sempre**, mesmo quando `ready=false`, mas com `src` vazio e `visibility:hidden` até `ready=true`. Isso garante que o elemento exista cedo e que `play()` aconteça no mesmo elemento que estava no DOM desde o início (sem remontagem). Substitui o atual `<div>` placeholder.
- Adicionar atributos explícitos no JSX: `muted` (boolean), `playsInline`, `autoPlay` (loop), `loop`, `controls={false}`, e o atributo legado do Safari via `ref` — `video.setAttribute("webkit-playsinline", "true")` e `video.muted = true` imperativo logo no mount (Safari ignora a prop JSX em alguns casos quando `src` muda).
- No effect do modo `loop`: chamar `video.load()` quando `src` mudar, depois `tryPlay()`. Encapsular `tryPlay` para também ser chamado nos eventos `canplay` e `loadedmetadata` (não só `loadeddata`), aumentando a chance de pegar a primeira janela permitida pelo Safari.
- Adicionar fallback de gesto: se o primeiro `play()` rejeitar (Safari sem gesto), registrar listeners `pointerdown`/`touchstart`/`keydown` **uma vez** no `window` que disparam `video.play()` no próximo gesto e se removem em seguida. Isso garante que qualquer interação subsequente (scroll com toque, clique em qualquer lugar) inicie o vídeo, sem precisar navegar para outra página.
- Adicionar também um listener `visibilitychange` que rechama `tryPlay()` ao voltar para a aba (cobre o caso de tab em background).

### 2. Sem mudanças em `src/routes/index.tsx`
A prop `ready={loaded}` continua sendo passada — agora ela só controla a visibilidade do elemento, não a montagem.

## Detalhes técnicos

- Manter `autoPlay` + `muted` + `playsInline` é o contrato mínimo do Safari para autoplay; o gesto-fallback cobre o caso em que mesmo isso é negado (ex.: Low Power Mode no iOS, configurações de mídia restritivas no Safari macOS).
- `video.load()` após troca de `src` é necessário no Safari para sair do estado `NETWORK_EMPTY` quando o elemento foi renderizado antes de ter `src`.
- Não mexer no modo `scroll` além de garantir os mesmos atributos no JSX — o scroll-scrub não depende de `play()`, então já funciona no Safari hoje.

## Verificação

- `bunx tsgo --noEmit` deve passar.
- Após o fix, abrir `/` em Safari (ou via Playwright com user-agent Safari) e confirmar que o vídeo começa a tocar sem precisar navegar para outra rota.
