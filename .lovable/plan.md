## Plano

O problema não é que as thumbs estejam escondidas no mobile. A base tem 9 jogos e a view pública também tem 9, mas os privilégios públicos ficaram inconsistentes após a última correção: a view `games_public` está acessível, enquanto a tabela base `games` ficou sem grants visíveis para os papéis da API, o que pode fazer a view retornar vazio para visitantes anônimos no app publicado.

## Correção

1. Aplicar uma migration pequena para normalizar o acesso público seguro:
   - manter a política pública de leitura na tabela `games`, necessária porque a view roda como `security_invoker`;
   - conceder somente leitura da tabela `games` para visitantes anônimos, para a view conseguir ler as linhas;
   - manter escrita/admin restrita;
   - manter `games_public` como a fonte usada pelo site, sanitizando os assets.

2. Validar imediatamente depois:
   - consulta pública em `games_public` deve retornar 9 jogos;
   - página `/games` em contexto mobile/anônimo deve mostrar os cards em vez de “No games match your search”.

3. Rodar o linter do backend e corrigir qualquer alerta causado por essa migration.

## Fora de escopo

- Não vou alterar layout, filtros, categorias ou imagens.
- Não vou mexer no cadastro dos jogos.
- Não vou remover a view pública nem expor paths internos de storage no app.