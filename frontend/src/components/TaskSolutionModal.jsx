import React, { useState } from "react";
import { Lightbulb, Copy, Check, X, Terminal, BookOpen, Sparkles } from "lucide-react";

export default function TaskSolutionModal({
  isOpen,
  onClose,
  task,
  remainingTokens = 0
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const solutionCmd = task.solutionCommand || task.verifyCommand || "echo 'No solution command configured'";
  const solutionExplanation =
    task.solutionExplanation ||
    "Execute the specified command syntax in your terminal prompt to complete this daily task challenge.";
  const solutionExample = task.solutionExample;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(solutionCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-dark/50 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
      <div className="card-base w-full max-w-lg bg-card border-hairline p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-[scaleUp_0.2s_ease-out]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-coffee-soft hover:text-coffee hover:bg-sand-deep/40 transition-colors"
          title="Close Solution"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-hairline/60 pb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rust uppercase tracking-wider">
            <Lightbulb size={16} className="text-amber-500 fill-amber-400" />
            <span>💡 Help Token Solution</span>
          </div>
          <h3 className="text-xl font-black text-coffee leading-tight">{task.title}</h3>
          <p className="text-xs text-coffee-soft">{task.description}</p>
        </div>

        {/* Command Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-coffee-soft flex items-center gap-1">
              <Terminal size={12} /> Correct Linux Command
            </span>
            <button
              onClick={handleCopy}
              className="btn-secondary py-1 px-2.5 text-[11px] font-mono inline-flex items-center gap-1 hover:scale-102 transition-transform"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-moss" />
                  <span className="text-moss font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-coffee-dark text-sand-light font-mono text-sm leading-relaxed border border-coffee/80 flex items-center justify-between gap-3 shadow-inner">
            <code className="text-amber-300 font-bold select-all break-all">{solutionCmd}</code>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="p-4 rounded-xl bg-sand-deep/30 border border-hairline/60 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-rust block flex items-center gap-1.5">
            <BookOpen size={13} /> Explanation — How it works:
          </span>
          <p className="text-xs text-coffee leading-relaxed font-medium">
            {solutionExplanation}
          </p>
        </div>

        {/* Example Card (if available) */}
        {solutionExample && (
          <div className="p-3.5 rounded-xl bg-moss/10 border border-moss/20 space-y-1 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-moss block flex items-center gap-1">
              <Sparkles size={11} /> Practical Example:
            </span>
            <code className="font-mono text-moss-dark font-semibold block">{solutionExample}</code>
          </div>
        )}

        {/* Token Balance Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-hairline/60 text-xs">
          <span className="font-mono text-coffee-soft text-[11px] font-semibold">
            💡 Remaining Help Tokens: <strong className="text-coffee">{remainingTokens}</strong>
          </span>
          <button
            onClick={onClose}
            className="btn-primary py-2 px-5 text-xs font-bold shadow-sm hover:scale-102 transition-transform ml-auto"
          >
            Got it, back to task
          </button>
        </div>

      </div>
    </div>
  );
}
