import { ingestFile } from "./ingest.js";
import { prisma } from "./db.js";

async function run() {
  console.log("Test ingestion starting...");
  await ingestFile("samples/synopsis.txt");
  await ingestFile("samples/meeting-notes.txt");
  await ingestFile("samples/tech-decisions.txt");

  const docCount = await prisma.document.count();
  const chunkCount = await prisma.chunk.count();

  console.log(`\nVerification Complete: `);
  console.log(`Documents in DB: ${docCount}`);
  console.log(`Chunks in DB: ${chunkCount}`);
}

run()
  .catch((err) => {
    console.error("Ingestion error: ", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
