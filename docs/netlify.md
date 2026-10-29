# Publicar o NEXUS HOME na Netlify

## Importar o repositório

1. Na Netlify, selecione **Add new project → Import an existing project → GitHub** (os nomes podem variar conforme a interface).
2. Autorize o acesso ao repositório `5an1ty/jarvis-senai` e selecione a branch `main`.
3. Use a **raiz do repositório** como Base directory (deixe vazio ou `.`). Não use `apps/web` como base: o lockfile e os workspaces estão na raiz.
4. Confira os valores detectados de `netlify.toml`:

   | Campo | Valor |
   | --- | --- |
   | Build command | `npm run build` |
   | Publish directory | `apps/web/.next` |
   | Node | `24` |
   | Framework | Next.js |

5. Inicie o deploy. A Netlify instala as dependências pelo `package-lock.json`, compila a web e aplica o runtime `@netlify/plugin-nextjs`. Não é necessário executar `next start` na Netlify.
6. Abra a URL HTTPS fornecida pela plataforma. Cada push em `main` passa a disparar um novo deploy.

Não configure `output: export`, diretório `out`, nem redirecionamento SPA `/* → /index.html`. O runtime Next.js gerencia as rotas e os assets. Não publique a raiz do repositório nem a pasta do backend.

## O que funciona sem configuração adicional

- `/`: site de apresentação responsivo, recursos e seção mobile.
- `/#mobile`: botão “faça download aqui”, por padrão para o APK assinado em `/downloads/nexus-home-1.0.0-arm64.apk`. O código-fonte permanece em link separado.
- `/app`: página de disponibilidade da central quando nenhuma API foi configurada; não faz chamadas a localhost em produção.
- Página 404 e navegação direta pelas rotas Next.js.

O APK é de instalação direta para Android 7.0+ ARM64 e está incluído no repositório, junto de seu checksum. Não há publicação nas lojas nem instalador iOS. A Netlify não precisa compilar Android ou acessar a chave privada. Para substituir o download por outra distribuição, defina `NEXT_PUBLIC_MOBILE_DOWNLOAD_URL` com o endereço verificado do APK ou da distribuição mobile.

## Habilitar o painel conectado

A Netlify hospeda a web Next.js. Este projeto FastAPI mantém sessões, estado, WebSockets e agendador em um processo persistente; ele **não é publicado automaticamente como função Netlify**.

1. Hospede `apps/api` em um serviço compatível com Python 3.12 e processo persistente, usando o Dockerfile existente ou as instruções do README. Execute um único worker e configure armazenamento persistente ou PostgreSQL. API e WebSocket devem usar HTTPS/WSS.
2. Na Netlify, em **Environment variables**, adicione `NEXT_PUBLIC_API_URL` com a URL HTTPS pública da API, sem barra final (exemplo: `https://api.seu-dominio.com`). Não inclua `/docs` ou `/home`.
3. No serviço da API, defina `CORS_ORIGINS` com a URL exata do site Netlify, sem barra final (exemplo: `https://nome-do-site.netlify.app`). Para múltiplas origens, separe por vírgula. Adicione explicitamente domínios próprios e previews que realmente precisem acessar a API.
4. Dispare um novo deploy: variáveis `NEXT_PUBLIC_*` são incorporadas ao build. Não coloque senhas ou tokens nessas variáveis.
5. Teste `/health` na API, entre em `/app` e execute um comando. Confira sincronização e falha de dispositivo offline.

A autenticação atual é uma demonstração aberta, com uma única residência fictícia. Ela não deve controlar hardware nem conter dados pessoais. Reiniciar a API invalida as sessões demo. Consulte `docs/architecture.md` antes de uso real.

## Validação realizada e limites

A tipagem e o build Next.js podem ser verificados com `npm run typecheck` e `npm run build`. O deploy real, URL pública, TLS e conexão com uma API hospedada devem ser confirmados após a importação na conta Netlify. Configuração no GitHub não significa site publicado.
