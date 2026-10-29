# 3L0 — Roadmap de produto e validação

**Status:** plano de execução; itens marcados como pendentes não representam capacidades já implementadas.  
**Princípio de publicação:** o Portal é público; código proprietário, vault, credenciais e registros operacionais internos permanecem restritos.

## Estratégia

Transformar o 3L0 em um produto defensável e comercialmente verificável: proteger os ativos essenciais, demonstrar um caso de uso de ponta a ponta, produzir evidências reproduzíveis e converter a validação em um piloto com escopo acordado.

## Etapa 1 — Proteger o acesso e os ativos

**Objetivo:** manter uma entrada pública simples sem conceder acesso operacional não autorizado ao Vision.

### 1.1 Portal público
- [x] Manter o Portal como superfície institucional pública.
- [x] Documentar o gate de privacidade para captação de leads.
- [ ] Completar o aviso de privacidade com dados reais do controlador, contato, finalidade, operadores, retenção e exclusão.
- [ ] Configurar e testar o webhook real sem expor credenciais.
- [ ] Implementar rate limiting e deduplicação com armazenamento compartilhado antes da captação comercial pública.

### 1.2 Vision com acesso controlado
- [x] Remover a oferta de cadastro público da interface na branch de segurança.
- [x] Bloquear criação autônoma de workspace pela API na branch de segurança.
- [ ] Desabilitar self-service sign-up nas configurações do Supabase de produção.
- [ ] Implementar emissão e resgate de convites no servidor, vinculados a identidade, workspace, papel e escopo de piloto/contrato.
- [ ] Implementar expiração, uso único, revogação e desligamento de acesso.
- [ ] Revisar RLS, grants e a função `create_workspace_with_org`.
- [ ] Executar testes negativos entre dois usuários e dois workspaces, inclusive acesso direto via Supabase.
- [ ] Confirmar que nenhuma chave privilegiada ou segredo aparece no frontend, repositório ou logs.

### 1.3 Critério de saída da etapa 1
Não liberar acesso operacional externo até que:
1. cadastro público esteja desabilitado no Supabase;
2. convites sejam validados no servidor e concedam apenas o papel/workspace autorizado;
3. revogação e expiração funcionem;
4. os testes de isolamento entre organizações passem;
5. a captação do Portal esteja legalmente documentada e tecnicamente testada antes de receber dados reais.

**Status geral da etapa:** em andamento. As mudanças de código em PRs são medidas parciais; não equivalem à configuração de produção nem a uma auditoria completa.

## Etapa 2 — Demonstrar a ORC

**Objetivo:** provar um fluxo útil de ponta a ponta em um caso de uso prioritário.

- [ ] Selecionar um caso de uso com problema, usuário e resultado esperados definidos.
- [ ] Executar o fluxo com dados sintéticos antes de usar dados operacionais.
- [ ] Registrar entradas, saídas, erros, exceções e intervenção humana.
- [ ] Definir critérios de sucesso antes do teste e preservar evidências reproduzíveis.
- [ ] Distinguir claramente funcionalidades implementadas, experimentos e hipóteses.

**Critério de saída:** demonstração reproduzível, limites documentados e resultados comparados com critérios predefinidos.

## Etapa 3 — Construir credibilidade técnica

**Objetivo:** fundamentar a tese da ORC sem divulgar ativos proprietários prematuramente.

- [ ] Estruturar artigo técnico-acadêmico com problema, tese, metodologia, arquitetura conceitual e experimentos.
- [ ] Incluir limitações, resultados negativos e condições de reprodução.
- [ ] Revisar propriedade intelectual e confidencialidade antes de publicar.
- [ ] Publicar apenas evidências e alegações sustentadas por resultados verificáveis.

**Critério de saída:** artefato de pesquisa revisado, com escopo público deliberado e afirmações rastreáveis a evidências.

## Etapa 4 — Converter evidência em piloto

**Objetivo:** validar valor com um parceiro e um compromisso operacional concreto.

- [ ] Identificar parceiro com problema e processo relevantes.
- [ ] Definir escopo, responsáveis, dados permitidos, prazo e critérios de sucesso.
- [ ] Formalizar obrigações, privacidade, propriedade intelectual e condições de encerramento.
- [ ] Conceder acesso apenas ao workspace, papel e dados necessários.
- [ ] Medir resultados e documentar falhas antes de ampliar o piloto.

**Critério de saída:** piloto executado ou compromisso verificável, com resultados documentados e decisão explícita de continuar, ajustar ou encerrar.

## Regras de execução e comunicação

- Distinguir sempre: **proposto**, **implementado**, **testado** e **validado em ambiente real**.
- Teste sintético não é resultado de produção; demonstração não é prova de prontidão comercial.
- Não inventar identidade jurídica, consentimentos, métricas, clientes, integrações ou resultados.
- Não colocar segredos, chaves, dados pessoais ou conteúdo interno do vault em materiais públicos.
- Preferir o menor escopo que prove valor; evitar expandir a arquitetura sem evidência de necessidade.

## Próxima ação

Concluir a etapa 1 pela revisão das PRs de segurança, implementação do fluxo de convites e testes de isolamento. Validar as configurações do Supabase e da Vercel com acesso autorizado, sem registrar segredos no repositório. Em seguida, selecionar o primeiro caso de uso demonstrável para a etapa 2.
