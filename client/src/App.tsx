import { useEffect, useState } from "react";
import type { Timeline, GenerateRequest } from "./types";
import * as networkApi from "./api";
import { ControlPanel } from "./components/ControlPanel";
import { TimelineCanvas } from "./components/TimelineCanvas";
import { NodeDetail } from "./components/NodeDetail";
import { SettingsModal } from "./components/SettingsModal";

export interface TimelineApi {
  getSample: () => Promise<Timeline>;
  generateTimeline: (req: GenerateRequest) => Promise<Timeline>;
  pullThread: (args: { timeline: Timeline; nodeId: string; followUp?: string }) => Promise<Timeline>;
}

interface Props {
  /** Injected so the same UI runs against the server or fully in-browser. */
  api?: TimelineApi;
  /** Standalone (single-file) build: surface in-browser key settings. */
  standalone?: boolean;
}

export default function App({ api = networkApi, standalone = false }: Props) {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    api
      .getSample()
      .then(setTimeline)
      .catch((e) => setError(String(e?.message ?? e)));
  }, [api]);

  const run = async (args: GenerateRequest) => {
    setBusy(true);
    setError(null);
    setSelectedId(null);
    try {
      setTimeline(await api.generateTimeline(args));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onPullThread = async (args: { nodeId: string; followUp?: string }) => {
    if (!timeline) return;
    setBusy(true);
    setError(null);
    try {
      setTimeline(await api.pullThread({ timeline, ...args }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const selectedNode = timeline?.nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex h-full">
      <ControlPanel
        initialPrompt="What if Hannibal had marched on Rome after Cannae?"
        busy={busy}
        onRun={run}
        standalone={standalone}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-baseline justify-between border-b border-ink-faint/30 px-6 py-3">
          <div className="min-w-0">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Alternate timeline
            </span>
            <p className="truncate font-serif text-lg text-ink">{timeline?.prompt ?? "—"}</p>
          </div>
          {timeline && (
            <span className="shrink-0 pl-4 font-mono text-[11px] text-ink-faint">
              {timeline.nodes.length} nodes · {timeline.yearsForward} yr
            </span>
          )}
        </header>

        {error && (
          <div className="border-b border-red-900/20 bg-red-900/5 px-6 py-2 font-mono text-xs text-red-900">
            {error}
          </div>
        )}

        <div className="min-h-0 flex-1">
          {timeline ? (
            <TimelineCanvas
              timeline={timeline}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-sm text-ink-faint">
              {error ? "Could not load." : "Loading…"}
            </div>
          )}
        </div>
      </main>

      <NodeDetail
        node={selectedNode}
        busy={busy}
        onClose={() => setSelectedId(null)}
        onPullThread={onPullThread}
      />

      {standalone && showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
