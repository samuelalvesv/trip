# 06: Anexos do Google Drive (Drive Attachment), Trip Checklist, Exportação .ics (Google Agenda) e Layout Desktop Split-View

**O que construir:** O viajante pode vincular e abrir links de documentos do Google Drive (**Drive Attachment** — ingressos, vouchers, reservas) na **Trip** geral, em um **Place** ou em uma **Stop** específica sem digitação manual (usando os atalhos **"Abrir Google Drive"**, **"Colar da Área de Transferência em 1 Toque"** ou compartilhando direto do app do Google Drive via *Web Share Target*), com *preview* embutido quando o link possuir identificador de arquivo. Pode também gerenciar o **Trip Checklist** geral de preparação da viagem, exportar toda a programação em arquivo `.ics` (RFC 5545) ou link individual para o Google Agenda, e utilizar a aplicação em telas maiores (`md`/`lg`) com layout responsivo em painéis paralelos (*Split-View*).

**Blocked by:** 04: Programação Diária de Paradas (Stop), Linha do Tempo Isolada, Conectores de Gap e Rotas no Google Maps

**Status:** ready-for-agent

- [ ] O viajante pode adicionar, editar e excluir **Drive Attachments** na **Trip**, em um **Place** e em uma **Stop**, validando na fronteira (*Fail First*) que a URL é um link `https://` íntegro.
- [ ] O componente de anexo oferece os botões **"Abrir Google Drive"** e **"Colar da Área de Transferência em 1 Toque"** (`navigator.clipboard.readText()`), além de capturar links do Google Drive recebidos via *Web Share Target* do PWA permitindo escolher onde salvar o anexo.
- [ ] Paradas e locais na linha do tempo e no **Cockpit** exibem pílulas de acesso rápido aos **Drive Attachments** (herdando também os anexos do **Place** vinculado), abrindo o link diretamente ou em modal de visualização embutida (`/file/d/<ID>/preview`) quando o `fileId` estiver presente na URL.
- [ ] O viajante pode criar, editar, marcar/desmarcar como concluído e excluir itens do **Trip Checklist** geral da viagem, acompanhando o indicador visual de progresso (`concluídos / total`).
- [ ] O viajante pode exportar todas as **Stops** da **Trip** (ou do dia ativo) em um arquivo `.ics` válido (RFC 5545) contendo título do **Place**, data, horário de início (`arrivalTime`), horário de término (`departureTime`), localização e descrição com observações e links do Google Drive, além de contar com o atalho individual de template do Google Agenda em cada **Stop**.
- [ ] Em viewports desktop (`md` e `lg`), a interface expande responsivamente para uma estrutura *Split-View* em painéis paralelos (navegação de viagens/dias à esquerda, linha do tempo ou catálogo de **Places** ao centro e painel complementar com **Trip Checklist**, cofre de **Drive Attachments** e exportações à direita).
- [ ] Testes unitários (parser do Drive e gerador RFC 5545 `.ics`) e testes de integração de interface validam todos os comportamentos acima.
