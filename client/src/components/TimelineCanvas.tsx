import { useMemo } from "react";
import type { Timeline } from "../types";
import { layoutTimeline } from "../lib/layout";
import { NodeCard } from "./NodeCard";

interface Props {
  timeline: Timeline;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STAGE_LABELS = ["Divergence", "Immediate · 0–5 yr", "Medium term", "Long term"];

export function TimelineCanvas({ timeline, selectedId, onSelect }: Props) {
  const layout = useMemo(() => layoutTimeline(timeline.nodes), [timeline.nodes]);
  const maxStage = useMemo(
    () => timeline.nodes.reduce((m, n) => Math.max(m, n.stage), 0),
    [timeline.nodes]
  );

  return (
    <div className="rail-scroll h-full overflow-auto">
      <div className="relative" style={{ width: layout.width, height: layout.height + 40 }}>
        {/* Stage column headers */}
        {Array.from({ length: maxStage + 1 }).map((_, stage) => (
          <div
            key={stage}
            className="absolute font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
            style={{ left: 32 + stage * 352, top: 6 }}
          >
            {STAGE_LABELS[stage] ?? `Stage ${stage}`}
          </div>
        ))}

        {/* Connectors */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={layout.width}
          height={layout.height + 40}
          style={{ top: 28 }}
        >
          {layout.edges.map((e) => {
            const midX = (e.x1 + e.x2) / 2;
            const active = e.toId === selectedId || e.fromId === selectedId;
            return (
              <path
                key={`${e.fromId}-${e.toId}`}
                d={`M ${e.x1} ${e.y1} C ${midX} ${e.y1}, ${midX} ${e.y2}, ${e.x2} ${e.y2}`}
                fill="none"
                stroke={active ? "#7c5e3c" : "#8a8275"}
                strokeWidth={active ? 1.75 : 1}
                strokeOpacity={active ? 0.9 : 0.45}
              />
            );
          })}
        </svg>

        {/* Node cards */}
        <div className="absolute inset-0" style={{ top: 28 }}>
          {layout.nodes.map((p) => (
            <NodeCard
              key={p.node.id}
              pos={{ x: p.x, y: p.y }}
              node={p.node}
              selected={p.node.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
