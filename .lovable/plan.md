## Diagnóstico

Na última rodada de segurança eu:
1. Removi a política que deixava **anon** (visitantes não logados) ler a tabela `public.games` diretamente.
2. Criei uma view `public.games_public` (com os caminhos internos de storage removidos) e apontei o código público (`fetchGames`) para essa view.

O preview do Lovable já roda a versão nova do código (usa `games_public`), então funciona. Mas o site publicado em produção (`ayuniqa.lovable.app`) ainda está rodando a versão **antiga** do código, que consulta a tabela `games` como anônimo — e essa permissão não existe mais. Resultado: a resposta vem vazia e nenhuma seção (Featured/Upcoming) renderiza no celular.

## Plano

1. Confirmar via consulta ao banco que a view `games_public` está acessível ao papel `anon` e devolve linhas (garantir que o fix funciona antes de publicar).
2. Republicar o projeto para que a versão nova do código (que consulta `games_public`) chegue ao domínio público.
3. Após publicar, validar no celular / em aba anônima que os jogos aparecem em Featured e Upcoming.

Se por algum motivo a view não estiver acessível ao anon, incluo uma pequena migração corrigindo o GRANT — mas pela migração anterior isso já deveria estar ok.

## Fora do escopo

- Reverter as mudanças de segurança (a exposição dos paths internos continua fechada).
- Alterar layout, filtros ou dados dos jogos.
