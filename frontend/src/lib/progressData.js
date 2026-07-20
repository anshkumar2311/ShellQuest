// Progress Data Engine for ShellQuest Progress Dashboard

export function getProgressStats() {
  // Generate 365 days of activity (past 52-53 weeks ending today)
  const today = new Date();
  const days = [];
  const activityMap = {};

  // We build a 365-day date array
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Seed realistic activity distribution for demonstration
    // Recent 30 days have more activity, older days have scattered activity
    let count = 0;
    const isRecent = i < 45;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    if (isRecent) {
      const rand = (i * 7 + d.getDate()) % 10;
      if (rand > 2) count = (rand % 5) + 1;
    } else if (i < 180) {
      const rand = (i * 3 + d.getDate()) % 10;
      if (rand > 5) count = (rand % 3) + 1;
    } else {
      const rand = (i * 11) % 10;
      if (rand > 7) count = 1;
    }

    // Determine level: 0 = none, 1 = 1-2, 2 = 3-4, 3 = 5+
    let level = 0;
    if (count >= 5) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: dateStr, count, level, dayOfWeek: d.getDay() });

    if (count > 0) {
      activityMap[dateStr] = generateDayDetails(dateStr, count);
    }
  }

  // Calculated Metrics
  const totalXP = 720 + 450; // 1,170 XP
  const levelNumber = 5;
  const levelTitle = "Linux Explorer";
  const xpCurrent = 720;
  const xpMax = 1000;

  const currentStreak = 6;
  const longestStreak = 12;
  const daysActive = days.filter((d) => d.count > 0).length;
  const totalLearningHours = 4.5;
  const totalChallenges = 24;

  const weeklyGoals = [
    { id: 1, title: "Complete 3 Quizzes", completed: true, current: 3, target: 3 },
    { id: 2, title: "Finish 5 Daily Tasks", completed: false, current: 3, target: 5 },
    { id: 3, title: "Practice AI Chat", completed: true, current: 1, target: 1 }
  ];

  const skillsProgress = [
    { name: "Linux Basics", percentage: 80, color: "bg-moss" },
    { name: "Permissions", percentage: 60, color: "bg-rust" },
    { name: "Networking", percentage: 30, color: "bg-lavender-dark" },
    { name: "Shell Scripting", percentage: 50, color: "bg-coffee" },
    { name: "Processes", percentage: 70, color: "bg-moss" }
  ];

  const favoriteTime = {
    label: "Evening",
    range: "6 PM - 9 PM",
    icon: "🌙"
  };

  const achievementsThisWeek = [
    { icon: "🏅", text: "Earned 2 badges", highlight: "2 badges" },
    { icon: "🔥", text: "5-day streak", highlight: "5-day" },
    { icon: "💯", text: "Scored 100% once", highlight: "100%" },
    { icon: "⚡", text: "Completed 12 commands", highlight: "12 commands" }
  ];

  const consistency = {
    percentage: 87,
    rating: "Excellent"
  };

  const aiInsight = "This week you've completed 5 quizzes, solved 8 terminal tasks, and improved your average score by 12%. You're most confident in File Management but should practice Shell Scripting. Keep going—you've maintained a 6-day learning streak!";

  const timelineItems = [
    {
      id: 1,
      type: "badge",
      icon: "🏅",
      title: "Earned Beginner Badge",
      date: "Today, 4:15 PM",
      desc: "Unlocked 'Command Commander' badge for running 50 valid terminal commands."
    },
    {
      id: 2,
      type: "quiz",
      icon: "📖",
      title: "Completed Linux Basics Quiz",
      date: "Yesterday, 7:30 PM",
      desc: "Scored 90% (9/10 correct) in File System Navigation."
    },
    {
      id: 3,
      type: "task",
      icon: "💻",
      title: "Solved 'File Permissions' Challenge",
      date: "2 days ago",
      desc: "Successfully configured chmod 755 executable permissions on practice script."
    },
    {
      id: 4,
      type: "ai",
      icon: "🤖",
      title: "Asked AI 4 Questions",
      date: "3 days ago",
      desc: "Explored grep pipe filters and standard output redirection flags."
    },
    {
      id: 5,
      type: "challenge",
      icon: "🎯",
      title: "Finished Daily Challenge",
      date: "4 days ago",
      desc: "Created nested directory tree structure with mkdir -p."
    }
  ];

  const analyticsSummary = {
    totalCommands: 142,
    quizzesCompleted: 12,
    dailyTasksFinished: 8,
    aiQuestionsAsked: 18,
    currentStreak: 6,
    longestStreak: 12,
    totalXP: totalXP,
    badgesEarned: 4
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
