## Objetivo
Permitir que o admin altere a logo do site (header e footer) através do painel `/admin`, com upload de imagem persistido no Lovable Cloud.

## Como vai funcionar (para o usuário)
1. No painel admin, uma nova aba/seção **"Identidade visual"** mostrará a logo atual.
2. O admin clica em **"Trocar logo"**, escolhe uma imagem (PNG/JPG/SVG/WebP até 2 MB) e confirma.
3. A nova logo aparece imediatamente no menu (Header) e no rodapé (Footer) em todas as páginas, para todos os visitantes.
4. Se nunca foi trocada, mostra a logo padrão atual (`ayuniqa-logo.png`).
5. Botão **"Restaurar padrão"** volta para a logo original.

## Detalhes técnicos

**Backend (Lovable Cloud)**
- Bucket de Storage público `branding` para guardar arquivos de logo.
- Tabela `public.site_settings` (singleton, `id = 'default'`) com coluna `logo_url text`.
  - GRANTs: `SELECT` para `anon` e `authenticated`; `UPDATE` apenas para admins.
  - RLS: leitura pública; escrita restrita via `has_role(auth.uid(), 'admin')`.
- Migration cria registro inicial com `logo_url = null`.

**Frontend**
- Novo hook `useSiteSettings()` (TanStack Query) que lê `site_settings` via Supabase client publishable.
- `Header.tsx` e `Footer.tsx` usam `settings.logo_url ?? logoAsset.url` (fallback para asset atual).
- Nova seção no `AdminPanel.tsx`:
  - Preview da logo atual.
  - Input `<input type="file">` + botão "Enviar".
  - Upload vai para `branding/logo-{timestamp}.{ext}`, pega `publicUrl`, faz `UPDATE` em `site_settings`.
  - Botão "Restaurar padrão" seta `logo_url = null`.
  - Após salvar, invalida a query para refletir nas demais páginas.

**Validações**
- Tipo MIME permitido: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`.
- Tamanho máximo 2 MB (checado no client antes do upload).

## Arquivos afetados
- `supabase/migrations/<novo>.sql` — tabela, RLS, bucket.
- `src/hooks/useSiteSettings.ts` (novo).
- `src/components/site/Header.tsx`, `src/components/site/Footer.tsx` — usar hook com fallback.
- `src/components/admin/AdminPanel.tsx` — nova seção "Identidade visual".

## Fora do escopo
- Trocar favicon, OG image, ou logo por tema (claro/escuro).
- Histórico/versionamento de logos antigas.