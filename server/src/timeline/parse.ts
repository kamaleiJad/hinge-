import { z } from "zod";
import type { GenerateFn } from "./provider.js";
import { GeneratedNode, type GeneratedNode as GNode } from "./schema.js";

/**
 * Pull the first JSON value out of a model response. Handles ```json fences,
 * leading prose, and trailing commentary by scanning for the outermost
 * balanced braces.
 */
export function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;

  const start = body.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < body.length; i++) {
    const c = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return body.slice(start, i + 1);
    }
  }
  return null;
}

function tryParse<T>(text: string, schema: z.ZodType<T>): T | null {
  const json = extractJson(text);
  if (!json) return null;
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}

/**
 * Validate against a Zod schema, repairing once via the model if needed.
 * The repair call reuses the active provider, so it works on either backend.
 */
export async function validateOrRepair<T>(
  text: string,
  schema: z.ZodType<T>,
  jsonSchema: Record<string, unknown>,
  gen: GenerateFn
): Promise<T | null> {
  const first = tryParse(text, schema);
  if (first) return first;

  const repairPrompt =
    "The text below was meant to be a single JSON value matching this JSON Schema:\n\n" +
    JSON.stringify(jsonSchema) +
    "\n\nReturn ONLY corrected JSON — no prose, no code fences. Text to fix:\n\n" +
    text;

  const repaired = await gen(repairPrompt, { schema: jsonSchema, maxTokens: 4000 });
  return tryParse(repaired, schema);
}

const NodeListLenient = z.object({ nodes: z.array(z.unknown()) });

/**
 * Parse a node list, then keep only the children that individually validate.
 * Lets one malformed node fall away rather than discarding a whole stage.
 */
export async function parseNodeList(
  text: string,
  jsonSchema: Record<string, unknown>,
  gen: GenerateFn
): Promise<GNode[]> {
  let parsed = tryParse(text, NodeListLenient);
  if (!parsed) {
    const repairPrompt =
      "The text below was meant to be JSON of the form {\"nodes\": [...]} matching:\n\n" +
      JSON.stringify(jsonSchema) +
      "\n\nReturn ONLY corrected JSON. Text to fix:\n\n" +
      text;
    const repaired = await gen(repairPrompt, { schema: jsonSchema, maxTokens: 4000 });
    parsed = tryParse(repaired, NodeListLenient);
  }
  if (!parsed) return [];

  const good: GNode[] = [];
  for (const raw of parsed.nodes) {
    const r = GeneratedNode.safeParse(raw);
    if (r.success) good.push(r.data);
  }
  return good;
}
