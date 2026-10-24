# Operação 100% Client-Local sem Backend ou Banco de Dados Remoto

Toda a persistência, validação, cálculo de linha do tempo e sincronização entre dispositivos do Trip ocorre exclusivamente no navegador do usuário via armazenamento local versionado, exportação de arquivo `.trip.json` e leitura óptica de QR Code comprimido (`Deflate` + `Base64URL`). Rejeitamos a criação de backend, banco de dados em nuvem e autenticação de contas para garantir funcionamento 100% offline durante viagens sem sinal de rede, custo operacional zero e privacidade imediata sem barreira de cadastro.
