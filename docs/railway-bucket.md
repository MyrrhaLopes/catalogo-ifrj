# Bucket de imagens no Railway

As fotos enviadas pelo editor de artigos (botão **Enviar** no bloco de imagem) são
gravadas num Storage Bucket do Railway (compatível com S3). O bucket é privado: o
backend serve cada imagem por `GET /api/v1/media/species/<id>/<arquivo>`, que
redireciona para uma URL pré-assinada válida por 1 hora.

## 1. Criar o bucket

1. Abra o projeto no Railway.
2. Clique em **+ Create** (ou **New**) → **Bucket**.
3. Escolha a região (a mais próxima do serviço da aplicação) e dê um nome, ex.: `imagens`.
4. Clique em **Deploy** / confirme as mudanças do canvas.

## 2. Conferir as credenciais

Abra o bucket → aba **Credentials**. Ela lista as variáveis:

| Variável do bucket   | Exemplo                       |
|----------------------|-------------------------------|
| `BUCKET`             | `imagens-a1b2c3` (nome global para a API S3) |
| `ENDPOINT`           | `https://storage.railway.app` |
| `REGION`             | `auto`                        |
| `ACCESS_KEY_ID`      | `...`                         |
| `SECRET_ACCESS_KEY`  | `...`                         |

Use `BUCKET`, **não** `RAILWAY_BUCKET_NAME` (esse é só o nome de exibição).

## 3. Ligar o bucket ao serviço da aplicação

No serviço do backend → aba **Variables** → **New Variable** (ou **Raw Editor**) e
adicione referências ao bucket (troque `imagens` pelo nome do seu bucket no canvas):

```env
S3_BUCKET=${{imagens.BUCKET}}
S3_ENDPOINT=${{imagens.ENDPOINT}}
S3_REGION=${{imagens.REGION}}
S3_ACCESS_KEY_ID=${{imagens.ACCESS_KEY_ID}}
S3_SECRET_ACCESS_KEY=${{imagens.SECRET_ACCESS_KEY}}
```

Usar referências (`${{...}}`) em vez de copiar os valores faz o serviço acompanhar
automaticamente uma rotação de credenciais. Salve e faça o redeploy.

### Endereçamento (path-style)

Por padrão o cliente usa URLs *virtual-hosted* (`https://<bucket>.storage.railway.app/...`),
que é o que a documentação atual do Railway indica. Se o upload falhar com erro de
DNS/host ou `NoSuchBucket`, adicione também:

```env
S3_FORCE_PATH_STYLE=true
```

## 4. Desenvolvimento local

Coloque as mesmas variáveis no `.env` (com os valores copiados da aba Credentials,
já que as referências `${{...}}` só funcionam dentro do Railway) e rode
`npm run dev-backend`. Sem essas variáveis o resto da aplicação funciona normalmente;
só as rotas de mídia respondem `503 armazenamento de mídia não configurado`.

## 5. Testar

1. Entre como admin e abra o artigo de uma espécie em modo de edição.
2. Adicione um bloco **Imagem** → **Enviar**.
3. No celular, o botão abre o seletor nativo (câmera ou galeria); no computador,
   o explorador de arquivos.
4. Escolha a origem (**Referência online** ou **Foto do acervo**), preencha os campos
   e envie. A imagem entra no bloco e também na galeria da espécie.

## Limites e comportamento

- Formatos: JPG, PNG, WEBP, GIF, AVIF. Tamanho máximo: 10 MB.
  (No iPhone o Safari normalmente converte fotos HEIC para JPEG no envio; se
  vier HEIC, o formulário avisa que o formato não é suportado.)
- Chave no bucket: `species/<speciesId>/<uuid>.<ext>`.
- Excluir a imagem pelo painel admin também remove o arquivo do bucket.
