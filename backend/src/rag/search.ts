import { prisma } from "./db.js";
import { embed } from "./gemini.js";

export interface Hit {
  id: string;
  content: string;
  ordinal: number;
  title: string;
  source: string;
  distance: number;
}

export async function search(
  question: string,
  k = 5,
  projectId?: string,
): Promise<Hit[]> {
  const vector = await embed(question);
  const literal = `[${vector.join(",")}]`;

  // Filter by project when projectId is provided (Part C multi-tenancy)
  if (projectId) {
    return prisma.$queryRaw<Hit[]>`
      SELECT c.id, c.content, c.ordinal, d.title, d.source,
             (c.embedding <=> ${literal}::vector) AS distance
      FROM "Chunk" c
      JOIN "Document" d ON d.id = c."documentId"
      WHERE c.embedding IS NOT NULL AND d."projectId" = ${projectId}
      ORDER BY c.embedding <=> ${literal}::vector ASC
      LIMIT ${k}
    `;
  }

  // Standalone search (Part A)
  return prisma.$queryRaw<Hit[]>`
    SELECT c.id, c.content, c.ordinal, d.title, d.source,
           (c.embedding <=> ${literal}::vector) AS distance
    FROM "Chunk" c
    JOIN "Document" d ON d.id = c."documentId"
    WHERE c.embedding IS NOT NULL
    ORDER BY c.embedding <=> ${literal}::vector ASC
    LIMIT ${k}
  `;
}
