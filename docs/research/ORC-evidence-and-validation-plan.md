# ORC — evidências externas e plano de validação do 3L0

**Status:** plano de pesquisa e experimento proposto; não representa teste executado nem desempenho comprovado do 3L0.  
**Data de consolidação:** 29 de outubro de 2026.  
**Objetivo:** fundamentar o problema com fontes externas confiáveis e converter a tese em um experimento falsificável, reproduzível e útil para decisão de produto.

## 1. Tese a investigar

Processos operacionais frequentemente dependem de informação distribuída entre documentos, imagens, códigos e sistemas. Extrair texto é apenas uma parte do problema: para apoiar uma ação, o sistema precisa relacionar os dados ao contexto, verificar critérios, identificar contradições e encaminhar casos incertos para revisão.

**Hipótese central (ainda não validada):** uma camada de resolução operacional que combine extração, critérios determinísticos, evidências de origem e tratamento explícito de incerteza pode tornar a conferência de recebimento mais auditável e reduzir esforço manual sem ocultar falhas de extração.

A hipótese será refutada ou revista se o fluxo não melhorar os resultados frente ao processo-base, se aumentar falsos positivos, se perder a ligação com as fontes ou se exigir tanta correção humana que o benefício operacional desapareça.

## 2. Evidências externas — o que sustentam e o que não sustentam

### 2.1 A adoção de tecnologia está crescendo, mas não prova demanda pelo 3L0

