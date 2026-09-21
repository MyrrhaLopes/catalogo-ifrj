Sempre que você for pedido uma implementação de alguma feature ou recurso muito grande, pergunte sempre o *escopo*.
Exemplo: O usuário solicitou "Desenvolva a página de artigos". Antes de começar a implementação, devolva uma pergunta ao usuário nos moldes de: "Até onde quer que eu implemente? Rotas, hooks, chamadas de api"

Nunca edite arquivos autogerados.

Sempre rode `npx tsc --noEmit` ao final da sessão de implementação para garantir que não há nenhum erro de tipagem.

Quando implementando códigos que envolvão estruturas de dados, implemente testes unitários para garantir que tipos diversos de input levantem o tipo correto de resposta, inclusive erros.
