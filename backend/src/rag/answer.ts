import { search, type Hit } from "./search.js";
import { generate } from "./gemini.js";

const MAX_DISTANCE = Number(process.env.RAG_MAX_DISTANCE ?? 0.65);
const REFUSAL =
  "I don't have anything in the project documents that answers that.";

export interface Source {
  title: string;
  ordinal: number;
  distance: number;
  preview: string;
}

export interface Answer {
  answer: string;
  grounded: boolean;
  sources: Source[];
}

function buildPrompt(question: string, hits: Hit[]): string {
  const context = hits
    .map((h, i) => `[${i + 1}] (${h.title}, chunk ${h.ordinal})\n${h.content}`)
    .join("\n\n---\n\n");

  return `You answer questions about a student software project using ONLY the context below.

Rules:
- If the context does not explicitly contain the answer, reply with exactly: NOT_IN_CONTEXT
- Cite sources inline as [1], [2] where you use them.
- Be concise. Never invent details, names, dates, or numbers.

CONTEXT:
${context}

QUESTION: ${question}

ANSWER:`;
}

export async function answerQuestion(
  question: string,
  k = 5,
  projectId?: string,
): Promise<Answer> {
  if (!question || !question.trim()) {
    throw new Error("Question cannot be empty");
  }

  const hits = await search(question, k, projectId);
  const relevant = hits.filter((h) => h.distance <= MAX_DISTANCE);

  // Guardrail 1 (Retrieval): Nothing is semantically close enough. Model is never called.
  if (relevant.length === 0) {
    return { answer: REFUSAL, grounded: false, sources: [] };
  }

  const raw = await generate(buildPrompt(question, relevant));

  // Guardrail 2 (Model): Retrieval found chunks, but LLM identified they don't answer the prompt.
  if (raw.includes("NOT_IN_CONTEXT")) {
    return { answer: REFUSAL, grounded: false, sources: [] };
  }

  return {
    answer: raw,
    grounded: true,
    sources: relevant.map((h) => ({
      title: h.title,
      ordinal: h.ordinal,
      distance: Number(Number(h.distance).toFixed(4)),
      preview: h.content.slice(0, 160).replace(/\s+/g, " ") + "…",
    })),
  };
}
