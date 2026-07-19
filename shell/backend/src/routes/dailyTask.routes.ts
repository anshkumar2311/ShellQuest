import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { getTaskProgress, markTaskComplete, countCompletedTasks } from "../services/dbService";
import { unlockBadge } from "../services/dbService";
import { DailyTask } from "../types";

const router = Router();

// A fixed rotation of tasks — picked by day-of-year so everyone gets the
// same task on the same day, and it repeats once the list is exhausted.
const TASK_LIST: DailyTask[] = [
  { id: "t1", title: "Make a folder with 3 files", description: "Create a folder called practice, then create 3 empty files inside it.", verifyCommand: "ls practice" },
  { id: "t2", title: "Find a file by name", description: "Use find to locate a file called notes.txt anywhere under your home directory.", verifyCommand: "find ~ -name notes.txt" },
  { id: "t3", title: "Check disk usage", description: "Use du or df to check how much disk space the current directory is using.", verifyCommand: "du -sh ." },
  { id: "t4", title: "Change file permissions", description: "Create a file called script.sh and make it executable using chmod.", verifyCommand: "chmod +x script.sh" },
  { id: "t5", title: "Search inside files", description: "Use grep to search for the word 'error' inside all .log files in the current folder.", verifyCommand: "grep -r error *.log" },
];

function todaysTask(): DailyTask {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TASK_LIST[dayOfYear % TASK_LIST.length];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/daily-task
router.get("/", verifyClerkAuth, async (req, res) => {
  const task = todaysTask();
  const completed = await getTaskProgress(req.userId!, task.id, todayISO());
  res.json({ task, completed });
});

// POST /api/daily-task/complete  { taskId }
router.post("/complete", verifyClerkAuth, async (req, res) => {
  const { taskId } = req.body as { taskId?: string };
  const task = todaysTask();
  if (!taskId || taskId !== task.id) {
    return res.status(400).json({ error: "taskId does not match today's task" });
  }

  await markTaskComplete(req.userId!, taskId, todayISO());

  const completedCount = await countCompletedTasks(req.userId!);
  if (completedCount >= 5) await unlockBadge(req.userId!, "5 Tasks Done");
  if (completedCount >= 1) await unlockBadge(req.userId!, "First Task");

  res.json({ ok: true });
});

export default router;
