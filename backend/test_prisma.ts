import { prisma } from "./src/db/prisma";
async function run() {
  const quiz = await prisma.quiz.findFirst({ include: { questions: { include: { options: true } } } });
  console.log(JSON.stringify(quiz, null, 2));
}
run();
