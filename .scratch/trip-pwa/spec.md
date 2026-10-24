# Trip PWA — Planejamento e Condução Guiada de Viagens 100% Client-Local

**Status:** ready-for-agent

## Declaração do Problema

Durante o planejamento e a execução de uma viagem, as informações essenciais ficam espalhadas em múltiplos aplicativos e conversas: links de lugares salvos em mensagens, endereços de hotéis e restaurantes que precisam ser redigitados a cada deslocamento, vouchers e ingressos perdidos em pastas do Google Drive, cálculos mentais para saber a que horas sair de um ponto e quanto tempo livre resta até o próximo compromisso, além da dificuldade de descobrir rapidamente quais lugares de interesse já cadastrados estão próximos da localização atual do viajante na rua — especialmente quando está fora do roteiro planejado ou sem conexão estável à internet.

## Solução

O **Trip** é uma aplicação web progressiva (**PWA**) 100% client-local, offline-first, construída sobre Material UI (MUI v9) com foco primário na experiência móvel e compatibilidade integral com telas maiores (desktop). A solução centraliza:

1. **Catálogo Unificado de Locais (`Place`) por Viagem (`Trip`)**: O viajante cadastra uma única vez todos os locais que deseja conhecer ou utilizar na viagem (incluindo seu hotel, atrações, restaurantes e pontos de apoio) sempre a partir de um link obrigatório do Google Maps (URL completa ou link curto de compartilhamento `maps.app.goo.gl`). Ambos os formatos de link passam pela mesma requisição de metadados públicos (`allorigins`) para apresentar comportamento idêntico e extrair as coordenadas geográficas obrigatórias (`lat, lng`), o nome sugerido e o endereço completo. Caso o dispositivo esteja offline ou a API de metadados esteja indisponível:
   - se for um link curto (`maps.app.goo.gl`), o sistema falha imediatamente (*Fail Fast*) e orienta o usuário a colar o link longo do Google Maps;
   - se for o link longo (`google.com/maps/place/...`), o sistema extrai diretamente da estrutura textual da própria URL o nome e as coordenadas exatas (`!3d<lat>!4d<lng>`), permitindo concluir o cadastro e editar nome, endereço, horário de funcionamento, observações e anexos do Google Drive.
2. **Descoberta por Proximidade ("Perto de Mim Agora") e Destaque no Mapa**: A qualquer momento na rua, o viajante pode filtrar seus **Places** (`Não visitados`, `Fora do roteiro`, `Agendados no roteiro`, `Visitados`, `Todos` + busca textual), ordená-los pela distância exata da sua posição atual de GPS (100% offline via fórmula de Haversine) e acionar o botão **"Ver locais mais próximos"** para abrir a visão geral do Google Maps destacando os locais filtrados mais próximos na tela.
3. **Programação Diária Isolada de Paradas (`Stop`), Linha do Tempo e `Cockpit`**: Cada dia da viagem referencia os **Places** já cadastrados em **Stops** ordenadas por horário de chegada (`arrivalTime`) e tempo de permanência (`stayDurationMinutes`). Os dias são estritamente isolados entre si (horários de saída que atravessem a meia-noite apenas exibem `(+1d)` visualmente). A linha do tempo calcula automaticamente as janelas livres e de deslocamento (**Gap**), detecta sobreposições (**Schedule Conflict**), oferece ajuste de horários em cascata (**Cascade Shift**), migração entre dias, exclusão segura com **Desfazer** e alimenta o **Cockpit** (*Agora & Próximo*) que avança imediatamente a cada parada marcada como concluída (*check*).
4. **Ecossistema Google Zero-Login e Compartilhamento P2P**: Integração direta sem login/OAuth com Google Maps (rotas ponto a ponto e rotas completas do dia particionadas em blocos de até 5 pontos no mobile), Google Drive (links com *preview* embutido, colagem em 1 toque da área de transferência e recebimento via *PWA Web Share Target*) e Google Agenda (exportação em lote `.ics` RFC 5545 e link de template individual), além de compartilhamento P2P entre amigos via arquivo `.trip.json` e leitura/geração de QR Code offline com resolução determinística de conflitos.

## Histórias de Usuário

