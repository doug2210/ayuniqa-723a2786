## Plano

### 1. Re-encodar o vídeo do hero sem faixa de áudio

`src/assets/hero-scroll-v2.mp4` é o asset usado no modo loop. Faixas de áudio (mesmo silenciosas) fazem o Safari recusar autoplay com mais frequência. Vou:

- Baixar o MP4 atual via URL do `.asset.json`.
- Rodar `ffmpeg -i input.mp4 -c:v copy -an output.mp4` (remove áudio, preserva vídeo sem re-encoding — rápido e sem perda).
- Subir o novo arquivo com `lovable-assets create` e sobrescrever `src/assets/hero-scroll-v2.mp4.asset.json` com o novo pointer.
- Deletar o asset antigo via `delete_asset` (opcional, mas mantém limpo).

Fazer o mesmo para `src/assets/hero-scroll.mp4` se também for usado em algum lugar.

### 2. Reforçar o autoplay no `HeroScrollVideo.tsx` (modo loop)

Mudanças no `useEffect` para o modo `loop`:

- **Setar `defaultMuted = true` antes do `load()`** — alguns Safari só respeitam `muted` se for o estado *default*, não atribuído depois.
- **Adicionar `IntersectionObserver`** que dispara `tryPlay()` quando o `<video>` entra no viewport. Resolve casos onde Safari adia o autoplay até o elemento ser visível.
- **Disparar `tryPlay()` também em `play`/`pause` events** caso o Safari pause sozinho.
- Manter o fallback de gesto que já existe.

### 3. Verificação

- Confirmar build OK.
- Pedir para você testar em Safari macOS/iOS (não consigo reproduzir Safari no sandbox — só Chromium via Playwright).

## Limitação

Se o iPhone estiver em **Low Power Mode**, nenhum vídeo dá autoplay — é regra do iOS. Nesse caso só um overlay "tap to play" resolve, e nem vou implementar agora.

Pronto para executar?