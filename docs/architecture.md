# Arquitetura e limites da primeira versão

NEXUS HOME v0.1 é um MVP demonstrável, não um controlador residencial de produção.

## Fluxo implementado

Web (Next.js) e mobile (Expo Router) → HTTP autenticado por sessão de demonstração → FastAPI → interpretação determinística → validação de capacidades e parâmetros → simulador → confirmação → persistência SQLAlchemy → WebSocket. Há polling de recuperação nas duas interfaces. Voz web é opcional e usa Web Speech API, dependendo de navegador, permissão e serviço de reconhecimento do sistema. Não existe escuta permanente. Nenhum LLM ou API paga é necessário.

A API gera tokens aleatórios por sessão, mantidos em memória; reiniciar exige novo login. O login demo é aberto por definição e todos os tokens acessam a mesma casa fictícia. Não use este modo com dispositivos reais nem exponha a API publicamente sem proteção adicional. CORS é limitado por configuração. Não há cadastro real, autorização granular, múltiplas casas ou política LGPD completa implementados.

A persistência atual usa um documento por residência em tabela SQL, com SQLite por padrão e driver PostgreSQL disponível. A criação de tabela é idempotente, mas **não substitui migrações relacionais versionadas**. O backend deve rodar com um único worker: estado e sessões ficam em memória. O histórico operacional mantém até 1.000 registros; eventos só recebem a marca de personalização quando há consentimento. A exclusão remove histórico e sugestões, não cancela agendamentos já autorizados.

## Proatividade

O simulador injeta três eventos históricos de café às 15h nos três dias anteriores. A análise usa o quarto dia às 14h, janela de ±20 minutos e exige consentimento. Uma sugestão pendente é criada, com explicação. Recusas permanecem registradas e evitam repetição. Aceitar cria agendamento para a próxima ocorrência real das 15h no fuso America/Sao_Paulo. O loop de 5 segundos executa e confirma no simulador; dispositivos offline causam status failed. Não há retroexecução física: tudo continua virtual. O serviço precisa estar rodando. O algoritmo só é invocado pela ferramenta de demonstração nesta versão; análise periódica de padrões reais é uma próxima etapa.

## Integrações

`nexus/adapters.py` define confirmação tipada e fronteiras de MQTT/Home Assistant. As classes retornam falha explícita porque essas integrações ainda não estão implementadas. Matter depende de uma bridge/controlador futuro. Nenhum placeholder retorna sucesso. Simulador e orquestração atuais permanecem no módulo principal; extrair repositórios e serviços é necessário antes de ampliar o produto.

## Próximas fases

- Separar módulos e serviços; normalizar Users, Homes, memberships, Rooms, Devices, capabilities, states, events, automations, executions, preferences, patterns, suggestions, notifications, conversations, messages, shopping, inventory e camera events com Alembic, índices e isolamento por residência.
- Autenticação OIDC, RBAC por dispositivo, criptografia, retenção configurável e gestão de credenciais antes de habilitar hardware.
- MQTT TLS com ACK correlacionado e timeout; Home Assistant com HTTPS, allowlist de serviços e permissões; streaming autenticado.
- Construtor visual CRUD de automações, execução transacional/compensação de cenas, cancelamento de agendamentos, quiet hours e limites configuráveis de notificações.
- STT nativo Expo, histórico conversacional persistido, push, notificações, cadastro/onboarding e telas mobile restantes.
- Adaptador LLM configurável com ferramentas tipadas, sem execução irrestrita.
- Testes em dispositivos Android/iOS e teste visual automatizado; auditoria de acessibilidade e segurança.

Não foram implementadas nem declaradas concluídas as sete fases completas do escopo original. Esta entrega prioriza o núcleo funcional em modo de demonstração.

## Demonstração web independente

`apps/web/components/residence-demo.tsx` e `apps/web/lib/residence-demo.ts` fornecem a residência local da rota `/demo`. A landing direciona o usuário para essa rota. A rota `/app` mantém a central FastAPI quando uma API está configurada e oferece a residência local quando não está. Os modos permanecem identificados como simulação.

A demonstração web armazena somente os estados de duas lâmpadas, duas tomadas e quantidades dos alimentos no navegador. A lista de compras é derivada dos mínimos, sem estado duplicado. A validação de `localStorage` recupera o estado inicial quando os dados são inválidos; falhas de armazenamento mantêm o uso em memória. Eventos `storage` sincronizam abas da mesma origem. Esses dados não são compartilhados com a API, o APK ou outros aparelhos e não representam estoque físico detectado por sensores.
