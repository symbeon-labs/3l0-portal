# 3L0 Portal

Superfície institucional pública do ecossistema 3L0 / Symbeon Labs.

## Conteúdo público

- `index.html` — página institucional do 3L0 Vision com jornada adaptativa de qualificação comercial.
- `api/leads.js` — endpoint serverless que valida e encaminha leads para um webhook privado.
- `ROADMAP.md` — plano de execução do produto, proteção de acesso, validação técnica e piloto comercial.
- A página descreve a proposta e o fluxo de referência sem apresentar hipóteses como capacidades validadas.

## Princípios de publicação

- Distinguir claramente capacidades implementadas, experimentos e roadmap.
- Não publicar pesquisa privada, registros operacionais internos, conteúdo do vault ou alegações de desempenho não verificadas.
- Derivar as narrativas públicas da documentação canônica do produto.
- Não divulgar integrações, precisão, economia ou prontidão de produção sem evidências.

## Roadmap

Consulte [ROADMAP.md](./ROADMAP.md) para as quatro etapas: proteger o acesso, demonstrar a ORC, construir credibilidade técnica e converter evidências em um piloto. O roadmap diferencia trabalho concluído, trabalho em andamento e gates pendentes; a existência de uma PR não significa que uma mudança esteja implantada em produção.

## Publicação e captação de leads

- O portal é publicado pela Vercel; o domínio atual é `https://3l0-portal.vercel.app/`.
- A jornada comercial adapta perguntas conforme o setor, registra papel na decisão, caso de uso, processo atual, frequência e prazo, e gera um resumo de abordagem para vendas.
- O endpoint `POST /api/leads` valida o consentimento e encaminha o perfil para `LEADS_WEBHOOK_URL` (por exemplo, um webhook privado de n8n/CRM). O endpoint não mantém uma base própria.
- **Gate de privacidade fail-closed:** além de `LEADS_WEBHOOK_URL`, a API exige `LEADS_PRIVACY_APPROVED=true`, `LEADS_CONTROLLER_NAME`, `LEADS_PRIVACY_EMAIL`, `LEADS_PRIVACY_URL` (HTTPS) e `LEADS_RETENTION_DAYS` (inteiro entre 1 e 3650). Sem todos esses valores válidos, o endpoint responde `503` e não encaminha dados. O sinal de aprovação deve ser ativado somente depois de revisão jurídica e publicação do aviso real.
- Antes de ativar a captação em produção, testar entrega e falhas; definir acesso, retenção e exclusão; documentar os operadores e a finalidade.
- Se o webhook não estiver configurado ou falhar, a interface não informa falsamente que o lead foi registrado: apresenta uma mensagem de erro.
- Não armazene segredos no frontend nem encaminhe dados pessoais para analytics público.

### Testes e limites operacionais

- Executar os testes automatizados com `node --test api/leads.test.js` antes do merge.
- O endpoint rejeita casos de uso incompatíveis com o setor e payloads acima de 16 KiB; os testes cobrem método HTTP, validação cruzada, tamanho do payload, webhook ausente e encaminhamento.
- Limitação de taxa e deduplicação com armazenamento compartilhado (por exemplo, Redis/serviço equivalente) continuam pendentes. Limites apenas em memória não são confiáveis em funções serverless com múltiplas instâncias.
- Antes da produção, completar o aviso de privacidade com controlador, canal de contato, finalidade, operadores, prazo de retenção e processo de exclusão; não inventar esses dados nem ativar captação real sem eles.
- Após configurar o webhook, testar entrega real, falha/timeout, repetição e deduplicação no destino.

A implantação da interface, isoladamente, não significa que a captação esteja operacional. Só considerar concluída após testar um envio real até o destino configurado.
