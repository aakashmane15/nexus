import { chunkText } from "./chunk.js";

const sample = `
Project NEXUS is an AI-powered collaboration platform.

The backend uses PostgreSQL with pgvector for vector storage.

The RAG pipeline uses Gemini embeddings to retrieve relevant project knowledge.
`;

const chunks = chunkText(sample);

console.log(`Generated ${chunks.length} chunks:\n`);

chunks.forEach((chunk, index) => {
  console.log(`--- Chunk ${index + 1} (${chunk.length} chars) ---`);
  console.log(chunk);
  console.log();
});

if (chunks.length === 0) {
  throw new Error("Chunking produced zero chunks.");
}

if (chunks.some((chunk) => chunk.length > 1200)) {
  throw new Error("A chunk exceeds the 1200-character limit.");
}

console.log("Chunking test passed.");
