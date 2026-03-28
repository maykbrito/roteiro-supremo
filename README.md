# Roteiro Supremo

App para criar roteiros de vídeo seguindo uma metodologia em 5 módulos: vitrine, abertura, apresentação, conteúdo e finalização. O conteúdo é salvo automaticamente no Convex enquanto você escreve.

## Pré-requisitos

- Node.js 18+
- Conta no [Convex](https://convex.dev) (gratuita)

## Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure o backend Convex (vai abrir o browser para login na primeira vez)
npx convex dev
```

Com o `convex dev` rodando, abra outro terminal:

```bash
# 3. Inicie o app
npm run dev
```

Acesse `http://localhost:5173`.

> O `convex dev` precisa ficar rodando em paralelo — ele sincroniza as funções de backend em tempo real.
