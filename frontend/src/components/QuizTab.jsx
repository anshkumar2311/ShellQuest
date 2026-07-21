import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  CheckCircle2,
  Lock,
  Cpu,
  Globe,
  Terminal,
  FolderOpen,
  Trophy,
  Flame,
  Target,
  Sparkles,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { createApiClient } from "../lib/api.js";
import QuizReview from "./QuizReview.jsx";

const TOPICS = [
  {
    name: "File permissions",
    desc: "Learn chmod, chown, and file access modes.",
    difficulty: "Beginner",
    icon: Lock,
    colorClass: "text-rust bg-rust/10 border-rust/20"
  },
  {
    name: "Process management",
    desc: "Understand ps, top, kill, and background jobs.",
    difficulty: "Intermediate",
    icon: Cpu,
    colorClass: "text-lavender-dark bg-lavender-light/20 border-lavender-soft/30"
  },
  {
    name: "Networking basics",
    desc: "Practice ping, curl, ifconfig, and netstat.",
    difficulty: "Intermediate",
    icon: Globe,
    colorClass: "text-moss bg-moss/10 border-moss/20"
  },
  {
    name: "Shell scripting",
    desc: "Write loops, conditions, and bash scripts.",
    difficulty: "Advanced",
    icon: Terminal,
    colorClass: "text-coffee bg-coffee/10 border-coffee/20"
  },
  {
    name: "File system navigation",
    desc: "Master cd, ls, find, pwd, and paths.",
    difficulty: "Beginner",
    icon: FolderOpen,
    colorClass: "text-rust-dark bg-rust-dark/10 border-rust-dark/20"
  }
];

function resolveCorrectAnswer(q, topic) {
  if (q.correctAnswer && q.correctAnswer !== "undefined") return q.correctAnswer;
  const opts = q.options || [];
  const text = (q.question || "").toLowerCase();

  if (text.includes("change file access") || text.includes("change mode")) return opts.find((o) => o.includes("chmod")) || opts[1] || "chmod";
  if (text.includes("owner") || text.includes("ownership")) return opts.find((o) => o.includes("chown") || o.toLowerCase().includes("user") || o.toLowerCase().includes("owner")) || opts[3] || "chown";
  if (text.includes("read") || text.includes("'r'")) return opts.find((o) => o.toLowerCase().includes("read")) || opts[2] || "Read permission";
  if (text.includes("700")) return opts.find((o) => o.includes("700")) || opts[0] || "700";
  if (text.includes("rwxr-xr-x") || text.includes("755")) return opts.find((o) => o.toLowerCase().includes("all") || o.includes("755")) || opts[1] || "Owner, group, and all users";
  if (text.includes("rw-r--r--")) return opts.find((o) => o.includes("644")) || opts[2] || "644 mode";

  return opts[1] || topic;
}

function resolveExplanation(q, topic, correctAns) {
  if (q.explanation && !q.explanation.includes("undefined") && !q.explanation.includes("standard Linux command syntax")) {
    return q.explanation;
  }
  const text = (q.question || "").toLowerCase();

  // Process Management Explanations
  if (text.includes("top") || correctAns.includes("top")) {
    return "The top command provides a real-time interactive view of running processes along with live CPU, RAM memory usage, and system uptime metrics.";
  }
  if (text.includes("ps") || correctAns.includes("ps aux")) {
    return "ps aux outputs a static snapshot of all active processes on the system along with PID process IDs, user ownership, and memory consumption.";
  }
  if (text.includes("pkill") || correctAns.includes("pkill")) {
    return "pkill terminates processes by matching their process name directly (e.g. pkill firefox), whereas kill requires a numeric Process ID (PID).";
  }
  if (text.includes("kill") || correctAns.includes("kill")) {
    return "kill sends a termination signal (such as SIGTERM or SIGKILL -9) to stop a running process using its numeric Process ID (PID).";
  }
  if (text.includes("background") || text.includes("bg") || correctAns.includes("bg")) {
    return "The bg command resumes a paused or suspended job in the background, keeping your current interactive shell prompt open for new commands.";
  }

  // File Permissions & Ownership Explanations
  if (text.includes("read") || text.includes("'r'")) {
    return "The 'r' flag stands for Read permission. It grants users permission to open and view file contents or list items inside a directory.";
  }
  if (text.includes("symbolic") || text.includes("rw-r--r--")) {
    return "rw-r--r-- represents mode 644 (Read/Write for owner = 6, Read-only for group = 4, Read-only for others = 4).";
  }
  if (text.includes("ownership") || text.includes("letter") || text.includes("u")) {
    return "'u' represents User (Owner), 'g' represents Group, 'o' represents Others, and 'a' represents All in Linux permissions notation.";
  }
  if (text.includes("execute") || text.includes("rwxr-x--x")) {
    return "In 'rwxr-x--x', the owner has rwx (read, write, execute), group members have r-x (read & execute), and others have --x (execute only).";
  }
  if (text.includes("chmod") || correctAns.includes("chmod")) {
    return "chmod (change mode) modifies read (r), write (w), and execute (x) access permissions for file owners, groups, and other users.";
  }
  if (text.includes("chown") || correctAns.includes("chown")) {
    return "chown (change owner) reassigns file ownership to a specified user or group. While chmod alters access modes, chown alters who owns the file.";
  }

  // Navigation & Directory Explanations
  if (text.includes("pwd") || correctAns.includes("pwd")) {
    return "pwd (print working directory) displays the full absolute file path of the directory folder you are currently located in.";
  }
  if (text.includes("ls") || correctAns.includes("ls")) {
    return "ls (list) displays directory contents so you can see all files, folders, and subdirectories in your current working path.";
  }

  return `The correct answer is "${correctAns}". It performs the requested shell operation for ${topic} by applying standard Linux command options and parameters.`;
}

