import { exec } from "child_process";
import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { prisma } from "../db/prisma";
import { logger } from "../lib/logger";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { generateDailyTask } from "../services/tasks";

const execAsync = promisify(exec);

const router = Router();

async function todaysTask() {
  const task = await prisma.task.findFirst({
    select: {
      createdAt: true,
      title: true,
      description: true,
      difficulty: true,
      id: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  if (!task) {
    return await generateDailyTask();
  }
  const last = task.createdAt;
  const today = new Date();
  if (last.getDate() === today.getDate() && last.getMonth() === today.getMonth() && last.getFullYear() === today.getFullYear()) {
    return task;
  }
  else {
    return await generateDailyTask()
  }
}

// GET /api/daily-task
router.get("/", verifyClerkAuth, async (req, res) => {
  const task = await todaysTask();
  const completed = await prisma.attempt.findFirst({
    where: {
      taskId: task.id,
      userId: req.userId!,
      wasSuccess: true
    }
  })
  res.json({ task, completed: completed ? true : false });
});

// POST /api/daily-task/complete  { taskId }
router.post("/complete", verifyClerkAuth, async (req, res) => {
  const { taskId } = req.body as { taskId?: string };
  let task;
  try {
    task = await todaysTask();
  } catch (e) {
    return res.status(400).json({ error: "No task today" });
  }

  if (!taskId) {
    return res.status(400).json({ error: "task not found" });
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

  // Find the full task with associated badges
  const taskData = await prisma.task.findUnique({
    where: { id: taskId },
    include: { badge: true }
  });

  if (taskData && taskData.badge) {
    for (const b of taskData.badge) {
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
    }
  }

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
