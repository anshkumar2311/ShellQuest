import React, { useState } from "react";
import { Info } from "lucide-react";

export default function ActivityHeatmap({ days, activityMap, onSelectDay }) {
  const [tooltip, setTooltip] = useState(null);

  // Group 365 days into weeks (52-53 columns of 7 days)
  const weeks = [];
  let currentWeek = [];

  // Determine starting padding so first day falls on its correct day of week
  const firstDayOfWeek = days.length > 0 ? days[0].dayOfWeek : 0;
  for (let p = 0; p < firstDayOfWeek; p++) {
    currentWeek.push(null);
  }

  days.forEach((dayItem) => {
    currentWeek.push(dayItem);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Month Labels Calculation
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const validDay = week.find((d) => d !== null);
    if (validDay) {
      const m = new Date(validDay.date).getMonth();
      if (m !== lastMonth) {
        const monthName = new Date(validDay.date).toLocaleDateString("en-US", { month: "short" });
        monthLabels.push({ text: monthName, colIndex: weekIdx });
        lastMonth = m;
      }
    }
  });

  function getLevelClass(level) {
    switch (level) {
      case 3:
        return "bg-moss border-moss/80";
      case 2:
        return "bg-moss/65 border-moss/50";
      case 1:
        return "bg-moss/35 border-moss/30";
      default:
        return "bg-sand-deep/45 border-hairline/40";
    }
  }

  return (
    <div className="card-base p-6 space-y-5 shadow-[0_8px_30px_rgba(59,42,30,0.02)] relative">
      
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="title-card">365-Day Activity Heatmap</h3>
          <p className="text-xs text-coffee-soft font-medium">
            Daily command-line achievements, quizzes, tasks, and AI practice over the past year
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-coffee-soft font-mono">
          <span>Less</span>
          <div className="flex items-center gap-1 mx-1">
            <span className="w-3 h-3 rounded-xs bg-sand-deep/45 border border-hairline/40 inline-block" />
            <span className="w-3 h-3 rounded-xs bg-moss/35 border border-moss/30 inline-block" />
            <span className="w-3 h-3 rounded-xs bg-moss/65 border border-moss/50 inline-block" />
            <span className="w-3 h-3 rounded-xs bg-moss border border-moss/80 inline-block" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Grid Container with Horizontal Scrollbar for narrow viewports */}
      <div className="overflow-x-auto pb-2 scrollbar-custom">
        <div className="min-w-[760px] space-y-2">
          
          {/* Month Headers Row */}
          <div className="flex text-[10px] font-mono font-semibold text-coffee-soft pl-7 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.colIndex * 14 + 28}px` }}
              >
                {m.text}
              </span>
            ))}
          </div>

          {/* Grid Layout: Left Day Labels + 52 Weeks Grid */}
          <div className="flex gap-2">
            
            {/* Day Labels Column */}
            <div className="flex flex-col justify-between text-[10px] font-mono font-semibold text-coffee-soft pr-1 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <span key={dIdx} className="w-3 h-3 rounded-xs opacity-0" />;
                    }

                    const hasDetail = day.count > 0;
                    const dateFormatted = new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });

                    return (
                      <button
                        key={day.date}
                        onClick={() => {
                          if (hasDetail && activityMap[day.date]) {
                            onSelectDay(activityMap[day.date]);
                          } else {
                            onSelectDay({
                              dateFormatted,
                              totalEvents: 0,
                              events: []
                            });
                          }
                        }}
                        onMouseEnter={() =>
                          setTooltip({
                            text: `${day.count} ${day.count === 1 ? "activity" : "activities"} on ${dateFormatted}`,
                            date: day.date
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        className={`w-3 h-3 rounded-xs border transition-all duration-150 focus:outline-none hover:scale-125 hover:z-10 ${getLevelClass(
                          day.level
                        )} ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
                        aria-label={`${day.count} activities on ${dateFormatted}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Interactive Tooltip Footer Indicator */}
      <div className="flex items-center justify-between text-[11px] text-coffee-soft font-mono pt-1 border-t border-hairline/30">
        <span className="flex items-center gap-1">
          <Info size={12} className="text-rust" /> Click any square to view itemized activity logs
        </span>
        {tooltip ? (
          <span className="text-coffee font-bold bg-sand-deep/40 px-2.5 py-0.5 rounded-full border border-hairline/40 animate-[fadeIn_0.15s_ease-out]">
            {tooltip.text}
          </span>
        ) : (
          <span className="opacity-50">Hover over a square for details</span>
        )}
      </div>

    </div>
  );
}
