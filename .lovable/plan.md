## Problema
O `vite.config.ts` está com `base: "/ayuniqa/"` fixo. Isso é necessário para o GitHub Pages (que serve em `doug2210.github.io/ayuniqa/`), mas quebra:
- o **preview do Lovable** (`id-preview--*.lovable.app`)
- o **site publicado** (`ayuniqa.lovable.app`)

Ambos servem na raiz `/`, mas o build com `base=/ayuniqa/` gera HTML apontando para `/ayuniqa/assets/styles-xxx.css`, que não existe nesses domínios → CSS 404 → página sem estilo (exatamente o que aparece no print).

## Solução
Tornar o `base` **condicional via variável de ambiente**, só ativando o prefixo `/ayuniqa/` quando o workflow do GitHub Pages estiver buildando.

### Mudança 1 — `vite.config.ts`
```ts
const base = process.env.GITHUB_PAGES === "true" ? "/ayuniqa/" : "/";

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  nitro: { preset: "static" },
  vite: { base },
});
```

### Mudança 2 — `.github/workflows/deploy.yml`
Adicionar `GITHUB_PAGES: "true"` no `env:` do step de build:
```yaml
- name: Build
  run: bun run build
  env:
    GITHUB_PAGES: "true"
    VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
    VITE_SUPABASE_PUBLISHABLE_KEY: ${{ vars.VITE_SUPABASE_PUBLISHABLE_KEY }}
```

## Resultado
- **Preview Lovable** e **ayuniqa.lovable.app**: voltam a funcionar normalmente (base = `/`).
- **GitHub Pages** (`doug2210.github.io/ayuniqa/`): continua funcionando, porque o workflow seta a env var antes do build.

## Arquivos afetados
- `vite.config.ts`
- `.github/workflows/deploy.yml`

## Fora do escopo
- Nenhuma mudança em código de UI, rotas ou backend.