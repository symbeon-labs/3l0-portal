# 3L0 Portal

**Superfície pública do ecossistema 3L0 / Symbeon Labs.** O Portal apresenta a visão do produto, seus cenários de uso, o estado de maturidade e a entrada para o ambiente experimental do 3L0 Vision.

> **Regra editorial:** comunicar a ambição com clareza, mas nunca apresentar arquitetura planejada, protótipos ou itens de roadmap como capacidades já validadas em produção.

## Acesse

- **Portal público:** https://3l0-portal.vercel.app/
- **3L0 Vision — ambiente experimental:** https://3l0-vision.vercel.app/

O Vision é a aplicação central do produto. O Portal é a camada institucional e de orientação; não deve duplicar a lógica do Vision nem sugerir que um link para o aplicativo, por si só, garante acesso autorizado ou disponibilidade operacional.

## O que este repositório contém

- `index.html` — página institucional, conteúdo, estilos e demonstração conceitual da experiência.
- `assets/` — identidade visual e recursos estáticos referenciados pela página.
- `README.md` — contexto, limites e procedimento de contribuição.

Este repositório é uma página estática e **não declara um pipeline de build JavaScript**. Antes de adicionar dependências, frameworks ou etapas de compilação, confirme que existe uma necessidade concreta e atualize esta documentação junto com a implementação.

## Proposta do 3L0

O 3L0 busca tornar o mundo operacional computável, conectando observações do mundo físico, evidências digitais e sistemas de informação.

O fluxo conceitual é **Observar → Relacionar → Resolver → Operar**. Na conferência de mercadorias, isso pode envolver códigos, imagens, documentos fiscais, cadastros, divergências e revisão humana.

O Portal deve distinguir claramente:

- **Disponível:** o que pode ser acessado agora e foi verificado.
- **Experimental:** o que pode ser testado com limites conhecidos.
- **Em desenvolvimento:** o que está sendo implementado ou validado.
- **Planejado:** uma direção futura, sem promessa de disponibilidade.

OCR operacional, validação fiscal perante autoridades, integrações ERP/WMS, validação física de mercadorias, desempenho em operação real e automação de decisões não devem ser anunciados como capacidades comprovadas sem evidências específicas.

## Visualização local

Como a página é estática, é possível servi-la localmente sem instalar dependências de aplicação:

```bash
python3 -m http.server 4173
```

Depois, abra http://localhost:4173 no navegador. Execute o comando na raiz do repositório. Isso serve os arquivos locais; não reproduz autenticação, APIs nem serviços externos do Vision.

## Checklist de revisão

Antes de aprovar mudanças no Portal:

- [ ] A proposta é compreensível sem conhecimento prévio do ecossistema.
- [ ] Os links para seções e para o Vision funcionam.
- [ ] A navegação pode ser usada por teclado e os focos são visíveis.
- [ ] O conteúdo permanece legível em telas pequenas e grandes.
- [ ] A demonstração está identificada como conceitual quando não executa processamento real.
- [ ] Capacidades implementadas, experimentais e planejadas estão diferenciadas.
- [ ] Não há alegações sem evidência sobre precisão, economia, conformidade, segurança ou prontidão para produção.
- [ ] Nenhuma pesquisa privada, segredo, dado operacional sensível ou conteúdo dos repositórios privados foi incluído.
- [ ] Recursos referenciados em `assets/` existem e carregam corretamente.

## Contribuir

1. Crie uma branch específica para a mudança.
2. Faça alterações pequenas e mantenha o escopo da página pública.
3. Revise o diff e confira links, seções, acessibilidade básica e responsividade.
4. Abra uma Pull Request com objetivo, arquivos alterados, verificações executadas e limitações conhecidas.
5. Registre testes como pendentes quando não tiverem sido executados em navegador ou no ambiente publicado.

Não há script `npm test`, `npm run build` ou pipeline de compilação documentado neste repositório neste momento. Não declare esses testes aprovados sem que sejam configurados e executados. A validação local não comprova que o deploy público foi atualizado.

## Publicação

O endereço público conhecido é o [Portal na Vercel](https://3l0-portal.vercel.app/). A configuração efetiva do projeto e o resultado do deploy devem ser conferidos no provedor antes de anunciar uma publicação.

Um commit na branch `main` não é, por si só, evidência de que o site publicado foi atualizado. Após o merge, confirme o estado do deploy e teste a URL publicada em desktop e celular.

## Princípios de publicação

- Manter o Portal como a superfície pública do ecossistema.
- Derivar a narrativa de documentação canônica e evidências verificáveis.
- Não expor pesquisa privada, vault, registros internos ou detalhes proprietários desnecessários.
- Não afirmar que autenticação, lista de espera, conectores ou persistência funcionam sem verificar o fluxo completo.
- Preferir precisão e rastreabilidade a promessas comerciais difíceis de demonstrar.
