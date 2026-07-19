export interface QuizResult {
  id: number;
  userId: string; // clerk_user_id
  topic: string;
  score: number;
  total: number;
  createdAt: string;
}
