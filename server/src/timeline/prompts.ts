import type { TimelineNode } from "./schema.js";

export interface StageMeta {
  stage: number; // 1 immediate, 2 medium, 3 long
  label: string;
  yearLow: number;
  yearHigh: number;
  childrenWanted: number;
}

function dramaGuidance(drama: number): string {
  if (drama < 0.34) {
    return "Stay conservative and well-grounded. Favor consequences with strong, well-attested causal mechanisms. Most nodes should be tagged 'likely' or 'plausible'.";
  }
  if (drama < 0.67) {
    return "Balance plausibility with interesting divergence. Mix solid causal chains with a few bolder branches. Use the full confidence range honestly.";
  }
  return "Lean into bold, surprising, high-stakes consequences — but keep each one internally coherent and causally traceable. Expect more 'speculative' tags; never invent magic.";
}

const HOUSE_STYLE =
  "You are a rigorous counterfactual historian building an alternate timeline. " +
  "Write like a research brief: dense, specific, and concrete. Name plausible actors, places, " +
  "and mechanisms. Avoid hedging filler and avoid restating the prompt. Each consequence is 2–3 sentences.";

/** Stage 0: establish the divergence as the root node (we need its year). */
export function rootPrompt(divergence: string, drama: number): string {
  return [
    HOUSE_STYLE,
    "",
    `The user's divergence: "${divergence}"`,
    "",
    "Return a single JSON object describing the point of divergence itself:",
    "- year: the integer year it occurs (negative for BC, e.g. -216 for 216 BC).",
    "- headline: a crisp ≤12-word title for the divergence.",
    "- consequence: 2–3 sentences stating exactly what changes at this moment versus real history.",
    "- confidence: always \"likely\" for the divergence itself.",
    "",
    dramaGuidance(drama),
    "Return ONLY the JSON object.",
  ].join("\n");
}

/** Stage 1+: generate the children of one node, fed the chain that led here. */
export function childrenPrompt(args: {
  divergence: string;
  ancestry: TimelineNode[]; // root → ... → parent
  stage: StageMeta;
  drama: number;
}): string {
  const { divergence, ancestry, stage, drama } = args;
  const parent = ancestry[ancestry.length - 1];
  const chain = ancestry
    .map((n) => `  • ${fmtYear(n.year)} — ${n.headline}: ${n.consequence}`)
    .join("\n");

  return [
    HOUSE_STYLE,
    "",
    `Root divergence: "${divergence}"`,
    "",
    "The causal chain established so far (earliest → latest):",
    chain,
    "",
    `Now derive the ${stage.label} consequences that follow specifically from the latest event ` +
      `("${parent.headline}"). These should fall roughly between ${fmtYear(stage.yearLow)} and ${fmtYear(stage.yearHigh)}.`,
    "",
    `Return JSON of the form {"nodes": [...]} with ${stage.childrenWanted} distinct downstream nodes. Each node:`,
    "- year: integer (negative for BC) within or near the window above.",
    "- headline: ≤12-word title.",
    "- consequence: 2–3 sentences. Build directly on the chain above — do not repeat it.",
    "- confidence: \"likely\" | \"plausible\" | \"speculative\", judged honestly.",
    "",
    dramaGuidance(drama),
    "Make the nodes genuinely different from one another (different domains: military, economic, cultural, technological, political).",
    "Return ONLY the JSON.",
  ].join("\n");
}

/** Pull-thread: deepen / re-root from a chosen node, optionally steered. */
export function threadPrompt(args: {
  divergence: string;
  ancestry: TimelineNode[];
  stage: StageMeta;
  drama: number;
  followUp?: string;
}): string {
  const base = childrenPrompt(args);
  if (!args.followUp) return base;
  return base.replace(
    "Return ONLY the JSON.",
    `Steer the branches to address this follow-up specifically: "${args.followUp}"\nReturn ONLY the JSON.`
  );
}

export function fmtYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : `AD ${year}`;
}
