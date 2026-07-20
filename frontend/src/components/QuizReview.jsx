import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  Terminal,
  MessageSquareCode,
  ShieldAlert,
  TrendingUp
} from "lucide-react";

function extractCleanCommand(cmd, questionText, correctAnswer, topic) {
  const isOptionLetter = (str) =>
    !str || ["a)", "b)", "c)", "d)", "a", "b", "c", "d"].includes(str.toLowerCase().trim());

  if (cmd && !isOptionLetter(cmd)) return cmd.trim();
  if (
    correctAnswer &&
    !isOptionLetter(correctAnswer) &&
    !correctAnswer.toLowerCase().includes("permission") &&
    !correctAnswer.toLowerCase().includes("owner") &&
    !correctAnswer.toLowerCase().includes("user")
  ) {
    return correctAnswer.trim();
  }

  const text = (questionText || "").toLowerCase();
  if (text.includes("chmod") || text.includes("permission") || text.includes("mode")) return "chmod 755";
  if (text.includes("chown") || text.includes("owner")) return "chown user:group";
  if (text.includes("top") || text.includes("resource")) return "top";
  if (text.includes("ps") || text.includes("snapshot")) return "ps aux";
  if (text.includes("kill") || text.includes("terminate")) return "kill -9";
  if (text.includes("list") || text.includes("ls")) return "ls -la";
  if (text.includes("directory") || text.includes("pwd")) return "pwd";
  if (text.includes("make") || text.includes("mkdir")) return "mkdir new_folder";
  if (text.includes("script") || text.includes("bash")) return "chmod +x script.sh";

  return topic;
}

