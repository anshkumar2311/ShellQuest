import { Pool } from "pg";

const LOCAL_DATABASE_URL = "postgresql://shellquest:shellquest@localhost:5432/shellquest";

function resolveDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.includes("your-rds-endpoint.amazonaws.com")) {
    return LOCAL_DATABASE_URL;
  }

  return databaseUrl;
}

const databaseUrl = resolveDatabaseUrl();

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("amazonaws.com") ? { rejectUnauthorized: false } : undefined,
});

// ---------- users ----------

export async function ensureUser(userId: string, name: string | null, email: string | null) {
  await pool.query(
    `INSERT INTO users (clerk_user_id, name, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_user_id) DO NOTHING`,
    [userId, name, email]
  );
}

// ---------- quiz ----------

export async function saveQuizResult(userId: string, topic: string, score: number, total: number) {
  await pool.query(
    `INSERT INTO quiz_results (user_id, topic, score, total, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [userId, topic, score, total]
  );
}

// ---------- daily task ----------

export async function getTaskProgress(userId: string, taskId: string, date: string) {
  const { rows } = await pool.query(
    `SELECT completed FROM daily_task_progress WHERE user_id = $1 AND task_id = $2 AND date = $3`,
    [userId, taskId, date]
  );
  return rows[0]?.completed ?? false;
}

export async function markTaskComplete(userId: string, taskId: string, date: string) {
  await pool.query(
    `INSERT INTO daily_task_progress (user_id, task_id, date, completed)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (user_id, task_id, date)
     DO UPDATE SET completed = true`,
    [userId, taskId, date]
  );
}

export async function countCompletedTasks(userId: string): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM daily_task_progress WHERE user_id = $1 AND completed = true`,
    [userId]
  );
  return rows[0]?.count ?? 0;
}

// ---------- badges ----------

export async function getUnlockedBadgeNames(userId: string): Promise<string[]> {
  const { rows } = await pool.query(`SELECT badge_name, unlocked_date FROM badges WHERE user_id = $1`, [userId]);
  return rows.map((r) => r.badge_name);
}

export async function getUnlockedBadges(userId: string) {
  const { rows } = await pool.query(
    `SELECT badge_name, unlocked_date FROM badges WHERE user_id = $1`,
    [userId]
  );
  return rows;
}

export async function unlockBadge(userId: string, badgeName: string) {
  await pool.query(
    `INSERT INTO badges (user_id, badge_name, unlocked_date)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id, badge_name) DO NOTHING`,
    [userId, badgeName]
  );
}
