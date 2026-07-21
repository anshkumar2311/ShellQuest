import { PrismaClient } from "./src/generated/prisma/client";
const prisma = new PrismaClient();
async function run() {
  const quizzes = await prisma.quiz.findMany({ include: { questions: true } });
  console.log(JSON.stringify(quizzes, null, 2));
}
run();
