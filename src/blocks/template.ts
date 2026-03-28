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
        "O título e a thumbnail são responsáveis por 80% dos cliques. Pense neles como a vitrine da sua loja.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Título do Vídeo",
      placeholder: "Clique para digitar o título...",
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
        "Os primeiros 30 segundos decidem se o espectador fica ou sai. Use o gancho ODA: Objetivo, Dificuldade, Âncora.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Objetivo do Vídeo",
      placeholder: "Qual é o objetivo principal deste vídeo?",
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
      placeholder: "Qual é a descoberta ou insight principal?",
      moduleId: "1",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Objeções",
      placeholder: "Quais objeções o espectador pode ter?",
      moduleId: "1",
    },
  },

  // Module 2-3 — Quem e Voce?
  {
    type: "moduleHeader",
    props: {
      moduleId: "2-3",
      moduleNumber: "2-3",
      moduleTitle: "Quem é Você?",
      microLearning:
        "O espectador precisa confiar em você antes de absorver o conteúdo. Mostre quem você é de forma autêntica.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Apresentação",
      placeholder: "Como você se apresenta?",
      moduleId: "2-3",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Credenciais",
      placeholder: "Quais são suas credenciais ou experiência?",
      moduleId: "2-3",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Estratégia de Conexão",
      placeholder: "Como você conecta com o espectador?",
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
        "Use a Regra de 3: divida o conteúdo em 3 partes claras. Isso facilita a compreensão e retenção.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Parte 1",
      placeholder: "Primeiro ponto principal do conteúdo...",
      moduleId: "4",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Parte 2",
      placeholder: "Segundo ponto principal do conteúdo...",
      moduleId: "4",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Parte 3",
      placeholder: "Terceiro ponto principal do conteúdo...",
      moduleId: "4",
    },
  },

  // Module 5-6 — A Saida Invisivel
  {
    type: "moduleHeader",
    props: {
      moduleId: "5-6",
      moduleNumber: "5-6",
      moduleTitle: "A Saída Invisível",
      microLearning:
        "Nunca termine abruptamente. A saída invisível faz o espectador sentir que o próximo passo é natural.",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Transição",
      placeholder: "Como você faz a transição para o final?",
      moduleId: "5-6",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "CTA Escolhido",
      placeholder: "Qual é o call-to-action?",
      moduleId: "5-6",
    },
  },
  {
    type: "scriptField",
    props: {
      label: "Vídeo Recomendado",
      placeholder: "Qual vídeo você recomenda em seguida?",
      moduleId: "5-6",
    },
  },
];
