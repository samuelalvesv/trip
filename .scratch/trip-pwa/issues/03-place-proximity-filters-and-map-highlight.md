# 03: Descoberta por Proximidade ("Perto de Mim Agora"), Filtros de Place e "Ver locais mais próximos"

**O que construir:** Na rua, o viajante pode acessar a aba de **Places (Locais)** da **Trip**, visualizar o status derivado de cada local no roteiro (`Fora do roteiro`, `Agendado` ou `Visitado`), filtrar os locais por status e busca textual, ordená-los pela distância exata da sua localização atual de GPS (100% offline via fórmula de Haversine) e clicar no botão **"Ver locais mais próximos"** para abrir a visão panorâmica do Google Maps com sua posição atual e os locais mais próximos **dentro do filtro selecionado** destacados na tela.

**Blocked by:** 02: Catálogo de Locais (Place) via Link do Google Maps e Web Share Target

**Status:** ready-for-agent

- [ ] Cada card de **Place** exibe sua etiqueta de status derivada automaticamente das paradas da viagem: **"Fora do roteiro"** (nenhuma parada vinculada), **"Agendado (Dia X • HH:mm)"** (ao menos uma parada pendente) ou **"Visitado ✓"** (todas as paradas vinculadas estão concluídas).
- [ ] O viajante pode filtrar a lista de **Places** pelas pílulas **`Não visitados`**, **`Fora do roteiro`**, **`Agendados no roteiro`**, **`Visitados`** e **`Todos`**, combinadas à busca por texto no nome, endereço ou observações.
- [ ] Ao acionar a ordenação por proximidade, o sistema obtém as coordenadas atuais do dispositivo via `navigator.geolocation.getCurrentPosition`, calcula a distância até cada **Place** via fórmula de Haversine, exibe a distância formatada em metros ou quilômetros (ex.: `a 350 m`, `a 1,4 km`) e ordena os locais do mais próximo ao mais distante.
- [ ] Caso a permissão de localização seja negada ou o GPS esteja indisponível, o sistema falha imediatamente na fronteira (*Fail Fast*) exibindo uma mensagem clara e amigável explicando como liberar o acesso à localização.
- [ ] O botão **"Ver locais mais próximos"** considera exclusivamente os **Places** que atendem ao filtro ativo, ordenados por proximidade, e gera links universais do Google Maps (`/maps/dir/?api=1&origin=<userLat,userLng>&waypoints=...&destination=...` **sem** `dir_action=navigate`) particionados em blocos de até 5 pontos no mobile (posição atual + até 4 locais por bloco), destacando-os na visão geral do mapa.
- [ ] Testes unitários (Haversine, derivação de status, filtragem e particionamento de URLs de proximidade) e testes de integração de interface validam todos os cenários acima.
