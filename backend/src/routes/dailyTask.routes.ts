import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { getTaskProgress, markTaskComplete, countCompletedTasks } from "../services/dbService";
import { unlockBadge } from "../services/dbService";
import { DailyTask } from "../types";

const router = Router();

// Fixed rotation of daily tasks with educational solution metadata
const TASK_LIST: DailyTask[] = [
  {
    id: "t1",
    title: "Make a folder with 3 files",
    description: "Create a folder called practice, then create 3 empty files inside it.",
    verifyCommand: "ls practice",
    solutionCommand: "mkdir practice && touch practice/file1.txt practice/file2.txt practice/file3.txt",
    solutionExplanation: "mkdir practice creates a new directory named 'practice'. touch creates empty files inside that directory without altering existing file data.",
    solutionExample: "mkdir practice && cd practice && touch notes.txt log.txt report.txt"
  },
  {
    id: "t2",
    title: "Find a file by name",
    description: "Use find to locate a file called notes.txt anywhere under your home directory.",
    verifyCommand: "find ~ -name notes.txt",
    solutionCommand: "find ~ -name notes.txt",
    solutionExplanation: "The find command searches for files and directories. The -name option specifies a filename pattern starting search from your home directory (~).",
    solutionExample: "find . -name 'report.txt'"
  },
  {
    id: "t3",
    title: "Check disk usage",
    description: "Use du or df to check how much disk space the current directory is using.",
    verifyCommand: "du -sh .",
    solutionCommand: "du -sh .",
    solutionExplanation: "du (disk usage) estimates file space usage. The -s flag summarizes total folder size, and -h formats output in human-readable sizes (MB/GB).",
    solutionExample: "du -sh /var/log"
  },
  {
    id: "t4",
    title: "Change file permissions",
    description: "Create a file called script.sh and make it executable using chmod.",
    verifyCommand: "chmod +x script.sh",
    solutionCommand: "touch script.sh && chmod +x script.sh",
    solutionExplanation: "chmod +x adds executable ('x') permission bits to script.sh so it can be executed as a shell program or binary script.",
    solutionExample: "chmod +x deploy.sh"
  },
  {
    id: "t5",
    title: "Search inside files",
    description: "Use grep to search for the word 'error' inside all .log files in the current folder.",
    verifyCommand: "grep -r error *.log",
    solutionCommand: "grep -r 'error' *.log",
    solutionExplanation: "grep searches for matching text patterns. The -r flag searches recursively through all files matching the .log extension.",
    solutionExample: "grep -i 'failed' server.log"
  },
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
  const completedCount = await countCompletedTasks(req.userId!);
  res.json({ task, completed, completedCount });
});

// GET /api/daily-task/completed-count
router.get("/completed-count", verifyClerkAuth, async (req, res) => {
  const completedCount = await countCompletedTasks(req.userId!);
  res.json({ completedCount });
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

  res.json({ ok: true, completedCount });
});

export default router;
