-- ShellQuest database schema
-- Run this against your AWS RDS PostgreSQL instance.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,        -- clerk_user_id
  topic TEXT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_task_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,        -- clerk_user_id
  task_id TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, task_id, date)
);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,        -- clerk_user_id
  badge_name TEXT NOT NULL,
  unlocked_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, badge_name)
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_task_user ON daily_task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
