# Issue tracker: Local Markdown

Issues e especificações deste repositório vivem como arquivos Markdown em `.scratch/`.

## Convenções

- Uma funcionalidade por diretório: `.scratch/<feature-slug>/`
- A especificação fica em `.scratch/<feature-slug>/spec.md`
- As issues de implementação ficam em um arquivo por ticket em `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numerados a partir de `01`, nunca em um único arquivo combinado
- O estado de triagem é registrado como uma linha `Status:` no topo de cada arquivo de issue (consulte `triage-labels.md` para as strings de papéis)
- Comentários e histórico de conversação são adicionados ao final do arquivo sob o título `## Comments`

## Quando uma skill disser "publish to the issue tracker"

Crie um novo arquivo sob `.scratch/<feature-slug>/` (criando o diretório se necessário).

## Quando uma skill disser "fetch the relevant ticket"

Leia o arquivo no caminho referenciado. Normalmente o usuário informará o caminho ou o número da issue diretamente.

## Operações de Wayfinding

Utilizadas por `/wayfinder`. O **mapa** é um arquivo com um arquivo **filho** por ticket:

- **Map**: `.scratch/<effort>/map.md` (corpo com Notes / Decisions-so-far / Fog).
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numerado a partir de `01`, com a pergunta no corpo. Uma linha `Type:` registra o tipo do ticket (`research`/`prototype`/`grilling`/`task`); uma linha `Status:` registra `claimed`/`resolved`.
- **Blocking**: uma linha `Blocked by: NN, NN` próxima ao topo. Um ticket está desbloqueado quando todos os arquivos listados estiverem como `resolved`.
- **Frontier**: escaneie `.scratch/<effort>/issues/` buscando arquivos abertos, desbloqueados e não assumidos (`unclaimed`); o primeiro por número vence.
- **Claim**: defina `Status: claimed` e salve antes de iniciar o trabalho.
- **Resolve**: adicione a resposta sob o título `## Answer`, defina `Status: resolved` e adicione um ponteiro de contexto (resumo + link) às decisões em `map.md`.
