import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { prisma } from "../db/prisma";
import { todaysTask, thisWeeksTasks } from "../services/tasks";

const router = Router();

router.get("/", verifyClerkAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        attempts: true,
        quizAttempts: true,
        userBadges: true,
        chats: true
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const [dailyTask, weeklyTasks] = await Promise.all([
      todaysTask(),
      thisWeeksTasks()
    ]);

    const dailyCompleted = user.attempts.some(a => a.taskId === dailyTask.id && a.wasSuccess);
    
    // Map completed status for each weekly task
    const mappedWeeklyTasks = weeklyTasks.map(task => ({
      ...task,
      completed: user.attempts.some(a => a.taskId === task.id && a.wasSuccess)
    }));

    res.json({
      xp: user.xp,
      streak: user.streak,
      maxStreak: user.maxStreak,
      heatmap: user.heatmap || [],
      totalAttempts: user.attempts.length,
      totalQuizzes: user.quizAttempts.length,
      totalBadges: user.userBadges.length,
      totalChats: user.chats.length,
      dailyTask: { ...dailyTask, completed: dailyCompleted },
      weeklyTasks: mappedWeeklyTasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

export default router;