1. Como viajante, quero criar uma **Trip** informando título, data de início (`startDate`) e data de fim (`endDate` $\ge$ `startDate`), para que os dias disponíveis do meu roteiro sejam gerados automaticamente.
2. Como viajante, quero listar, selecionar, editar e excluir minhas **Trips** salvas localmente no navegador, para gerenciar múltiplas viagens no mesmo aparelho sem depender de conta ou servidor.
3. Como viajante, quero duplicar uma **Trip** existente copiando todos os seus **Places**, **Stops**, **Drive Attachments** e itens do **Trip Checklist** com os estados de conclusão (`completed`) reiniciados para `false`, para reutilizar um roteiro como template.
4. Como viajante, quero que, ao alterar a data de início (`startDate`) de uma **Trip** que já possui **Stops**, o sistema ofereça deslocar todas as paradas proporcionalmente para as novas datas, para que eu possa adiar ou adiantar uma viagem inteira sem reeditar dia por dia.
5. Como viajante, quero que, ao encurtar o período de uma **Trip** deixando **Stops** fora do novo intervalo `[startDate, endDate]`, o sistema exija escolher entre mover as paradas órfãs para o dia válido mais próximo ou excluí-las, para manter a integridade do roteiro.
6. Como viajante, quero iniciar o cadastro de qualquer **Place** colando obrigatoriamente um link do Google Maps (seja a URL completa copiada do navegador ou o link curto `https://maps.app.goo.gl/...` gerado pelo botão Compartilhar), para não precisar digitar coordenadas manualmente nem correr risco de endereços ambíguos.
7. Como viajante, quero que tanto o link curto (`maps.app.goo.gl`) quanto o link longo (`google.com/maps/place/...`) façam a mesma requisição ao serviço público de metadados (`allorigins`) ao cadastrar um **Place**, para que ambos apresentem o mesmo comportamento e extraiam automaticamente as coordenadas exatas (`lat, lng`), o nome sugerido e o endereço completo presentes nos metadados.
8. Como viajante, quero que, caso o dispositivo esteja offline ou a API de metadados esteja indisponível no momento de cadastrar um **Place**:
   - se eu tiver colado um link curto (`maps.app.goo.gl`), o sistema falhe imediatamente (*Fail Fast*) com uma mensagem clara orientando a usar o link longo do Google Maps para trazer as informações;
   - se eu tiver colado o link longo do Google Maps (`google.com/maps/place/...`), o sistema extraia diretamente da própria URL o nome (`/maps/place/<Nome>/`) e as coordenadas exatas do pino (`!3d<lat>!4d<lng>` ou `@<lat>,<lng>`), informando que o endereço pode ser preenchido manualmente por indisponibilidade temporária dos metadados.
