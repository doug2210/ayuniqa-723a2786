## Problema
O `PlayDemoButton` em `GameMedia.tsx` renderiza um `<DialogContent>` que já inclui um botão de fechar padrão (no canto superior direito). O componente também adiciona seu próprio botão `<X>` dentro do `DialogHeader`, resultando em dois botões de fechar sobrepostos no mesmo lugar.

## Solução
1. **Modificar `src/components/ui/dialog.tsx`**: Adicionar uma prop opcional `hideCloseButton` ao `DialogContent`. Quando true, o botão padrão de fechar (com o ícone X) não é renderizado.
2. **Modificar `src/components/site/GameMedia.tsx`**: No `PlayDemoButton`, passar `hideCloseButton` para o `<DialogContent>`, mantendo o botão customizado existente no `DialogHeader`.

Isso corrige o duplicado sem afetar outros usos do `Dialog` (como `GameScreenshots`), que continuam usando o botão de fechar padrão normalmente.