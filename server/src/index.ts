import "dotenv/config";
import express from "express";
import cors from "cors";
import { HANNIBAL_SAMPLE } from "./timeline/hardcoded.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT ?? 8787);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: process.env.LLM_PROVIDER ?? "anthropic" });
});

// A hardcoded divergence, available directly for reference.
app.get("/api/timeline/sample", (_req, res) => {
  res.json(HANNIBAL_SAMPLE);
});

// Phase 1 stub: the full request/response loop works end-to-end, but the
// body is the hardcoded sample regardless of input. Phase 2 replaces the
// internals with staged LLM generation while keeping this contract.
app.post("/api/timeline/generate", (req, res) => {
  const { prompt, yearsForward, drama } = req.body ?? {};
  res.json({
    ...HANNIBAL_SAMPLE,
    prompt: typeof prompt === "string" && prompt.trim() ? prompt : HANNIBAL_SAMPLE.prompt,
    yearsForward: yearsForward ?? HANNIBAL_SAMPLE.yearsForward,
    drama: drama ?? HANNIBAL_SAMPLE.drama,
  });
});

// Phase 1 stub: returns the timeline unchanged. Phase 2 implements real
// thread-pulling (deepen / re-root from a node).
app.post("/api/timeline/pull-thread", (req, res) => {
  const { timeline } = req.body ?? {};
  res.json(timeline ?? HANNIBAL_SAMPLE);
});

app.listen(PORT, () => {
  console.log(`[hinge] server listening on http://localhost:${PORT}`);
});
