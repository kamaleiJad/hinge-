// Mirrors server/src/timeline/schema.ts (the wire contract).

export type Confidence = "likely" | "plausible" | "speculative";

export interface TimelineNode {
  id: string;
  parent_id: string | null;
  year: number;
  headline: string;
  consequence: string;
  confidence: Confidence;
  /** 0 = root, 1 = immediate, 2 = medium, 3 = long-term. */
  stage: number;
}

export interface Timeline {
  prompt: string;
  yearsForward: number;
  drama: number;
  nodes: TimelineNode[];
}

export interface GenerateRequest {
  prompt: string;
  yearsForward: number;
  drama: number;
}
