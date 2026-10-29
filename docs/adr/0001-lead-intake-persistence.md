# ADR-0001 — Persistência e integridade da captação de leads

- **Status:** decisão adotada para a etapa atual; implementação de persistência adicional adiada.
- **Data:** 2026-10-29
- **Escopo:** 3L0 Portal, `POST /api/leads`.

## Contexto

O endpoint atual valida o formulário e encaminha o perfil comercial para um webhook privado configurado por `LEADS_WEBHOOK_URL`. Um exemplo proposto de implementação introduz uma tabela PostgreSQL/Drizzle com e-mail, setor, respostas e um hash SHA-256 do payload. O repositório não demonstra, por si só, que esse banco, suas migrações, permissões, política de retenção e processo de exclusão estejam configurados para produção.

Introduzir uma segunda fonte persistente sem esses elementos cria risco de divergência, duplicação de dados pessoais e comportamento ambíguo em caso de falha entre banco e webhook.

## Decisão

1. **Manter o fluxo comercial atual como mecanismo principal de encaminhamento.** Não substituir o contrato de `api/leads.js` nem alterar o formato de payload sem mapear os consumidores do webhook e testar compatibilidade.
2. **Não adicionar agora a tabela `lead_submissions` nem persistir respostas pessoais num banco novo.** A ideia de persistência adicional fica condicionada a uma decisão de infraestrutura, finalidade e governança de dados.
3. **Manter o gate de privacidade fail-closed.** Não habilitar a captação real até que o aviso de privacidade use dados verdadeiros, a finalidade e os operadores estejam documentados e o webhook tenha sido testado em ambiente autorizado.
4. **Tratar hash como evidência de integridade limitada, não como atestação completa.** Um SHA-256 do conteúdo pode permitir comparar bytes/canonicalização, mas não prova autoria, horário confiável, imutabilidade nem que o registro não foi substituído. Não devolver hash determinístico do conteúdo pessoal como identificador público.
5. **Se persistência vier a ser aprovada**, projetar primeiro uma migração explícita, acesso mínimo por papel, RLS quando aplicável, retenção e exclusão automatizáveis, proteção contra abuso, chave de idempotência e um padrão confiável de entrega. Se banco e webhook precisarem ser consistentes, preferir outbox transacional e entrega assíncrona com retries/idempotência a duas escritas independentes no handler.
6. **Não registrar dados pessoais em logs, telemetria ou erros.** Capturar apenas metadados operacionais minimizados e identificadores aleatórios que não codifiquem o conteúdo do formulário.

## Consequências

- O webhook existente continua sendo o destino operacional atual; o endpoint responde sucesso apenas quando o destino confirma a entrega.
- Ainda não há garantia de entrega durável em caso de falha/timeout depois de o destino receber o evento. Isso deve ser resolvido antes de prometer processamento confiável, por meio de contrato de idempotência no destino ou de uma fila/outbox aprovada.
- Rate limiting e deduplicação com armazenamento compartilhado continuam requisitos antes da captação comercial pública; não simular proteção distribuída com memória local de funções serverless.
- A aprovação desta decisão documental não configura Vercel/Supabase, não valida juridicamente o aviso e não constitui teste de segurança.

## Critérios para reconsiderar

Reabrir esta decisão somente quando houver: (a) finalidade e base legal/consentimento revisados; (b) controlador, canal, retenção e processo de exclusão definidos; (c) banco e ambiente identificados; (d) migrações, permissões e testes de acesso revisados; (e) política de idempotência, falhas, retries e exclusão definida; e (f) plano de migração compatível com o consumidor atual do webhook.
