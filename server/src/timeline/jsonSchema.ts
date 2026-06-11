// JSON Schemas handed to the LLM backends to constrain output. Kept in sync
// with the Zod schemas in schema.ts by hand (they're small and explicit).

const NODE_PROPS = {
  year: { type: "integer" },
  headline: { type: "string" },
  consequence: { type: "string" },
  confidence: { type: "string", enum: ["likely", "plausible", "speculative"] },
} as const;

const NODE_REQUIRED = ["year", "headline", "consequence", "confidence"];

export const ROOT_SCHEMA = {
  type: "object",
  properties: NODE_PROPS,
  required: NODE_REQUIRED,
  additionalProperties: false,
};

export const NODE_LIST_SCHEMA = {
  type: "object",
  properties: {
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: NODE_PROPS,
        required: NODE_REQUIRED,
        additionalProperties: false,
      },
    },
  },
  required: ["nodes"],
  additionalProperties: false,
};
