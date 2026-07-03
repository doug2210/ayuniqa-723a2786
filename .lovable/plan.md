## Problema

No dashboard da Resend só aparece envio para `aleks.v@ayuniqa.com`, mesmo com `TO_ADDRESSES` contendo três endereços (`olga@`, `aleks.v@`, `marketing@`).

Isso acontece porque o código faz **uma única chamada** à Resend com `to: [olga, aleks.v, marketing]`. A Resend trata isso como **um único email com múltiplos destinatários no cabeçalho To:** — gera **um só registro de log** (e o painel às vezes mostra apenas o primeiro/último destinatário na listagem resumida). Além disso, todos os destinatários veem os endereços uns dos outros, e se o Gmail Workspace filtrar/entregar para um deles, os outros herdam o mesmo destino.

## Solução

Enviar **um email separado por destinatário interno**, em paralelo. Cada envio vira um log independente na Resend (fácil de auditar quem recebeu / bounce / delivered por pessoa), e não expõe os endereços internos entre si.

### Mudanças

Arquivo único: `src/routes/api/public/contact.ts`

1. Trocar o único `fetch` de notificação interna por um `Promise.all` que dispara um `fetch` por endereço em `TO_ADDRESSES`.
2. Cada chamada usa `to: [address]` (array de 1) e mantém `reply_to: email` (visitante), mesmo `subject`, mesmo `html`/`text`.
3. Logar `providerId`, `status` e `durationMs` **por destinatário** (`[contact] email sent to olga@… id=…`), para diagnosticar caso um falhe.
4. Se **qualquer** envio interno falhar, ainda responder `502` — mas continuar tentando os outros (não abortar no primeiro erro). O confirmation email para o visitante continua igual.
5. Nenhuma mudança no formulário, no schema, no admin inbox, ou nas variáveis de ambiente.

### Resultado esperado

Após publicar, um submit no formulário vai gerar **3 linhas** distintas no painel da Resend (uma por destinatário), cada uma com seu próprio status de entrega. Assim confirmamos se `olga@` e `marketing@` estão realmente sendo entregues ou se caem em algum filtro do Workspace.