- A PINTEC Semestral 2024 do IBGE informa que 41,9% das empresas industriais brasileiras investigadas com 100 ou mais pessoas ocupadas utilizaram IA em 2024, contra 16,9% em 2022. A amostra de referência abrange 10.167 empresas industriais com esse porte. Fonte: [Agência Gov, com dados do IBGE (24 set. 2025)](https://agenciagov.ebc.com.br/noticias/202509/de-2022-a-2024-percentual-de-empresas-industriais-utilizando-inteligencia-artificial-subiu-de-16-9-para-41-9).
- Na TIC Empresas 2024, o Cetic.br/NIC.br estimou que 13% das empresas brasileiras pesquisadas usavam IA; a taxa variou por porte e setor. Fonte: [Cetic.br — indicador H9](https://cetic.br/pt/tics/pesquisa/2024/empresas/H9/expandido/).

**Interpretação:** existe uma mudança relevante no contexto de digitalização, mas os números usam populações e metodologias distintas. Não devem ser combinados como uma única série nem apresentados como prova de mercado endereçável, disposição a pagar ou necessidade específica do 3L0.

### 2.2 Extração de documentos é sensível à variedade dos formatos

- O artigo aberto *Document Information Extraction: An Analysis of Invoice Anatomy* (2024) compara modelos em faturas geradas com nove templates e mostra que resultados podem cair quando o modelo encontra layouts não vistos no treino; a diversidade estrutural dos exemplos influencia a generalização. [Artigo e DOI](https://doi.org/10.1155/2024/7599415).
- O artigo *DocExtractNet* (Information Processing & Management, 2025) investiga extração de informação em documentos empresariais e destaca desafios de documentos complexos e multimodais. [Artigo e DOI](https://doi.org/10.1016/j.ipm.2024.104046).

**Interpretação:** estes trabalhos sustentam a necessidade de testar diversidade de formatos e avaliar campos individualmente. Não demonstram que o 3L0 já resolva esse problema.

### 2.3 A avaliação deve incluir robustez, limites e supervisão humana

- O NIST AI Risk Management Framework 1.0 recomenda documentar conjuntos de teste, métricas, ferramentas, condições de avaliação, limitações de generalização e monitoramento. Também recomenda considerar intervenção humana quando o sistema não consegue detectar ou corrigir erros. [NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf).
- O NIST Measure Playbook recomenda rastrear erros, ações de revisão e override humano, além de testar condições diferentes das esperadas. [NIST — Measure](https://airc.nist.gov/airmf-resources/playbook/measure/).

**Interpretação:** evidência externa orienta o método de validação. Não substitui a medição do comportamento do produto em seu contexto de uso.

## 3. Primeiro experimento: conferência de recebimento

### Pergunta experimental

Em um conjunto controlado de recebimentos, o fluxo 3L0 consegue identificar divergências documentais e encaminhar casos incertos com rastreabilidade melhor que uma extração simples, sem elevar indevidamente os falsos alertas?

### Escopo mínimo proposto

Construir um benchmark inicial de **40 casos sintéticos rotulados**, sem dados pessoais nem documentos de clientes:

| Estrato | Casos | O que testar |
|---|---:|---|
| Correspondência consistente | 10 | Campos coerentes entre documento, código e registro de referência |
| Divergência explícita | 10 | Quantidade, identificador, valor ou descrição incompatível |
| Evidência degradada | 10 | Imagem ruim, campo truncado, OCR ambíguo ou layout variante |
| Evidência incompleta/conflitante | 10 | Campo ausente, fonte contraditória ou informação insuficiente |

O benchmark é uma proposta inicial para descobrir falhas, não uma amostra estatisticamente representativa de operações reais. Se o sistema falhar em categorias importantes, ampliar e estratificar o conjunto antes de qualquer alegação de prontidão.

### Comparadores

1. **Baseline A — leitura/extração:** campos extraídos sem a camada de resolução contextual.
2. **Baseline B — regras determinísticas:** comparação dos campos disponíveis com critérios explícitos.
3. **Candidato C — fluxo 3L0:** extração disponível + estruturação + critérios + resolução de divergências + estado de saída + referências às evidências.

Se algum baseline não estiver implementado, registrar como não disponível em vez de simular que foi executado.

### Rótulos de referência

Cada caso precisa de um registro de verdade de referência revisado antes da execução: campos corretos, fontes que os sustentam, regra aplicável, divergência esperada e resultado esperado. Manter o conjunto de referência separado dos resultados produzidos pelo sistema.

### Métricas obrigatórias

- **Exatidão por campo:** campos corretamente extraídos / campos avaliados.
- **Precisão e recall de divergências:** medir falsos alertas e divergências perdidas.
- **Taxa de abstenção/encaminhamento:** casos enviados para revisão por insuficiência ou conflito.
- **Taxa de resolução incorreta:** casos incorretamente classificados como consistentes ou liberados.
- **Intervenção humana:** número e tipo de correções por caso.
- **Tempo de processamento:** mediana e percentil 95, separando tempo automático e tempo humano.
- **Rastreabilidade:** proporção de resultados que apontam para a fonte e para a regra que os justificam.
- **Robustez por estrato:** resultados separados para formatos limpos, divergentes, degradados e incompletos.

Não agregar tudo em uma única pontuação que esconda erros perigosos. Uma taxa alta de extração não compensa uma divergência crítica liberada sem alerta.

### Critérios de sucesso a definir antes de rodar

Antes do primeiro teste, o responsável pelo experimento deve congelar:
1. quais campos são críticos;
2. quais erros são considerados graves;
3. a tolerância para falsos negativos e falsos positivos;
4. o tempo máximo aceitável;
5. o que deve acontecer quando a evidência for insuficiente;
6. qual ganho mínimo justificaria continuar.

**Não definir os limiares depois de ver os resultados.** O primeiro ciclo pode ser exploratório; nesse caso, os resultados servem para calibrar um segundo benchmark confirmatório, não para declarar sucesso.

### Artefatos de evidência por execução

Cada execução deve gerar:
- identificador e versão do caso;
- hash do arquivo de entrada sintético;
- versão/commit do sistema, configuração e modelo utilizado;
- saída bruta e estado final;
- campos, regras e fontes que sustentam o resultado;
- divergências, erros e exceções;
- revisões e correções humanas;
- duração automática e duração total;
- resumo das métricas, limitações e condições de reprodução.

Não colocar segredos, credenciais, dados pessoais ou arquivos de clientes em repositório público. Os artefatos sintéticos podem ser públicos; resultados internos e detalhes proprietários devem passar por revisão antes de publicação.

## 4. Decisão depois do experimento

- **Continuar:** resultados reproduzíveis, rastreabilidade preservada e melhoria em relação aos baselines sem ultrapassar os limites de risco previamente definidos.
- **Ajustar:** falhas localizadas em templates, OCR, critérios, interface de revisão ou tratamento de incerteza.
- **Reduzir escopo:** se só alguns tipos de documento/campo forem confiáveis, limitar a alegação e o caso de uso a esse domínio.
- **Interromper a hipótese:** se a camada contextual não melhorar a decisão ou aumentar erros críticos em comparação ao baseline.

## 5. Fontes primárias e leitura

1. IBGE/Agência Gov, 24 set. 2025 — [uso de IA na indústria brasileira, PINTEC 2024](https://agenciagov.ebc.com.br/noticias/202509/de-2022-a-2024-percentual-de-empresas-industriais-utilizando-inteligencia-artificial-subiu-de-16-9-para-41-9).
2. Cetic.br/NIC.br — [TIC Empresas 2024, uso de IA por setor e porte](https://cetic.br/pt/tics/pesquisa/2024/empresas/H9/expandido/).
3. Hamri et al., 2024 — [Document Information Extraction: An Analysis of Invoice Anatomy](https://doi.org/10.1155/2024/7599415).
4. Yan et al., 2025 — [DocExtractNet: A novel framework for enhanced information extraction from business documents](https://doi.org/10.1016/j.ipm.2024.104046).
5. NIST, 2023 — [Artificial Intelligence Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf).
6. NIST — [AI RMF Playbook: Measure](https://airc.nist.gov/airmf-resources/playbook/measure/).

## 6. Próximo gate de execução

O próximo trabalho de engenharia é verificar o estado real da captura, extração, comparação e persistência de evidências no 3L0 Vision, mapear quais partes estão implementadas e automatizar os 40 casos contra o fluxo real. Este documento não declara que esse teste já foi executado. O resultado só deve ser publicado após execução, inspeção dos logs e preservação dos artefatos.
