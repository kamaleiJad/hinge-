import type { LlmOptions } from "./types.js";
import { anthropicGenerate } from "./anthropic.js";
import { ollamaGenerate } from "./ollama.js";

export type { LlmOptions } from "./types.js";

export function activeProvider(): "anthropic" | "ollama" {
  return (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase() === "ollama"
    ? "ollama"
    : "anthropic";
}

/**
 * The single entry point. Swap providers via LLM_PROVIDER without touching
 * any calling code.
 */
export async function generate(prompt: string, opts: LlmOptions = {}): Promise<string> {
  return activeProvider() === "ollama"
    ? ollamaGenerate(prompt, opts)
    : anthropicGenerate(prompt, opts);
}