9. Como viajante, quero que qualquer link colado no cadastro de **Place** que não pertença ao Google Maps ou não permita obter coordenadas válidas seja rejeitado imediatamente na fronteira (*Fail Fast*), garantindo que todo **Place** salvo possua coordenadas geográficas válidas.
10. Como viajante, quero poder editar o nome e o endereço extraídos de um **Place** e preencher opcionalmente o **Horário de Funcionamento** (`openingHours`) e **Observações** (`notes`), para registrar apelidos claros (como *"Nosso Hotel"*), horários de abertura/fechamento e dicas úteis visíveis no aplicativo.
11. Como viajante no celular, quero compartilhar um local diretamente de dentro do aplicativo nativo do Google Maps para o ícone do **Trip** (via *PWA Web Share Target*), para que o **Trip** já abra com o formulário de novo **Place** preenchido automaticamente.
12. Como viajante, quero cadastrar meu hotel/hospedagem como um **Place** normal no catálogo da viagem e poder agendá-lo em quantas **Stops** eu quiser ao longo dos dias (saída pela manhã, descanso à tarde, retorno à noite), para reutilizar o mesmo local sem redigitar endereço e sem complexidade de regras de check-in/check-out.
13. Como viajante, quero editar os dados de um **Place** (nome, endereço, horário de funcionamento, observações ou **Drive Attachments**) em um único lugar e ver a atualização refletida imediatamente em todas as **Stops** que referenciam aquele **Place**, para evitar retrabalho.
14. Como viajante, quero que, ao tentar excluir um **Place** que já está referenciado em uma ou mais **Stops** do roteiro, o sistema informe em quantas paradas ele é usado e, após confirmação, remova o **Place** junto com suas **Stops** exibindo um `Snackbar` com a opção **"Desfazer"**, para evitar paradas órfãs e proteger contra exclusões acidentais.
15. Como viajante na rua, quero abrir a aba de **Places** da viagem e ordenar todos os locais cadastrados pela distância da minha localização atual de GPS (`navigator.geolocation` + cálculo local de Haversine), para descobrir imediatamente o que cadastrei perto de mim agora (ex.: `a 250 m`, `a 1,2 km`), mesmo offline.
16. Como viajante, quero que, caso a permissão de GPS seja negada ou o sensor de localização não esteja disponível ao solicitar a ordenação por proximidade, o sistema falhe imediatamente (*Fail Fast*) com uma mensagem clara e amigável explicando como habilitar a localização.
17. Como viajante na aba de **Places**, quero visualizar em cada local uma etiqueta automática derivada do roteiro indicando se ele está **"Fora do roteiro"**, **"Agendado (Dia X • HH:mm)"** ou **"Visitado ✓"**, além do seu horário de funcionamento se cadastrado, para tomar decisões rápidas na rua.
18. Como viajante na aba de **Places**, quero filtrar a lista por **`Não visitados`**, **`Fora do roteiro`**, **`Agendados no roteiro`**, **`Visitados`** ou **`Todos`**, além de buscar por texto no nome/endereço/observações, para focar exatamente no subconjunto de locais que me interessa no momento.
19. Como viajante na aba de **Places**, quero clicar no botão **"Ver locais mais próximos"** para abrir o Google Maps exibindo a visão geral do mapa com a minha localização atual e os **Places** mais próximos **dentro do filtro ativo** destacados na tela (respeitando o limite mobile de até 5 pontos por link do Google Maps), para visualizar espacialmente minhas opções ao redor.
20. Como viajante na aba de **Places**, quero ter um botão de 1 toque **"+ Adicionar ao roteiro de hoje"** em cada card de **Place**, para encaixar rapidamente qualquer local próximo como uma **Stop** no dia atual.
21. Como viajante montando o roteiro de um dia, quero criar uma **Stop** selecionando um **Place** já existente no catálogo e informando o horário de chegada (`arrivalTime` em `HH:mm`) e o tempo esperado de permanência (`stayDurationMinutes` $\ge 1$), para compor a programação cronológica do dia.
22. Como viajante dentro do formulário de criação de **Stop**, quero ter a opção **"+ Cadastrar novo local aqui mesmo"** caso o lugar ainda não esteja no catálogo de **Places**, para criar o **Place** via link do Google Maps e já vinculá-lo à **Stop** sem sair da tela do dia.
23. Como viajante, quero visualizar na linha do tempo de cada dia todas as **Stops** ordenadas por `arrivalTime`, exibindo para cada parada o horário de chegada, a duração de permanência, o horário estimado de saída (`departureTime = arrivalTime + stayDurationMinutes`), o endereço, o horário de funcionamento do **Place** e os anexos disponíveis.
24. Como viajante, quero que, caso uma **Stop** noturna tenha `departureTime` após `23:59` (ex.: chegada às `22:30` com `150 min` de permanência $\to$ saída `01:00 (+1d)`), o sistema apenas exiba o indicador visual `(+1d)` no horário de saída dentro do próprio dia em que a parada começou, mantendo os dias estritamente isolados sem invadir nem bloquear o dia seguinte.
25. Como viajante, quero ver entre cada par de paradas consecutivas ($S_i$ e $S_{i+1}$) de um mesmo dia um conector visual exibindo a **Gap (Janela Livre e de Deslocamento)** ($\Delta t = \text{arrivalTime}(S_{i+1}) - \text{departureTime}(S_i)$) sem precisar informar tempo manual de trânsito, acompanhado de um botão de 1 toque para abrir a rota de $S_i \to S_{i+1}$ no Google Maps.
26. Como viajante, quero ter em cada card de **Stop** e de **Place** um botão de 1 toque **"Copiar Endereço/Local"**, para colar o destino rapidamente em aplicativos de transporte urbano (Uber, 99, táxi).
27. Como viajante na rua, quero contar com o painel **Cockpit (Agora & Próximo)** no topo da viagem ativa destacando a parada em andamento e a próxima parada pendente, para operar o aplicativo com uma só mão enquanto caminho.
28. Como viajante, quero que, no instante em que eu marcar a **Stop** atual como concluída (*check*), o **Cockpit** avance imediatamente o foco para a próxima **Stop** pendente do dia, mostrando quanto tempo tenho disponível para deslocamento/tempo livre até o horário programado e oferecendo botões de 1 toque para iniciar a rota no Google Maps, copiar o endereço e abrir os ingressos no Google Drive.
29. Como viajante, quero que o sistema sinalize visualmente um **Schedule Conflict (Conflito de Horário)** sempre que o horário estimado de saída de uma parada ultrapassar o horário de chegada da parada seguinte ($\Delta t < 0$) ou quando o relógio atual ultrapassar o início de uma parada pendente, mostrando a diferença exata em minutos.
30. Como viajante diante de um **Schedule Conflict** ou atraso, quero acionar em 1 toque o botão **"Empurrar horários seguintes em cascata"** (**Cascade Shift**), para deslocar proporcionalmente o `arrivalTime` de todas as paradas subsequentes não concluídas daquele mesmo dia (limitado a `23:59` do próprio dia, preservando o isolamento entre dias).
31. Como viajante, quero poder duplicar uma **Stop** (com `completed: false`) ou usar a ação **"Mover para outro dia"** escolhendo a nova data e horário de chegada, mantendo os horários do dia de origem fixos por padrão (com opção de adiantar em cascata) e sinalizando imediatamente qualquer **Schedule Conflict** no dia de destino com oferta de **Cascade Shift** para frente.
32. Como viajante, quero que, ao excluir uma **Stop** de um dia, os horários das paradas seguintes permaneçam fixos por padrão (ampliando a **Gap**) e um `Snackbar` ofereça imediatamente os botões **"Desfazer"** (restaurando a parada em 1 toque) e **"Adiantar paradas seguintes em cascata"**, além de ver no cabeçalho do dia o resumo consolidado (total de paradas concluídas vs. pendentes, tempo total alocado em paradas e tempo total de janelas livres/deslocamento).
33. Como viajante, quero abrir a rota completa do dia no Google Maps com todas as paradas encadeadas e, caso o dia possua mais de 5 paradas, quero que o sistema particione automaticamente a rota em botões sequenciais de até 5 locais sobrepostos ($S_1 \to S_5$, $S_5 \to S_9$), para que o aplicativo móvel do Google Maps nunca descarte paradas além do limite de 3 waypoints intermediários.
34. Como viajante, quero anexar links de documentos do Google Drive (**Drive Attachment**) na **Trip** geral, em um **Place** ou em uma **Stop** específica usando os atalhos **"Abrir Google Drive"**, **"Colar da Área de Transferência em 1 Toque"** (`navigator.clipboard.readText()`) ou compartilhando direto do app do Google Drive via *PWA Web Share Target*, para vincular ingressos e vouchers sem precisar copiar e colar manualmente em campos de texto.
35. Como viajante, quero abrir qualquer **Drive Attachment** em 1 toque diretamente da linha do tempo ou do **Cockpit**, incluindo visualização embutida (*preview*) quando o link possuir identificador de arquivo (`/file/d/<ID>/`), deixando a responsabilidade de acesso offline dos arquivos para o app nativo do Google Drive.
36. Como viajante, quero exportar toda a programação da **Trip** (ou de um dia específico) em um arquivo padronizado `.ics` (RFC 5545) ou adicionar uma **Stop** individual via link de template do Google Agenda, para sincronizar meus compromissos com a agenda sem exigir login OAuth.
37. Como viajante, quero gerenciar um **Trip Checklist** geral da viagem (criar, editar, marcar/desmarcar e excluir itens de bagagem, documentação e preparação) com barra de progresso independente das paradas diárias.
38. Como viajante, quero compartilhar minha **Trip** com amigos exportando o arquivo `.trip.json` (via `navigator.share` nativo entre iPhone e Android ou download direto) ou exibindo na tela um **QR Code** gerado 100% offline com os dados comprimidos (`Deflate` + `Base64URL`), com opção de gerar o QR Code por dia caso a viagem completa exceda a capacidade óptica de um único QR Code.
39. Como viajante, quero ler o QR Code da tela de um amigo usando a câmera dentro do próprio aplicativo (ou selecionando um arquivo `.trip.json` / imagem), validando toda a carga na fronteira de entrada (*Fail First*) antes de importar.
40. Como viajante importando uma **Trip** cujo `id` já existe no meu dispositivo, quero que o sistema apresente um diálogo comparativo (*Versão Local* vs. *Versão Recebida*) com 4 escolhas explícitas: **Substituir versão local**, **Mesclar com versão local** (união direta de itens inéditos por padrão + aplicação do registro com `updatedAt` mais recente nos itens de mesmo `id` + preservação monotônica de `completed = true`), **Importar como outra viagem** (novo `id`) ou **Cancelar**.
41. Como viajante usando o aplicativo sob sol forte na rua ou à noite economizando bateria, quero alternar em 1 toque no cabeçalho entre o tema **Claro Solar** (alto contraste) e o tema **Escuro OLED** (fundo escuro real), além de instalar e usar o aplicativo 100% offline como um PWA nativo no celular e no computador.

