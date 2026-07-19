import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, Circle } from "lucide-react";
import { createApiClient } from "../lib/api.js";
import TerminalComponent from "./TerminalComponent.jsx";

export default function DailyTaskTab() {
  const { getToken } = useAuth();
  const [task, setTask] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const api = createApiClient(getToken);
      const { data } = await api.get("/api/daily-task");
      setTask(data.task);
      setCompleted(data.completed);
      setLoading(false);
    })();
  }, [getToken]);

  const handleComplete = useCallback(async () => {
    setCompleted(true);
    const api = createApiClient(getToken);
    await api.post("/api/daily-task/complete", { taskId: task?.id });
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
      </div>

      <TerminalComponent onTaskComplete={handleComplete} />
    </div>
  );
}
