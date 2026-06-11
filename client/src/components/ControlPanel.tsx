import { useState } from "react";

const YEAR_OPTIONS = [10, 50, 200] as const;

interface Props {
  initialPrompt: string;
  busy: boolean;
  onRun: (args: { prompt: string; yearsForward: number; drama: number }) => void;
  standalone?: boolean;
  onOpenSettings?: () => void;
}

export function ControlPanel({
  initialPrompt,
  busy,
  onRun,
  standalone = false,
  onOpenSettings,
}: Props) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [yearsForward, setYears] = useState<number>(200);
  const [drama, setDrama] = useState(0.4);

  const submit = () => {
    if (!prompt.trim() || busy) return;
    onRun({ prompt: prompt.trim(), yearsForward, drama });
  };

  return (
    <aside className="w-80 shrink-0 border-r border-ink-faint/30 bg-parchment-dark/40 p-5 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">Hinge</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Counterfactual History Engine
          </p>
        </div>
        {standalone && (
          <button
            onClick={onOpenSettings}
            title="Live generation settings"
            className="mt-1 rounded-sm border border-ink-faint/40 px-2 py-1 font-mono text-xs text-ink-soft hover:border-accent/60"
          >
            ⚙
          </button>
        )}
      </div>

      <label className="mt-6 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        Divergence
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        rows={4}
        placeholder="What if Hannibal had marched on Rome after Cannae?"
        className="mt-2 w-full resize-none rounded-sm border border-ink-faint/40 bg-parchment px-3 py-2 font-serif text-[15px] leading-snug text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
      />

      <label className="mt-6 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        Simulate forward
      </label>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {YEAR_OPTIONS.map((y) => (
          <button
            key={y}
            onClick={() => setYears(y)}
            className={`rounded-sm border px-2 py-1.5 font-mono text-xs transition-colors ${
              yearsForward === y
                ? "border-accent bg-accent text-parchment"
                : "border-ink-faint/40 bg-parchment text-ink-soft hover:border-accent/60"
            }`}
          >
            {y} yr
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Plausibility ↔ Drama
        </label>
        <span className="font-mono text-[11px] text-ink-faint">{drama.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={drama}
        onChange={(e) => setDrama(Number(e.target.value))}
        className="mt-2 w-full accent-accent"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        <span>plausible</span>
        <span>dramatic</span>
      </div>

      <button
        onClick={submit}
        disabled={busy || !prompt.trim()}
        className="mt-7 w-full rounded-sm bg-ink px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-parchment transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? "Reasoning…" : "Run simulation"}
      </button>
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
        ⌘/Ctrl + Enter to run. Consequences are reasoned in stages — immediate
        effects first, then fed back to derive medium and long-term branches.
        {standalone && " Live runs need an Anthropic key — set one in ⚙."}
      </p>
    </aside>
  );
}