## Decisões de Implementação

1. **Contratos de Domínio Rígidos, Imutáveis e *Fail First***:
   - Todos os contratos de domínio são imutáveis (`readonly` e `ReadonlyArray`) e validados na fronteira de entrada por *parsers* puros que retornam `Result<T, string>` (`{ readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string }`), sem uso de `any` ou asserções não-nulas:
   ```ts
   export interface GeoCoordinates {
     readonly lat: number
     readonly lng: number
   }

   export interface DriveAttachment {
     readonly id: string
     readonly label: string
     readonly url: string
     readonly updatedAt: string
   }

   export interface ChecklistItem {
     readonly id: string
     readonly label: string
     readonly completed: boolean
     readonly updatedAt: string
   }

   export interface TripPlace {
     readonly id: string
     readonly name: string
     readonly mapUrl: string
     readonly coordinates: GeoCoordinates
     readonly address?: string
     readonly openingHours?: string
     readonly notes?: string
     readonly attachments: ReadonlyArray<DriveAttachment>
     readonly updatedAt: string
   }

   export interface TripStop {
     readonly id: string
     readonly placeId: string
     readonly date: string // YYYY-MM-DD within [Trip.startDate, Trip.endDate]
     readonly arrivalTime: string // HH:mm (00:00 to 23:59)
     readonly stayDurationMinutes: number // Integer >= 1
     readonly completed: boolean
     readonly completedAt?: string
     readonly notes?: string
     readonly attachments: ReadonlyArray<DriveAttachment>
     readonly updatedAt: string
   }

   export interface Trip {
     readonly id: string
     readonly title: string
     readonly startDate: string // YYYY-MM-DD
     readonly endDate: string // YYYY-MM-DD
     readonly places: ReadonlyArray<TripPlace>
     readonly stops: ReadonlyArray<TripStop>
     readonly attachments: ReadonlyArray<DriveAttachment>
     readonly checklist: ReadonlyArray<ChecklistItem>
     readonly updatedAt: string
   }
   ```
