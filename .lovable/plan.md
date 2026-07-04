## Respostas rápidas

**1) O formulário de contato envia para `marketing@ayuniqa.com`?**
Sim. O endpoint `/api/public/contact` envia cada mensagem para três destinatários fixos: `olga@ayuniqa.com`, `aleks.v@ayuniqa.com` e `marketing@ayuniqa.com`, usando o conector Resend (`RESEND_API_KEY` já configurado). Isso não mudou na migração.

**2) Erro `permission denied for function has_role` no inbox**
Encontrei a causa. Na migração inicial do Lovable Cloud, a função `public.has_role(uuid, app_role)` teve o `EXECUTE` revogado dos papéis `anon` e `authenticated`, deixando apenas `service_role`. Só que as políticas RLS de várias tabelas (contact_messages, site_config, games, storage.objects) chamam exatamente essa função para verificar admin. Resultado: quando o painel admin (logado) consulta o inbox, o Postgres precisa avaliar `has_role(auth.uid(), 'admin')` e nega — daí o erro.

## Correção proposta

Restaurar o `EXECUTE` de `public.has_role(uuid, app_role)` para o papel `authenticated`. Esse é o padrão recomendado do Supabase para `SECURITY DEFINER` functions usadas em RLS — ela continua segura porque só retorna `true/false` a partir da tabela `user_roles` e usa `search_path = public`. Sem essa permissão, nenhuma tela admin (inbox, configuração do site, gestão de jogos, upload de imagens) funciona.

Em uma única migração:

- `GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;`
- Manter o `REVOKE` para `anon` (visitantes não precisam checar cargo).

## Verificação

Depois de aplicar:
1. Recarregar `/admin` → aba de mensagens de contato deve listar os registros existentes sem erro.
2. Testar o formulário público `/contact` para confirmar que a inserção continua funcionando (a política de INSERT não usa `has_role`).
3. Confirmar que edição do site e upload de imagens no admin continuam OK.

## Observações

- Não mexo no formulário de contato nem no envio de e-mails; o comportamento de destinatários permanece igual.
- Nenhuma alteração no front-end é necessária.