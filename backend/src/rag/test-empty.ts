import { answerQuestion } from "./answer.js";

async function run() {
  await answerQuestion("");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