2. **Módulo Unificado de Resolução e Extração de Links do Google Maps (*Fail Fast*)**:
   - Todo cadastro de **Place** exige um link do Google Maps (`mapUrl`), seja curto (`https://maps.app.goo.gl/...`) ou longo (`https://www.google.com/maps/place/...`).
   - **Requisição Unificada para Ambos os Formatos**: Tanto o link curto quanto o link longo fazem a mesma requisição ao serviço open-source `allorigins` (`https://api.allorigins.win/get?url=...`). A partir da URL final resolvida (`status.url`) e do HTML retornado (`contents`), o sistema extrai de forma idêntica:
     - **Coordenadas exatas (`coordinates`)**: priorizando o pino exato `!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)` e, quando ausente, `@(-?\d+\.\d+),(-?\d+\.\d+)` ou `q=(-?\d+\.\d+),(-?\d+\.\d+)`;
     - **Nome sugerido (`name`)** e **Endereço completo (`address`)**: extraídos das meta tags públicas (`og:title` / `meta description`, no formato `"Nome · Endereço"`) e do segmento `/maps/place/([^/]+)/`.
   - **Comportamento Offline ou Indisponibilidade da API**:
     - Se a requisição ao `allorigins` falhar (sem conexão ou serviço indisponível) e o link colado for o **link curto (`maps.app.goo.gl`)**, o sistema falha imediatamente (*Fail Fast*) e orienta claramente o usuário a usar o **link longo do Google Maps** para trazer as informações.
     - Se a requisição ao `allorigins` falhar mas o usuário estiver usando o **link longo do Google Maps (`google.com/maps/place/...`)**, o sistema extrai diretamente da própria string da URL o **Nome** (`/maps/place/<Nome>/`) e as **Coordenadas exatas** (`!3d<lat>!4d<lng>`), permitindo concluir o cadastro offline e informando que o endereço pode ser complementado manualmente.
   - Nenhum **Place** é criado sem `coordinates` válidas.
