import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { z } from "zod";
import { HANNIBAL_SAMPLE } from "./timeline/hardcoded.js";
import { Timeline } from "./timeline/schema.js";
import { buildTimeline, pullThread } from "./timeline/generate.js";
import { activeProvider, generate } from "./llm/index.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT ?? 8787);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: activeProvider() });
});

// A hardcoded divergence, handy for UI work without burning tokens.
app.get("/api/timeline/sample", (_req, res) => {
  res.json(HANNIBAL_SAMPLE);
});

const GenerateBody = z.object({
  prompt: z.string().min(1).max(2000),
  yearsForward: z.union([z.literal(10), z.literal(50), z.literal(200)]).default(50),
  drama: z.number().min(0).max(1).default(0.4),
});

app.post("/api/timeline/generate", async (req: Request, res: Response) => {
  const parsed = GenerateBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }
  try {
    const timeline = await buildTimeline(parsed.data, generate);
    res.json(timeline);
  } catch (e) {
    console.error("[generate]", e);
    res.status(502).json({ error: e instanceof Error ? e.message : "Generation failed." });
  }
});

const PullThreadBody = z.object({
  timeline: Timeline,
  nodeId: z.string(),
  followUp: z.string().max(2000).optional(),
});

app.post("/api/timeline/pull-thread", async (req: Request, res: Response) => {
  const parsed = PullThreadBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }
  try {
    const timeline = await pullThread(parsed.data, generate);
    res.json(timeline);
  } catch (e) {
    console.error("[pull-thread]", e);
    res.status(502).json({ error: e instanceof Error ? e.message : "Thread expansion failed." });
  }
});

app.listen(PORT, () => {
  console.log(`[hinge] server listening on http://localhost:${PORT} (provider: ${activeProvider()})`);
});
