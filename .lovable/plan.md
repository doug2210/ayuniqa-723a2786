## Problema

Os jogos só aparecem para usuários autenticados porque a view pública `games_public` está configurada com `security_invoker=on`. Nesse modo, a view usa as permissões do usuário que consulta na tabela base `games`. Como o `anon` não tem `GRANT SELECT` na tabela `games` (apenas a policy de RLS, que sozinha não basta), a view retorna vazio para visitantes não logados — enquanto o `authenticated` tem grant e vê tudo.

## Correção

Uma única migration, sem mexer em código de frontend, filtros, layout ou cadastro:

1. `ALTER VIEW public.games_public SET (security_invoker = off)` — a view passa a rodar com as permissões do dono (postgres), então qualquer visitante que tenha `SELECT` na view (já concedido para `anon` e `authenticated`) enxerga os jogos.
2. Manter a tabela base `games` sem `GRANT SELECT` para `anon` — o público continua obrigado a passar pela view, que já sanitiza os `assets` (remove os `path` internos de storage).
3. Manter as policies de admin (`insert/update/delete`) intactas.

## Validação

- Consulta anônima em `games_public` deve retornar as 9 linhas.
- `/games` no mobile/anônimo deve mostrar os cards em vez de "No games match your search".
- Consulta anônima direta em `games` deve continuar negada.
- Rodar o linter do backend e tratar qualquer alerta gerado por essa mudança.

## Fora de escopo

- Nenhuma mudança em componentes, hooks, filtros de busca, categorias ou imagens.
- Nenhuma alteração no cadastro de jogos ou no fluxo de admin.
- A view `games_public` continua sendo a única fonte pública; `games` segue restrita.
