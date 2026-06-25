## Diagnóstico

A diferença que você vê é o **perfil de cor do monitor**, não cache. iMacs renderizam em Display P3 (gamut maior); Windows típico em sRGB. Quando o CSS define cor em `oklch()`, o navegador interpola dentro do gamut do display — então o mesmo valor sai com tom diferente em cada tela.

O `--background` do hero já está em hex sRGB (`#FDFBF7`), mas o resto da paleta (foreground, card, muted, border, primary, accent, brand) continua em `oklch()`, e essas cores aparecem ao redor do hero (texto, cards, bordas, botões laranja). Por isso a sensação geral de "tom diferente" persiste no Mac.

## Solução

Converter todos os tokens de cor de `oklch()` para **hex sRGB** em `src/styles.css`. sRGB é o gamut que toda tela renderiza igual — é o denominador comum entre iMac P3, Windows sRGB, celular, etc.

### Tokens a converter (mantendo o mesmo visual sRGB)

```
--brand-grey:         #494949
--brand-yellow:       #F6EB23
--brand-orange:       #F24B02
--brand-light-orange: #F5A514

--foreground:         #3B342C
--card:               #FFFFFF
--card-foreground:    #3B342C
--popover:            #FFFFFF
--popover-foreground: #3B342C
--primary-foreground: #FFFFFF
--secondary:          #F7F2EA
--secondary-foreground: #494949
--muted:              #F2EDE5
--muted-foreground:   #7A6F62
--accent-foreground:  #FFFFFF
--destructive:        #DC2626
--destructive-foreground: #FFFFFF
--border:             #E8E1D6
--input:              #E8E1D6

(tokens da sidebar e chart-* também convertidos por consistência)
```

Os brand colors `#494949`, `#F6EB23`, `#F24B02`, `#F5A514` já são as cores oficiais que estavam no comentário do arquivo — voltam exatas, sem reinterpretação por `oklch()`.

### Ajustes complementares

- Substituir `color-mix(in oklab, ...)` nas variáveis `--shadow-glow` e `--shadow-card` por `rgb(... / alpha)` direto, pelo mesmo motivo (oklab interpola em gamut maior).
- Manter `color-scheme: light` e o meta `theme-color` que já estão no lugar.

## Cache

Cache de navegador **não** está causando isso — o Vite já versiona o CSS com hash, então quando você publica, a URL muda e o navegador busca a versão nova. Sem ação necessária aí.

## Verificação

Após implementar:
- Abrir no Mac e no Windows lado a lado em modo anônimo.
- O bege do hero deve ficar idêntico, e os laranjas dos botões/brand também.
- Se ainda houver diferença sutil, é calibração de hardware do monitor — fora do alcance de código.