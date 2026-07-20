import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { generateQuiz } from "../services/aiService";
import { saveQuizResult, unlockBadge } from "../services/dbService";
import { QuizQuestion } from "../types";

const router = Router();

// In-memory cache of the last generated quiz per user+topic so /submit can
// grade without trusting the client for correct answers.
const activeQuizzes = new Map<string, QuizQuestion[]>();

function cacheKey(userId: string, topic: string) {
  return `${userId}::${topic}`;
}

// POST /api/quiz/generate  { topic }
router.post("/generate", verifyClerkAuth, async (req, res) => {
  const { topic } = req.body as { topic?: string };
  if (!topic) return res.status(400).json({ error: "topic is required" });

  const questions = await generateQuiz(topic);
  activeQuizzes.set(cacheKey(req.userId!, topic), questions);

  // Return full questions array including correct answers and explanations
  res.json({ questions });
});

// POST /api/quiz/submit  { topic, answers: { [index]: chosenOption } }
router.post("/submit", verifyClerkAuth, async (req, res) => {
  const { topic, answers } = req.body as { topic?: string; answers?: Record<string, string> };
  if (!topic || !answers) return res.status(400).json({ error: "topic and answers are required" });

  const questions = activeQuizzes.get(cacheKey(req.userId!, topic));
  if (!questions) return res.status(400).json({ error: "No active quiz for this topic. Generate one first." });

  let score = 0;
  const detailedResults = questions.map((q, i) => {
    const userAnswer = answers[String(i)] || null;
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) score += 1;
    return {
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer,
      isCorrect,
      explanation: q.explanation || `The correct answer is "${q.correctAnswer}".`,
      command: q.command || null
    };
  });

  await saveQuizResult(req.userId!, topic, score, questions.length);
  if (score === questions.length) {
    await unlockBadge(req.userId!, "Perfect Quiz");
  }

  activeQuizzes.delete(cacheKey(req.userId!, topic));
  res.json({ score, total: questions.length, detailedResults });
});

export default router;
