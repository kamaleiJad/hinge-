// In-browser implementation of the timeline API for the standalone single-file
// build. Reuses the exact staged-generation core (@core → server/src/timeline),
// injecting a `generate` that calls Anthropic directly from the browser.

import { buildTimeline, pullThread as corePullThread } from "@core/generate";
import { HANNIBAL_SAMPLE } from "@core/hardcoded";
import type { GenerateFn } from "@core/provider";
import type { Timeline, GenerateRequest } from "../types";
import { KEY_STORAGE, MODEL_STORAGE } from "../components/SettingsModal";

const browserGenerate: GenerateFn = async (prompt, opts = {}) => {
  const key = localStorage.getItem(KEY_STORAGE);
  if (!key) {
    throw new Error("Add your Anthropic API key in ⚙ Settings to run live generation.");
  }
  const model = localStorage.getItem(MODEL_STORAGE) || "claude-opus-4-8";

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        // Opt in to direct browser access (Anthropic CORS).
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 6000,
        thinking: { type: "adaptive" },
        ...(opts.schema
          ? { output_config: { format: { type: "json_schema", schema: opts.schema } } }
          : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    throw new Error(`Network error calling Anthropic (${e instanceof Error ? e.message : e}).`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    stop_reason?: string;
    content?: Array<{ type: string; text?: string }>;
  };
  if (data.stop_reason === "refusal") throw new Error("Model declined to answer this divergence.");
  return (data.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("");
};

export function getSample(): Promise<Timeline> {
  return Promise.resolve(HANNIBAL_SAMPLE as Timeline);
}

export function generateTimeline(req: GenerateRequest): Promise<Timeline> {
  return buildTimeline(req, browserGenerate) as Promise<Timeline>;
}

export function pullThread(args: {
  timeline: Timeline;
  nodeId: string;
  followUp?: string;
}): Promise<Timeline> {
  return corePullThread(args as never, browserGenerate) as Promise<Timeline>;
}
