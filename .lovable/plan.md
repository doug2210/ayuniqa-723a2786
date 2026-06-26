# Vídeo do hero em wrapper full-bleed independente

## Diagnóstico

O `<section>` do hero em `src/routes/index.tsx` já é `w-full`, mas o vídeo está dentro de um `<div class="absolute inset-0">` que herda a largura do `<section>`. Se qualquer ancestral (preview, layout, transformações futuras) limitar a largura da section, o vídeo limita junto e aparecem barras pretas nas laterais — exatamente o sintoma do print.

A solução é desacoplar o vídeo do container de conteúdo: ele passa a se posicionar pela **viewport**, não pelo pai.

## Mudanças

**`src/routes/index.tsx` — função `Hero`:**

1. Adicionar `overflow-hidden` ao `<section>` (evita scroll horizontal causado pelo full-bleed).
2. Trocar o wrapper atual do vídeo:
   ```
   <div className="absolute inset-0 z-0 overflow-hidden">
   ```
   por um wrapper full-bleed que ignora a largura do pai usando o padrão `left-1/2 -translate-x-1/2 w-screen`:
   ```
   <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 overflow-hidden">
   ```
   Assim o vídeo sempre ocupa 100vw, independente de qualquer container que envolva a section.

3. Nenhuma mudança no conteúdo de texto (continua dentro do `max-w-7xl` com alinhamento atual).

**`HeroScrollVideo.tsx`:** sem alterações. O `sideCropPct` continua funcionando para cortar barras pretas embutidas no arquivo do vídeo (problema diferente, do próprio mp4).

## Verificação

- Playwright em viewports 1280, 1720 e 375: confirmar que o `<video>` tem `width === window.innerWidth` e `getBoundingClientRect().x === 0` em todos os casos.
- Screenshot visual: cream/vídeo encostando em ambas as bordas, sem faixa preta.
- Conferir que não aparece scroll horizontal na página (`document.documentElement.scrollWidth === window.innerWidth`).
