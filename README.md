# ⌘ NEXUS HOME

Central residencial com interface cyberpunk em português, API persistente e simulador IoT. **Todos os dispositivos e sensores são virtuais.** Sem chaves pagas, hardware ou LLM para executar a demonstração.

## Executar localmente

Requisitos: Node 24, npm 11 e Python 3.12. Use o checkout existente; cada tarefa de nuvem já é isolada e não requer worktree.

```bash
npm ci
python -m venv .venv
.venv/bin/pip install -r apps/api/requirements.txt
PYTHONPATH=apps/api .venv/bin/uvicorn nexus.main:app --host 0.0.0.0 --port 8000
```

Em outro terminal, na raiz:

```bash
npm run dev:web
```

Abra a web na porta 3000 e escolha “Explorar residência de demonstração”. API e documentação OpenAPI na porta 8000 (`/docs`). O banco SQLite é criado automaticamente na raiz e ignorado pelo Git. Use `DATABASE_URL` para PostgreSQL. Tokens demo expiram quando a API reinicia; entre novamente.

### Mobile Expo

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8000 npm run dev:mobile
```

Para desenvolvimento, abra com Expo Go compatível com SDK 53 ou um development build. Para instalar diretamente no Android, use o APK disponível na seção mobile do site ou em `apps/web/public/downloads/nexus-home-1.0.0-arm64.apk`. Em telefone físico, localhost é o próprio telefone; use o IP da máquina que executa a API, com acesso na rede. A web e o mobile compartilham a residência simulada. O APK release foi compilado e sua assinatura verificada; ainda não houve teste de uso em aparelho físico. Ele inclui demonstração local sem internet e conexão opcional com uma API HTTPS.

### PostgreSQL e Docker

O Compose fornecido é uma opção de infraestrutura, ainda não executada nesta validação. Crie `.env` a partir de `.env.example`, adicione `POSTGRES_PASSWORD` local e execute `docker compose up --build`. Não versione esse arquivo. URLs web são incorporadas no build; ajuste para seu ambiente antes de compilar. HTTPS deve ser provido por proxy de produção. Não publique a autenticação demo como autenticação real.

## Roteiro da demonstração

1. **Dispositivos:** ligue/desligue luzes e tomada; ajuste brilho e cor. Os estados persistem.
2. **NEXUS AI:** “Acenda a luz da sala”, “Agora diminua para 40%”, “E deixe azul”. O contexto é por sessão. Microfone somente ao clicar; voz e reconhecimento dependem do suporte do navegador. Ative “Resposta por voz” para TTS.
3. **Geladeira & compras:** edite quantidades e gere a lista com base nos mínimos. Compartilhar usa o recurso do dispositivo ou copia; não afirma envio sem confirmação.
4. **Hábitos & insights:** autorize aprendizado e simule três dias de café. A sugestão explica a regra, permite recusa ou agendamento às 15h. Nenhum equipamento físico é acionado.
5. Abra duas sessões/clientes; uma alteração é transmitida por WebSocket e recuperada por polling se necessário.
6. Em Dispositivos, simule a desconexão da luz. Um comando falha explicitamente sem registrar sucesso.
7. Desative o aprendizado em Configurações. A geração de hábitos é bloqueada, novos eventos não são destinados à personalização; histórico pode ser excluído.

## Validação

```bash
PYTHONPATH=apps/api .venv/bin/pytest apps/api/tests -q
npm run typecheck
npm run build
# Com API e web rodando; requer Chromium (CHROMIUM_PATH configurável):
node scripts/smoke.mjs
```

A suíte cobre intenções contextuais, inventário/compras, consentimento, café, recusa, agendamento, falha offline, autenticação demo, validação, persistência e sincronização WebSocket. Não valida áudio físico, streaming, hardware ou builds iOS.

O smoke de navegador também valida duas sessões, comandos contextuais, sugestão de café, compras e layout de 390 px. A exportação Android passou; áudio físico e runtime nativo continuam sem validação.

## Estrutura

- `apps/api`: FastAPI, SQLAlchemy, simulador, parser de intenções, scheduler e testes.
- `apps/web`: Next.js, interface responsiva, núcleo animado, voz web e controles reais do simulador.
- `apps/mobile`: Expo Router/React Native, cinco seções e acesso ao mesmo backend.
- `packages/contracts`: contratos TypeScript e tokens compartilhados.
- `docs/architecture.md`: limites, decisões e próximas fases.

A versão atual **não** oferece autenticação de produção, controle físico de dispositivos, migrações relacionais completas ou todas as telas solicitadas. Consulte a arquitetura antes de expandir ou integrar hardware.

## Site e download mobile

A página inicial (`/`) apresenta o NEXUS HOME. Os botões de acesso abrem a residência de demonstração em `/demo`, executada no próprio navegador. O aplicativo conectado à API continua em `/app`, que mostra a mesma demonstração local quando não há API configurada.

A seção mobile contém **“faça download aqui”**. Por padrão, o link baixa o **APK Android 1.0.0 assinado** para ARM64 e Android 7.0 ou superior (aproximadamente 13,3 MB). Não precisa de Expo Go. O código-fonte continua disponível em link separado. Não há publicação nas lojas nem instalador iOS. Para usar um APK hospedado ou página oficial de distribuição, defina `NEXT_PUBLIC_MOBILE_DOWNLOAD_URL` antes de executar o build web. Use somente um endereço de distribuição verificado; variáveis `NEXT_PUBLIC_*` ficam públicas no navegador.

## Publicar na Netlify

O repositório inclui `netlify.toml`: conecte `5an1ty/jarvis-senai`, branch `main`, com a base na raiz. O build é `npm run build` e a publicação é `apps/web/.next` (Node 24). Não use `index.html` nem pasta `out`; o runtime Next.js cuida das rotas.

O site e a residência virtual `/demo` publicam sem API. O botão de demonstração abre `/demo`; `/app` também usa essa residência quando nenhuma API estiver configurada. Para habilitar a residência conectada em `/app`, hospede o backend separadamente e configure `NEXT_PUBLIC_API_URL` na Netlify e `CORS_ORIGINS` na API. Em produção, nenhuma URL localhost é usada como fallback. Consulte o [guia de publicação](docs/netlify.md) para o passo a passo e a configuração do download mobile.

## APK Android

O APK, o checksum SHA-256 e os metadados da versão estão em `apps/web/public/downloads`. O botão do site usa `/downloads/nexus-home-1.0.0-arm64.apk`; a Netlify publica o instalador como arquivo estático no próximo deploy da branch `main`. Se houver um override antigo em `NEXT_PUBLIC_MOBILE_DOWNLOAD_URL`, remova-o e refaça o deploy para usar o APK incluído.

No primeiro acesso ao app, escolha **Explorar demonstração sem internet**. Esse modo é explicitamente local, não controla hardware nem sincroniza com a web e reinicia os dados ao encerrar o processo. Para sincronização, informe uma API NEXUS acessível por HTTPS.

A compilação no GitHub Actions terminou com sucesso, os quatro testes do simulador passaram, o APK passou em `apksigner verify` e o pacote declara Android mínimo 24/7.0, versão 1.0.0 e ABI `arm64-v8a`. Instalação em telefone físico ainda não foi validada.

Veja [assinatura, instalação e reprodução do build](docs/android.md). A chave privada fica fora do repositório e precisa ser preservada com segurança para futuras atualizações.

## Residência de demonstração no site

A rota `/demo` funciona na Netlify sem backend, credenciais ou acesso a dispositivos físicos. O botão **Explorar residência de demonstração** da página inicial abre essa rota.

- Duas lâmpadas: ON/OFF, seis cores rápidas, seletor de cor personalizada e brilho.
- Duas tomadas: ON/OFF e indicação de potência nominal simulada.
- Geladeira: oito alimentos com quantidades editáveis, estoque mínimo e estados disponível, baixo ou em falta.
- Lista de compras ao lado: calcula automaticamente a diferença entre quantidade e mínimo. Permite copiar a lista e selecionar itens para uma **reposição simulada**, que atualiza o estoque virtual.
- Dados salvos em `localStorage`, com validação de dados, sincronização entre abas do mesmo navegador e opção **Restaurar demonstração**. Se o armazenamento estiver bloqueado, o uso continua somente na sessão. Não há sincronização dessa residência com o app Android ou com uma API.

Validação de navegador, com a web rodando na porta 3000 (ou configure `DEMO_URL`):

```bash
npm run test:demo
```

O teste cobre entrada pela landing page, os quatro controles, cores, inventário, compras, cópia, reposição, persistência, sincronização entre abas, armazenamento inválido e layout responsivo. Requer Chromium, com caminho opcional em `CHROMIUM_PATH`. `scripts/smoke.mjs` continua sendo o teste separado da residência conectada à API em `/app`.
