import { useState } from "react";

export const KEY_STORAGE = "hinge_anthropic_key";
export const MODEL_STORAGE = "hinge_model";

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? "");
  const [model, setModel] = useState(
    () => localStorage.getItem(MODEL_STORAGE) ?? "claude-opus-4-8"
  );

  const save = () => {
    if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
    localStorage.setItem(MODEL_STORAGE, model.trim() || "claude-opus-4-8");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border border-ink-faint/40 bg-parchment p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-ink">Live generation</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          This standalone build calls the Anthropic API directly from your
          browser. Paste your own key to run real staged generation. It is
          stored only in this browser’s local storage and is sent only to
          Anthropic — nowhere else. Leave it blank to browse the sample timeline.
        </p>

        <label className="mt-5 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Anthropic API key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-…"
          autoComplete="off"
          className="mt-2 w-full rounded-sm border border-ink-faint/40 bg-parchment-dark/40 px-3 py-2 font-mono text-[13px] text-ink focus:border-accent focus:outline-none"
        />

        <label className="mt-4 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Model
        </label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-2 w-full rounded-sm border border-ink-faint/40 bg-parchment-dark/40 px-3 py-2 font-mono text-[13px] text-ink focus:border-accent focus:outline-none"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-sm border border-ink-faint/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-accent/60"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-sm bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-parchment hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
