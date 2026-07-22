// Progress Data Engine for ShellQuest Progress Dashboard

export function getProgressStats(userData) {
  const { xp, streak, maxStreak, heatmap, totalAttempts, totalQuizzes, totalBadges, totalChats } = userData;

  const today = new Date();
  const days = [];
  const activityMap = {};
  
  // Aggregate heatmap events by date string
  const groupedEvents = {};
  heatmap.forEach(event => {
    const d = new Date(event.date);
    const dateStr = d.toISOString().split("T")[0];
    if (!groupedEvents[dateStr]) groupedEvents[dateStr] = [];
    groupedEvents[dateStr].push(event);
  });

  // Build a 365-day date array
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const events = groupedEvents[dateStr] || [];
    const count = events.length;

    let level = 0;
    if (count >= 5) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: dateStr, count, level, dayOfWeek: d.getDay() });

    if (count > 0) {
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
      activityMap[dateStr] = {
        dateFormatted: formattedDate,
        totalEvents: count,
        events
      };
    }
  }

  // Calculated Metrics
  const totalXP = xp;
  const levelNumber = Math.floor(xp / 100) + 1;
  const levelTitle = "Linux Explorer"; // Can be dynamic
  const xpCurrent = xp % 100;
  const xpMax = 100;

  const currentStreak = streak;
  const longestStreak = maxStreak;
  const daysActive = days.filter((d) => d.count > 0).length;
  const totalLearningHours = 0; // Replace if tracking time
  const totalChallenges = totalAttempts;

  const weeklyGoals = [];
  if (userData.dailyTask) {
    weeklyGoals.push({
      id: "daily",
      title: "Daily Linux Challenge",
      completed: userData.dailyTask.completed,
      current: userData.dailyTask.completed ? 1 : 0,
      target: 1
    });
  }
  
  if (userData.weeklyTasks && Array.isArray(userData.weeklyTasks)) {
    userData.weeklyTasks.forEach((task, index) => {
      weeklyGoals.push({
        id: `weekly-${task.id}`,
        title: `Weekly Challenge ${index + 1}`,
        completed: task.completed,
        current: task.completed ? 1 : 0,
        target: 1
      });
    });
  }

  const skillsProgress = [];

  const favoriteTime = {
    label: "Evening",
    range: "6 PM - 9 PM",
    icon: "🌙"
  };

  const achievementsThisWeek = [];

  const consistency = {
    percentage: Math.min((currentStreak / 30) * 100, 100).toFixed(0),
    rating: currentStreak > 7 ? "Excellent" : currentStreak > 3 ? "Good" : "Needs Work"
  };

  const aiInsight = `You've completed ${totalQuizzes} quizzes and ${totalAttempts} terminal tasks. You have a ${currentStreak}-day streak. Keep it up!`;

  // Sort timeline events: most recent 5
  const timelineItems = [...heatmap]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((event, idx) => {
      let icon = "💻";
      if (event.type === "quiz") icon = "📖";
      if (event.type === "badge") icon = "🏅";
      if (event.type === "ai") icon = "🤖";
      
      const d = new Date(event.date);
      const timeStr = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      return {
        id: idx,
        type: event.type,
        icon,
        title: event.title,
        date: timeStr,
        desc: event.detail
      };
    });

  const analyticsSummary = {
    totalCommands: 0,
    quizzesCompleted: totalQuizzes,
    dailyTasksFinished: totalAttempts,
    aiQuestionsAsked: totalChats,
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    totalXP: totalXP,
    badgesEarned: totalBadges
  };

  return {
    days,
    activityMap,
    levelNumber,
    levelTitle,
    xpCurrent,
    xpMax,
    currentStreak,
    longestStreak,
    daysActive,
    totalLearningHours,
    totalChallenges,
    weeklyGoals,
    skillsProgress,
    favoriteTime,
    achievementsThisWeek,
    consistency,
    aiInsight,
    timelineItems,
    analyticsSummary
  };
}

function generateDayDetails(dateStr, count) {
  const dateObj = new Date(dateStr);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const events = [];

  if (count >= 1) {
    events.push({
      type: "quiz",
      title: "Quiz Completed: Linux Permissions",
      detail: "Score: 9/10 (90%)",
      badge: "Quiz"
    });
  }
  if (count >= 2) {
    events.push({
      type: "task",
      title: "Daily Challenge Completed",
      detail: "Created folder practice with 3 empty files inside",
      badge: "Terminal"
    });
  }
  if (count >= 3) {
    events.push({
      type: "ai",
      title: "Used AI Chat",
      detail: "Asked 4 questions regarding pipe commands and grep flags",
      badge: "AI Assistant"
    });
  }
  if (count >= 4) {
    events.push({
      type: "badge",
      title: "Badge Earned: Terminal Explorer",
      detail: "Unlocked for completing 10 terminal challenges",
      badge: "Achievement"
    });
  }
  if (count >= 5) {
    events.push({
      type: "challenge",
      title: "Finished Script Automation Test",
      detail: "Wrote bash loop executing multi-line check",
      badge: "Scripting"
    });
  }

  return {
    dateFormatted: formattedDate,
    totalEvents: count,
    events
  };
}
