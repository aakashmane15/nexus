import { readFile } from "node:fs/promises";
import path, { basename } from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "./db.js";
import { chunkText } from "./chunk.js";
import { embed } from "./gemini.js";

export async function ingestFile(
  path: string,
  projectId: string | null = null,
) {
  const raw = await readFile(path, "utf-8");
  const chunks = chunkText(raw);

  if (chunks.length === 0) {
    throw new Error(`No text found in ${path}`);
  }

  const doc = await prisma.document.create({
    data: {
      title: basename(path),
      source: path,
      projectId,
    },
  });

  for (const [i, content] of chunks.entries()) {
    const vector = await embed(content);
    const literal = `[${vector.join(",")}]`;

    await prisma.$executeRaw`INSERT INTO "Chunk" ("id", "docummentId", "ordinal", "content", "embedding", "createdAt") VALUES (${randomUUID()}, ${doc.id}, ${i}, ${content}, ${literal}::vector, now())`;

    process.stdout.write(`Embedding chunk ${i + 1}/${chunks.length}\r`);
  }

  console.log(`Ingested: ${doc.title}, Chunks stored: ${chunks.length}`);
  return { documentId: doc.id, chunks: chunks.length };
}
