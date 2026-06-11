export interface LlmOptions {
  /**
   * A JSON Schema. When provided, the backend constrains output to it
   * (Anthropic structured outputs / Ollama `format`). The caller still
   * validates + repairs, since not every backend enforces schemas strictly.
   */
  schema?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

/** The single seam every provider implements. */
export type GenerateFn = (prompt: string, opts?: LlmOptions) => Promise<string>;
