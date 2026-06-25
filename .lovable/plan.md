# Tornar a cor do hero consistente entre monitores e SOs

A diferença visual vem de três fontes que dá para neutralizar no código: (1) navegador "auto dark mode" repintando a página, (2) reinterpretação de `oklch()` em telas wide-gamut (P3), (3) ausência de declaração explícita de gamut/esquema de cor. O plano abaixo trava a página em **sRGB + light** e usa cores em sRGB no hero, de modo que o mesmo arquivo de cor seja enviado e renderizado igual em qualquer monitor calibrado em sRGB padrão.

> Importante: nenhuma mudança de código consegue compensar tela mal calibrada, brilho desigual, ou filtros do SO ligados (Night Shift / True Tone / Night Light). Esses precisam ficar desligados no monitor "diferente" — ainda assim, depois dessa mudança, a margem de variação cai significativamente.

## Mudanças

### 1. `src/routes/__root.tsx` — forçar light + sRGB no documento
Adicionar nas `meta` do `head()`:
- `{ name: "color-scheme", content: "light" }`
- `{ name: "supported-color-schemes", content: "light" }`
- `{ name: "theme-color", content: "#FDFBF7" }`

Isso desativa o "Auto Dark Mode for Web Contents" do Chrome/Edge e impede que o SO escureça automaticamente fundos claros.

### 2. `src/styles.css` — gamut e esquema fixos, cor de fundo em sRGB
- No topo de `:root` adicionar:
  ```css
  color-scheme: light;
  ```
- Adicionar:
  ```css
  html { color-gamut: srgb; }
  ```
- Trocar `--background: oklch(0.995 0.005 80);` por `#FDFBF7` (mesmo bege quase branco do gradiente, mas em sRGB hex — interpretado exatamente igual em qualquer navegador, sem conversão de espaço de cor).
- Remover o bloco `.dark { ... }` inteiro **ou** neutralizá-lo (não temos toggle de tema; o bloco só existe e arrisca ser aplicado se algum script externo adicionar a classe). Vou remover, é mais seguro.

### 3. `src/routes/index.tsx` — gradiente do hero já em sRGB
Manter `from-[#FDFBF7]` (já é hex sRGB). Sem mudança.

### 4. Garantir que `h.backgroundColor` no admin seja sempre um hex sRGB
O hero usa `style={{ backgroundColor: h.backgroundColor }}`. Se o valor configurado for um `oklch(...)`, volta a variar entre telas P3. Confirmar no `site-config` que o default é hex (`#...`) e, no admin, manter o color picker em hex. Sem mudança de código necessária se já é hex; só sinalizo para você não trocar por `oklch` depois.

## Detalhes técnicos

- `color-scheme: light` + meta `color-scheme` é o que **desliga** o Auto Dark do Chrome/Edge nesta página. Sem isso, a partir do Chrome 96 o navegador pode repintar fundos claros como escuros conforme preferência do usuário, mesmo o site sendo claro.
- `color-gamut: srgb` em `html` é uma dica ao navegador para evitar mapeamento P3 ampliado em telas wide-gamut; combinada com cores em hex (sRGB), elimina a maior parte da variação "bege levemente mais quente/frio".
- `oklch()` é matematicamente preciso mas o resultado **renderizado** depende do gamut do display. Trocar só o `--background` para hex já resolve o hero; o resto dos tokens (laranja da marca etc.) pode continuar em `oklch` porque saturações altas variam menos perceptivelmente que tons quase-brancos.

## O que NÃO vai mudar

- Tipografia, layout, vídeo do hero, conteúdo, gradientes da marca.
- Tokens de cor de marca (`--brand-orange`, etc.) continuam em `oklch`.

Aprovando, eu aplico as mudanças 1, 2 e remoção do `.dark`.
