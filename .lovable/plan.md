## Problema

As imagens dos jogos (capa e screenshots) foram salvas como URLs "públicas" do storage (`/storage/v1/object/public/site-assets/...`), mas o bucket `site-assets` é privado. Portanto essas URLs retornam erro para qualquer visitante — o admin só vê porque as imagens ficaram cacheadas no navegador dele.

Registros afetados: todas as linhas em `public.games` cujos campos `cover_url` e `screenshots[]` apontam para o caminho `/object/public/site-assets/...`.

## Correção

1. **Backfill no banco (uma migration única, apenas UPDATE de dados)**
   Para cada linha em `public.games`:
   - Extrair o path interno (`site/<arquivo>`) das URLs `.../object/public/site-assets/<path>`.
   - Gerar uma URL assinada de longa duração (100 anos) usando a função `storage.sign` do Postgres (ou, se não disponível, inserir na tabela `storage.objects` um token via `create_signed_url` chamado por uma função util). O padrão já usado pelo `ImageField` é `createSignedUrl(path, 100y)` — vamos replicar o mesmo formato no SQL emitindo o token JWT do storage.
   - Atualizar `cover_url` e cada entrada de `screenshots[]` com a URL assinada resultante.

   Observação: o Supabase Storage expõe `storage.get_signed_url(bucket, path, expires_in)` internamente. Se não estiver disponível no ambiente, a migration usará uma função temporária que monta o JWT com o secret do storage (via `pg_net`/vault) — se isso não for viável, faremos o backfill via um script de admin one-shot chamando `supabase.storage.createSignedUrl` a partir de um Server Function admin.

2. **Sem mudanças no frontend nem no `ImageField`** — uploads novos já geram signed URLs corretamente.

3. **Verificação**
   - `curl -I` em uma das novas URLs em modo anônimo → 200.
   - Abrir `/games` em aba anônima mobile → capas visíveis.

## Fora de escopo

- Não mexer no bucket (permanece privado, conforme política do workspace).
- Não alterar RLS, views, ou lógica de admin.
- Não alterar categorias, filtros, ou cadastro de jogos.
