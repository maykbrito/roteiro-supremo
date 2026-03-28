export interface ScriptData {
  // Step 1: Vitrine
  title: string;
  thumbIdea: string;
  
  // Step 2: 30 Segundos
  objective: string;
  difficulties: string;
  discovery: string;
  objections: string;
  
  // Step 3: Apresentação
  name: string;
  whoYouAre: string;
  whatYouDo: string;
  connectionStrategy: 'fiz-por-voce' | 'inimigo-comum' | 'dados-provas' | '';
  
  // Step 4: Conteúdo
  parts: string[];
  
  // Step 5: Finalização
  transition: string;
  cta: string[];
  recommendedVideo: string;
}

export const INITIAL_DATA: ScriptData = {
  title: '',
  thumbIdea: '',
  objective: '',
  difficulties: '',
  discovery: '',
  objections: '',
  name: '',
  whoYouAre: '',
  whatYouDo: '',
  connectionStrategy: '',
  parts: ['', '', ''],
  transition: '',
  cta: [],
  recommendedVideo: '',
};
