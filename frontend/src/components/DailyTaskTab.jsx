import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, Circle, Sparkles, Terminal, CalendarDays, Calendar, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createApiClient } from "../lib/api.js";
import TerminalComponent from "./TerminalComponent.jsx";

export default function DailyTaskTab() {
  const { getToken } = useAuth();
  const [dailyTask, setDailyTask] = useState(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  
  const [selectedTaskType, setSelectedTaskType] = useState("DAILY"); // "DAILY" or "WEEKLY"
  const [activeWeeklyTaskId, setActiveWeeklyTaskId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const api = createApiClient(getToken);
      try {
        const { data } = await api.get("/api/daily-task");
        setDailyTask(data.dailyTask);
        setDailyCompleted(data.dailyCompleted);
        setWeeklyTasks(data.weeklyTasks || []);
        if (data.weeklyTasks && data.weeklyTasks.length > 0) {
          setActiveWeeklyTaskId(data.weeklyTasks[0].id);
        }
      } catch {
        setError("Could not load tasks.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  const activeWeeklyTask = weeklyTasks.find(t => t.id === activeWeeklyTaskId);
  
  const activeTask = selectedTaskType === "DAILY" ? dailyTask : activeWeeklyTask;
  const activeCompleted = selectedTaskType === "DAILY" ? dailyCompleted : activeWeeklyTask?.completed;

  const handleComplete = useCallback(async () => {
    if (!activeTask) return;
    setMarkingDone(true);
    setError("");
    const api = createApiClient(getToken);
    try {
      await api.post("/api/daily-task/complete", { taskId: activeTask.id });
      if (selectedTaskType === "DAILY") {
        setDailyCompleted(true);
      } else if (selectedTaskType === "WEEKLY") {
        setWeeklyTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, completed: true } : t));
      }
    } catch (err) {
      const serverError = err?.response?.data?.error;
      setError(serverError || "Could not mark the task complete. Try again.");
    } finally {
      setMarkingDone(false);
    }
  }, [getToken, activeTask, selectedTaskType]);

  if (loading) {
    return (
      <div className="card-base p-8 text-center animate-pulse">
        <p className="font-mono text-sm text-coffee-soft">loading tasks…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Task Selection Tabs */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setSelectedTaskType("DAILY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            selectedTaskType === "DAILY" ? "bg-rust text-sand shadow-sm" : "bg-sand-deep/30 text-coffee hover:bg-sand-deep/50"
          }`}
        >
          <Calendar size={14} /> Daily Challenge
        </button>
        <button
          onClick={() => setSelectedTaskType("WEEKLY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            selectedTaskType === "WEEKLY" ? "bg-rust text-sand shadow-sm" : "bg-sand-deep/30 text-coffee hover:bg-sand-deep/50"
          }`}
        >
          <CalendarDays size={14} /> Weekly Challenges
        </button>
      </div>

      {selectedTaskType === "WEEKLY" && weeklyTasks.length > 0 && (
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          {weeklyTasks.map((task, idx) => (
            <button
              key={task.id}
              onClick={() => setActiveWeeklyTaskId(task.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border text-left min-w-[200px] transition-all ${
                activeWeeklyTaskId === task.id
                  ? "bg-sand border-rust shadow-sm"
                  : "bg-sand-deep/20 border-hairline hover:bg-sand-deep/40"
              }`}
            >
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft block mb-0.5">
                  Challenge {idx + 1}
                </span>
                <span className={`text-sm font-bold truncate block ${task.completed ? "text-moss line-through opacity-70" : "text-coffee"}`}>
                  {task.title}
                </span>
              </div>
              <div>
                {task.completed ? (
                  <CheckCircle2 size={16} className="text-moss" />
                ) : (
                  <ChevronRight size={16} className="text-coffee-soft" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTask && (
        <div className="card-base p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left Side: Task Meta and Info */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-coffee-soft">
                <Terminal size={12} />
                <span>{selectedTaskType === "DAILY" ? "Today's Task" : "Selected Weekly Task"}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-coffee leading-tight">{activeTask?.title}</h3>
                <p className="text-xs text-coffee-soft leading-relaxed max-w-3xl">{activeTask?.description}</p>
              </div>
            </div>

            {/* Right Side: Status and Manual Done Button */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3.5 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-hairline/40">
              {activeCompleted ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-moss bg-moss/10 px-2.5 py-1 rounded-full shadow-sm">
                  <CheckCircle2 size={12} /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-coffee-soft bg-sand-deep/40 px-2.5 py-1 rounded-full shadow-sm">
                  <Circle size={12} /> Incomplete
                </span>
              )}

              {!activeCompleted ? (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={markingDone}
                  className="btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <Sparkles size={12} />
                  <span>{markingDone ? "Marking…" : "Mark as done"}</span>
                </button>
              ) : null}
            </div>
          </div>

          {error ? (
            <p className="mt-3 text-sm text-rust-dark whitespace-pre-wrap font-mono bg-rust/10 p-2 rounded">{error}</p>
          ) : null}

          {!activeCompleted ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={markingDone}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-rust text-sand px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50 hidden"
            >
              <Sparkles size={14} />
              {markingDone ? "Marking…" : "Mark as done"}
            </button>
          ) : null}
        </div>
      )}

      {/* Terminal View */}
      <TerminalComponent onTaskComplete={handleComplete} />
    </div>
  );
}
