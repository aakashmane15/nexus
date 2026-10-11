import { createInflateRaw } from "node:zlib";

const DEFAULT_MAX_CHARS = 1200;
const DEFAULT_OVERLAP = 200;

function hardSplit(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    out.push(text.slice(i, i + maxChars));
  }

  return out;
}

export function chunkTest(
  raw: string,
  maxChars = DEFAULT_MAX_CHARS,
  overlap = DEFAULT_OVERLAP,
): string[] {
  const text = raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  if (!text) return [];

  // Split on paragraph boundaries
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .flatMap((b) => (b.length > maxChars ? hardSplit(b, maxChars) : [b]));

  const chunks: string[] = [];
  let current = "";

  for (const block of blocks) {
    const candidate = current ? `${current}\n\n${block}` : block;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);

    const carry = overlap > 0 ? current.slice(-overlap) : "";
    current = carry ? `${carry}\n\n${block}` : block;

    if (current.length > maxChars) {
      current = block;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
