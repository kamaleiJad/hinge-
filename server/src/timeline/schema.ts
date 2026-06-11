import { z } from "zod";

/**
 * The core data model. A timeline is a flat list of nodes forming a tree:
 * every node points at its parent via `parent_id` (the root has `null`).
 * The client reconstructs the branching structure from these edges.
 */

export const Confidence = z.enum(["likely", "plausible", "speculative"]);
export type Confidence = z.infer<typeof Confidence>;

/**
 * What we ask the model to produce for each child node. We deliberately do NOT
 * let the model invent `id`/`parent_id` — the server stamps those so the graph
 * can never be internally inconsistent. The model only reasons about content.
 */
export const GeneratedNode = z.object({
  year: z.coerce.number().int(),
  headline: z.string().min(1).max(200),
  consequence: z.string().min(1).max(800),
  confidence: Confidence,
});
export type GeneratedNode = z.infer<typeof GeneratedNode>;

export const GeneratedNodeList = z.object({
  nodes: z.array(GeneratedNode).min(0).max(4),
});
export type GeneratedNodeList = z.infer<typeof GeneratedNodeList>;

/** A fully-formed node as stored and sent to the client. */
export const TimelineNode = z.object({
  id: z.string(),
  parent_id: z.string().nullable(),
  year: z.number().int(),
  headline: z.string(),
  consequence: z.string(),
  confidence: Confidence,
  /** How deep in the reasoning chain: 0 = root, 1 = immediate, 2 = medium, 3 = long. */
  stage: z.number().int(),
});
export type TimelineNode = z.infer<typeof TimelineNode>;

export const Timeline = z.object({
  prompt: z.string(),
  yearsForward: z.number().int(),
  drama: z.number(),
  nodes: z.array(TimelineNode),
});
export type Timeline = z.infer<typeof Timeline>;
