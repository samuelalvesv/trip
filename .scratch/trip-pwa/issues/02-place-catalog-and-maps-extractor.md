# 02: Catálogo de Locais (Place) via Link do Google Maps e Web Share Target

**O que construir:** O viajante pode cadastrar, listar, editar, copiar o endereço em 1 toque e excluir **Places (Locais)** no catálogo da **Trip** ativa (incluindo seu hotel, atrações, restaurantes e pontos de apoio). Todo cadastro de **Place** exige obrigatoriamente um link do Google Maps (seja o link curto de compartilhamento `maps.app.goo.gl` ou o link longo copiado do navegador), executando a requisição unificada de metadados públicos (`allorigins`) para extrair automaticamente as coordenadas geográficas obrigatórias (`lat, lng`), o nome sugerido e o endereço completo (com extração direta da URL longa quando offline e orientação *Fail Fast* no link curto), além de permitir abrir o local no Google Maps e receber links compartilhados diretamente do aplicativo nativo do Google Maps via *Web Share Target*.

**Blocked by:** 01: Fundação de Testes, Temas Claro Solar / Escuro OLED e Gestão de Viagens (Trip)

**Status:** ready-for-agent

- [ ] Na aba de **Places (Locais)** da **Trip** ativa, o viajante pode iniciar o cadastro de um novo **Place** colando um link do Google Maps (em campo direto ou botão **"Colar da Área de Transferência em 1 Toque"** via `navigator.clipboard.readText()`).
- [ ] Tanto o link curto (`https://maps.app.goo.gl/...`) quanto o link longo (`https://www.google.com/maps/place/...`) realizam a mesma requisição ao serviço público `allorigins` quando online, extraindo de maneira uniforme as coordenadas exatas do pino (`!3d<lat>!4d<lng>`, `@<lat>,<lng>` ou `q=<lat>,<lng>`), o nome sugerido e o endereço completo dos metadados (`og:title` / `description`).
- [ ] Quando o dispositivo está offline ou o serviço de metadados está indisponível:
  - Se o link informado for o link curto (`maps.app.goo.gl`), a validação falha imediatamente (*Fail Fast*) com mensagem clara orientando o viajante a colar o link longo do Google Maps;
  - Se o link informado for o link longo (`google.com/maps/place/...`), o sistema extrai o nome (`/maps/place/<Nome>/`) e as coordenadas exatas (`!3d<lat>!4d<lng>`) diretamente da estrutura textual da URL, permitindo concluir o cadastro e avisando que o endereço pode ser preenchido manualmente.
- [ ] Qualquer URL que não seja do Google Maps ou da qual não seja possível obter coordenadas válidas é rejeitada na fronteira (*Fail Fast*), garantindo que todo **Place** salvo possua `coordinates: { lat, lng }` válidas.
- [ ] O viajante pode editar o nome e o endereço extraídos, preencher opcionalmente o **Horário de Funcionamento** (`openingHours`) e **Observações** (`notes`), abrir o **Place** no Google Maps, copiar o endereço/local em 1 toque (para colar em Uber/99) e excluir o **Place** (com opção **"Desfazer"** no `Snackbar`).
- [ ] Quando o aplicativo é aberto com parâmetros de *Web Share Target* (`share_url` ou `share_text`) contendo um link do Google Maps, o formulário de criação de **Place** abre automaticamente preenchido com os dados extraídos e limpa a query string da barra de endereços.
- [ ] Testes unitários do extrator de links do Google Maps e testes de integração de interface cobrem os fluxos online, offline e *Fail Fast*.
