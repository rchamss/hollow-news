# AGENTS.md

Este documento reúne o contexto estrutural e as convenções do repositório **Hollownews** para orientar agentes de código com informações estáveis e fáceis de conferir diretamente nos arquivos de configuração.

## Propósito do Projeto

O **Hollownews** é um projeto educacional do **curso.dev** (com apoio de Filipe Deschamps). Sua finalidade é construir uma rede social fictícia ambientada no universo do jogo *Hollow Knight*, na qual usuários assumem personagens inexistentes e interagem dentro desse cenário.

Consulte o [README.md](./README.md) para a descrição oficial do projeto.

## Organização do Repositório

- `pages/`: Páginas React e rotas da API utilizando o **Pages Router** do Next.js.
  - `pages/api/v1/`: Endpoints versionados da API REST (ex.: `status`, `migrations`).
- `infra/`: Camada de infraestrutura, serviços locais e acesso a dados.
  - `infra/compose.yaml`: Definição dos serviços locais em Docker (banco PostgreSQL).
  - `infra/database.js`: Módulo central de conexão e execução de queries no PostgreSQL (`query` e `getNewClient`).
  - `infra/migrations/`: Migrations de banco de dados gerenciadas com `node-pg-migrate`.
- `tests/`: Suíte de testes automatizados (Jest).
  - `tests/integration/api/v1/`: Testes de integração que validam os endpoints HTTP reais da API.

## Stack, Ambiente e Convenções

- **Runtime e Frameworks:** Node.js (versão definida em `.nvmrc`), Next.js (Pages Router) e React, utilizando JavaScript (sem TypeScript).
- **Resolução de Imports:** Imports absolutos a partir da raiz do projeto são habilitados via `jsconfig.json` (`baseUrl: "."`) e `jest.config.js` (`moduleDirectories: ["node_modules", "<rootDir>"]`). Prefira imports como `infra/database.js` em vez de caminhos relativos longos.
- **Formatação:** O padrão de código é garantido pelo **Prettier** e pelo `.editorconfig` (indentação com 2 espaços). Use os scripts de lint para validar ou corrigir a formatação.
- **Variáveis de Ambiente:** A configuração local de desenvolvimento e testes fica em `.env.development` (carregado pelo `jest.config.js` e pelos scripts de migration).

## Banco de Dados e Migrations

- **Conexão:** Toda interação com o PostgreSQL deve passar por `infra/database.js`, que gerencia a criação e o encerramento de clientes (`pg.Client`) e configura SSL automaticamente conforme `POSTGRES_CA` / `NODE_ENV`.
- **Migrations:** O schema evolui por meio de arquivos em `infra/migrations/` usando `node-pg-migrate`.
  - O endpoint `/api/v1/migrations` também expõe a verificação (`GET`, em `dryRun`) e a execução (`POST`) de migrations pendentes.
- **Limpeza em Testes:** Os testes de integração que alteram estado do banco reinicializam o schema `public` antes da execução para manter isolamento.

## Desenvolvimento e Testes

Consulte o `package.json` para a lista sempre atualizada de scripts disponíveis. Os fluxos principais são:

1. **Subir serviços e servidor local:**
   - `npm run dev` (sobe o container definido em `infra/compose.yaml` e inicia o `next dev`).
   - `npm run services:up` / `npm run services:stop` / `npm run services:down` para gerenciar apenas o Docker Compose.
2. **Migrations:**
   - `npm run migration:create <nome>` para criar uma nova migration.
   - `npm run migration:up` para aplicar migrations pendentes no ambiente de desenvolvimento.
3. **Qualidade e Testes:**
   - `npm run lint:check` / `npm run lint:fix` para checar ou formatar com Prettier.
   - `npm test` (ou `npm run test:watch`) para rodar o Jest com `--runInBand` (execução sequencial, necessária por causa do estado compartilhado do banco de dados).
   - **Importante:** Os testes em `tests/integration/` fazem requisições HTTP reais contra `http://localhost:3000`; portanto, o banco de dados e o servidor Next.js precisam estar em execução ao rodar a suíte de integração.
