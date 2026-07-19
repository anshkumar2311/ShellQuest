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

  // Hide correct answers from the client
  const safeQuestions = questions.map(({ question, options }) => ({ question, options }));
  res.json({ questions: safeQuestions });
});

// POST /api/quiz/submit  { topic, answers: { [index]: chosenOption } }
router.post("/submit", verifyClerkAuth, async (req, res) => {
  const { topic, answers } = req.body as { topic?: string; answers?: Record<string, string> };
  if (!topic || !answers) return res.status(400).json({ error: "topic and answers are required" });

  const questions = activeQuizzes.get(cacheKey(req.userId!, topic));
  if (!questions) return res.status(400).json({ error: "No active quiz for this topic. Generate one first." });

  let score = 0;
  questions.forEach((q, i) => {
    if (answers[String(i)] === q.correctAnswer) score += 1;
  });

  await saveQuizResult(req.userId!, topic, score, questions.length);
  if (score === questions.length) {
    await unlockBadge(req.userId!, "Perfect Quiz");
  }

  activeQuizzes.delete(cacheKey(req.userId!, topic));
  res.json({ score, total: questions.length });
});

export default router;
