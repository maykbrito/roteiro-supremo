# Roteiro Supremo v2

Construtor de roteiros para YouTube com editor de blocos e assistencia de IA.

## Funcionalidades

- **Editor de blocos**: Edite seu roteiro diretamente em uma unica tela usando BlockNote.js
- **Modulos colapsaveis**: Organize seu roteiro em modulos que podem ser expandidos/colapsados
- **Micro learning**: Dicas educativas inline em cada modulo
- **IA por campo**: Botao "Sugerir" gera conteudo contextual para cada campo
- **Analise completa**: "Analisar com IA" avalia o roteiro inteiro com pontuacao e sugestoes
- **Menu IA nativo**: Selecione texto para reescrever, resumir ou traduzir com IA
- **Dashboard**: Gerencie multiplos roteiros com criacao, edicao e exclusao
- **Auth**: Login com Google via Convex Auth

## Tech Stack

- React 19 + Vite + Tailwind CSS 4
- BlockNote.js (editor de blocos)
- Convex (backend, auth, real-time sync)
- Gemini 3 Flash Preview (IA)

## Setup

1. Clone e instale dependencias:
   ```bash
   pnpm install
   ```

2. Configure o Convex:
   ```bash
   pnpm exec convex dev
   ```

3. Configure o Convex Auth (gera `JWT_PRIVATE_KEY` e `JWKS` automaticamente):
   ```bash
   pnpm exec @convex-dev/auth
   ```

4. Defina as variaveis de ambiente no Convex Dashboard:
   - `AUTH_GOOGLE_ID` — Google OAuth client ID
   - `AUTH_GOOGLE_SECRET` — Google OAuth client secret
   - `AUTH_SECRET` — Segredo para assinar cookies/tokens (gere com `openssl rand -base64 32`)
   - `SITE_URL` — URL do frontend (ex: `http://localhost:3456` em dev)
   - `GEMINI_API_KEY` — Chave da API Gemini

   > `CONVEX_SITE_URL` e `JWT_PRIVATE_KEY`/`JWKS` sao configurados automaticamente pelo Convex e pelo passo 3.

5. Crie `.env.local` com:
   ```
   VITE_CONVEX_URL=<sua-url-convex>
   ```

6. Inicie o dev server:
   ```bash
   pnpm dev
   ```
