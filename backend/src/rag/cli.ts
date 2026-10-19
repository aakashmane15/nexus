import { ingestFile } from "./ingest.js";
import { answerQuestion } from "./answer.js";
import { prisma } from "./db.js";

const [, , command, ...rest] = process.argv;

async function main() {
  switch (command) {
    case "ingest": {
      if (rest.length === 0) {
        throw new Error("Usage: npm run rag:ingest -- <file...>");
      }
      for (const file of rest) {
        await ingestFile(file);
      }
      break;
    }
    case "ask": {
      const question = rest.join(" ");
      if (!question || !question.trim()) {
        throw new Error('Usage: npm run rag:ask -- "your question"');
      }

      const result = await answerQuestion(question);
      console.log(`\n${result.answer}\n`);

      if (!result.grounded) {
        console.log("(no grounded sources — this is the refusal path)");
        break;
      }

      console.log("Sources:");
      result.sources.forEach((s, i) => {
        console.log(
          `  [${i + 1}] ${s.title} #${s.ordinal}  distance=${s.distance}`,
        );
        console.log(`      ${s.preview}`);
      });
      break;
    }
    default:
      throw new Error(`Unknown command "${command ?? ""}". Use: ingest | ask`);
  }
}

main()
  .catch((e) => {
    console.error("✗", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
