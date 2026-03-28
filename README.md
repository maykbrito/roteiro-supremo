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

3. Defina as variaveis de ambiente no Convex Dashboard:
   - `AUTH_GOOGLE_ID` — Google OAuth client ID
   - `AUTH_GOOGLE_SECRET` — Google OAuth client secret
   - `CONVEX_SITE_URL` — URL do HTTP Actions (ex: `https://<deployment>.convex.site`)
   - `GEMINI_API_KEY` — Chave da API Gemini

4. Crie `.env.local` com:
   ```
   VITE_CONVEX_URL=<sua-url-convex>
   ```

5. Inicie o dev server:
   ```bash
   pnpm dev
   ```
