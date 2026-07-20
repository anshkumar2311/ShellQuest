import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
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

  if (loading) return <p className="font-mono text-sm text-coffee-soft">loading today's task…</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-hairline bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-xs uppercase tracking-wider text-rust-dark">Today's task</p>
          {completed ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-moss font-medium">
              <CheckCircle2 size={16} /> Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-coffee-soft">
              <Circle size={16} /> Not done yet
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold">{task?.title}</h3>
        <p className="text-sm text-coffee-soft mt-1.5 leading-relaxed">{task?.description}</p>

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

      <TerminalComponent onTaskComplete={handleComplete} />
    </div>
  );
}
