import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const suggestFieldContent = action({
  args: {
    scriptTitle: v.string(),
    moduleTitle: v.string(),
    fieldLabel: v.string(),
    existingContent: v.string(),
    otherFields: v.array(
      v.object({ label: v.string(), content: v.string() })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `Voce e um especialista em roteiros para YouTube. 
Estou criando um roteiro chamado "${args.scriptTitle}".

Modulo: ${args.moduleTitle}
Campo: ${args.fieldLabel}
${args.existingContent ? `Conteudo atual: ${args.existingContent}` : "O campo esta vazio."}

${args.otherFields.length > 0 ? `Contexto dos outros campos:\n${args.otherFields.map((f) => `- ${f.label}: ${f.content}`).join("\n")}` : ""}

Escreva uma sugestao concisa e direta para o campo "${args.fieldLabel}". 
Responda APENAS com o texto da sugestao, sem explicacoes adicionais.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text.trim();
  },
});

export const analyzeScript = action({
  args: {
    scriptContent: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `Voce e um especialista em roteiros para YouTube.
Analise o seguinte roteiro e forneca feedback estruturado em portugues:

${args.scriptContent}

Retorne a analise no seguinte formato JSON:
{
  "score": <numero de 0 a 100>,
  "summary": "<resumo geral em 1-2 frases>",
  "strengths": ["<ponto forte 1>", "<ponto forte 2>"],
  "improvements": [
    { "area": "<area>", "suggestion": "<sugestao especifica>" }
  ],
  "retentionHooks": "<analise dos ganchos de retencao>",
  "ctaEffectiveness": "<analise do CTA>",
  "contentFlow": "<analise do fluxo do conteudo>"
}

Responda APENAS com o JSON, sem markdown ou texto adicional.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
    }
  },
});
