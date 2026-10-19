import { search } from "./search.js";

async function run() {
  const results = await search(
    "What database does Nexus use for vector storage?",
  );

  console.log("\nSearch results:");

  for (const [i, result] of results.entries()) {
    console.log(`\n[${i + 1}]`);
    console.log(`Title: ${result.title}`);
    console.log(`Distance: ${result.distance}`);
    console.log(`Content: ${result.content}`);
  }
}

run().catch((error) => {
  console.error("✗ Search error:", error);
  process.exit(1);
});
