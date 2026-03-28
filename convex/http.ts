// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

// Convex Auth routes
auth.addHttpRoutes(http);

// BlockNote AI proxy — translates OpenAI-compatible requests to Gemini
http.route({
  path: "/api/ai/blocknote/v1/chat/completions",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages = body.messages ?? [];
    const stream = body.stream ?? false;

    // Convert OpenAI messages to Gemini format
    let systemInstruction: { parts: { text: string }[] } | undefined;
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of messages as { role: string; content: string }[]) {
      if (msg.role === "system") {
        systemInstruction = { parts: [{ text: msg.content }] };
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    if (stream) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            ...(systemInstruction && { systemInstruction }),
          }),
        }
      );

      if (!geminiRes.ok || !geminiRes.body) {
        return new Response(
          JSON.stringify({ error: `Gemini error: ${geminiRes.status}` }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      const reader = geminiRes.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const readable = new ReadableStream({
        async start(controller) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              try {
                const geminiData = JSON.parse(jsonStr);
                const text =
                  geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                if (text) {
                  const openaiChunk = {
                    choices: [{ delta: { content: text }, index: 0 }],
                  };
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify(openaiChunk)}\n\n`
                    )
                  );
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            ...(systemInstruction && { systemInstruction }),
          }),
        }
      );

      if (!geminiRes.ok) {
        return new Response(
          JSON.stringify({ error: `Gemini error: ${geminiRes.status}` }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await geminiRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const openaiResponse = {
        choices: [{ message: { role: "assistant", content: text } }],
      };

      return new Response(JSON.stringify(openaiResponse), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

// CORS preflight for AI proxy
http.route({
  path: "/api/ai/blocknote/v1/chat/completions",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }),
});

export default http;
