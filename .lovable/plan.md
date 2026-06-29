# Plano

## 1. Hero: vídeo em landscape mobile/tablet (<1024px)

Hoje o vídeo só aparece em `lg:` (≥1024px). Em telas menores mostramos só o fundo bege. Vamos adicionar uma terceira condição: **landscape em telas <1024px também mostra o vídeo**, com a coluna de texto reduzida para não sobrepor o vídeo (que fica à direita).

### Arquivo: `src/routes/index.tsx` (função `Hero`)

- Substituir as duas divs `block lg:hidden` / `hidden lg:block` por:
  - **Bege sólido**: visível só em portrait <1024px (`block lg:hidden portrait:block landscape:hidden lg:portrait:hidden`). Usar a variant Tailwind `portrait:`/`landscape:` (built-in v4).
  - **Vídeo**: visível em `lg:` OU em landscape <1024px (`hidden landscape:block lg:block`).
- Reduzir coluna de texto em landscape <1024px:
  - Trocar `lg:w-1/2` por `landscape:w-1/2 lg:w-1/2` no wrapper interno (linha 69) — assim em landscape estreito o texto ocupa só metade, deixando o vídeo respirar à direita.
  - Reduzir tamanho do `<h1>` em landscape estreito: adicionar `landscape:text-4xl landscape:max-lg:text-4xl` ou similar para evitar quebra horrível.
- Manter o overlay branco gradient como está (já mascara bem o lado esquerdo).

Resultado: celular em pé → fundo bege como hoje; celular deitado / tablet landscape → vídeo aparece, texto fica em coluna esquerda mais estreita.

## 2. Formulário de contato com Lovable Emails

O formulário em `src/routes/contact.tsx` já salva em `contact_messages`. Falta disparar email para `olga@ayuniqa.com` notificando cada nova mensagem.

Vamos usar **Lovable Emails** (built-in, sem precisar de Resend/API key externa).

### Pré-requisitos (automático via tools)
1. Verificar / configurar domínio de email Lovable (se ainda não estiver).
2. Rodar setup da infraestrutura de email (filas pgmq, tabelas, cron).
3. Scaffold de email transacional (cria rotas `/lovable/email/transactional/send`, `/preview`, `/email/unsubscribe`, template de exemplo).

### Template novo
- Criar `src/lib/email-templates/contact-notification.tsx`: email simples mostrando nome, empresa, email do remetente e mensagem. Destinatário fixo: `olga@ayuniqa.com`.
- Registrar em `src/lib/email-templates/registry.ts`.

### Rota pública de envio
Como o formulário de contato é **público** (visitante não logado), não dá pra chamar `/lovable/email/transactional/send` diretamente do cliente (essa rota exige JWT). Criar:

- `src/routes/api/public/contact.ts` (server route) que:
  1. Valida o body com o mesmo `contactSchema` Zod.
  2. Insere em `contact_messages` (via `supabaseAdmin`, server-side).
  3. Chama `/lovable/email/transactional/send` internamente (service-role) com `templateName: "contact-notification"`, `recipientEmail: "olga@ayuniqa.com"`, `idempotencyKey` derivado do id do registro.
  4. Retorna `{ ok: true }`.

### Atualizar o formulário
- Em `src/routes/contact.tsx`, trocar o `supabase.from("contact_messages").insert(...)` por um `fetch("/api/public/contact", { method: "POST", body: JSON.stringify(parsed.data) })`.

## Arquivos afetados

- `src/routes/index.tsx` — ajustes responsivos no Hero.
- `src/routes/contact.tsx` — submit aponta para nova rota.
- `src/routes/api/public/contact.ts` — nova rota.
- `src/lib/email-templates/contact-notification.tsx` — novo template.
- `src/lib/email-templates/registry.ts` — registrar template.
- + arquivos gerados automaticamente pelo scaffold (rotas `/lovable/email/*`, templates de exemplo).

## Detalhes técnicos

- Lovable Emails roda em fila (pgmq) + cron a cada 5s; entrega é assíncrona — usuário vê confirmação imediata no formulário, email chega segundos depois.
- Caso o domínio de email ainda não esteja configurado, vai aparecer um diálogo de setup antes — basta seguir o fluxo.
- Sem dependência de Resend, sem API key, sem secret manual.

## Fora do escopo

- Logo no admin (já implementado em turno anterior).
- Dashboard de monitoramento de emails enviados — pode ser adicionado depois se quiser.
