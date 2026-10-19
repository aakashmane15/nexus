import { answerQuestion } from "./answer.js";

async function run() {
  const result = await answerQuestion(
    "What database does Nexus use for vector storage?",
  );

  console.log("\nAnswer:");
  console.log(result.answer);

  console.log("\nGrounded:", result.grounded);

  console.log("\nSources:");
  for (const [i, source] of result.sources.entries()) {
    console.log(
      `[${i + 1}] ${source.title} #${source.ordinal} distance=${source.distance}`,
    );
    console.log(`    ${source.preview}`);
  }
}

run().catch((error) => {
  console.error("✗ Answer error:", error);
  process.exit(1);
});
