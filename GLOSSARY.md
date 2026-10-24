# Trip

Aplicação web progressiva (PWA) 100% local para planejamento de roteiros de viagem e condução guiada em tempo real na rua, sem banco de dados remoto e sem exigência de login.

## Vocabulário

### Locais, Roteiro e Tempo

**Trip (Viagem)**:
Período delimitado por uma data de início e uma data de fim que agrupa o catálogo de locais de interesse, a programação diária de paradas, os anexos gerais e o checklist de preparação.
_Evitar_: Projeto, Plano, Tour, Evento

**Place (Local)**:
Ponto de interesse cadastrado uma única vez na viagem a partir de um link obrigatório do Google Maps (curto ou longo), do qual são extraídos na fronteira de entrada o nome sugerido, o endereço completo via metadados e as coordenadas geográficas obrigatórias (`lat, lng`), além de suportar endereço editável, horário de funcionamento, observações e anexos do Drive. Representa qualquer ponto relevante da viagem (hotel, atrações, restaurantes), podendo ser referenciado por múltiplas paradas do roteiro ou filtrado e ordenado por distância atual do viajante ("Ver locais mais próximos").
_Evitar_: Hospedagem, Hotel, Waypoint, Destino, Ponto

**Stop (Parada)**:
Agendamento de um **Place (Local)** em um dia específico da viagem, com horário de chegada previsto, duração esperada de permanência e estado de conclusão. Os dias são estritamente isolados entre si: uma parada que termine após `23:59` apenas exibe o indicador `(+1d)` no horário de saída sem interferir no dia seguinte.
_Evitar_: Atividade, Evento, Etapa, Visita

**Gap (Janela Livre e de Deslocamento)**:
Intervalo de tempo entre o horário estimado de saída de uma parada e o horário de chegada da parada seguinte no mesmo dia, compreendendo conjuntamente o trânsito entre os locais e o tempo livre do viajante.
_Evitar_: Tempo de trânsito, Deslocamento isolado, Buffer, Tempo ocioso

**Schedule Conflict (Conflito de Horário)**:
Sobreposição temporal que ocorre quando o horário estimado de saída de uma parada ultrapassa o horário de chegada previsto da parada seguinte no mesmo dia ($\Delta t < 0$) ou quando o relógio atual ultrapassa o início de uma parada pendente.
_Evitar_: Erro, Colisão, Atraso genérico

**Cascade Shift (Ajuste em Cascata)**:
Deslocamento proporcional do horário de chegada de todas as paradas subsequentes não concluídas de um mesmo dia para frente (para resolver atrasos ou sobreposições) ou para trás (para aproveitar o tempo liberado após uma exclusão), limitado estritamente ao próprio dia.
_Evitar_: Reagendamento automático, Recálculo, Efeito cascata genérico

### Execução e Documentos

**Cockpit (Cockpit Agora & Próximo)**:
Painel de comando em tempo real que destaca a parada em andamento e o próximo compromisso pendente do dia, atualizando imediatamente a janela de deslocamento e as ações de navegação quando uma parada é concluída.
_Evitar_: Dashboard, Card de cabeçalho, Barra de status, Visão atual

**Drive Attachment (Anexo do Drive)**:
Referência leve por URL a um ingresso, voucher, reserva ou documento armazenado no Google Drive, vinculada à viagem como um todo, a um local ou a uma parada específica.
_Evitar_: Arquivo, Upload, Blob, Mídia

**Trip Checklist (Checklist Geral da Viagem)**:
Lista de tarefas de preparação da viagem (bagagem, documentação, check-in) independente da conclusão cronológica das paradas do roteiro diário.
_Evitar_: Lista de tarefas, Todo list, Subtarefas
