// The LLM seam, expressed as pure types so the staged-generation core can run
// against any backend — the Node server (Anthropic/Ollama) or a browser that
// calls Anthropic directly. Callers inject a `GenerateFn`.

export interface LlmOptions {
  /** A JSON Schema; backends constrain output to it when provided. */
  schema?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export type GenerateFn = (prompt: string, opts?: LlmOptions) => Promise<string>;
