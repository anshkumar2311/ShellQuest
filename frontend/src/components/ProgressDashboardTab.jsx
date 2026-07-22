import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createApiClient } from "../lib/api.js";
import {
  Sparkles,
  Trophy,
  Flame,
  Target,
  Award,
  Terminal,
  MessageSquareCode,
  CheckCircle2,
  Zap,
  Printer,
  BookOpen
} from "lucide-react";
import { getProgressStats } from "../lib/progressData.js";
import ActivityHeatmap from "./ActivityHeatmap.jsx";
import DayActivityModal from "./DayActivityModal.jsx";
import ExportReportModal from "./ExportReportModal.jsx";

export default function ProgressDashboardTab({ onNavigateTab }) {
  const { getToken } = useAuth();
  const [rawStats, setRawStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const api = createApiClient(getToken);
        const { data } = await api.get("/api/progress");
        setRawStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  const stats = useMemo(() => {
    if (!rawStats) return null;
    return getProgressStats(rawStats);
  }, [rawStats]);

  const [selectedDayData, setSelectedDayData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  if (loading) {
    return (
      <div className="card-base p-8 text-center animate-pulse">
        <p className="font-mono text-sm text-coffee-soft">loading progress…</p>
      </div>
    );
  }

  const hasActivity = stats && stats.daysActive > 0;

  // New User Empty State Render
  if (!hasActivity) {
    return (
      <div className="card-base p-12 text-center space-y-6 max-w-xl mx-auto my-8 animate-[fadeIn_0.3s_ease-out]">
        <div className="w-20 h-20 rounded-full bg-lavender-light/40 text-lavender-dark flex items-center justify-center mx-auto shadow-inner">
          <Sparkles size={36} />
        </div>
        <div className="space-y-2">
          <h3 className="heading-section">Welcome to ShellQuest Progress!</h3>
          <p className="text-body max-w-md mx-auto">
            You haven't completed any learning activities yet. Start your first quiz or solve a daily task to begin building your Linux progress dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab?.("task")}
            className="btn-accent px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Terminal size={16} /> Start Daily Task
          </button>
          <button
            onClick={() => onNavigateTab?.("quiz")}
            className="btn-primary px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
          >
            <BookOpen size={16} /> Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* 1. AI-Generated Learning Insights Card */}
      <div className="card-base p-6 bg-lavender-light/30 border-lavender-soft/30 space-y-3 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-lavender-dark uppercase tracking-wider">
          <Sparkles size={16} className="text-rust animate-pulse" />
          <span>AI Learning Companion Insights</span>
        </div>
        <p className="text-sm md:text-base text-coffee leading-relaxed font-medium max-w-4xl">
          "{stats.aiInsight}"
        </p>
      </div>

      {/* 2. Primary Highlights Row (Level Card, Weekly Goals, Consistency & Learning Time) */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Learning Level Card */}
        <div className="card-base p-6 space-y-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust">Learning Tier</span>
            <span className="text-xs font-bold font-mono text-moss bg-moss/10 px-2.5 py-0.5 rounded-full">Active</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-coffee">Level {stats.levelNumber}</span>
              <span className="text-xs font-bold text-rust font-mono">— {stats.levelTitle}</span>
            </div>
            <p className="text-xs text-coffee-soft">XP Progress: <span className="font-bold text-coffee">{stats.xpCurrent} / {stats.xpMax} XP</span></p>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 bg-sand-deep/45 rounded-full overflow-hidden">
              <div
                className="h-full bg-rust transition-all duration-500"
                style={{ width: `${(stats.xpCurrent / stats.xpMax) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="card-base p-6 space-y-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-coffee-soft">This Week's Goal</span>
            <span className="text-xs font-bold text-coffee font-mono">{stats.weeklyGoals.filter(g => g.completed).length} / {stats.weeklyGoals.length} completed</span>
          </div>
          <div className="space-y-2 text-xs font-semibold text-coffee">
            {stats.weeklyGoals.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-2 rounded-xl bg-sand-deep/20 border border-hairline/30">
                <span className="flex items-center gap-2">
                  <span className={g.completed ? "text-moss font-bold" : "text-coffee-soft"}>
                    {g.completed ? "☑" : "☐"}
                  </span>
                  <span className={g.completed ? "line-through opacity-70" : ""}>{g.title}</span>
                </span>
                <span className="text-[10px] font-mono text-coffee-soft">{g.current}/{g.target}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-sand-deep/45 rounded-full overflow-hidden">
            <div className="h-full bg-moss transition-all duration-500" style={{ width: `${stats.weeklyGoals.length ? (stats.weeklyGoals.filter(g => g.completed).length / stats.weeklyGoals.length) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Favorite Learning Time & Consistency Meter */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Favorite Time Card */}
          <div className="card-base p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sand-deep/40 flex items-center justify-center text-lg">
                {stats.favoriteTime.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Most Active Time</span>
                <p className="text-sm font-bold text-coffee">{stats.favoriteTime.label} <span className="text-xs font-mono text-rust">({stats.favoriteTime.range})</span></p>
              </div>
            </div>
          </div>

          {/* Consistency Meter */}
          <div className="card-base p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Consistency Rating</span>
              <span className="text-moss font-bold">{stats.consistency.rating} ({stats.consistency.percentage}%)</span>
            </div>
            <div className="w-full h-2.5 bg-sand-deep/45 rounded-full overflow-hidden">
              <div className="h-full bg-moss transition-all duration-500" style={{ width: `${stats.consistency.percentage}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Skills Progress & Weekly Achievements */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Skills Progress Card */}
        <div className="md:col-span-2 card-base p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="title-card">Skills Progress by Topic</h3>
            <span className="text-xs font-mono text-coffee-soft">Mastery levels</span>
          </div>
          <div className="space-y-3">
            {stats.skillsProgress.map((sk) => (
              <div key={sk.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-coffee">
                  <span>{sk.name}</span>
                  <span className="font-mono">{sk.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-sand-deep/45 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${sk.color} transition-all duration-500`}
                    style={{ width: `${sk.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements This Week Card */}
        <div className="card-base p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="title-card">Achievements This Week</h3>
            <p className="text-xs text-coffee-soft">Recent milestone highlights</p>
          </div>
          <div className="space-y-2.5">
            {stats.achievementsThisWeek.map((ach, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-sand-deep/20 border border-hairline/30 text-xs font-semibold text-coffee">
                <span className="text-base">{ach.icon}</span>
                <span>{ach.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Calendar Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card-base p-4 text-center space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft block">Current Streak</span>
          <span className="text-lg font-bold text-rust font-mono flex items-center justify-center gap-1">
            <Flame size={16} /> {stats.currentStreak} Days
          </span>
        </div>
        <div className="card-base p-4 text-center space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft block">Longest Streak</span>
          <span className="text-lg font-bold text-coffee font-mono">{stats.longestStreak} Days</span>
        </div>
        <div className="card-base p-4 text-center space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft block">Days Active</span>
          <span className="text-lg font-bold text-coffee font-mono">{stats.daysActive} Days</span>
        </div>
        <div className="card-base p-4 text-center space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft block">Learning Time</span>
          <span className="text-lg font-bold text-coffee font-mono">{stats.totalLearningHours} Hours</span>
        </div>
        <div className="card-base p-4 text-center space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-bold uppercase text-coffee-soft block">Challenges Done</span>
          <span className="text-lg font-bold text-coffee font-mono">{stats.totalChallenges} Completed</span>
        </div>
      </div>

      {/* 5. 365-Day GitHub Contribution Heatmap */}
      <ActivityHeatmap
        days={stats.days}
        activityMap={stats.activityMap}
        onSelectDay={(dayData) => setSelectedDayData(dayData)}
      />

      {/* 6. Weekly & Monthly Analytics Grid */}
      <div className="space-y-4">
        <h3 className="heading-section text-base">Detailed System Analytics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-rust/10 text-rust">
              <Terminal size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Commands Executed</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.totalCommands}</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-moss/10 text-moss">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Quizzes Solved</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.quizzesCompleted}</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-sand-deep/40 text-coffee">
              <Target size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Daily Tasks</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.dailyTasksFinished}</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-lavender-light/30 text-lavender-dark">
              <MessageSquareCode size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">AI Questions</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.aiQuestionsAsked}</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-rust/10 text-rust">
              <Flame size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Active Streak</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.currentStreak} Days</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-moss/10 text-moss">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Best Streak</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.longestStreak} Days</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-sand-deep/40 text-coffee">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Total XP</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.totalXP} XP</p>
            </div>
          </div>

          <div className="card-base p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-rust-dark/10 text-rust-dark">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-coffee-soft">Badges Unlocked</p>
              <p className="text-lg font-bold text-coffee">{stats.analyticsSummary.badgesEarned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Learning Activity Timeline */}
      <div className="card-base p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="title-card">Learning Activity Feed</h3>
            <p className="text-xs text-coffee-soft">Chronological log of recent accomplishments</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-moss bg-moss/10 px-2.5 py-0.5 rounded-full">
            Live Feed
          </span>
        </div>

        <div className="space-y-6 relative border-l-2 border-hairline/50 pl-6 ml-3 py-1">
          {stats.timelineItems.map((item) => (
            <div key={item.id} className="relative animate-[fadeIn_0.3s_ease-out]">
              <span className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-card border border-hairline flex items-center justify-center text-xs shadow-xs">
                {item.icon}
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-coffee">{item.title}</h4>
                  <span className="text-[10px] font-mono text-coffee-soft">{item.date}</span>
                </div>
                <p className="text-xs text-coffee-soft leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Export Learning Report & Motivational Footer */}
      <div className="card-base p-8 text-center space-y-6 bg-sand-deep/20 border-dashed">
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-bold text-base text-coffee">Need a report for teachers or portfolios?</h3>
          <p className="text-xs text-coffee-soft">
            Export a full printable summary including quiz scores, streaks, skills mastery breakdown, and badge accomplishments.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-accent px-6 py-3 text-xs font-semibold inline-flex items-center gap-2 shadow-sm hover:scale-[1.02] transition-transform"
          >
            <Printer size={16} />
            <span>Download Progress Report (PDF)</span>
          </button>
        </div>

        <div className="pt-4 border-t border-hairline/40">
          <p className="text-sm italic font-serif text-coffee-soft">
            “Small commands every day build powerful Linux skills.”
          </p>
        </div>
      </div>

      {/* Modals */}
      {selectedDayData && (
        <DayActivityModal
          selectedDayData={selectedDayData}
          onClose={() => setSelectedDayData(null)}
        />
      )}

      {showExportModal && (
        <ExportReportModal
          stats={stats}
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
}
