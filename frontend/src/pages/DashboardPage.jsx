import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, MessageSquareCode, ListChecks, Terminal, Award } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import ProgressDashboardTab from "../components/ProgressDashboardTab.jsx";
import AiChatTab from "../components/AiChatTab.jsx";
import QuizTab from "../components/QuizTab.jsx";
import DailyTaskTab from "../components/DailyTaskTab.jsx";
import BadgesTab from "../components/BadgesTab.jsx";

const TABS = [
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "task", label: "Daily Task", icon: Terminal },
  { id: "chat", label: "AI Chat", icon: MessageSquareCode },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "badges", label: "Badges", icon: Award },
];

export default function DashboardPage({ initialTab = "progress" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [active, setActive] = useState(tabFromUrl || initialTab);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== active) {
      setActive(tabFromUrl);
    }
  }, [tabFromUrl]);

  function handleTabChange(tabId) {
    setActive(tabId);
    setSearchParams({ tab: tabId });
  }

  return (
    <div className="min-h-screen w-full bg-sand text-coffee font-sans transition-all duration-300">
      <Navbar showUser />
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 md:py-10 space-y-6">
        
        {/* Rounded Pill Tabs Navigation */}
        <div className="flex flex-wrap gap-2 p-1 bg-sand-deep/40 rounded-2xl border border-hairline/60 max-w-max shadow-sm">
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold focus-ring transition-all duration-300 " +
                  (isActive
                    ? "bg-coffee text-sand shadow-sm"
                    : "text-coffee-soft hover:text-coffee hover:bg-sand-deep/20")
                }
              >
                <t.icon size={16} className={isActive ? "text-rust" : "text-coffee-soft"} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel with subtle fade-in */}
        <div className="animate-[fadeIn_0.4s_ease-out]">
          {active === "progress" && <ProgressDashboardTab onNavigateTab={handleTabChange} />}
          {active === "chat" && <AiChatTab />}
          {active === "quiz" && <QuizTab onNavigateTab={handleTabChange} />}
          {active === "task" && <DailyTaskTab />}
          {active === "badges" && <BadgesTab />}
        </div>
      </div>
    </div>
  );
}
