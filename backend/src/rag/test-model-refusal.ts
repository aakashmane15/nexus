import { answerQuestion } from "./answer.js";

async function run() {
  const result = await answerQuestion(
    "What is Nexus's monthly cloud subscription pricing?",
  );

  console.log("\nAnswer:");
  console.log(result.answer);

  console.log("\nGrounded:", result.grounded);

  console.log("\nSources:");
  console.log(result.sources);
}

run().catch((error) => {
  console.error("Answer error:", error);
  process.exit(1);
});
