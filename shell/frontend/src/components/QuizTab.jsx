import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2 } from "lucide-react";
import { createApiClient } from "../lib/api.js";

const TOPICS = ["File permissions", "Process management", "Networking basics", "Shell scripting", "File system navigation"];

export default function QuizTab() {
  const { getToken } = useAuth();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate(t) {
    setTopic(t);
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const api = createApiClient(getToken);
      const { data } = await api.post("/api/quiz/generate", { topic: t });
      setQuestions(data.questions);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    try {
      const api = createApiClient(getToken);
      const { data } = await api.post("/api/quiz/submit", { topic, answers });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  if (!topic) {
    return (
      <div>
        <h3 className="font-semibold text-lg mb-4">Pick a topic</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => generate(t)}
              className="text-left rounded-lg border border-hairline bg-card px-4 py-3 text-sm font-medium hover:border-rust hover:-translate-y-0.5 transition"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading && !questions) {
    return <p className="font-mono text-sm text-coffee-soft">generating questions…</p>;
  }

  if (result) {
    return (
      <div className="rounded-lg border border-hairline bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto text-moss mb-3" size={32} />
        <h3 className="text-xl font-semibold">
          You scored {result.score} / {result.total}
        </h3>
        <p className="text-sm text-coffee-soft mt-2">Topic: {topic}</p>
        <button
          onClick={() => setTopic(null)}
          className="mt-5 rounded-md bg-coffee text-sand px-4 py-2 text-sm font-medium hover:brightness-110"
        >
          Try another topic
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-lg">{topic}</h3>
      {(questions || []).map((q, i) => (
        <div key={i} className="rounded-lg border border-hairline bg-card p-4">
          <p className="text-sm font-medium mb-3">{i + 1}. {q.question}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {q.options.map((opt) => (
              <label
                key={opt}
                className={
                  "text-sm rounded-md border px-3 py-2 cursor-pointer transition " +
                  (answers[i] === opt ? "border-rust bg-sand-deep" : "border-hairline")
                }
              >
                <input
                  type="radio"
                  name={`q-${i}`}
                  className="mr-2"
                  checked={answers[i] === opt}
                  onChange={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={submit}
        disabled={loading}
        className="rounded-md bg-rust text-sand px-5 py-2.5 text-sm font-medium hover:brightness-110 disabled:opacity-50"
      >
        Submit answers
      </button>
    </div>
  );
}
