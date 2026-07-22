import { exec } from "child_process";
import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { prisma } from "../db/prisma";
import { logger } from "../lib/logger";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { todaysTask, thisWeeksTasks } from "../services/tasks";
import { HeatmapActivity, HeatmapActivitySchema } from "../types/schemas";

const execAsync = promisify(exec);

const router = Router();

// GET /api/daily-task
router.get("/", verifyClerkAuth, async (req, res) => {
  const [dailyTask, weeklyTasks] = await Promise.all([
    todaysTask(),
    thisWeeksTasks()
  ]);

  const [dailyCompleted, weeklyCompletedData] = await Promise.all([
    prisma.attempt.findFirst({ where: { taskId: dailyTask.id, userId: req.userId!, wasSuccess: true } }),
    prisma.attempt.findMany({
      where: {
        userId: req.userId!,
        wasSuccess: true,
        taskId: { in: weeklyTasks.map(t => t.id) }
      }
    })
  ]);

  const weeklyCompletedIds = new Set(weeklyCompletedData.map(a => a.taskId));

  res.json({
    dailyTask,
    dailyCompleted: !!dailyCompleted,
    weeklyTasks: weeklyTasks.map(t => ({ ...t, completed: weeklyCompletedIds.has(t.id) }))
  });
});

// POST /api/daily-task/complete  { taskId }
router.post("/complete", verifyClerkAuth, async (req, res) => {
  const { taskId } = req.body as { taskId?: string };
  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }

  const taskData = await prisma.task.findUnique({
    where: { id: taskId },
    include: { badge: true }
  });

  if (!taskData) {
    return res.status(404).json({ error: "Task not found" });
  }

  const validatorPath = path.join(process.cwd(), "files", "validators", `${taskId}.sh`);
  try {
    await fs.access(validatorPath);
    logger.info(`Validator script found at ${validatorPath}`);
    const containerName = `sq-${req.userId}`;

    // Check if container is running first
    try {
      const { stdout: inspectOut } = await execAsync(`docker inspect -f '{{.State.Running}}' ${containerName}`);
      if (inspectOut.trim() !== "true") {
        logger.error(`Container ${containerName} is not running.`);
        return res.status(400).json({ error: "Terminal environment is not running. Connect to the terminal first." });
      }
      logger.info(`Container ${containerName} is running.`);
    } catch (err: any) {
      logger.error(`Failed to inspect container ${containerName}: ${err.message}`);
      return res.status(400).json({ error: "Terminal environment not found. Connect to the terminal first." });
    }

    // Execute the validation script inside the container
    try {
      logger.info(`Executing script inside container ${containerName}`);
      const { stdout, stderr } = await execAsync(`docker exec -i ${containerName} bash < ${validatorPath}`);
      logger.info(`Script execution succeeded. stdout: ${stdout}, stderr: ${stderr}`);
    } catch (err: any) {
      logger.error(`Script execution failed! Exit code: ${err.code}, stdout: ${err.stdout}, stderr: ${err.stderr}, message: ${err.message}`);
      return res.status(400).json({ error: "Task verification failed.\n" + (err.stderr || err.stdout || err.message) });
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      logger.warn(`No validator script found for task ${taskId}`);
    } else {
      logger.error(`Error accessing validator script: ${err.message}`);
    }
  }



  let earnedXp = 0;
  let heatmapEvents: HeatmapActivity[] = [];

  if (taskData && taskData.badge) {
    for (const b of taskData.badge) {
      const existingUb = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: req.userId!, badgeId: b.id } },
        select: { progress: true }
      });

      const newProgress = (existingUb?.progress || 0) + 1;

      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId: req.userId!,
            badgeId: b.id
          }
        },
        update: {
          progress: { increment: 1 }
        },
        create: {
          userId: req.userId!,
          badgeId: b.id,
          progress: 1
        }
      });

      if (newProgress === b.target) {
        earnedXp += b.xp;
        heatmapEvents.push({
          type: "badge",
          title: `Badge Earned: ${b.name}`,
          detail: b.description,
          badge: "Achievement",
          date: new Date().toISOString()
        });
      }
    }
  }

  // task XP
  const difficultyMap: Record<string, number> = {
    BEGINNER: 20,
    INTERMEDIATE: 40,
    ADVANCED: 80
  };
  const taskXp = taskData ? difficultyMap[taskData.difficulty] : 20;
  earnedXp += taskXp;

  heatmapEvents.push({
    type: "task",
    title: "Daily Challenge Completed",
    detail: taskData ? taskData.title : "Terminal Task",
    badge: "Terminal",
    date: new Date().toISOString()
  });

  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { heatmap: true, id: true } });
  if (!user) {
    return res.status(500).json({ error: "User not found" });
  }
  let currentHeatmap: HeatmapActivity[] = [];
  if (user.heatmap) {
    try {
      currentHeatmap = HeatmapActivitySchema.array().parse(user.heatmap);
    }
    catch (err) {
      logger.error(`Failed to parse heatmap for user: ${user.id}.`);
    }
  }

  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      xp: { increment: earnedXp },
      heatmap: [...currentHeatmap, ...heatmapEvents]
    }
  });

  // Record the successful attempt
  await prisma.attempt.create({
    data: {
      userId: req.userId!,
      taskId: taskId,
      timeTaken: 0,
      wasSuccess: true
    }
  });

  res.json({ ok: true });
});

export default router;
