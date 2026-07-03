# Diagnóstico: 200 OK ≠ Entregue

Resend retornar **200** significa apenas "aceitei o envio para processar". A entrega real acontece depois, e o Gmail (Workspace com domínio próprio) pode:
- Silenciosamente marcar como spam.
- Rejeitar após aceitar (bounce assíncrono).
- Filtrar por regra de segurança sem aparecer em nenhuma pasta.

Você **está** recebendo porque seu endereço não é `@ayuniqa.com`. O cliente (olga@ e aleks.v@) **é** `@ayuniqa.com` — e é aí que mora o problema mais provável.

---

## Causa mais provável: same-domain via terceiro (Gmail Workspace)

O envio é `noreply@ayuniqa.com` → `olga@ayuniqa.com`. Ou seja, o Gmail Workspace do cliente recebe uma mensagem que **afirma vir do próprio domínio dele**, mas foi entregue pelos servidores da Resend (externo).

Mesmo com SPF/DKIM/DMARC 100% corretos e alinhados, o Gmail Workspace aplica uma proteção anti-spoofing extra chamada **"Protect against spoofing of your domain name"**. Essa regra normalmente **quarentena ou descarta silenciosamente** mensagens externas que usam o domínio da própria organização no `From:` — sem ir para spam do usuário final, e sem bounce visível.

Isso explica exatamente o sintoma: 200 OK, log da Resend dizendo "enviado", mas nada chega — nem no inbox, nem no spam da Olga/Aleks.

---

## Plano de ação (na ordem)

### 1. Confirmar no dashboard da Resend o que aconteceu depois do 200
Antes de mexer em DNS ou código, abrir **Resend → Emails → Logs** e localizar os envios recentes para `olga@ayuniqa.com` e `aleks.v@ayuniqa.com`. Cada evento vai mostrar `delivered`, `bounced`, `deferred` ou `complained`. Isso decide o caminho:
- **`delivered`** → chegou no Gmail e o Gmail está filtrando (Causa Provável acima). Ir para passo 2.
- **`bounced` / `deferred`** → o Gmail rejeitou. A mensagem de bounce vai dizer o motivo exato (SPF fail, DMARC fail, "message rejected due to spoofing", etc.). Ir para passo 3.

### 2. Se Resend disser "delivered" — ajustar o Gmail Workspace do cliente
Pedir ao administrador do Google Workspace do ayuniqa.com para:

**(a)** Em **Admin Console → Apps → Google Workspace → Gmail → Safety → Spoofing and authentication**, revisar a regra **"Protect against spoofing of your domain names"**. Trocar a ação de *Quarantine* para *Show warning* temporariamente, para confirmar que é essa a regra bloqueando.

**(b)** Adicionar `noreply@ayuniqa.com` (ou o servidor da Resend) como remetente confiável em **Gmail → Routing → Inbound gateway** ou criar uma **address list** de remetentes aprovados e referenciar na regra anti-spoofing como exceção.

**(c)** Alternativa mais limpa e recomendada: **parar de enviar `From:` como `@ayuniqa.com`** para destinatários `@ayuniqa.com`. Ver passo 4.

### 3. Se Resend disser "bounced" — ler o bounce
O corpo do bounce indica exatamente o registro DNS que falhou. Nesse caso a checagem seria: MX aponta para Google; SPF inclui `include:_spf.resend.com` **e** `include:_spf.google.com`; DKIM da Resend publicado em `resend._domainkey`; DMARC com `p=none` ou `p=quarantine` + `sp=none` para não afetar subdomínios; alinhamento `adkim=r; aspf=r` (relaxed). Ajustar o que estiver faltando no Registro.br.

### 4. Ajuste recomendado no código (independente da causa)
Alterar o `FROM_ADDRESS` em `src/routes/api/public/contact.ts` para **um subdomínio dedicado** de envio, ex.:
```
Ayuniqa Contact <noreply@send.ayuniqa.com>
```
Verificar `send.ayuniqa.com` como um novo domínio na Resend (SPF/DKIM próprios do subdomínio). Vantagens:
- Elimina o conflito same-domain com o Gmail Workspace do cliente (o inbox continua em `ayuniqa.com`, o envio sai de `send.ayuniqa.com`).
- Reputação de envio isolada — problemas de deliverability não afetam email humano `@ayuniqa.com`.
- Padrão da indústria (é o que fazem Stripe, Linear, Notion, etc.).

O `reply_to` continua sendo o email do visitante, então a Olga responde direto para o cliente normalmente.

### 5. Registrar DMARC corretamente (se ainda não estiver)
Você disse que já tem DMARC. Confirmar no Registro.br que o TXT em `_dmarc.ayuniqa.com` está no formato:
```
v=DMARC1; p=quarantine; rua=mailto:<email-de-relatorios>; adkim=r; aspf=r; pct=100
```
`p=none` só monitora; `p=quarantine` já orienta o Gmail a proteger. Sem `rua=` você não recebe os relatórios que mostrariam esse tipo de bloqueio. Preciso do email de destino dos relatórios (pergunta que ficou sem resposta).

---

## Detalhes técnicos

- Nada no código atual está errado: o endpoint em `src/routes/api/public/contact.ts` já loga `providerId`, `durationMs`, `to`, `subject`. Esse `providerId` é o que você usa para buscar o evento no dashboard da Resend (passo 1).
- Se decidirmos migrar para `send.ayuniqa.com`, é uma edição de 1 linha (`FROM_ADDRESS`) mais a verificação DNS do subdomínio na Resend. Nenhuma outra mudança de lógica.
- O `reply_to: email` já garante que responder no Gmail vai para o remetente original — isso não muda.

---

## O que preciso de você para executar

1. Print (ou colar) do que aparece no **Resend → Logs** para os últimos envios de contato — status `delivered` / `bounced` / etc.
2. Confirmar se o cliente é admin do Google Workspace do ayuniqa.com (para o passo 2) ou se quer que a gente já parta direto para o passo 4 (subdomínio de envio).
3. Email onde ele quer receber os relatórios agregados do DMARC (`rua=`).

Com o item 1 eu já sei se é bloqueio Gmail ou bounce, e sigo direto para o passo 2 ou 3 no próximo turno.
