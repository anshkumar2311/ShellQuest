export interface DailyTaskProgress {
  id: number;
  userId: string; // clerk_user_id
  taskId: string;
  date: string;
  completed: boolean;
}
