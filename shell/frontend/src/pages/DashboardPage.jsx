import React, { useState } from "react";
import { MessageSquareCode, ListChecks, Terminal, Award } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import AiChatTab from "../components/AiChatTab.jsx";
import QuizTab from "../components/QuizTab.jsx";
import DailyTaskTab from "../components/DailyTaskTab.jsx";
import BadgesTab from "../components/BadgesTab.jsx";

const TABS = [
  { id: "chat", label: "AI Chat", icon: MessageSquareCode },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "task", label: "Daily Task", icon: Terminal },
  { id: "badges", label: "Badges", icon: Award },
];

export default function DashboardPage() {
  const [active, setActive] = useState("task");

  return (
    <div className="min-h-screen w-full bg-sand text-coffee">
      <Navbar showUser />
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="flex gap-2 mb-8 border-b border-hairline">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition " +
                (active === t.id
                  ? "border-rust text-coffee"
                  : "border-transparent text-coffee-soft hover:text-coffee")
              }
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {active === "chat" && <AiChatTab />}
        {active === "quiz" && <QuizTab />}
        {active === "task" && <DailyTaskTab />}
        {active === "badges" && <BadgesTab />}
      </div>
    </div>
  );
}
