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

Abra com Expo Go compatível com SDK 53 ou um development build. Em telefone físico, localhost é o próprio telefone; use o IP da máquina que executa a API, com acesso na rede. A web e o mobile compartilham a residência simulada. App nativo ainda não validado em dispositivo: a tipagem e o bundle Android são as verificações possíveis nesta entrega.

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

A página inicial (`/`) apresenta o NEXUS HOME; o aplicativo web está em `/app`. Os botões de acesso abrem a residência simulada pela API existente.

A seção mobile contém **“faça download aqui”**. Por padrão, o link baixa o ZIP do repositório com o projeto Expo e informa que não é um APK. Ainda não existe instalador ou publicação nas lojas. Para usar um APK hospedado ou página oficial de distribuição, defina `NEXT_PUBLIC_MOBILE_DOWNLOAD_URL` antes de executar o build web. Use somente um endereço de distribuição verificado; variáveis `NEXT_PUBLIC_*` ficam públicas no navegador.
