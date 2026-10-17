# Domain Docs

Como as skills de engenharia consomem e mantêm a documentação de domínio deste repositório ao explorar a base de código.

## Leitura antes da exploração

- **`GLOSSARY.md`** na raiz do repositório, ou
- **`GLOSSARY-MAP.md`** na raiz do repositório se existir: aponta para um `GLOSSARY.md` por contexto. Leia cada um relevante ao tópico.
- **`docs/adr/`**: leia as ADRs que tocam na área em que você vai trabalhar. Em repositórios multi-contexto, verifique também `src/<context>/docs/adr/`.

Se algum desses arquivos não existir, **prossiga silenciosamente**. Não sinalize sua ausência nem sugira criá-los antecipadamente. A skill `/domain-modeling` (acionada via `/grill-with-docs` e `/improve-codebase-architecture`) os cria sob demanda quando os termos ou decisões forem efetivamente consolidados.

## Estrutura de arquivos

Repositório de contexto único (*single-context*):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-exemplo-decisao.md
│   └── 0002-outra-decisao.md
└── src/
```

## Uso do vocabulário do glossário

Quando sua saída nomear um conceito de domínio (em título de issue, proposta de refatoração, hipótese ou nome de teste), utilize o termo exato definido em `GLOSSARY.md`. Não derive para sinônimos que o glossário evita explicitamente.

Se o conceito necessário ainda não estiver no glossário, isso é um sinal: ou você está inventando linguagem que o projeto não usa (reconsidere) ou existe uma lacuna real (registre para `/domain-modeling`).

## Sinalização de conflitos com ADRs

Se sua saída contradisser uma ADR existente, explicite o conflito em vez de sobrescrevê-la silenciosamente:

> _Contradiz a ADR-0001 (...), mas vale reabrir porque…_
