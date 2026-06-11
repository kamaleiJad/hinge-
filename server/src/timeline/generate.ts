import { generate } from "../llm/index.js";
import { GeneratedNode, type Timeline, type TimelineNode } from "./schema.js";
import { NODE_LIST_SCHEMA, ROOT_SCHEMA } from "./jsonSchema.js";
import { parseNodeList, validateOrRepair } from "./parse.js";
import { childrenPrompt, rootPrompt, threadPrompt, type StageMeta } from "./prompts.js";

let counter = 0;
function makeId(): string {
  counter = (counter + 1) % 1_000_000;
  return `n${Date.now().toString(36)}${counter.toString(36)}`;
}

const MAX_PARENTS_PER_STAGE: Record<number, number> = { 1: 1, 2: 3, 3: 4 };

function round(n: number): number {
  return Math.round(n);
}

function stageMetas(rootYear: number, yearsForward: number): StageMeta[] {
  const immediate: StageMeta = {
    stage: 1,
    label: "immediate (0–5 year)",
    yearLow: rootYear,
    yearHigh: rootYear + Math.min(5, yearsForward),
    childrenWanted: 3,
  };
  const medium: StageMeta = {
    stage: 2,
    label: "medium-term",
    yearLow: rootYear + round(yearsForward * 0.1),
    yearHigh: rootYear + round(yearsForward * 0.45),
    childrenWanted: 2,
  };
  const long: StageMeta = {
    stage: 3,
    label: "long-term",
    yearLow: rootYear + round(yearsForward * 0.5),
    yearHigh: rootYear + yearsForward,
    childrenWanted: 2,
  };
  if (yearsForward <= 10) return [immediate];
  if (yearsForward <= 50) return [immediate, medium];
  return [immediate, medium, long];
}

async function generateRoot(divergence: string, drama: number): Promise<TimelineNode> {
  const text = await generate(rootPrompt(divergence, drama), {
    schema: ROOT_SCHEMA,
    maxTokens: 3000,
  });
  const parsed = await validateOrRepair(text, GeneratedNode, ROOT_SCHEMA);
  if (parsed) {
    return { id: "root", parent_id: null, stage: 0, ...parsed, confidence: "likely" };
  }
  // Graceful fallback so the UI always has a root.
  return {
    id: "root",
    parent_id: null,
    stage: 0,
    year: 0,
    headline: divergence.length > 80 ? divergence.slice(0, 77) + "…" : divergence,
    consequence: "The point of divergence from real history.",
    confidence: "likely",
  };
}

/** Generate the children of a single node and stamp ids/parent links. */
async function expandNode(args: {
  divergence: string;
  ancestry: TimelineNode[];
  parent: TimelineNode;
  meta: StageMeta;
  drama: number;
  followUp?: string;
}): Promise<TimelineNode[]> {
  const { divergence, ancestry, parent, meta, drama, followUp } = args;
  const prompt = threadPrompt({ divergence, ancestry, stage: meta, drama, followUp });
  const text = await generate(prompt, { schema: NODE_LIST_SCHEMA, maxTokens: 6000 });
  const gen = await parseNodeList(text, NODE_LIST_SCHEMA);
  return gen.slice(0, meta.childrenWanted).map((g) => ({
    id: makeId(),
    parent_id: parent.id,
    stage: meta.stage,
    ...g,
  }));
}

export async function buildTimeline(req: {
  prompt: string;
  yearsForward: number;
  drama: number;
}): Promise<Timeline> {
  const { prompt, yearsForward, drama } = req;
  const root = await generateRoot(prompt, drama);

  const nodes: TimelineNode[] = [root];
  const ancestry = new Map<string, TimelineNode[]>([[root.id, [root]]]);
  let frontier: TimelineNode[] = [root];

  for (const meta of stageMetas(root.year, yearsForward)) {
    const parents = frontier.slice(0, MAX_PARENTS_PER_STAGE[meta.stage] ?? 3);
    const batches = await Promise.all(
      parents.map((parent) =>
        expandNode({
          divergence: prompt,
          ancestry: ancestry.get(parent.id)!,
          parent,
          meta,
          drama,
        })
      )
    );

    const next: TimelineNode[] = [];
    for (let i = 0; i < parents.length; i++) {
      for (const child of batches[i]) {
        nodes.push(child);
        ancestry.set(child.id, [...ancestry.get(parents[i].id)!, child]);
        next.push(child);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  return { prompt, yearsForward, drama, nodes };
}

/**
 * Pull a thread: re-root the simulation beneath the chosen node, reasoning
 * two further stages down. Existing nodes are kept; new ones are appended.
 */
export async function pullThread(args: {
  timeline: Timeline;
  nodeId: string;
  followUp?: string;
}): Promise<Timeline> {
  const { timeline, nodeId, followUp } = args;
  const byId = new Map(timeline.nodes.map((n) => [n.id, n]));
  const start = byId.get(nodeId);
  if (!start) return timeline;

  // Reconstruct ancestry of the start node from the existing tree.
  const chainFor = (id: string): TimelineNode[] => {
    const chain: TimelineNode[] = [];
    let cur: TimelineNode | undefined = byId.get(id);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
    }
    return chain;
  };

  const { yearsForward, drama, prompt } = timeline;
  const span = Math.max(5, round(yearsForward * 0.3));
  const added: TimelineNode[] = [];
  const ancestry = new Map<string, TimelineNode[]>([[start.id, chainFor(start.id)]]);

  // Stage A: 3 children directly under the chosen node (steered by followUp).
  const metaA: StageMeta = {
    stage: start.stage + 1,
    label: followUp ? "follow-up" : "deeper",
    yearLow: start.year + 1,
    yearHigh: start.year + span,
    childrenWanted: 3,
  };
  const childrenA = await expandNode({
    divergence: prompt,
    ancestry: ancestry.get(start.id)!,
    parent: start,
    meta: metaA,
    drama,
    followUp,
  });
  for (const c of childrenA) {
    added.push(c);
    ancestry.set(c.id, [...ancestry.get(start.id)!, c]);
  }

  // Stage B: deepen the first two of those one more level.
  const metaB: StageMeta = {
    stage: start.stage + 2,
    label: "downstream",
    yearLow: start.year + span,
    yearHigh: start.year + span * 2,
    childrenWanted: 2,
  };
  const deepBatches = await Promise.all(
    childrenA.slice(0, 2).map((parent) =>
      expandNode({
        divergence: prompt,
        ancestry: ancestry.get(parent.id)!,
        parent,
        meta: metaB,
        drama,
        followUp,
      })
    )
  );
  for (const batch of deepBatches) added.push(...batch);

  return { ...timeline, nodes: [...timeline.nodes, ...added] };
}