3. **Módulo de Proximidade Geográfica, Filtros de `Place` e Destaque no Google Maps**:
   - A distância entre a posição atual do usuário (`navigator.geolocation.getCurrentPosition`) e cada `TripPlace.coordinates` é calculada localmente via fórmula de Haversine (em metros/quilômetros). Caso o GPS falhe ou a permissão seja negada, a fronteira retorna erro explícito imediato (*Fail Fast*).
   - O status de cada **Place** na viagem é derivado em tempo de renderização a partir de `Trip.stops`:
     - `unscheduled` (*Fora do roteiro*): nenhuma `TripStop` referencia `place.id`;
     - `scheduled` (*Agendado no roteiro*): existe ao menos uma `TripStop` pendente (`completed === false`) referenciando `place.id`;
     - `visited` (*Visitado*): existem paradas para `place.id` e todas estão com `completed === true`.
   - O botão **"Ver locais mais próximos"** recebe exclusivamente a lista de **Places** que passaram pelo **filtro ativo** (status + texto de busca) já ordenada por distância crescente e constrói URLs universais do Google Maps (`https://www.google.com/maps/dir/?api=1&origin=<userLat,userLng>&waypoints=<p1|p2|p3>&destination=<p4>`) **sem** o parâmetro `dir_action=navigate`, abrindo a visão panorâmica do mapa com a posição do usuário e os locais filtrados mais próximos marcados na tela (particionados em blocos de até 4 locais + origem = 5 pontos no mobile).
4. **Módulo de Linha do Tempo Isolada por Dia, `Cockpit` e `Cascade Shift`**:
   - Todos os cálculos de linha do tempo operam de forma pura sobre as **Stops** de uma única data `date` (`YYYY-MM-DD`), ordenadas por `arrivalTime` ascendente:
     - `departureMinutes = arrivalMinutes + stayDurationMinutes`.
     - Se `departureMinutes >= 1440` (`24:00`), o horário formatado exibe `HH:mm (+1d)` apenas como indicador visual naquele mesmo dia; nenhuma parada ou ajuste em cascata invade ou altera o dia seguinte.
     - `gapMinutes = nextStop.arrivalMinutes - currentStop.departureMinutes`. Valores $\ge 0$ representam a **Gap (Janela Livre e de Deslocamento)**; valores $< 0$ caracterizam um **Schedule Conflict**.
   - **Cascade Shift para Frente (`pushSubsequentStopsForward`)**: Desloca proporcionalmente o `arrivalTime` das paradas subsequentes não concluídas do mesmo dia para eliminar sobreposições ($\Delta t < 0$) ou alinhar com o relógio atual, limitando o início máximo a `23:59` do próprio dia.
   - **Exclusão de Parada e Cascade Shift para Trás (`pullSubsequentStopsBackward`)**: Excluir uma parada mantém os horários seguintes fixos por padrão e registra o snapshot anterior em `lastUndoableState`, acionando um `Snackbar` com **"Desfazer"** e **"Adiantar paradas seguintes em cascata"**.
5. **Módulo de Integrações Zero-Login (Drive, Calendar, QR Code e `.trip.json`) e Mesclagem Determinística**:
   - **Google Drive**: Reconhece URLs `drive.google.com/file/d/<ID>`, `drive.google.com/open?id=<ID>` e `docs.google.com/*/d/<ID>`, extraindo `fileId` para oferecer *preview* modal (`/file/d/<ID>/preview`) além do link direto, leitura em 1 toque via `navigator.clipboard.readText()` e captura de URLs compartilhadas via `share_target` no `manifest.webmanifest` (`action: "/"`, `params: { title: "share_title", text: "share_text", url: "share_url" }`, roteando links do Google Maps para criação de **Place**, links do Google Drive para criação de **Drive Attachment** e limpando a query string via `history.replaceState`).
   - **Google Agenda**: Gera conteúdo `.ics` (RFC 5545) em memória para todas as paradas da viagem/dia (preenchendo `SUMMARY` com o nome do **Place**, `LOCATION` com endereço/URL do Maps e `DESCRIPTION` com observações e links do Drive) e links individuais `calendar.google.com/calendar/render?action=TEMPLATE`.
   - **Compartilhamento e QR Code Caminho Único**: Exporta e importa `.trip.json` (`navigator.share({ files })` e download) e gera QR Code offline via biblioteca `qrcode` com payload comprimido nativamente via `CompressionStream('deflate-raw')` + `Base64URL` (permitindo alternar para QR Code por dia caso a viagem completa ultrapasse o limite óptico seguro de ~1,5 KB). A leitura óptica de QR Code utiliza `jsqr` sobre `<canvas>` como caminho único determinístico em todas as plataformas.
   - **Mesclagem (`mergeTrips`)**: O diálogo comparativo exibe *Versão Local* vs. *Versão Recebida* (datas `updatedAt` e contagem de locais/paradas) com 4 opções (**Substituir**, **Mesclar**, **Importar como outra viagem** e **Cancelar**). Na opção **"Mesclar com versão local"**, expande o período (`startDate = min(local.startDate, incoming.startDate)` e `endDate = max(local.endDate, incoming.endDate)`), aplica a união direta por padrão (itens cujo `id` exista em qualquer um dos dois lados são mantidos, ressuscitando por padrão itens ausentes no outro lado) e, para itens com o mesmo `id` em ambos os lados (`places`, `stops`, `attachments`, `checklist`), vence o registro com `updatedAt` mais recente, preservando `completed = local.completed || incoming.completed`.
