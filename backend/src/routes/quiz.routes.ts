import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { generateQuiz } from "../services/aiService";
import { prisma } from "../db/prisma";
import { QuizQuestion } from "../types";
import { HeatmapActivity, HeatmapActivitySchema } from "../types/schemas";

const router = Router();

// POST /api/quiz/generate  { topic }
router.post("/generate", verifyClerkAuth, async (req, res) => {
  const { topic } = req.body as { topic?: string };
  if (!topic) return res.status(400).json({ error: "topic is required" });

  const aiQuestions = await generateQuiz(topic);

  // Save the quiz to the database
  const quiz = await prisma.quiz.create({
    data: {
      questions: {
        create: aiQuestions.map((q) => {
          const qCorrect = q.correctAnswer;
          // Append zero-width space + random to avoid statement unique constraint violations
          const uniqueSuffix = ` \u200B${Math.random().toString(36).substring(7)}`;
          return {
            statement: q.question + uniqueSuffix,
            options: {
              create: q.options.map((opt) => ({
                text: opt,
                isCorrect: qCorrect === opt
              }))
            }
          };
        })
      }
    },
    include: { questions: { include: { options: true } } }
  });

  // Hide correct answers from the client and guarantee order
  const safeQuestions = [...quiz.questions]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(q => ({
      id: q.id,
      question: q.statement.replace(/ \u200B.*/, ''), // remove our uniqueness hack for display
      options: [...q.options].sort((a, b) => a.id.localeCompare(b.id)).map(o => o.text)
    }));

  res.json({ quizId: quiz.id, questions: safeQuestions });
});

// POST /api/quiz/submit  { quizId, answers: { [index]: chosenOption } }
router.post("/submit", verifyClerkAuth, async (req, res) => {
  const { quizId, answers } = req.body as { quizId?: string; answers?: Record<string, string | string[]> };

  if (!quizId || !answers) return res.status(400).json({ error: "quizId and answers are required" });

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { id: 'asc' }, include: { options: { orderBy: { id: 'asc' } } } } }
  });

  if (!quiz) return res.status(404).json({ error: "Quiz not found." });

  let score = 0;

  const questionAttempts = quiz.questions.map((q, i) => {
    // The frontend sends answers keyed by index 0,1,2, etc.
    const selectedOptionsList = Array.isArray(answers[String(i)])
      ? (answers[String(i)] as string[])
      : [answers[String(i)] as string].filter(Boolean);

    const correctOptions = q.options.filter(opt => opt.isCorrect);

    if (correctOptions.length > 0) {
      const correctSelections = selectedOptionsList.filter(optText => correctOptions.some(co => co.text === optText)).length;
      score += (correctSelections / correctOptions.length);
    }

    const selectedOptionIds = q.options
      .filter(opt => selectedOptionsList.includes(opt.text))
      .map(opt => ({ id: opt.id }));

    return {
      questionId: q.id,
      selected: { connect: selectedOptionIds }
    };
  });

  await prisma.quizAttempt.create({
    data: {
      userId: req.userId!,
      quizId: quiz.id,
      answers: {
        create: questionAttempts
      }
    }
  });

  let earnedXp = Math.round(score * 10); // Base XP for completing the quiz
  let heatmapEvents: HeatmapActivity[] = [];

  if (Math.abs(score - quiz.questions.length) < 0.01) {
    const badge = await prisma.badge.findUnique({ where: { name: "Perfect Quiz" } });
    if (badge) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: req.userId!, badgeId: badge.id } }
      });
      if (!existing || existing.progress < badge.target) {
        earnedXp += badge.xp;
        heatmapEvents.push({
           type: "badge",
           title: `Badge Earned: ${badge.name}`,
           detail: badge.description,
           badge: "Achievement",
           date: new Date().toISOString()
        });
      }
      
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: req.userId!, badgeId: badge.id } },
        create: { userId: req.userId!, badgeId: badge.id },
        update: { progress: 1 }
      });
    }
  }

  heatmapEvents.push({
     type: "quiz",
     title: "Quiz Completed",
     detail: `Score: ${score}/${quiz.questions.length}`,
     badge: "Quiz",
     date: new Date().toISOString()
  });

  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { heatmap: true }});
  let currentHeatmap: HeatmapActivity[] = [];
  if (user?.heatmap) {
    try {
      currentHeatmap = HeatmapActivitySchema.array().parse(user.heatmap);
    } catch (err) {
      console.error(`Failed to parse heatmap for user: ${req.userId!}`);
    }
  }

  await prisma.user.update({
     where: { id: req.userId! },
     data: {
        xp: { increment: earnedXp },
        heatmap: [...currentHeatmap, ...heatmapEvents]
     }
  });

  res.json({ score, total: quiz.questions.length });
});

export default router;
