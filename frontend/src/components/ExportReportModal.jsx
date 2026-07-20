import React from "react";
import { X, Printer, Award, Trophy, CheckCircle2, Sparkles, Terminal } from "lucide-react";

export default function ExportReportModal({ stats, onClose }) {
  if (!stats) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
      <div className="card-base max-w-2xl w-full p-6 space-y-6 shadow-2xl relative animate-[scaleUp_0.2s_ease-out] bg-card border-hairline max-h-[90vh] overflow-y-auto scrollbar-custom">
        
        {/* Header Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-hairline/60 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-coffee">
            <Printer size={18} className="text-rust" />
            <h3 className="font-bold text-base">Progress Report Preview</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn-accent px-4 py-2 text-xs inline-flex items-center gap-2 shadow-sm"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-sand-deep/30 text-coffee-soft hover:text-coffee transition-colors"
              aria-label="Close report preview modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div id="printable-report" className="space-y-6 p-6 bg-sand/30 rounded-2xl border border-hairline/50 text-coffee print:p-0 print:bg-transparent print:border-none">
          
          {/* Document Header */}
          <div className="flex items-center justify-between border-b border-hairline/60 pb-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-coffee text-sand font-mono text-base font-bold shadow-sm">
                $_
              </span>
              <div>
                <h1 className="font-mono text-xl font-bold tracking-tight text-coffee">shellquest</h1>
                <p className="text-xs text-coffee-soft font-semibold">Official Student Linux Progress Report</p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-coffee-soft space-y-0.5">
              <p>Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              <p className="text-rust font-bold">Status: Active Learner</p>
            </div>
          </div>

          {/* Student & Level Overview Banner */}
          <div className="card-base p-5 bg-sand-deep/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust">Student Level</span>
              <h2 className="text-lg font-extrabold text-coffee">Level {stats.levelNumber} — {stats.levelTitle}</h2>
              <p className="text-xs text-coffee-soft">Total Experience: <span className="font-bold text-coffee">{stats.analyticsSummary.totalXP} XP</span></p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs font-bold text-moss bg-moss/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Trophy size={13} /> Consistency: {stats.consistency.percentage}%
              </span>
              <p className="text-xs text-coffee-soft block font-mono">Streak: {stats.currentStreak} Days</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-hairline/50 text-center space-y-0.5">
              <span className="text-[10px] font-mono text-coffee-soft block uppercase font-bold">Commands</span>
              <span className="text-lg font-bold text-coffee">{stats.analyticsSummary.totalCommands}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-hairline/50 text-center space-y-0.5">
              <span className="text-[10px] font-mono text-coffee-soft block uppercase font-bold">Quizzes</span>
              <span className="text-lg font-bold text-coffee">{stats.analyticsSummary.quizzesCompleted}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-hairline/50 text-center space-y-0.5">
              <span className="text-[10px] font-mono text-coffee-soft block uppercase font-bold">Daily Tasks</span>
              <span className="text-lg font-bold text-coffee">{stats.analyticsSummary.dailyTasksFinished}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-hairline/50 text-center space-y-0.5">
              <span className="text-[10px] font-mono text-coffee-soft block uppercase font-bold">Badges</span>
              <span className="text-lg font-bold text-coffee">{stats.analyticsSummary.badgesEarned}</span>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-coffee-soft">Skills Mastery Breakdown</h4>
            <div className="space-y-2.5 bg-card p-4 rounded-2xl border border-hairline/50">
              {stats.skillsProgress.map((sk) => (
                <div key={sk.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-coffee">
                    <span>{sk.name}</span>
                    <span>{sk.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-sand-deep/45 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sk.color}`}
                      style={{ width: `${sk.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assessment Summary */}
          <div className="p-4 rounded-2xl bg-lavender-light/30 border border-lavender-soft/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-lavender-dark">
              <Sparkles size={14} /> AI Assessment Summary
            </div>
            <p className="text-xs text-coffee-soft leading-relaxed italic">{stats.aiInsight}</p>
          </div>

          {/* Verification Footer Signature */}
          <div className="pt-6 border-t border-hairline/60 flex items-center justify-between text-[11px] text-coffee-soft font-mono">
            <span>Verified by ShellQuest Learning Platform</span>
            <span>https://shellquest.app</span>
          </div>

        </div>

        {/* Modal Bottom Close Action (Hidden when printing) */}
        <div className="print:hidden">
          <button
            onClick={onClose}
            className="btn-primary w-full py-2.5 text-xs font-semibold"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
