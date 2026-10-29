# 3L0 Portal

Superfície institucional pública do ecossistema 3L0 / Symbeon Labs.

## Conteúdo público

- `index.html` — página institucional do 3L0 Vision com jornada adaptativa de qualificação comercial.
- `api/leads.js` — endpoint serverless que valida e encaminha leads para um webhook privado.
- A página descreve a proposta e o fluxo de referência sem apresentar hipóteses como capacidades validadas.

## Princípios de publicação

- Distinguir claramente capacidades implementadas, experimentos e roadmap.
- Não publicar pesquisa privada, registros operacionais internos, conteúdo do vault ou alegações de desempenho não verificadas.
- Derivar as narrativas públicas da documentação canônica do produto.
- Não divulgar integrações, precisão, economia ou prontidão de produção sem evidências.

## Publicação e captação de leads

- O portal é publicado pela Vercel; o domínio atual é `https://3l0-portal.vercel.app/`.
- A jornada comercial adapta perguntas conforme o setor, registra papel na decisão, caso de uso, processo atual, frequência e prazo, e gera um resumo de abordagem para vendas.
- O endpoint `POST /api/leads` valida o consentimento e encaminha o perfil para `LEADS_WEBHOOK_URL` (por exemplo, um webhook privado de n8n/CRM). O endpoint não mantém uma base própria.
- **Obrigatório antes de ativar a captação em produção:** configurar `LEADS_WEBHOOK_URL` nas Environment Variables da Vercel, apontando para um destino HTTPS controlado pela equipe; testar entrega e tratamento de falhas; publicar aviso de privacidade com URL real; definir acesso, retenção e exclusão dos dados.
- Se o webhook não estiver configurado ou falhar, a interface não informa falsamente que o lead foi registrado: apresenta uma mensagem de erro.
- Não armazene segredos no frontend nem encaminhe dados pessoais para analytics público.

### Testes e limites operacionais

- Executar os testes automatizados com `node --test api/leads.test.js` antes do merge.
- O endpoint rejeita casos de uso incompatíveis com o setor e payloads acima de 16 KiB; os testes cobrem método HTTP, validação cruzada, tamanho do payload, webhook ausente e encaminhamento.
- Ainda é necessário configurar limitação de taxa e deduplicação com armazenamento compartilhado (por exemplo, Redis/serviço equivalente). Limites apenas em memória não são confiáveis em funções serverless com múltiplas instâncias.
- Antes da produção, completar o aviso de privacidade com controlador, canal de contato, finalidade, operadores, prazo de retenção e processo de exclusão; não inventar esses dados nem ativar captação real sem eles.
- Após configurar o webhook, testar entrega real, falha/timeout, repetição e deduplicação no destino.

A implantação da interface, isoladamente, não significa que a captação esteja operacional. Só considerar concluída após testar um envio real até o destino configurado.
