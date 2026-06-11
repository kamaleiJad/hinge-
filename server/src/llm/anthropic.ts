import Anthropic from "@anthropic-ai/sdk";
import type { LlmOptions } from "./types.js";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env or switch LLM_PROVIDER=ollama."
    );
  }
  client ??= new Anthropic();
  return client;
}

export async function anthropicGenerate(prompt: string, opts: LlmOptions = {}): Promise<string> {
  const res = await getClient().messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
    max_tokens: opts.maxTokens ?? 6000,
    // Adaptive thinking: counterfactual chains benefit from the model
    // reasoning before it commits to a structured answer.
    thinking: { type: "adaptive" },
    ...(opts.schema
      ? { output_config: { format: { type: "json_schema", schema: opts.schema } } }
      : {}),
    messages: [{ role: "user", content: prompt }],
  });

  if (res.stop_reason === "refusal") {
    throw new Error("Model declined to answer this divergence.");
  }
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
