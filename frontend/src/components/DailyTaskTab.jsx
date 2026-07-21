import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, Circle, Sparkles, Terminal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createApiClient } from "../lib/api.js";
import TerminalComponent from "./TerminalComponent.jsx";

export default function DailyTaskTab() {
  const { getToken } = useAuth();
  const [task, setTask] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const api = createApiClient(getToken);
      try {
        const { data } = await api.get("/api/daily-task");
        setTask(data.task);
        setCompleted(data.completed);
      } catch {
        setError("Could not load today's task.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  const handleComplete = useCallback(async () => {
    setMarkingDone(true);
    setError("");
    const api = createApiClient(getToken);
    try {
      await api.post("/api/daily-task/complete", { taskId: task?.id });
      setCompleted(true);
    } catch (err) {
      const serverError = err?.response?.data?.error;
      setError(serverError || "Could not mark the task complete. Try again.");
    } finally {
      setMarkingDone(false);
    }
  }, [getToken, task]);

  if (loading) {
    return (
      <div className="card-base p-8 text-center animate-pulse">
        <p className="font-mono text-sm text-coffee-soft">loading today's task…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="card-base p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Side: Task Meta and Info */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-coffee-soft">
              <Terminal size={12} />
              <span>Today's Task Challenge</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-coffee leading-tight">{task?.title}</h3>
              <p className="text-xs text-coffee-soft leading-relaxed max-w-3xl">{task?.description}</p>
            </div>
          </div>

          {/* Right Side: Status and Manual Done Button */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3.5 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-hairline/40">
            {completed ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-moss bg-moss/10 px-2.5 py-1 rounded-full shadow-sm">
                <CheckCircle2 size={12} /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-coffee-soft bg-sand-deep/40 px-2.5 py-1 rounded-full shadow-sm">
                <Circle size={12} /> Incomplete
              </span>
            )}

            {!completed ? (
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

        {!completed ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={markingDone}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-rust text-sand px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            <Sparkles size={14} />
            {markingDone ? "Marking…" : "Mark as done"}
          </button>
        ) : null}
      </div>

      {/* Terminal View */}
      <TerminalComponent onTaskComplete={handleComplete} />
    </div>
  );
}
