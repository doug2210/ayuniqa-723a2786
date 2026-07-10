
## Diagnóstico

- No celular (aba anônima) a lista de jogos volta vazia. Confirmei fazendo a chamada direta como `anon`: `games_public` responde 200 com 0 linhas. No desktop você está logado como admin, por isso vê tudo.
- Causa: a view `public.games_public` foi criada com `security_invoker=true` (para não ser flagada como "SECURITY DEFINER view"). Nesse modo a view lê a tabela `public.games` no papel do chamador. A tabela `games` só tem política SELECT para `authenticated`, então `anon` lê 0 linhas.
- A view foi criada justamente para esconder os caminhos internos de storage no campo `assets`. Precisamos manter esse benefício ao liberar leitura pública.

## Correção (uma migration)

1. Adicionar política de SELECT em `public.games` permitindo `anon` (`USING (true)`) — necessária porque a view roda como invoker.
2. `REVOKE SELECT ON public.games FROM anon` (e revogar demais escritas que não fizerem sentido) — assim `anon` **não consegue** consultar a tabela diretamente pela Data API; só através da view `games_public`, que continua com GRANT para `anon` e projeta um `assets` já sanitizado.
3. Manter a política/grants existentes para `authenticated` e `service_role` intactas.
4. Rodar o linter do Supabase após a migration; se surgir aviso novo relacionado, tratar.

Resultado: no celular anônimo a home (Featured) e a página `/games` (Portfolio + Upcoming) voltam a listar os jogos, e os caminhos internos de storage continuam ocultos do público.

## Validação

- Rechecar `curl` como `anon` em `games_public` deve retornar as 9 linhas.
- Rechecar `curl` como `anon` em `games` deve retornar `permission denied`.
- Republicar e conferir no celular (aba anônima e depois normal) que Featured e Upcoming aparecem em `/` e `/games`.

## Fora de escopo

- Alterar layout, filtros, categorias ou lógica do site.
- Reverter as correções de segurança anteriores.
- Tocar em `security_invoker` da view.
