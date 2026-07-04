# Plano: Migrar Supabase externo → Lovable Cloud

## Contexto atual
- Projeto usa Supabase externo (`sbslimrugkzgnfacmlnm.supabase.co`) com URL/anon key hardcoded em `src/integrations/supabase/client.ts`.
- Schema em `supabase/schema.sql` + migrações auxiliares: tabelas `profiles`, `user_roles`, `site_config`, `contact_messages`, `games`, enum `app_role`, função `has_role`, RLS.
- Autenticação: signup/login (com admin `douglascucco` promovido via SQL).
- Domínio `notify.ayuniqa.com` já delegado ao Lovable — email `marketing@ayuniqa.com` funcionará direto após migração.
- Rota `/api/public/contact` envia via Resend hoje; passará a usar Lovable Emails.

## Etapas

### 1. Backup dos dados atuais (feito por você no Supabase externo)
Antes de qualquer coisa, exportar dados que precisam ser preservados:
- Dashboard Supabase externo → Table Editor → exportar CSV de: `profiles`, `user_roles`, `site_config`, `contact_messages`, `games`.
- Auth → Users → exportar CSV de usuários (para saber quem precisa recriar conta).

Importante: **senhas dos usuários não são exportáveis**. Usuários existentes precisarão fazer "esqueci minha senha" ou criar conta nova depois. Confirmar se isso é aceitável.

### 2. Ativar Lovable Cloud no projeto
- Rodar `supabase--enable` — provisiona novo projeto Supabase gerenciado pelo Lovable e substitui automaticamente `src/integrations/supabase/client.ts` para apontar para as novas credenciais via `import.meta.env.VITE_SUPABASE_*`.

### 3. Recriar schema no novo backend
- Converter `supabase/schema.sql` + `games-migration.sql` + `games-status-migration.sql` em uma migração Lovable Cloud e aplicar.
- **Não** aplicar `make-admin-douglascucco.sql` ainda (o `user_id` mudará — ver etapa 6).

### 4. Importar dados
- `site_config`: reinserir a linha `main` com os textos atuais.
- `games`: reimportar via SQL INSERTs a partir do CSV.
- `contact_messages`: opcional (histórico) — reimportar se quiser manter.
- `profiles` / `user_roles`: **não importar diretamente** — dependem de `auth.users` que será recriado.

### 5. Recriar usuários / promover admin
- Você recria a conta admin (`douglascucco`) via tela de signup do site já apontando para o novo backend.
- Executar SQL equivalente ao `make-admin-douglascucco.sql` no novo projeto para promover essa conta a `admin`.
- Outros usuários se cadastram novamente conforme forem acessando.

### 6. Migrar envio de emails (Resend → Lovable Emails)
- Substituir a chamada ao Resend em `src/routes/api/public/contact.ts` pelo sistema de emails do Lovable Cloud usando `marketing@ayuniqa.com` como remetente (domínio `notify.ayuniqa.com` já verificado).
- Remover a dependência da secret `RESEND_API_KEY` do código (pode ficar armazenada mas deixa de ser usada).

### 7. Validação end-to-end
- Signup/login funcionando.
- Painel admin acessível para `douglascucco`.
- CRUD de `games` e edição de `site_config` funcionando.
- Formulário de contato enviando email para o destinatário e gravando em `contact_messages`.
- Build sem erros.

### 8. Limpeza (opcional, após validar)
- Arquivar / pausar o projeto Supabase externo.
- Remover chave/URL antiga de qualquer secret.

## Riscos e pontos de atenção
- **Senhas de usuários não migram** — todos precisam redefinir senha ou recadastrar.
- **IDs de usuários mudam** — qualquer FK apontando para `auth.users` (profiles, user_roles) tem que ser recriada com os novos IDs.
- **URLs OAuth / redirects**: como não há OAuth configurado (só email/senha), sem impacto.
- **Downtime curto** entre trocar o client e reimportar dados — combinar horário.

## Perguntas antes de executar
1. Tudo bem que os usuários existentes precisem redefinir senha (ou recadastrar)?
2. Quer preservar histórico de `contact_messages` ou pode começar limpo?
3. Confirma que só o `douglascucco` precisa voltar como admin?