6. **Persistência Local, PWA, Ergonomia Mobile-First / Desktop Split-View e Temas MUI v9**:
   - Armazenamento síncrono versionado em `localStorage` (`trip:v1:state`) hidratado exclusivamente através do parser de validação *Fail First*.
   - Tema Material UI v9 configurado com `cssVariables: { colorSchemeSelector: 'data' }` e `colorSchemes: { light: true, dark: true }` implementando os modos **Claro Solar** (alto contraste diurno) e **Escuro OLED** (fundo `#000000` / `#0a0f18`).
   - **Mobile-First**: Barra horizontal deslizante no topo (*Sticky Day Strip* alternando entre `Dia 1`, `Dia 2`..., `Locais`, `Checklist Geral` e `Documentos`), card **Cockpit** fixo no topo, linha do tempo vertical com conectores de **Gap** / alerta de **Schedule Conflict**, gavetas inferiores `SwipeableDrawer` operáveis com uma mão e `Snackbar` de **Desfazer**.
   - **Desktop (`md`/`lg`)**: Expansão responsiva em painéis paralelos (navegação lateral de viagens e dias à esquerda, linha do tempo ou catálogo de **Places** ao centro e painel complementar à direita com **Trip Checklist**, cofre de **Drive Attachments** e ações de rota/exportação).
   - **PWA Completo**: Configurado via `vite-plugin-pwa` com `display: "standalone"`, ícones *maskable*, `share_target` e *Service Worker* com cache offline integral de *App Shell*, fontes (`@fontsource/roboto`) e ícones (`@mui/icons-material`).

## Decisões de Testes

1. **O que constitui um bom teste neste projeto**:
   - Testes validam exclusivamente o **comportamento externo observável** através de entradas e saídas públicas nas costuras definidas, nunca detalhes internos de implementação (como nomes de estados internos do React ou estrutura privada de funções auxiliares).
   - A suíte roda sobre **Vitest 5 (`^5.0.5`)**, **`happy-dom` (`^21.0.3`)**, **`@testing-library/react` (`^16.3.3`)**, **`@testing-library/user-event`** e **`@vitest/coverage-v8` (`^5.0.5`)**, compartilhando o mesmo pipeline Vite 8 + Oxc/TypeScript 7 do projeto.
