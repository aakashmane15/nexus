import { embed, generate } from "./gemini.js";

async function test() {
  console.log("Testing embedding...");
  const vector = await embed("Project Embedding Test");
  console.log(`Embedding: ${vector.length}.`);

  if (vector.length !== 768) {
    throw new Error(`Mismatched dimension: ${vector.length}. Expected is 768`);
  }

  console.log("Testing generation...");
  const reply = await generate(
    "Reply with exactly: 'Gemini Flash model is working.'",
  );
  console.log(`Reponse: ${reply}`);
}

test().catch((err) => {
  console.error("Test Failed: ", err.message);
  process.exit(1);
});
