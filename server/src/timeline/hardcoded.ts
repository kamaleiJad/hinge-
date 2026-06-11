import type { Timeline } from "./schema.js";

/**
 * A hand-authored sample timeline used to bring the full stack up end-to-end
 * before any LLM is wired in. Served from GET /api/timeline/sample.
 *
 * Divergence: "What if Hannibal had marched on Rome after Cannae (216 BC)?"
 */
export const HANNIBAL_SAMPLE: Timeline = {
  prompt: "What if Hannibal had marched on Rome immediately after Cannae?",
  yearsForward: 200,
  drama: 0.5,
  nodes: [
    {
      id: "root",
      parent_id: null,
      stage: 0,
      year: -216,
      headline: "Hannibal turns north for Rome after Cannae",
      consequence:
        "Rather than consolidating in southern Italy, Hannibal gambles on a direct strike at the capital while the Senate reels from the loss of 50,000 men. The decision overrides Maharbal's famous advice in reverse — here the cavalry commander gets his wish.",
      confidence: "likely",
    },
    // Immediate (0-5yr)
    {
      id: "n1",
      parent_id: "root",
      stage: 1,
      year: -215,
      headline: "Siege of Rome bleeds the Carthaginian army",
      consequence:
        "Rome's Servian Walls and two freshly levied legions blunt the assault. Hannibal lacks a siege train and supply lines stretch thin across hostile territory. The siege becomes attrition he cannot win outright.",
      confidence: "plausible",
    },
    {
      id: "n2",
      parent_id: "root",
      stage: 1,
      year: -215,
      headline: "Latin allies waver but mostly hold",
      consequence:
        "The shock of an army at the gates pushes a handful of Latin towns toward Carthage, but the core confederation, bound by intermarriage and citizenship, does not collapse as Hannibal had bet. Rome's deep manpower reserves remain largely intact.",
      confidence: "plausible",
    },
    {
      id: "n3",
      parent_id: "root",
      stage: 1,
      year: -213,
      headline: "Carthaginian Senate hesitates on reinforcement",
      consequence:
        "With Hannibal seemingly on the verge of victory, the merchant aristocracy in Carthage debates whether to commit fresh armies or protect Iberian silver. The delay mirrors the historical under-support that dogged Hannibal's campaign.",
      confidence: "speculative",
    },
    // Medium (~50yr)
    {
      id: "n4",
      parent_id: "n2",
      stage: 2,
      year: -205,
      headline: "A negotiated peace partitions Italy",
      consequence:
        "Unable to take the city but too costly to expel, Hannibal extracts a treaty: Carthage keeps Iberia and Sicily, and several southern Italian cities gain independence from Rome. Roman hegemony is checked a century early.",
      confidence: "speculative",
    },
    {
      id: "n5",
      parent_id: "n2",
      stage: 2,
      year: -190,
      headline: "Rome rebuilds as a wary regional power",
      consequence:
        "Stripped of its aura of invincibility, Rome turns inward, reforming its army and consolidating central Italy rather than expanding. The Scipios rise on a platform of cautious recovery rather than overseas conquest.",
      confidence: "plausible",
    },
    {
      id: "n6",
      parent_id: "n1",
      stage: 2,
      year: -200,
      headline: "Carthage dominates the western Mediterranean trade",
      consequence:
        "With Rome contained, Carthaginian commerce flourishes across Iberia, Sicily, and North Africa. A maritime trading empire, not a land-based legionary state, becomes the Mediterranean's center of gravity.",
      confidence: "speculative",
    },
    // Long (~200yr)
    {
      id: "n7",
      parent_id: "n4",
      stage: 3,
      year: -50,
      headline: "No Roman Empire; a polycentric Mediterranean",
      consequence:
        "Without a single hegemon, the Mediterranean settles into competing powers — a Carthaginian commercial sphere, Hellenistic successor kingdoms, and a regional Rome. Latin never becomes the lingua franca of an empire.",
      confidence: "speculative",
    },
    {
      id: "n8",
      parent_id: "n6",
      stage: 3,
      year: -30,
      headline: "Punic language and Phoenician script spread west",
      consequence:
        "Carthaginian cultural influence, carried by trade, leaves a Semitic-language footprint across Iberia and the western islands — a mirror image of the Latinization that defined our own timeline.",
      confidence: "speculative",
    },
    {
      id: "n9",
      parent_id: "n5",
      stage: 3,
      year: -10,
      headline: "Roman law develops without imperial scale",
      consequence:
        "Roman legal innovation still emerges, but as the civic code of a city-state federation rather than the administrative backbone of three continents. Its later influence on Europe is profound but far narrower.",
      confidence: "speculative",
    },
  ],
};
