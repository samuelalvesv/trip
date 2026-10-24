# 07: Compartilhamento P2P (.trip.json e QR Code Offline), Resolução de Conflitos (Merge), PWA Offline-First e CI no GitHub Actions

**O que construir:** O viajante pode compartilhar sua **Trip** com amigos exportando o arquivo `.trip.json` (via gaveta nativa `navigator.share` entre iPhone e Android ou download direto) ou gerando um **QR Code** 100% offline na tela com os dados comprimidos (`Deflate` + `Base64URL`), e pode importar viagens lendo o QR Code pela câmera/imagem ou abrindo um `.trip.json`. Quando a **Trip** importada já existir no aparelho (mesmo `id`), um diálogo comparativo permite escolher entre **Substituir**, **Mesclar** (união padrão + `updatedAt` mais recente + preservação monotônica de `completed`), **Importar como outra viagem** ou **Cancelar**. A aplicação é empacotada como um PWA instalável completo (`manifest.webmanifest` com `share_target` + *Service Worker* offline-first) e protegida pelo pipeline bloqueante no GitHub Actions (`.github/workflows/ci.yml`).

**Blocked by:** 03: Descoberta por Proximidade ("Perto de Mim Agora"), Filtros de Place e "Ver locais mais próximos", 05: Painel Cockpit (Agora & Próximo), Schedule Conflict, Cascade Shift e Migração entre Dias, 06: Anexos do Google Drive (Drive Attachment), Trip Checklist, Exportação .ics (Google Agenda) e Layout Desktop Split-View

**Status:** ready-for-agent

- [ ] O viajante pode exportar a **Trip** em arquivo `.trip.json` (acionando `navigator.share({ files })` ou download direto) e exibir na tela o **QR Code** gerado offline (`qrcode`) a partir do payload comprimido com `CompressionStream('deflate-raw')` + `Base64URL`, oferecendo alternância para geração de QR Code por dia caso o payload completo ultrapasse ~1,5 KB.
- [ ] O viajante pode importar uma **Trip** selecionando um arquivo `.trip.json` ou escaneando um QR Code via câmera/imagem usando `jsqr` como caminho único determinístico, validando integralmente o contrato na fronteira de entrada (*Fail First*) antes de qualquer mutação de estado.
- [ ] Ao importar uma **Trip** cujo `id` já exista localmente, o sistema exibe o diálogo comparativo (*Versão Local* vs. *Versão Recebida* com `updatedAt` e contagens) oferecendo as 4 opções:
  1. **Substituir versão local**;
  2. **Mesclar com versão local** (expande `[startDate, endDate]` para a união dos períodos, mantém todos os itens exclusivos de qualquer um dos dois lados por padrão e, nos itens de mesmo `id` em `places`, `stops`, `attachments` e `checklist`, aplica o registro com `updatedAt` mais recente preservando `completed = local.completed || incoming.completed`);
  3. **Importar como outra viagem** (gera novo `id` único mantendo ambas no aparelho);
  4. **Cancelar**.
- [ ] O plugin `vite-plugin-pwa` gera em produção o `manifest.webmanifest` (com ícones *maskable*, cores sincronizadas e configuração `share_target`) e o *Service Worker* (`sw.js`) garantindo funcionamento 100% offline.
- [ ] O workflow `.github/workflows/ci.yml` executa em todo `push` e `pull_request` validando `npm ci`, `npm audit --audit-level=high`, `npm run lint`, `npm run typecheck`, `npm run test:coverage` (com *thresholds* V8) e `npm run build` (incluindo verificação programática de `dist/index.html`, `dist/manifest.webmanifest` e `dist/sw.js`).
- [ ] Testes unitários (codec `Deflate` + `Base64URL` e algoritmo `mergeTrips`) e testes de integração de interface cobrem a exportação, importação e os 4 caminhos de resolução de conflito.
