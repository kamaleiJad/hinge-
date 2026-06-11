import type { Confidence, TimelineNode } from "../types";
import { CARD_H, CARD_W } from "../lib/layout";

const CONFIDENCE_STYLE: Record<Confidence, { dot: string; label: string }> = {
  likely: { dot: "bg-accent", label: "text-accent" },
  plausible: { dot: "bg-accent-soft", label: "text-accent-soft" },
  speculative: { dot: "bg-ink-faint", label: "text-ink-faint" },
};

export function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : `AD ${year}`;
}

interface Props {
  pos: { x: number; y: number };
  node: TimelineNode;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function NodeCard({ pos, node, selected, onSelect }: Props) {
  const conf = CONFIDENCE_STYLE[node.confidence];
  return (
    <button
      onClick={() => onSelect(node.id)}
      style={{ left: pos.x, top: pos.y, width: CARD_W, height: CARD_H }}
      className={`absolute flex flex-col rounded-sm border bg-parchment px-3.5 py-2.5 text-left shadow-sm transition-all ${
        selected
          ? "border-accent ring-1 ring-accent"
          : node.stage === 0
            ? "border-ink/70"
            : "border-ink-faint/40 hover:border-accent/70"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-ink-soft">
          {formatYear(node.year)}
        </span>
        <span className={`flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider ${conf.label}`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${conf.dot}`} />
          {node.confidence}
        </span>
      </div>
      <h3 className="mt-1.5 font-serif text-[15px] font-medium leading-tight text-ink line-clamp-2">
        {node.headline}
      </h3>
      <p className="mt-1.5 overflow-hidden text-[12px] leading-snug text-ink-soft line-clamp-3">
        {node.consequence}
      </p>
    </button>
  );
}
