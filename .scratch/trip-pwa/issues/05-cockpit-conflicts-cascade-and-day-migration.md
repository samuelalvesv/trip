# 05: Painel Cockpit (Agora & Próximo), Schedule Conflict, Cascade Shift e Migração entre Dias

**O que construir:** Durante a execução da viagem na rua, o viajante conta com o painel **Cockpit (Agora & Próximo)** no topo da tela destacando a parada em andamento e o próximo destino, avançando imediatamente assim que uma **Stop** é marcada como concluída (*check*). Quando ocorrem sobreposições de horário (**Schedule Conflict**, $\Delta t < 0$) ou atrasos, o sistema sinaliza o conflito com a diferença exata em minutos e permite ajustar todas as paradas seguintes do dia com 1 toque (**Cascade Shift** para frente, ou para trás após exclusão), além de permitir migrar qualquer parada para outro dia da viagem.

**Blocked by:** 04: Programação Diária de Paradas (Stop), Linha do Tempo Isolada, Conectores de Gap e Rotas no Google Maps

**Status:** ready-for-agent

- [ ] O painel **Cockpit (Agora & Próximo)** destaca a parada atual e a próxima parada pendente do dia ativo, com botões largos de 1 toque para concluir a parada atual, iniciar rota no Google Maps até o próximo destino e copiar o endereço.
- [ ] No instante em que o viajante marca a **Stop** atual como concluída (*check*), o **Cockpit** avança o foco imediatamente para a próxima **Stop** pendente do dia, exibindo o tempo disponível de **Gap (Janela Livre e de Deslocamento)** até o início programado daquela parada.
- [ ] Quando $\Delta t < 0$ entre duas paradas consecutivas (o horário estimado de saída de $S_i$ ultrapassa a chegada de $S_{i+1}$) ou quando o horário previsto fica atrasado, o conector e o card exibem um alerta visual de **Schedule Conflict (Conflito de Horário)** informando a sobreposição exata em minutos ($|\Delta t|$).
- [ ] Ao acionar o botão **"Empurrar horários seguintes em cascata"** (**Cascade Shift** para frente), todas as **Stops** subsequentes não concluídas daquele mesmo dia têm seus horários de chegada deslocados proporcionalmente para eliminar a sobreposição (limitado a `23:59` do próprio dia, mantendo os dias isolados).
- [ ] Ao excluir uma **Stop** que possua paradas posteriores pendentes no mesmo dia, o `Snackbar` oferece, além de **"Desfazer"**, a ação **"Adiantar paradas seguintes em cascata"** (**Cascade Shift** para trás), puxando as paradas seguintes pelo tempo liberado sem gerar sobreposição com a parada anterior.
- [ ] A ação **"Mover para outro dia"** permite transferir qualquer **Stop** para outra data válida da **Trip** definindo seu novo `arrivalTime`, mantendo os horários restantes do dia de origem fixos por padrão e sinalizando imediatamente eventual **Schedule Conflict** no dia de destino com oferta de **Cascade Shift**.
- [ ] Testes unitários e de integração cobrem o avanço do **Cockpit**, a detecção de **Schedule Conflict**, o **Cascade Shift** (para frente e para trás) e a migração de parada entre dias.
