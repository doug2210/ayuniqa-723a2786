## Problema

Uma migration anterior revogou `EXECUTE` na função `public.has_role(uuid, app_role)` dos papéis `PUBLIC`, `anon` e `authenticated`. Só que as políticas RLS de `storage.objects` (buckets `site-assets` e `game-assets`) ainda chamam `has_role(auth.uid(), 'admin')`. Sem permissão de executar a função, qualquer upload/leitura do admin explode com "permission denied for function has_role".

## Correção

Migration única restaurando o acesso mínimo necessário à função para o papel `authenticated` (o único que precisa executá-la a partir de políticas RLS):

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
```

`anon` continua sem acesso (não é admin em nenhum caso), e `service_role` já tem tudo.

## Fora de escopo

- Não mexer em outras políticas, buckets, ou views.
- Não alterar `current_user_has_role` (não é usada por políticas de storage).

<!-- deploy bump: force GitHub Actions rerun after sync -->
