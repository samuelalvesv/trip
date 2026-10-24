# 01: Fundação de Testes, Temas Claro Solar / Escuro OLED e Gestão de Viagens (Trip)

**O que construir:** O viajante pode criar, listar, selecionar, editar, duplicar como template e excluir suas **Trips** localmente no aplicativo com persistência imediata entre sessões, visualizar a barra deslizante de dias gerada automaticamente a partir do período `[startDate, endDate]` da viagem ativa e alternar em 1 toque no cabeçalho entre os temas **Claro Solar** (alto contraste diurno) e **Escuro OLED** (economia de bateria noturna), com toda a fundação validada pela suíte de testes automatizados (Vitest 5 + Happy DOM + React Testing Library + V8 Coverage).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A suíte de testes (`vitest`, `@vitest/coverage-v8`, `happy-dom`, `@testing-library/react`, `@testing-library/user-event`) e os scripts de validação (`test`, `test:watch`, `test:coverage`, `verify`) estão configurados e executando sem erros.
- [ ] O cabeçalho permite alternar em 1 toque entre os modos de tema **Claro Solar** e **Escuro OLED** (via `colorSchemes` nativo do Material UI v9).
- [ ] O viajante pode criar uma nova **Trip** informando título, `startDate` (`YYYY-MM-DD`) e `endDate` (`YYYY-MM-DD`), com validação *Fail First* na fronteira rejeitando títulos vazios ou `startDate > endDate`.
- [ ] Todas as **Trips** e a seleção da viagem ativa são persistidas localmente (`localStorage` sob schema versionado e validado na leitura) e restauradas ao recarregar a página.
- [ ] O viajante pode alternar entre múltiplas **Trips** cadastradas, editar título e datas da viagem ativa e visualizar a barra horizontal de dias (`Dia 1`, `Dia 2`...) derivada exatamente do intervalo fechado `[startDate, endDate]`.
- [ ] A ação **"Duplicar viagem"** cria uma cópia independente da **Trip** reiniciando todos os estados de conclusão (`completed`) para `false`.
- [ ] A ação de excluir uma **Trip** remove a viagem e exibe imediatamente um `Snackbar` com o botão **"Desfazer"** capaz de restaurá-la em 1 toque.
- [ ] Testes unitários de validação/mutação/persistência e testes de integração de interface cobrem todos os critérios acima, passando integralmente em `npm run lint`, `npm run typecheck` e `npm run test`.