export default function QuizReview({
  topic,
  result,
  timeTakenSeconds = 105,
  onPracticeMistakes,
  onTryAnotherTopic,
  onNavigateTab
}) {
  const { score = 0, total = 5, detailedResults = [] } = result || {};
  const percentage = Math.round((score / total) * 100);
  const xpEarned = score * 20 + (percentage === 100 ? 50 : 0);
  const incorrectCount = Math.max(0, total - score);

  // Guarantee detailedResults is populated with non-undefined fallback values
  const displayResults = detailedResults.length > 0
    ? detailedResults
    : Array.from({ length: total }, (_, i) => ({
        question: `Question ${i + 1} regarding ${topic} commands`,
        userAnswer: "Your answer",
        correctAnswer: `Standard ${topic} syntax`,
        isCorrect: i < score,
        explanation: `In ${topic}, command syntax requires precise flag specifications. Practice this command structure in the terminal to master the concept.`,
        command: topic
      }));

  const incorrectResults = displayResults.filter((r) => !r.isCorrect);

  // Format time taken string
  const mins = Math.floor(timeTakenSeconds / 60);
  const secs = timeTakenSeconds % 60;
  const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // Dynamic Strengths & Weaknesses
  const strengths = [];
  const weaknesses = [];

  if (score >= 4) {
    strengths.push("Core Command Syntax", "Option Flags Mastery");
  } else if (score >= 2) {
    strengths.push("Basic Concepts");
  } else {
    strengths.push("Attempt & Focus");
  }

  if (incorrectCount > 0) {
    if (topic.toLowerCase().includes("permission")) {
      weaknesses.push("File Permissions (chmod)", "Ownership Flags (chown)");
    } else if (topic.toLowerCase().includes("process")) {
      weaknesses.push("Signal Controls (kill)", "Background Job Management");
    } else {
      weaknesses.push(`${topic} Edge Cases`, "Command Arguments");
    }
  }

  // Dynamic AI Mistake Pattern Analysis
  let aiTutorAnalysis = "";
  if (percentage === 100) {
    aiTutorAnalysis = `Outstanding performance! You demonstrated complete mastery of ${topic}. You answered all ${total} questions with 100% accuracy and earned a perfect daily score bonus.`;
  } else if (percentage >= 70) {
    aiTutorAnalysis = `You performed well overall and demonstrated a solid understanding of ${topic}. Most of your answers were accurate, but reviewing ${weaknesses.join(
      " and "
    )} will help you reach 100%.`;
  } else {
    aiTutorAnalysis = `Good effort on ${topic}! You got ${score} out of ${total} correct. Your main challenge was distinguishing specific command arguments in ${weaknesses.join(
      " and "
    )}. Reviewing the explanations below will reinforce these concepts.`;
  }

  // Commands to Review derived directly from incorrect questions
  const commandsToReview = (incorrectResults.length > 0 ? incorrectResults : displayResults).map((item, idx) => {
    const cleanCmd = extractCleanCommand(item.command, item.question, item.correctAnswer, topic);
    return {
      questionNum: idx + 1,
      questionText: item.question,
      name: cleanCmd,
      desc: item.explanation
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 1. Quiz Summary Card */}
      <div className="card-base p-8 space-y-6 bg-card border-hairline relative overflow-hidden shadow-lg">
        
        {/* Top Header Badge & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline/60 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust bg-rust/10 px-3 py-1 rounded-full">
              Quiz Completed
            </span>
            <h2 className="text-2xl font-black text-coffee">{topic}</h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-coffee font-mono">{percentage}%</span>
            <p className="text-xs text-coffee-soft font-semibold">{score} / {total} Correct</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-sand-deep/30 border border-hairline/40 text-center space-y-0.5">
            <span className="text-[10px] font-mono text-coffee-soft uppercase font-bold block">XP Earned</span>
            <span className="text-lg font-bold text-rust font-mono inline-flex items-center gap-1">
              <Zap size={16} /> +{xpEarned} XP
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sand-deep/30 border border-hairline/40 text-center space-y-0.5">
            <span className="text-[10px] font-mono text-coffee-soft uppercase font-bold block">Time Taken</span>
            <span className="text-lg font-bold text-coffee font-mono inline-flex items-center gap-1">
              <Clock size={16} /> {timeFormatted}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-moss/10 border border-moss/20 text-center space-y-0.5">
            <span className="text-[10px] font-mono text-moss uppercase font-bold block">Correct</span>
            <span className="text-lg font-bold text-moss font-mono inline-flex items-center gap-1">
              <CheckCircle2 size={16} /> {score} Questions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rust/10 border border-rust/20 text-center space-y-0.5">
            <span className="text-[10px] font-mono text-rust uppercase font-bold block">Incorrect</span>
            <span className="text-lg font-bold text-rust font-mono inline-flex items-center gap-1">
              <XCircle size={16} /> {incorrectCount} Questions
            </span>
          </div>

        </div>

        {/* Motivational Feedback Message */}
        <div className="p-4 rounded-2xl bg-sand-deep/20 border border-hairline/40 text-center">
          <p className="text-sm font-semibold text-coffee">
            {percentage === 100
              ? "🎉 Perfect Score! Excellent work mastering this Linux topic."
              : percentage >= 70
              ? "Great effort! Review your minor mistakes below to lock in complete mastery."
              : "Keep going! Every mistake is a learning opportunity. Review the explanations below and try again."}
          </p>
        </div>

      </div>

      {/* 2. AI Mistake Pattern Analysis */}
      <div className="card-base p-6 bg-lavender-light/30 border-lavender-soft/30 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-lavender-dark uppercase tracking-wider">
          <Sparkles size={16} className="text-rust" />
          <span>AI Tutor Pattern Analysis</span>
        </div>
        <p className="text-sm text-coffee leading-relaxed font-medium">
          "{aiTutorAnalysis}"
        </p>
      </div>

      {/* 3. Strengths & Weaknesses Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-base p-6 space-y-3 border-moss/30 bg-moss/5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-moss uppercase tracking-wider">
            <CheckCircle2 size={16} />
            <span>Strengths Demonstrated</span>
          </div>
          <ul className="space-y-1.5 text-xs font-semibold text-coffee">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-base p-6 space-y-3 border-rust/30 bg-rust/5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rust uppercase tracking-wider">
            <ShieldAlert size={16} />
            <span>Needs Improvement</span>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-1.5 text-xs font-semibold text-coffee">
              {weaknesses.map((wk, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rust" />
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-coffee-soft italic">No major weakness areas identified! Great job.</p>
          )}
        </div>
      </div>

      {/* 4. Single Unified Question-by-Question Review & Interactive Practice */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="heading-section text-lg">Question-by-Question Detailed Review</h3>
            <p className="text-xs text-coffee-soft font-medium">
              Read the plain-English explanation for every question and test the command directly in the terminal sandbox.
            </p>
          </div>
          <span className="text-xs text-coffee-soft font-mono font-medium">
            {displayResults.length} Questions Reviewed
          </span>
        </div>

        <div className="space-y-4">
          {displayResults.map((item, idx) => {
            const isCorrect = item.isCorrect;
            return (
              <div
                key={idx}
                className={`card-base p-6 space-y-4 transition-all ${
                  isCorrect ? "border-moss/40 bg-moss/5" : "border-rust/40 bg-rust/5"
                }`}
              >
                {/* Question Header & Status Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-mono font-bold text-coffee-soft block">
                      Question {idx + 1}
                    </span>
                    <h4 className="font-bold text-base text-coffee leading-relaxed">{item.question}</h4>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0 ${
                      isCorrect ? "bg-moss/20 text-moss border border-moss/30" : "bg-rust/20 text-rust-dark border border-rust/30"
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                {/* Answers Grid */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {/* Selected Answer */}
                  <div className={`p-3 rounded-xl border ${isCorrect ? "bg-moss/10 border-moss/30 text-moss-dark" : "bg-rust/10 border-rust/30 text-rust-dark"}`}>
                    <span className="text-[10px] font-mono uppercase font-bold block text-coffee-soft">Your Answer</span>
                    <p className="font-semibold mt-0.5">{item.userAnswer || "No answer selected"}</p>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-3 rounded-xl bg-moss/10 border border-moss/30 text-moss-dark">
                    <span className="text-[10px] font-mono uppercase font-bold block text-moss font-bold">✓ Correct Answer</span>
                    <p className="font-bold mt-0.5 text-sm">{item.correctAnswer || "Standard command syntax"}</p>
                  </div>
                </div>

                {/* Easy Definition & Explanation Box */}
                <div className="p-4 rounded-xl bg-card border border-hairline/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-rust block flex items-center gap-1">
                    <BookOpen size={13} /> Easy Definition — Why this is correct:
                  </span>
                  <p className="text-xs text-coffee leading-relaxed font-medium">{item.explanation}</p>
                </div>

                {/* Interactive Practice Button for each question */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-hairline/40">
                  <span className="text-xs text-coffee-soft font-semibold">
                    Want to test this command syntax live?
                  </span>
                  <button
                    onClick={() => onNavigateTab?.("task")}
                    className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:scale-102 transition-transform"
                  >
                    <Terminal size={14} /> Practice Answer in Terminal
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Commands You Should Practice (Per Incorrect Answer) */}
      {commandsToReview.length > 0 && (
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline/60 pb-3">
            <div className="space-y-0.5">
              <h3 className="title-card text-base font-bold text-coffee">Commands You Should Practice</h3>
              <p className="text-xs text-coffee-soft font-medium">
                Targeted terminal commands generated for each question you answered incorrectly.
              </p>
            </div>
            <span className="text-xs text-rust font-mono font-bold bg-rust/10 px-2.5 py-1 rounded-full">
              {commandsToReview.length} Commands to Master
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {commandsToReview.map((cmd, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-sand-deep/20 border border-hairline/60 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs hover:border-rust/40 transition-colors">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-rust uppercase tracking-wider block">
                    Part of Question #{cmd.questionNum}
                  </span>
                  <p className="text-xs font-bold text-coffee leading-snug line-clamp-2">
                    "{cmd.questionText}"
                  </p>
                  <div className="pt-1">
                    <span className="font-mono font-bold text-xs text-rust-dark bg-rust/10 border border-rust/20 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <Terminal size={12} /> {cmd.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-coffee-soft leading-relaxed pt-1">
                    {cmd.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-hairline/40">
                  <button
                    onClick={() => onNavigateTab?.("chat")}
                    className="flex-1 btn-secondary py-1.5 text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <MessageSquareCode size={12} /> Ask AI
                  </button>
                  <button
                    onClick={() => onNavigateTab?.("task")}
                    className="flex-1 btn-primary py-1.5 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Terminal size={12} /> Practice in Terminal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Action Bar with "Practice My Mistakes" ⭐ */}
      <div className="card-base p-6 space-y-4 text-center bg-sand-deep/30">
        {incorrectCount > 0 ? (
          <div className="space-y-3 pb-2">
            <div className="space-y-1">
              <h4 className="font-bold text-base text-coffee">Want to target your weak spots?</h4>
              <p className="text-xs text-coffee-soft">
                Take a focused mini-quiz containing only the {incorrectCount} questions you answered incorrectly.
              </p>
            </div>
            <button
              onClick={() => onPracticeMistakes?.(incorrectResults)}
              className="btn-accent px-6 py-3 text-xs font-bold inline-flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <RotateCcw size={16} />
              <span>Practice My Mistakes ({incorrectCount} Questions)</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-moss font-bold">🎉 Perfect Score! No mistakes to practice.</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-hairline/40">
          <button
            onClick={onTryAnotherTopic}
            className="btn-primary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <BookOpen size={14} /> Try Another Topic
          </button>
          <button
            onClick={() => onNavigateTab?.("task")}
            className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Terminal size={14} /> Go to Daily Tasks
          </button>
          <button
            onClick={() => onNavigateTab?.("progress")}
            className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <TrendingUp size={14} /> View Progress Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}
