## Objetivo

Transformar a rota `/admin` (hoje apenas um placeholder) em um painel funcional que edita o conteúdo do site em tempo real, **sem backend**. Toda a configuração fica no `localStorage` do seu navegador, então é perfeito para você visualizar trocas de assets, textos e ajustes nos símbolos flutuantes antes de plugar o Lovable Cloud depois.

## Arquitetura

```text
src/
  lib/
    site-config.ts          ← tipos + defaults + load/save/reset (localStorage)
  components/
    site-config/
      SiteConfigProvider.tsx ← Context que injeta config no app + listener cross-tab
      useSiteConfig.ts       ← hook helper
    admin/
      AdminGate.tsx          ← modal de senha (sessão em localStorage)
      AdminLayout.tsx        ← shell com abas
      sections/
        FloatingItemsEditor.tsx
        HeroEditor.tsx
        GamesEditor.tsx
        BrandingEditor.tsx   ← parceiros, footer, contato
      controls/
        ImageField.tsx       ← upload local → dataURL (sem backend)
        ColorField.tsx, NumberField.tsx, ListField.tsx
  routes/
    admin.tsx                ← AdminGate + AdminLayout
```

`SiteConfigProvider` envolve o app no `__root.tsx`. Cada componente do site (`FloatingSlotItems`, `HeroStage`, `Header`, `Footer`, `games.tsx`, etc.) passa a ler o config pelo hook, com fallback nos defaults atuais — então nada quebra se a chave do localStorage estiver vazia.

## O que dá pra editar

**1. Símbolos flutuantes** (já existe estrutura; só falta a UI)
- Lista de itens: símbolo (emoji/texto), tamanho, velocidade, opacidade, hue
- Densidade global
- Botão "Adicionar item", "Remover", "Restaurar padrão"
- Preview ao vivo (o site abaixo do painel ou em nova aba reflete)

**2. Hero da home**
- Título, subtítulo, texto/links dos CTAs
- Imagem/asset do hero (upload local → dataURL)

**3. Jogos** (`/games` e `/games/$slug`)
- Lista editável: nome, slug, thumbnail (upload), descrição curta, descrição longa, tags
- Reordenar, adicionar, remover

**4. Branding / Footer / Contato**
- Logos de parceiros (upload + nome + link)
- Textos do footer, redes sociais
- E-mail/telefone/endereço de contato

**5. Utilidades globais**
- Botão **Exportar JSON** (baixa o config inteiro)
- Botão **Importar JSON** (substitui o config)
- Botão **Restaurar padrões** por seção e global
- Toast confirmando "salvo" a cada mudança (debounce 300ms)

## Proteção

- `AdminGate.tsx` mostra um modal pedindo senha antes de renderizar o painel.
- Senha lida de `import.meta.env.VITE_ADMIN_PASSWORD` com fallback `"ayuniqa"` para desenvolvimento.
- Sessão salva em `localStorage` (`ayuniqa.admin.session = true`) com botão "Sair" no header do painel.
- Deixo um aviso visível: **"Proteção apenas client-side, troque por auth real ao ativar o Lovable Cloud."**

## Persistência

- Chave única: `ayuniqa.siteConfig.v1` (JSON).
- `SiteConfigProvider` escuta `storage` event → mudanças em outra aba refletem no preview imediatamente.
- Versionamento por `version` no JSON; se subir a versão depois, faço merge com defaults para não perder dados.
- Imagens upadas viram **dataURL** dentro do mesmo JSON (limite ~5MB total no localStorage; aviso quando estiver perto).

## Detalhes técnicos

- Tipos exportados em `lib/site-config.ts` (`SiteConfig`, `FloatingItem`, `GameEntry`, `Partner`, etc.) e os defaults vêm dos valores hoje hardcoded em cada componente — copio para lá e refatoro os componentes para consumir o hook.
- `FloatingSlotItems` passa a aceitar `items`/`density` opcionais (já aceita) e, se não receber, lê do `useSiteConfig()`.
- UI usa os componentes shadcn já presentes (`Tabs`, `Card`, `Input`, `Slider`, `Button`, `Dialog`, `Switch`, `Label`).
- SSR-safe: leitura do localStorage só em `useEffect`; durante SSR usa defaults para evitar mismatch.

## Fora de escopo (fica para quando ligar o Lovable Cloud)

- Auth real, multiusuário, RLS.
- Upload de imagem para CDN/storage (por ora vira dataURL).
- Aprovações de parceiros, mensagens de contato persistentes, analytics.

## Entrega

Ao terminar: navegar para `/admin`, digitar senha, trocar um símbolo / hero / jogo e ver atualizar na home em tempo real (mesma aba ou outra aba).