2. **Costuras e Módulos Testados**:
   - **Costura 1 — Testes Unitários de Domínio Puro**:
     - Validação *Fail First* de contratos (`Trip`, `TripPlace` com `coordinates` obrigatórias, `TripStop`, `DriveAttachment`, `ChecklistItem`);
     - Cálculo de linha do tempo (`departureTime`, sufixo `(+1d)` com isolamento estrito entre dias, `Gap`, detecção de `Schedule Conflict`, `pushSubsequentStopsForward` e `pullSubsequentStopsBackward`);
     - Cálculo de distância de Haversine, derivação de status do **Place** (`Fora do roteiro`, `Agendado`, `Visitado`) e aplicação combinada de filtros;
     - Mutações de viagem (duplicação, deslocamento de período ao alterar `startDate`, tratamento de paradas órfãs ao encurtar datas e exclusão em cascata de `Place` + suas `Stops`);
     - Algoritmo de mesclagem determinística P2P (`mergeTrips`: união padrão + desempate por `updatedAt` + monotonicidade de `completed`).
   - **Costura 2 — Testes Unitários de Protocolos e Integrações**:
     - Parser unificado de URLs do Google Maps (requisição de metadados via `allorigins` para links curtos e longos extraindo coordenadas `!3d<lat>!4d<lng>`, nome e endereço; rejeição *Fail Fast* de link curto quando offline orientando usar o link longo; extração direta do link longo quando offline);
     - Construtor de URLs do Google Maps (`api=1`) para rota entre paradas, rota completa do dia particionada em blocos de até 5 pontos e visão geral **"Ver locais mais próximos"** (sem `dir_action=navigate`, respeitando os itens filtrados);
     - Parser de links e *preview* do Google Drive, gerador `.ics` (RFC 5545) e *round-trip* de compressão/descompressão (`Deflate` + `Base64URL`) do QR Code.
   - **Costura 3 — Testes de Integração na Raiz `<App />` (`Happy DOM` + `@testing-library/react`)**:
     - Fluxo completo do usuário: criar **Trip** $\to$ cadastrar **Place** via link do Google Maps (testando sucesso com metadados em ambos os links, comportamento offline da URL longa e orientação *Fail Fast* do link curto) $\to$ agendar **Stops** usando o **Place** cadastrado $\to$ concluir **Stop** (*check*) e verificar avanço imediato do **Cockpit** $\to$ resolver **Schedule Conflict** com **Cascade Shift** $\to$ excluir **Stop** e acionar **Desfazer** / **Adiantar em cascata** $\to$ filtrar **Places**, ordenar por distância de GPS e acionar **"Ver locais mais próximos"** $\to$ importar `.trip.json` com `id` existente e exercitar as 4 opções do diálogo de conflito.
3. **Quality Gate Bloqueante no GitHub Actions (`.github/workflows/ci.yml`) e Scripts de Validação**:
   - Scripts padronizados em `package.json`: `dev` (`vite`), `typecheck` (`tsc -b --pretty false`), `lint` (`oxlint --deny-warnings`), `test` (`vitest run`), `test:watch` (`vitest`), `test:coverage` (`vitest run --coverage`), `build` (`tsc -b && vite build`), `verify` (`npm run lint && npm run typecheck && npm run test:coverage && npm run build`) e `preview` (`vite preview`).
   - Pipeline executado em todo `push` e `pull_request` (checkout com `submodules: recursive` e Node cacheado) exigindo aprovação integral em: `npm ci`, auditoria de segurança (`npm audit --audit-level=high`), análise estática zero-warnings (`oxlint --deny-warnings`), verificação estrita de tipos (`tsc -b --pretty false`), suíte de testes unitários e de integração com cobertura V8 (`vitest run --coverage`) e build de produção com verificação programática dos artefatos PWA (`dist/index.html`, `dist/manifest.webmanifest` contendo `share_target` e `dist/sw.js`).

## Fora de Escopo

- Servidores de backend próprios, bancos de dados remotos ou contas/autenticação de usuários.
- Login OAuth com Google ou uso de APIs pagas do Google Cloud / Google Maps Platform (*Places API*, *Routes API*, *Geocoding API*, *Google Picker API*).
- Cadastro de **Place** por digitação solta de endereço sem link do Google Maps ou integração com geocodificadores do OpenStreetMap.
- Atividades que invadam ou alterem automaticamente a programação do dia seguinte ao atravessar `23:59` (os dias são estritamente isolados).
- Armazenamento de arquivos binários (PDFs/imagens) no estado da viagem ou campos extras de código de reserva offline fora dos links do Google Drive.
- Exportação ou formatação de impressão em PDF.
- Tombstones ou telas intermediárias de seleção de exclusões na mesclagem P2P (a mesclagem adota união direta por padrão).

## Notas Adicionais

- Documentação viva de domínio e decisões arquiteturais de referência:
  - Vocabulário canônico: [GLOSSARY.md](../../GLOSSARY.md)
  - ADRs: [0001-client-local-zero-backend.md](../../docs/adr/0001-client-local-zero-backend.md), [0002-zero-login-google-integrations.md](../../docs/adr/0002-zero-login-google-integrations.md), [0003-native-web-apis-and-minimal-dependencies.md](../../docs/adr/0003-native-web-apis-and-minimal-dependencies.md), [0004-unified-place-catalog-and-isolated-days.md](../../docs/adr/0004-unified-place-catalog-and-isolated-days.md) e [0005-vitest-happy-dom-and-ci-quality-gate.md](../../docs/adr/0005-vitest-happy-dom-and-ci-quality-gate.md).
