import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Award, Lock, Trophy, Sparkles, Star, Shield, Target } from "lucide-react";
import { createApiClient } from "../lib/api.js";

const CATEGORIES = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED", "SKILL", "STREAK", "GAMEPLAY", "COLLECTION"];

const getBadgeIcon = (type, difficulty) => {
  if (type === "STREAK") return Trophy;
  if (type === "GAMEPLAY") return Star;
  if (type === "COLLECTION") return Target;
  if (difficulty === "ADVANCED") return Shield;
  if (difficulty === "INTERMEDIATE") return Sparkles;
  return Award;
};

const getBadgeColor = (difficulty) => {
  if (difficulty === "BEGINNER") return "text-moss bg-moss/10 border-moss/20";
  if (difficulty === "INTERMEDIATE") return "text-rust bg-rust/10 border-rust/20";
  if (difficulty === "ADVANCED") return "text-lavender-dark bg-lavender-light/20 border-lavender-soft/30";
  return "text-coffee bg-coffee/10 border-coffee/20";
};

export default function BadgesTab() {
  const { getToken } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const api = createApiClient(getToken);
        const { data } = await api.get("/api/badges");
        setBadges(data.badges || []);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching badges.");
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

  if (error) {
    return (
      <div className="card-base p-8 text-center bg-rust/5 border-rust/20 text-rust">
        <p className="font-mono text-sm font-bold">{error}</p>
      </div>
    );
  }

  const formattedBadges = badges.map((b) => ({
    ...b,
    icon: getBadgeIcon(b.type, b.difficulty),
    colorClass: getBadgeColor(b.difficulty)
  }));

  const unlockedBadges = formattedBadges.filter((b) => b.unlocked);
  const lockedBadges = formattedBadges.filter((b) => !b.unlocked);

  const filteredBadges = formattedBadges.filter(
    (b) => activeCategory === "All" || b.type === activeCategory || b.difficulty === activeCategory
  );

  const nextTarget = lockedBadges[0] || null;

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card-base p-6 bg-rust/5 border-rust/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust bg-rust/10 px-2.5 py-0.5 rounded-full">
              🎯 Next Target Badge
            </span>
            {nextTarget && (
              <span className="text-xs font-bold text-coffee-soft font-mono">Progress: {Math.floor((nextTarget.progress / nextTarget.target) * 100)}%</span>
            )}
          </div>
          {nextTarget ? (
            <>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border flex-shrink-0 ${nextTarget.colorClass}`}>
                  <nextTarget.icon size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-coffee">{nextTarget.name}</h3>
                  <p className="text-xs text-coffee-soft leading-relaxed">
                    {nextTarget.description} ({nextTarget.progress} / {nextTarget.target})
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-sand-deep/45 rounded-full overflow-hidden">
                <div className="h-full bg-rust transition-all duration-300" style={{ width: `${Math.floor((nextTarget.progress / nextTarget.target) * 100)}%` }} />
              </div>
            </>
          ) : (
            <div className="text-center text-sm font-bold text-coffee py-4">All badges unlocked!</div>
          )}
        </div>

        <div className="card-base p-6 flex flex-col justify-between space-y-3 bg-lavender-light/20 border-lavender-soft/30">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lavender-dark">
              💡 Mastery Tips
            </span>
            <h4 className="font-bold text-sm text-coffee">How to unlock faster</h4>
            <p className="text-xs text-coffee-soft leading-relaxed pt-1">
              • Higher difficulty tasks grant up to 80 XP.
              <br />
              • Unlock badges for additional XP boosts!
            </p>
          </div>
        </div>
      </div>

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((b) => {
          const BadgeIcon = b.icon;
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
                <div className={`p-2.5 rounded-xl border ${b.colorClass}`}>
                  <BadgeIcon size={20} />
                </div>
                {isUnlocked ? (
                  <span className="text-[10px] font-mono font-semibold text-moss bg-moss/10 px-2 py-0.5 rounded-full">
                    Unlocked (+{b.xp} XP)
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
                {!isUnlocked && (
                  <p className="text-[10px] font-mono text-coffee-soft mt-1">Target: {b.progress} / {b.target}</p>
                )}
              </div>

              {isUnlocked && b.unlockedDate && (
                <div className="pt-2 border-t border-hairline/30 flex items-center justify-between text-[10px] font-mono text-coffee-soft">
                  <span>Earned Date</span>
                  <span>{new Date(b.unlockedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-8 border-t border-hairline/60 text-center">
        <p className="text-sm italic text-coffee-soft font-medium">
          “You’re building real Linux skills one command at a time.”
        </p>
      </div>

    </div>
  );
}
