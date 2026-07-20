import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, Circle, Sparkles, Terminal, Lightbulb, AlertCircle } from "lucide-react";
import { createApiClient } from "../lib/api.js";
import TerminalComponent from "./TerminalComponent.jsx";
import TaskSolutionModal from "./TaskSolutionModal.jsx";

const STORAGE_KEY_USED_TOKENS = "shellquest_used_help_tokens";
const STORAGE_KEY_REVEALED_TASKS = "shellquest_revealed_task_ids";

export default function DailyTaskTab() {
  const { getToken } = useAuth();
  const [task, setTask] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);
  const [error, setError] = useState("");
  
  // Solution Modal & Help Token State
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [tokenAlert, setTokenAlert] = useState("");

  // Persisted Used Tokens count
  const [usedTokens, setUsedTokens] = useState(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY_USED_TOKENS);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Track which task IDs have already been revealed by this user
  const [revealedTaskIds, setRevealedTaskIds] = useState(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY_REVEALED_TASKS);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    (async () => {
      const api = createApiClient(getToken);
      try {
        const { data } = await api.get("/api/daily-task");
        setTask(data.task);
        setCompleted(data.completed);
        if (data.completedCount !== undefined) {
          setCompletedCount(data.completedCount);
        }
      } catch {
        setError("Could not load today's task.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  // Help Token Calculation
  const totalEarnedTokens = Math.floor(completedCount / 3);
  const availableTokens = Math.max(0, totalEarnedTokens - usedTokens);
  const tasksUntilNext = 3 - (completedCount % 3);

  const handleComplete = useCallback(async () => {
    setMarkingDone(true);
    setError("");
    const api = createApiClient(getToken);
    try {
      const { data } = await api.post("/api/daily-task/complete", { taskId: task?.id });
      setCompleted(true);
      if (data?.completedCount !== undefined) {
        setCompletedCount(data.completedCount);
      } else {
        setCompletedCount((prev) => prev + 1);
      }
    } catch {
      setError("Could not mark the task complete. Try again.");
    } finally {
      setMarkingDone(false);
    }
  }, [getToken, task]);

  // Reveal Solution Handler
  const handleRevealSolution = () => {
    setTokenAlert("");

    // If task was already revealed previously, open modal without deducting tokens
    if (task && revealedTaskIds.includes(task.id)) {
      setShowSolutionModal(true);
      return;
    }

    // Check if tokens are available
    if (availableTokens > 0) {
      const newUsedCount = usedTokens + 1;
      setUsedTokens(newUsedCount);
      try {
        localStorage.setItem(STORAGE_KEY_USED_TOKENS, newUsedCount.toString());
      } catch (err) {
        console.error(err);
      }

      if (task?.id) {
        const updatedRevealed = [...revealedTaskIds, task.id];
        setRevealedTaskIds(updatedRevealed);
        try {
          localStorage.setItem(STORAGE_KEY_REVEALED_TASKS, JSON.stringify(updatedRevealed));
        } catch (err) {
          console.error(err);
        }
      }

      setShowSolutionModal(true);
    } else {
      setTokenAlert("You've used all your available Help Tokens. Complete 3 more Daily Tasks to earn another token.");
    }
  };

  if (loading) {
    return (
      <div className="card-base p-6 text-center animate-pulse">
        <p className="font-mono text-sm text-coffee-soft">loading today's task workspace…</p>
      </div>
    );
  }  return (
    <div className="flex flex-col space-y-3 lg:h-[calc(100vh-250px)] lg:max-h-[calc(100vh-250px)] overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      
      {/* Ultra-Compact Task & Utility Header Card (25% Height Max) */}
      <div className="card-base p-3.5 sm:p-4 bg-card border-hairline relative overflow-hidden shadow-xs flex-shrink-0 space-y-2">
        
        {/* Top Header Row: Task Title & Compact Utility Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Task Info & Category Pill */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="p-1 rounded-lg bg-rust/10 text-rust flex-shrink-0">
              <Terminal size={13} />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-coffee leading-tight">{task?.title}</h2>
                {completed ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-moss bg-moss/10 border border-moss/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-coffee-soft bg-sand-deep/40 border border-hairline/40 px-2 py-0.5 rounded-full">
                    <Circle size={10} /> In Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-coffee-soft font-medium leading-snug line-clamp-1">{task?.description}</p>
            </div>
          </div>

          {/* Top-Right Utilities: Compact Help Tokens & Subtle Solution Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Compact Help Tokens Pill */}
            <div
              className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center gap-1 text-xs"
              title={`Earn 1 Help Token per 3 daily tasks. Progress: ${tasksUntilNext === 3 ? "Complete 3 tasks for +1" : `${tasksUntilNext} more task(s) for +1`}`}
            >
              <Lightbulb size={12} className="text-amber-500 fill-amber-400" />
              <span className="font-mono font-black text-coffee text-xs">{availableTokens}</span>
              <span className="text-[10px] text-coffee-soft font-semibold hidden md:inline">
                ({tasksUntilNext === 3 ? "+1 per 3" : `${tasksUntilNext} more for +1`})
              </span>
            </div>

            {/* Subtle Solution Utility Button */}
            <button
              type="button"
              onClick={handleRevealSolution}
              title={availableTokens > 0 || (task && revealedTaskIds.includes(task.id)) ? "Use Help Token to reveal solution" : "No Help Tokens available"}
              className={`py-0.5 px-2.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 border transition-all ${
                availableTokens > 0 || (task && revealedTaskIds.includes(task.id))
                  ? "btn-secondary border-amber-500/30 hover:bg-amber-500/15 hover:scale-102"
                  : "opacity-60 cursor-not-allowed bg-sand-deep/20 text-coffee-soft border-hairline"
              }`}
            >
              <Lightbulb size={12} className="text-amber-500 fill-amber-400" />
              <span className="text-[10px] font-bold">
                {task && revealedTaskIds.includes(task.id) ? "Solution" : "💡 Solution"}
              </span>
            </button>

            {/* Mark as Done Button */}
            {!completed && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={markingDone}
                className="btn-accent py-1 px-2.5 text-xs font-bold inline-flex items-center gap-1 shadow-xs hover:scale-102 transition-transform"
              >
                <Sparkles size={11} />
                <span className="text-[11px]">{markingDone ? "Marking…" : "Mark done"}</span>
              </button>
            )}
          </div>

        </div>

        {/* Token Alert Message if 0 tokens available */}
        {tokenAlert && (
          <div className="p-1.5 rounded-lg bg-rust/10 border border-rust/20 flex items-center justify-between gap-2 text-xs font-semibold text-rust-dark animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-rust flex-shrink-0" />
              <span className="text-[11px]">{tokenAlert}</span>
            </div>
            <button
              onClick={() => setTokenAlert("")}
              className="text-[9px] font-mono text-rust hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {error ? (
          <p className="text-xs font-semibold text-rust-dark bg-rust/5 border border-rust/10 p-1.5 rounded-lg">{error}</p>
        ) : null}
      </div>

      {/* Main Element: Adjusted Terminal Sandbox (Fits Single Viewport) */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <TerminalComponent
          onTaskComplete={handleComplete}
          containerHeightClass="h-full min-h-[300px] lg:h-[calc(100vh-360px)]"
        />
      </div>

      {/* Task Solution Reveal Modal */}
      <TaskSolutionModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        task={task}
        remainingTokens={availableTokens}
      />

    </div>
  );
}