export default function QuizTab({ onNavigateTab }) {
  const { getToken } = useAuth();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(105);

  async function generate(t) {
    setTopic(t);
    setLoading(true);
    setResult(null);
    setAnswers({});
    setStartTime(Date.now());
    setQuizId(null);
    try {
      const api = createApiClient(getToken);
      const { data } = await api.post("/api/quiz/generate", { topic: t });
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
      setQuizId(data.quizId);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    const duration = startTime ? Math.max(10, Math.round((Date.now() - startTime) / 1000)) : 105;
    setTimeTakenSeconds(duration);

    try {
      const api = createApiClient(getToken);
      const { data } = await api.post("/api/quiz/submit", { topic, answers });

      const detailedResults = (data.detailedResults && data.detailedResults.length > 0)
        ? data.detailedResults
        : (questions || []).map((q, i) => {
            const userAnswer = answers[String(i)] !== undefined ? answers[String(i)] : answers[i] || "No answer";
            const correctAns = resolveCorrectAnswer(q, topic);
            const isCorrect = userAnswer === correctAns;
            return {
              question: q.question,
              options: q.options || [],
              correctAnswer: correctAns,
              userAnswer,
              isCorrect,
              explanation: resolveExplanation(q, topic, correctAns),
              command: q.command || (correctAns ? correctAns.split(" ")[0] : topic)
            };
          });

      const computedScore = detailedResults.filter((r) => r.isCorrect).length;
      const computedTotal = detailedResults.length;

      setResult({
        score: computedScore,
        total: computedTotal,
        detailedResults
      });
    } catch (err) {
      console.error(err);
      const detailedResults = (questions || []).map((q, i) => {
        const userAnswer = answers[String(i)] !== undefined ? answers[String(i)] : answers[i] || "No answer";
        const correctAns = resolveCorrectAnswer(q, topic);
        const isCorrect = userAnswer === correctAns;
        return {
          question: q.question,
          options: q.options || [],
          correctAnswer: correctAns,
          userAnswer,
          isCorrect,
          explanation: resolveExplanation(q, topic, correctAns),
          command: q.command || (correctAns ? correctAns.split(" ")[0] : topic)
        };
      });
      const computedScore = detailedResults.filter((r) => r.isCorrect).length;
      setResult({
        score: computedScore,
        total: detailedResults.length,
        detailedResults
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePracticeMistakes(incorrectItems) {
    const mistakeQuestions = incorrectItems.map((item) => ({
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      command: item.command
    }));
    setQuestions(mistakeQuestions);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
  }

  // Pick a topic screen
  if (!topic) {
    return (
      <div className="grid lg:grid-cols-3 gap-6 items-start animate-[fadeIn_0.3s_ease-out]">

        {/* Left Columns (Welcome, Featured Cards, Topics list) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Welcome Header */}
          <div className="space-y-1.5">
            <h3 className="heading-section">Linux Quizzes</h3>
            <p className="text-body">
              Test your command-line knowledge across core concepts. Choose a topic below to start.
            </p>
          </div>

          {/* Featured Quiz of the Day & Recommended Topic Row */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Featured Quiz of the Day Card */}
            <div className="card-base p-5 bg-rust/5 border-rust/20 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust bg-rust/10 px-2 py-0.5 rounded-full">
                  ⭐ Featured Quiz
                </span>
                <span className="text-[10px] font-bold text-moss font-mono">+200 XP</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-coffee">File permissions</h4>
                <p className="text-xs text-coffee-soft leading-relaxed">
                  Master chmod, chown, and file access modes. Daily bonus active!
                </p>
              </div>
              <button
                onClick={() => generate("File permissions")}
                className="btn-accent text-xs font-semibold py-2 px-4 inline-flex items-center justify-between"
              >
                <span>Start Featured Quiz</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Recommended Next Topic Card */}
            <div className="card-base p-5 bg-lavender-light/30 border-lavender-soft/30 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lavender-dark bg-lavender-light/50 px-2 py-0.5 rounded-full">
                  🎯 Recommended
                </span>
                <span className="text-[10px] font-mono text-coffee-soft">Next Step</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-coffee">Shell scripting</h4>
                <p className="text-xs text-coffee-soft leading-relaxed">
                  Based on your progress, practice writing loops, variables, and bash scripts.
                </p>
              </div>
              <button
                onClick={() => generate("Shell scripting")}
                className="btn-primary text-xs font-semibold py-2 px-4 inline-flex items-center justify-between"
              >
                <span>Practice Scripting</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

          {/* Topics Cards List with Difficulty Tags */}
          <div className="space-y-3">
            <h4 className="text-meta">All Available Quiz Topics</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {TOPICS.map((t) => {
                const TopicIcon = t.icon;
                return (
                  <button
                    key={t.name}
                    onClick={() => generate(t.name)}
                    className="text-left card-base p-4 hover:border-rust hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 flex items-start gap-3.5 group"
                  >
                    <div className={`p-2.5 rounded-xl border ${t.colorClass} group-hover:scale-105 transition-transform`}>
                      <TopicIcon size={18} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-coffee group-hover:text-rust transition-colors">{t.name}</span>
                        <ChevronRight size={14} className="text-hairline group-hover:text-rust group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-coffee-soft leading-relaxed">{t.desc}</p>
                      <div className="pt-1">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          t.difficulty === "Beginner" ? "bg-moss/10 text-moss" :
                          t.difficulty === "Intermediate" ? "bg-rust/10 text-rust" :
                          "bg-coffee/10 text-coffee"
                        }`}>
                          {t.difficulty}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side Illustration Column (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:block space-y-6">
          <div className="card-base p-6 text-center space-y-4 bg-sand-deep/20 border-hairline">
            <div className="w-16 h-16 rounded-2xl bg-sand-deep/40 text-coffee flex items-center justify-center mx-auto shadow-inner">
              <Sparkles size={28} />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-coffee">Linux Knowledge Base</h5>
              <p className="text-xs text-coffee-soft max-w-[200px] leading-relaxed mx-auto">
                Unlock achievements and test your skills. Each correct answer helps cement standard shell workflows.
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Loading state
  if (loading && !questions) {
    return (
      <div className="card-base p-12 text-center space-y-4 animate-pulse">
        <Sparkles className="mx-auto text-rust animate-spin" size={28} />
        <p className="font-mono text-sm text-coffee-soft">generating adaptive questions for {topic}…</p>
      </div>
    );
  }

  // Comprehensive AI Quiz Review Screen
  if (result) {
    return (
      <QuizReview
        topic={topic}
        result={result}
        timeTakenSeconds={timeTakenSeconds}
        onPracticeMistakes={handlePracticeMistakes}
        onTryAnotherTopic={() => setTopic(null)}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  // Active quiz screen (with progress bar)
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions && questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">

      {/* Quiz Header & Back button */}
      <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
        <div className="space-y-1">
          <button
            onClick={() => setTopic(null)}
            className="text-xs font-semibold text-coffee-soft hover:text-coffee inline-flex items-center gap-1.5 transition-colors mb-1"
          >
            <ArrowLeft size={12} /> Back to topics
          </button>
          <h3 className="font-bold text-lg text-coffee">{topic}</h3>
        </div>
        <span className="text-xs font-mono bg-sand-deep px-2.5 py-1 rounded-full font-bold text-coffee">Adaptive Quiz</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-coffee-soft">
          <span>Question progress</span>
          <span>{answeredCount} of {questions?.length || 0} answered</span>
        </div>
        <div className="w-full h-2 bg-sand-deep/45 rounded-full overflow-hidden">
          <div
            className="h-full bg-moss transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-5">
        {(questions || []).map((q, i) => (
          <div key={i} className="card-base p-5 space-y-4">
            <p className="text-sm font-semibold text-coffee">
              {i + 1}. {q.question}
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {q.options.map((opt) => {
                const isSelected = answers[i] === opt;
                return (
                  <label
                    key={opt}
                    className={
                      "text-sm rounded-xl border p-3.5 cursor-pointer flex items-center gap-2.5 transition-all " +
                      (isSelected
                        ? "border-rust bg-sand-deep/40 font-semibold text-rust"
                        : "border-hairline hover:bg-sand/30 text-coffee-soft hover:text-coffee")
                    }
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      className="accent-rust h-4 w-4"
                      checked={isSelected}
                      onChange={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className="pt-2">
        <button
          onClick={submit}
          disabled={loading || answeredCount < (questions?.length || 0)}
          className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting answers…" : "Submit answers"}
        </button>
      </div>
    </div>
  );
}
