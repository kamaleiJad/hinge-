import type { TimelineNode } from "../types";

export const CARD_W = 288;
export const CARD_H = 150;
export const COL_GAP = 64;
export const ROW_GAP = 28;
export const COL_W = CARD_W + COL_GAP;
export const ROW_H = CARD_H + ROW_GAP;
export const PAD = 32;

export interface PositionedNode {
  node: TimelineNode;
  x: number;
  y: number;
}

export interface Edge {
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Layout {
  nodes: PositionedNode[];
  edges: Edge[];
  width: number;
  height: number;
}

/**
 * Tidy tree layout. The x-axis is the reasoning stage (root → immediate →
 * medium → long), the y-axis packs siblings without overlap: leaves take
 * sequential rows and each parent centers on its children (a classic
 * post-order tidy layout). Connectors run parent right-edge → child left-edge.
 */
export function layoutTimeline(nodes: TimelineNode[]): Layout {
  if (nodes.length === 0) return { nodes: [], edges: [], width: 0, height: 0 };

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, TimelineNode[]>();
  for (const n of nodes) {
    if (n.parent_id && byId.has(n.parent_id)) {
      (children.get(n.parent_id) ?? children.set(n.parent_id, []).get(n.parent_id)!).push(n);
    }
  }
  // Stable ordering within a sibling group: by year, then headline.
  for (const list of children.values()) {
    list.sort((a, b) => a.year - b.year || a.headline.localeCompare(b.headline));
  }

  const roots = nodes
    .filter((n) => !n.parent_id || !byId.has(n.parent_id))
    .sort((a, b) => a.year - b.year);

  const row = new Map<string, number>();
  let cursor = 0;

  const assign = (node: TimelineNode): number => {
    const kids = children.get(node.id) ?? [];
    let r: number;
    if (kids.length === 0) {
      r = cursor++;
    } else {
      const rs = kids.map(assign);
      r = (rs[0] + rs[rs.length - 1]) / 2;
    }
    row.set(node.id, r);
    return r;
  };
  roots.forEach(assign);

  const positioned: PositionedNode[] = nodes.map((node) => ({
    node,
    x: PAD + node.stage * COL_W,
    y: PAD + (row.get(node.id) ?? 0) * ROW_H,
  }));
  const posById = new Map(positioned.map((p) => [p.node.id, p]));

  const edges: Edge[] = [];
  for (const n of nodes) {
    if (!n.parent_id) continue;
    const parent = posById.get(n.parent_id);
    const child = posById.get(n.id);
    if (!parent || !child) continue;
    edges.push({
      fromId: n.parent_id,
      toId: n.id,
      x1: parent.x + CARD_W,
      y1: parent.y + CARD_H / 2,
      x2: child.x,
      y2: child.y + CARD_H / 2,
    });
  }

  const width = PAD * 2 + (Math.max(...nodes.map((n) => n.stage)) + 1) * COL_W - COL_GAP;
  const height = PAD * 2 + cursor * ROW_H;
  return { nodes: positioned, edges, width, height: Math.max(height, PAD * 2 + ROW_H) };
}
