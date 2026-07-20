import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Award, Lock, Trophy, Sparkles, Flame, Star, Shield, Target } from "lucide-react";
import { createApiClient } from "../lib/api.js";

const CATEGORIES = ["All", "Beginner", "Terminal", "Quiz Master", "Consistency", "AI Explorer"];

const BADGE_METADATA = {
  "First Task": { category: "Beginner", icon: Award, colorClass: "text-rust bg-rust/10 border-rust/20" },
  "5 Tasks Done": { category: "Consistency", icon: Trophy, colorClass: "text-moss bg-moss/10 border-moss/20" },
  "Perfect Quiz": { category: "Quiz Master", icon: Sparkles, colorClass: "text-lavender-dark bg-lavender-light/20 border-lavender-soft/30" }
};

// Additional mock locked badges to enrich user target progression
const EXTRA_LOCK_BADGES = [
  {
    name: "AI Conversationalist",
    description: "Ask the AI assistant 10 questions about commands.",
    category: "AI Explorer",
    unlocked: false,
    icon: Star,
    colorClass: "text-rust bg-rust/10 border-rust/20"
  },
  {
    name: "Unix Guru",
    description: "Use the terminal continuously for 30 minutes.",
    category: "Terminal",
    unlocked: false,
    icon: Shield,
    colorClass: "text-coffee bg-coffee/10 border-coffee/20"
  },
  {
    name: "Consistent Navigator",
    description: "Navigate to 50 distinct directories without errors.",
    category: "Consistency",
    unlocked: false,
    icon: Target,
    colorClass: "text-moss bg-moss/10 border-moss/20"
  }
];

export default function BadgesTab() {
  const { getToken } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const api = createApiClient(getToken);
        const { data } = await api.get("/api/badges");
        setBadges(data.badges);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  if (loading) {
    return (
      <div className="card-base p-8 text-center animate-pulse">
        <p className="font-mono text-sm text-coffee-soft">loading badges…</p>
      </div>
    );
  }

  // Combine real backend badges with mock locked badges
  const formattedRealBadges = badges.map((b) => {
    const meta = BADGE_METADATA[b.name] || { category: "Beginner", icon: Award, colorClass: "text-rust bg-rust/10 border-rust/20" };
    return {
      ...b,
      category: meta.category,
      icon: meta.icon,
      colorClass: meta.colorClass
    };
  });

  const allBadges = [...formattedRealBadges, ...EXTRA_LOCK_BADGES];

  // Stats calculation
  const unlockedBadges = formattedRealBadges.filter((b) => b.unlocked);
  const totalUnlockedCount = unlockedBadges.length;
  const totalBadgesCount = allBadges.length;
  const currentStreak = 5; // placeholder streak
  const totalXp = totalUnlockedCount * 150 + 50; // simple XP calc
  const nextLevelProgress = Math.min((totalUnlockedCount / 4) * 100, 100);

  // Filtered badges
  const filteredBadges = allBadges.filter(
    (b) => activeCategory === "All" || b.category === activeCategory
  );

  // Recent achievement spotlight
  const recentBadge = unlockedBadges[unlockedBadges.length - 1] || null;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 1. Badge Showcase Highlights (Next Badge & Mastery Tips) */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Next Badge to Unlock Spotlight */}
        <div className="md:col-span-2 card-base p-6 bg-rust/5 border-rust/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust bg-rust/10 px-2.5 py-0.5 rounded-full">
              🎯 Next Target Badge
            </span>
            <span className="text-xs font-bold text-coffee-soft font-mono">Progress: 60%</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rust/10 text-rust border border-rust/20 flex-shrink-0">
              <Star size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-coffee">AI Conversationalist</h3>
              <p className="text-xs text-coffee-soft leading-relaxed">
                Ask the AI companion 10 questions regarding Linux flags and syntax. You've asked 6 / 10 questions!
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-sand-deep/45 rounded-full overflow-hidden">
            <div className="h-full bg-rust transition-all duration-300" style={{ width: "60%" }} />
          </div>
        </div>

        {/* Badge Unlock Tips */}
        <div className="card-base p-6 flex flex-col justify-between space-y-3 bg-lavender-light/20 border-lavender-soft/30">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lavender-dark">
              💡 Mastery Tips
            </span>
            <h4 className="font-bold text-sm text-coffee">How to unlock faster</h4>
            <p className="text-xs text-coffee-soft leading-relaxed pt-1">
              • Complete 1 daily challenge every day to maintain streak bonuses.
              <br />
              • Solve quizzes with 100% accuracy to trigger instant trophy badges.
            </p>
          </div>
        </div>

      </div>

      {/* 2. Category Filters */}
      <div className="flex flex-wrap gap-2 pb-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                "px-4 py-2 rounded-xl text-xs font-semibold border focus-ring transition-all duration-300 " +
                (isActive
                  ? "bg-coffee text-sand border-coffee shadow-sm"
                  : "bg-card text-coffee-soft border-hairline/60 hover:text-coffee hover:bg-sand-deep/20")
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Badges Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((b) => {
          const BadgeIcon = b.icon || Award;
          const isUnlocked = b.unlocked;

          return (
            <div
              key={b.name}
              className={
                "card-base p-5 transition-all duration-300 flex flex-col justify-between space-y-4 " +
                (isUnlocked
                  ? "shadow-[0_8px_30px_rgba(166,87,46,0.03)] hover:shadow-[0_8px_30px_rgba(166,87,46,0.09)] hover:-translate-y-0.5 border-hairline/60"
                  : "border-hairline/40 bg-sand-deep/20 opacity-40 filter grayscale scale-[0.98] border-dashed shadow-none")
              }
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${b.colorClass || "text-coffee bg-coffee/10 border-coffee/20"}`}>
                  <BadgeIcon size={20} />
                </div>
                {isUnlocked ? (
                  <span className="text-[10px] font-mono font-semibold text-moss bg-moss/10 px-2 py-0.5 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <div className="p-1 rounded-full text-coffee-soft">
                    <Lock size={14} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-[15px] text-coffee">{b.name}</h3>
                <p className="text-xs text-coffee-soft leading-relaxed">{b.description}</p>
              </div>

              {isUnlocked && b.unlockedDate && (
                <div className="pt-2 border-t border-hairline/30 flex items-center justify-between text-[10px] font-mono text-coffee-soft">
                  <span>Earned Date</span>
                  <span>{b.unlockedDate}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Motivational Quote */}
      <div className="pt-8 border-t border-hairline/60 text-center">
        <p className="text-sm italic text-coffee-soft font-medium">
          “You’re building real Linux skills one command at a time.”
        </p>
      </div>

    </div>
  );
}
