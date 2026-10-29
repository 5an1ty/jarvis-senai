# Android: APK instalável e assinatura

## Versão distribuída

- Aplicativo: NEXUS HOME 1.0.0 (`home.nexus.app`, versionCode 1).
- Compatibilidade: Android 7.0/API 24 ou superior, processadores ARM64 (`arm64-v8a`). Não é um APK para aparelhos de 32 bits ou emuladores x86.
- Build release com bundle JavaScript/Hermes incorporado. Não requer Metro nem Expo Go.
- Assinado com chave privada de distribuição NEXUS HOME; não é uma publicação na Google Play.
- Arquivo público: `apps/web/public/downloads/nexus-home-1.0.0-arm64.apk`. O arquivo `.sha256` ao lado permite conferir a integridade.

## Instalar no telefone

1. Na seção mobile do site, toque em **faça download aqui**.
2. Abra o APK baixado. Se o Android solicitar, autorize temporariamente o navegador a instalar aplicativos desta fonte.
3. Conclua a instalação e abra NEXUS HOME. Depois, você pode desativar novamente essa autorização nas configurações do aparelho.
4. Escolha **Explorar demonstração sem internet** para usar os dispositivos virtuais, chat contextual, lista de compras e demonstração do café.

A demonstração local é identificada como **DEMO LOCAL** e mantém dados somente na sessão: fechar o processo reinicia os dados. Os agendamentos virtuais locais só são verificados enquanto o app está aberto. Não há controle de dispositivos físicos nem sincronização com a web nesse modo. A síntese de voz depende da voz pt-BR disponível no Android; o ditado é fornecido pelo teclado.

Para compartilhar a residência com a web, informe a URL HTTPS de uma API NEXUS hospedada e toque em **Conectar à minha API**. A API precisa estar acessível pelo telefone. Não utilize localhost do computador como endereço no aparelho. A autenticação continua sendo a demonstração aberta descrita na arquitetura.

## Build no GitHub Actions

Para builds dentro deste ambiente de nuvem, o domínio `repo.reactnative.dev` precisa estar liberado: o Maven redireciona os AARs de React Native/Hermes para ele. A adição foi salva no rascunho de rede; revise e salve nas configurações do ambiente e publique o ambiente para aplicá-la. A alternativa abaixo utiliza o CI do próprio repositório.

Na aba Actions do GitHub, abra **Build Android APK → Run workflow** na branch `main`. O workflow é manual para evitar recompilar o Android em cada publicação do site.

O workflow `.github/workflows/android-apk.yml` compila o aplicativo no runner Android do GitHub e publica o APK **sem assinatura** na branch `android-apk-output`, junto de `build-info.json` com o commit de origem e o checksum. Essa branch é uma saída técnica, não um instalador e não aciona o deploy de produção da web. A assinatura final é feita separadamente usando a chave privada local.

Depois de conferir o commit e o SHA-256, use `bash scripts/sign-android-apk.sh /caminho/app-sem-assinatura.apk` com as variáveis de SDK e assinatura abaixo. Não distribua o arquivo sem assinatura como aplicativo instalável.

## Reproduzir o build

Requisitos: Node 24, npm, JDK 17, Android SDK platform 35, build-tools 35.0.0, NDK 27.1.12297006 e CMake 3.22.1, com as licenças do SDK aceitas. O Gradle 8.13 é obtido pelo wrapper com checksum SHA-256 fixado.

```bash
npm ci
npm run test:mobile
npm run typecheck

# Configure caminhos da sua máquina. Nunca versione os arquivos de assinatura.
export JAVA_HOME=/caminho/do/jdk17
export ANDROID_HOME=/caminho/do/android-sdk
export NEXUS_KEYSTORE=/local/privado/nexus-home-release.jks
export NEXUS_PASSWORD_FILE=/local/privado/store-password
npm run build:apk
```

A chave deve usar o alias `nexus-home`. `NEXUS_PASSWORD_FILE` contém a senha do keystore e da chave, com permissões restritas. A primeira chave desta distribuição foi gerada fora do checkout, em `/workspace/.nexus-signing`, e não foi enviada ao GitHub nem incluída no download. Preserve-a em armazenamento seguro para futuras atualizações do mesmo app; uma assinatura diferente exige desinstalar a versão anterior. Não coloque a chave ou a senha no diretório público, no ZIP de fontes ou em variáveis `NEXT_PUBLIC_*`.

O script gera o APK sem assinatura pelo Gradle, alinha o ZIP, assina externamente com `apksigner`, verifica a assinatura e escreve o SHA-256. A chave não é necessária para `npm run build` na Netlify: o APK final é um arquivo estático já preparado.

O diretório `apps/mobile/android` está versionado e inclui o ícone nativo e a configuração de assinatura externa. Não rode `expo prebuild --clean` sem preservar essas personalizações.

## Publicação na web

O Next.js serve `public/downloads` no caminho `/downloads`. O APK e seu checksum são enviados ao GitHub junto com o site; a Netlify publica esses arquivos no próximo deploy de `main`. A variável `NEXT_PUBLIC_MOBILE_DOWNLOAD_URL` pode substituir o link, mas deve ser removida se ainda apontar para o ZIP antigo.

Para uma nova versão, incremente `versionCode` e `versionName`, atualize o nome do arquivo no script e no site e assine com a mesma chave. Os APKs versionados podem ter cache imutável; não substitua um arquivo publicado por outro conteúdo com o mesmo nome.

## Limites da validação

A compilação e a verificação criptográfica não substituem um teste de instalação e uso em telefone físico. Não há evidência de validação em aparelho nesta entrega. Nenhum APK iOS é fornecido; iOS usa um processo separado de assinatura e distribuição.

O pacote desta versão foi compilado pelo run [40820876161](https://github.com/5an1ty/jarvis-senai/actions/runs/40820876161), a partir do commit `2b7497e797417c575aa4d6985c1e44db6a27af0d`. Os metadados públicos estão em `apps/web/public/downloads/android-release.json`. O manifesto final inclui permissões de armazenamento legado herdadas das bibliotecas Expo; a interface do app não solicita acesso a fotos ou arquivos pessoais.
