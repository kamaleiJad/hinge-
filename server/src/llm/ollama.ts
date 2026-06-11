import type { LlmOptions } from "./types.js";

/**
 * Local, offline backend. Uses Ollama's /api/generate with `stream: false`.
 * Recent Ollama accepts a JSON Schema object as `format` to constrain output;
 * we pass the schema through when present.
 */
export async function ollamaGenerate(prompt: string, opts: LlmOptions = {}): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "qwen2.5";
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: opts.schema ?? "json",
        options: { temperature: opts.temperature ?? 0.8 },
      }),
    });
  } catch (e) {
    throw new Error(
      `Could not reach Ollama at ${baseUrl}. Is it running? (${e instanceof Error ? e.message : e})`
    );
  }
  if (!res.ok) {
    throw new Error(`Ollama ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as { response?: string };
  return data.response ?? "";
}
