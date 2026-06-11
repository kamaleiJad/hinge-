import type { Timeline, GenerateRequest } from "./types";

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ?? JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export function getSample(): Promise<Timeline> {
  return fetch("/api/timeline/sample").then((r) => asJson<Timeline>(r));
}

export function generateTimeline(req: GenerateRequest): Promise<Timeline> {
  return fetch("/api/timeline/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  }).then((r) => asJson<Timeline>(r));
}

/** Pull a thread: deepen a node or re-root the simulation from it. */
export function pullThread(args: {
  timeline: Timeline;
  nodeId: string;
  followUp?: string;
}): Promise<Timeline> {
  return fetch("/api/timeline/pull-thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  }).then((r) => asJson<Timeline>(r));
}
