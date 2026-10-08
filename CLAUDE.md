Sempre que você for pedido uma implementação de alguma feature ou recurso muito grande, pergunte sempre o *escopo*.
Exemplo: O usuário solicitou "Desenvolva a página de artigos". Antes de começar a implementação, devolva uma pergunta ao usuário nos moldes de: "Até onde quer que eu implemente? Rotas, hooks, chamadas de api"

Nunca edite arquivos autogerados.

Sempre rode `npx tsc --noEmit` ao final da sessão de implementação para garantir que não há nenhum erro de tipagem.

Quando implementando códigos que envolvão estruturas de dados, implemente testes unitários para garantir que tipos diversos de input levantem o tipo correto de resposta, inclusive erros.

## Feature folder contract

Backend: `src/backend/http/features/<name>/`
- `<name>.route.ts` — Express router, sem lógica de negócio
- `<name>.service.ts` — todo acesso ao DB e regras de negócio
- `<name>.schema.ts` — schemas Zod para validação de request/response

Frontend: `src/frontend/features/<name>/`
- `hooks/` — custom hooks da feature
- `api/` — chamadas fetch da feature
- `components/` — componentes escopados à feature

## Arquivos autogerados

Nunca edite arquivos em `src/frontend/components/ui/` — gerados pelo shadcn/ui.

## Regras de componente

- Máximo de 150 linhas por arquivo de componente. Extraia antes de adicionar.
- Pages apenas compõem features. Sem lógica de negócio, sem loading states inline.
- Lógica de negócio (async multi-step, dados derivados, loops) vai em um hook na pasta `hooks/` da feature.
- Um componente, uma responsabilidade. Modais são arquivos separados. Inputs complexos são arquivos separados.
- Props passadas por mais de duas camadas sem serem usadas pela camada intermediária → introduza um React context.
- Estrutura JSX repetida → extraia como componente nomeado antes de continuar.
- Use `pendingComponent` / `errorComponent` na definição de rota para estados de loading/erro.
- Envolva toda page em `<PageShell>`. Nunca renderize `<CatalogHeader>` diretamente em uma page.

## Tipos de componente

| Tipo    | Pasta                                    | Regra                                  |
|---------|------------------------------------------|----------------------------------------|
| Page    | src/frontend/pages/                      | Apenas compõe features                 |
| Feature | src/frontend/features/<name>/components/ | Pode usar os hooks da própria feature  |
| Layout  | src/frontend/components/layout/          | Sem data fetching, sem hooks           |
| UI      | src/frontend/components/ui/              | Sem domain knowledge                   |

## Aliases de importação

- `@/` → `src/`
- `@/lib/utils` → `cn()` (padrão shadcn — use este, não `@/frontend/shared/utils`)
- `@/frontend/components/ui/` → componentes shadcn/ui
- `@/backend/db/drizzle` → cliente do banco de dados

## Naming conventions

- Hooks: `use<NomeDaFuncionalidade>` em `hooks/` da feature
- API files: `<feature>.api.ts` em `api/` ou raiz da feature
- Rotas: `<feature>Route` exportado de `pages/<FeaturePage>.tsx`
- Contextos: `<Nome>Context.tsx` em `context/` da feature

## State management

- Estado de servidor: TanStack Query (`useQuery`, `useMutation`) — nunca `useState` para dados do servidor
- Estado de UI: `useState` / `useReducer` local no componente
- Estado compartilhado entre features: React Context em `context/` da feature

## Tecnologias principais

- **Routing**: TanStack Router — `src/frontend/router.ts`; rotas definidas via `createRoute` nas pages
- **Server state**: TanStack Query v5 — provider no `rootRoute.tsx`
- **UI**: shadcn/ui — componentes em `src/frontend/components/ui/` (autogerados, nunca editar)
- **Drag and drop**: @dnd-kit/core + @dnd-kit/sortable
- **Validação**: Zod — schemas em `*.schema.ts`
- **ORM**: Drizzle ORM — schema em `src/backend/db/schema.ts`
- **Backend**: Express.js

## Proteção de rotas

Use `requireAuth()` / `requireAdmin()` de `src/frontend/shared/auth.ts` no `beforeLoad` de rotas protegidas. Não duplique o padrão de fetch manual para `/api/v1/sessions/`.

## Toast / notificações

Use `useToast()` de `@/frontend/shared/context/ToastContext`.
