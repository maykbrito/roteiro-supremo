// src/blocks/template.ts
import type { PartialBlock } from "@blocknote/core";
import type { RoteiroSchema } from "./schema";

type Block = PartialBlock<
  RoteiroSchema["blockSchema"],
  RoteiroSchema["inlineContentSchema"],
  RoteiroSchema["styleSchema"]
>;

export const SCRIPT_TEMPLATE: Block[] = [
  // Module 0 — A Vitrine
  {
    type: "moduleHeader",
    props: {
      moduleId: "0",
      moduleNumber: "0",
      moduleTitle: "A Vitrine",
      microLearning:
        "O titulo e a thumbnail sao responsaveis por 80% dos cliques. Pense neles como a vitrine da sua loja.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Titulo do Video",
      placeholder: "Clique para digitar o titulo...",
      moduleId: "0",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Ideia da Thumbnail",
      placeholder: "Descreva a ideia da thumbnail...",
      moduleId: "0",
    },
  },

  // Module 1 — 30 Segundos Cruciais
  {
    type: "moduleHeader",
    props: {
      moduleId: "1",
      moduleNumber: "1",
      moduleTitle: "30 Segundos Cruciais",
      microLearning:
        "Os primeiros 30 segundos decidem se o espectador fica ou sai. Use o gancho ODA: Objetivo, Dificuldade, Ancora.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Objetivo do Video",
      placeholder: "Qual e o objetivo principal deste video?",
      moduleId: "1",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Dificuldade / Problema",
      placeholder: "Qual problema o espectador enfrenta?",
      moduleId: "1",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Descoberta",
      placeholder: "Qual e a descoberta ou insight principal?",
      moduleId: "1",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Objecoes",
      placeholder: "Quais objecoes o espectador pode ter?",
      moduleId: "1",
    },
  },

  // Module 2-3 — Quem e Voce?
  {
    type: "moduleHeader",
    props: {
      moduleId: "2-3",
      moduleNumber: "2-3",
      moduleTitle: "Quem e Voce?",
      microLearning:
        "O espectador precisa confiar em voce antes de absorver o conteudo. Mostre quem voce e de forma autentica.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Apresentacao",
      placeholder: "Como voce se apresenta?",
      moduleId: "2-3",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Credenciais",
      placeholder: "Quais sao suas credenciais ou experiencia?",
      moduleId: "2-3",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Estrategia de Conexao",
      placeholder: "Como voce conecta com o espectador?",
      moduleId: "2-3",
    },
  },

  // Module 4 — O Recheio
  {
    type: "moduleHeader",
    props: {
      moduleId: "4",
      moduleNumber: "4",
      moduleTitle: "O Recheio",
      microLearning:
        "Use a Regra de 3: divida o conteudo em 3 partes claras. Isso facilita a compreensao e retencao.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Parte 1",
      placeholder: "Primeiro ponto principal do conteudo...",
      moduleId: "4",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Parte 2",
      placeholder: "Segundo ponto principal do conteudo...",
      moduleId: "4",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Parte 3",
      placeholder: "Terceiro ponto principal do conteudo...",
      moduleId: "4",
    },
  },

  // Module 5-6 — A Saida Invisivel
  {
    type: "moduleHeader",
    props: {
      moduleId: "5-6",
      moduleNumber: "5-6",
      moduleTitle: "A Saida Invisivel",
      microLearning:
        "Nunca termine abruptamente. A saida invisivel faz o espectador sentir que o proximo passo e natural.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Transicao",
      placeholder: "Como voce faz a transicao para o final?",
      moduleId: "5-6",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "CTA Escolhido",
      placeholder: "Qual e o call-to-action?",
      moduleId: "5-6",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Video Recomendado",
      placeholder: "Qual video voce recomenda em seguida?",
      moduleId: "5-6",
    },
  },
];
