
# TODO:
1. - [ ] Definir testes de serviços e utils;
    1. - [ ] Definir testes para parsing de article contents;
    2. - [ ] Definir testes para construção de nome científico a partir de taxonomy;
2. - [ ] Segregar componentes React da página de visualização de artigos;
     1. - [ ] Segregar componentes de Artigo para sua pasta;
3. - [ ] Definir parsers zod para validar content de artigos;
4. - [ ] Criar skills para padronizar fluxo de criação de rotas, serviços e páginas;

# Descrição geral
## Objetivo do projeto

## Tecnologias utilizadas:
- React: Frontend declarativo
- ShadCN: biblioteca de componentes com suporte ao teclado e estilo padronizado
- Postgres: banco de dados relacional
- Drizzle: ORM (facilitar migrations, declaração de schema da db em typescript com tipagem automática),
- Express: criação de rotas e middlewares,
- Zod: validação com conversão de atributos de payload de requisição,
- Tanstack Router: Roteamento de front-end para visualizações baseada em url e proteção de de páginas,
- Tanstack Query: caching e revalidação inteligentes pro front-end,

# Passo-a-passo para instalar e rodar localmente:
REQUISITOS:
- ter o psql (PostgreSQL) 18.4 instalado;
- ter o node v22.23.1 instalado

1. instale os pacotes necessários rodando:
`npm install`

2 Configure as seguintes variáveis de ambiente em `.env` na raiz do projeto:
`DATABASE_URL=postgresql://{usuario}:{senha}@localhost:5432/{nome_do_banco}`
substitua os valores em chaves pelos valores correspondentes. nome_do_banco diz respeito ao nome do banco de dados criado a partir do psql com `CREATE DATABASE nome_do_banco;`

3 Suba o schema da base de dados (garanta que o psql esteja rodando):
`npx drizzle-kit push`

4 Rode o servidor backend com: `npm run dev-backend`

5 Em outro terminal, rode a interface web com `npm run dev`

# Estrutura de pastas:

O projeto utiliza uma estrutura monorepo com frontend e backend dentro da mesma pasta `src/`:

```
src/
├── backend/
│   ├── db/
│   │   └── migrations/
│   └── http/
│       ├── features/         # organizado por domínio (ex: species, specimen, users)
│       │   └── <feature>/
│       └── middleware/
├── frontend/
│   ├── features/             # lógica de UI por domínio (hooks, componentes locais)
│   │   └── <feature>/
│   ├── pages/
│   └── shared/               # utilitários e chamadas HTTP compartilhados
└── components/
    └── ui/                   # componentes genéricos do shadcn/ui
```

# Segurança Aplicada

| Medida | Como foi implementada |
| --- | --- |
| **Hash de senhas** | bcrypt com salt factor 10 — a senha nunca é armazenada em texto puro |
| **Proteção de rotas** | Middleware `authorizeUser` valida o cookie de sessão antes de qualquer rota privada |
| **Sessão stateful via cookie httpOnly** | O token de sessão (UUID) é enviado num cookie `httpOnly`, inacessível a JavaScript no browser, mitigando XSS |
| **Cookie `sameSite: lax`** | Reduz a superfície de ataques CSRF em navegação cruzada |
| **Expiração server-side** | Validade de 7 dias calculada e verificada no banco — invalidar a sessão no servidor encerra o acesso imediatamente |
| **Isolamento por usuário** | Todas as queries incluem `userId` como filtro — um usuário não consegue ler, editar ou deletar registros de outro mesmo conhecendo o UUID |
| **Validação de input** | Zod valida e coerce todos os payloads antes de qualquer acesso ao banco |
| **Proteção contra SQL Injection** | Drizzle ORM usa queries parametrizadas — não há interpolação de strings em SQL |
| **Sem exposição do hash** | `password_hash` nunca é retornado nas respostas da API |
