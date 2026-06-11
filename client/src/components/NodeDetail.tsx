import { useState } from "react";
import type { TimelineNode } from "../types";
import { formatYear } from "./NodeCard";

interface Props {
  node: TimelineNode | null;
  busy: boolean;
  onClose: () => void;
  onPullThread: (args: { nodeId: string; followUp?: string }) => void;
}

export function NodeDetail({ node, busy, onClose, onPullThread }: Props) {
  const [followUp, setFollowUp] = useState("");
  if (!node) return null;

  return (
    <aside className="w-96 shrink-0 border-l border-ink-faint/30 bg-parchment-dark/40 p-6 overflow-y-auto">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          {formatYear(node.year)} · {node.confidence}
        </span>
        <button
          onClick={onClose}
          className="font-mono text-xs text-ink-faint hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <h2 className="mt-3 font-serif text-2xl leading-tight text-ink">{node.headline}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{node.consequence}</p>

      <hr className="my-6 border-ink-faint/30" />

      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        Pull this thread
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">
        Re-root the simulation from this moment. Leave the box empty to simply
        reason deeper from here, or ask a pointed follow-up to steer it.
      </p>
      <textarea
        value={followUp}
        onChange={(e) => setFollowUp(e.target.value)}
        rows={3}
        placeholder="e.g. How does this reshape trade in the western Mediterranean?"
        className="mt-3 w-full resize-none rounded-sm border border-ink-faint/40 bg-parchment px-3 py-2 text-[14px] leading-snug text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
      />
      <button
        onClick={() => onPullThread({ nodeId: node.id, followUp: followUp.trim() || undefined })}
        disabled={busy}
        className="mt-3 w-full rounded-sm bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-parchment transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? "Reasoning…" : followUp.trim() ? "Re-root from here" : "Reason deeper"}
      </button>
    </aside>
  );
}
