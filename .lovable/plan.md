## Situação atual

O domínio `notify.ayuniqa.com` já está verificado e a infraestrutura de emails do Lovable (filas, cron, tabelas) já foi provisionada — as funções `enqueue_email`, `email_send_state`, etc. existem no banco.

Porém o endpoint do formulário de contato (`src/routes/api/public/contact.ts`) ainda envia direto pelo **connector do Resend** (`connector-gateway.lovable.dev/resend`), usando `RESEND_API_KEY` e `FROM = marketing@ayuniqa.com`. Por isso os emails continuam saindo pelo Resend — o código nunca foi migrado.

## O que este plano faz

1. **Provisionar templates de app emails do Lovable** (chamando `scaffold_transactional_email`). Isso cria as rotas `/lovable/email/transactional/send`, `/lovable/email/transactional/preview`, `/email/unsubscribe`, `/lovable/email/suppression`, e um `src/lib/email-templates/registry.ts` com o padrão React Email.

2. **Criar dois templates React Email** em `src/lib/email-templates/`, com a identidade visual do site (fontes, cores lidas de `src/styles.css`):
   - `contact-notification.tsx` — notificação interna enviada para `olga@`, `aleks.v@` e `marketing@ayuniqa.com` (o email que hoje é enviado pelo Resend com o corpo "New contact message").
   - `contact-confirmation.tsx` — confirmação em inglês enviada para quem preencheu o formulário ("Thanks for reaching out…").
   - Ambos registrados em `src/lib/email-templates/registry.ts`.

3. **Reescrever `src/routes/api/public/contact.ts`** para:
   - Remover completamente o uso do connector do Resend (sem `RESEND_API_KEY`, sem `GATEWAY_URL`, sem `fetch` para `/resend/emails`).
   - Após validar o formulário e disparar o webhook do n8n (que continua igual), enfileirar os emails via `supabase.rpc('enqueue_email', { queue_name: 'transactional_emails', payload: { … } })` usando o cliente admin do Supabase.
   - Um payload por destinatário interno + um payload para o remetente com o template de confirmação, cada um com um `idempotency_key` único derivado de `email + timestamp` para evitar duplicidade em retries.
   - Endereço remetente passa a ser `Ayuniqa <notify@notify.ayuniqa.com>` (subdomínio verificado do Lovable Emails). `reply_to` continua sendo `marketing@ayuniqa.com` nas notificações internas e o email do usuário na confirmação.

4. **Não mexer** em rotas de auth email, no `n8n` webhook, no fluxo do formulário no frontend, nem nas policies/tabelas de infra de email.

## Detalhes técnicos

- `scaffold_transactional_email` só é chamado uma vez; ele não sobrescreve templates já existentes. Depois basta editar os arquivos `.tsx` gerados.
- O `enqueue_email` é `SECURITY DEFINER` e já está com `EXECUTE` revogado de `anon/authenticated`, então precisa ser chamado pelo `supabaseAdmin` dentro do handler (que já é a prática usada em outras rotas do projeto). O import continua `await import("@/integrations/supabase/client.server")` dentro do `POST`.
- O `RESEND_API_KEY` (gerenciado pelo connector) e o connector em si podem permanecer no projeto — apenas deixam de ser usados. Se você quiser removê-los depois via Connectors, é uma etapa separada.
- Como a fila é processada por cron a cada 5 s, a resposta HTTP para o formulário continua rápida — não esperamos o envio real, apenas o enqueue.

## Fora do escopo

- Templates de auth email (signup, recovery, etc.) — não foram tocados nesta rodada e continuam como estão.
- Remover a conexão do Resend do workspace.
- Qualquer mudança de UI no formulário `/contact`.
