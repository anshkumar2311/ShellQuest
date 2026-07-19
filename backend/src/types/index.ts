export interface AuthedUser {
  userId: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  verifyCommand?: string;
}

export interface Badge {
  name: string;
  description: string;
  unlocked: boolean;
  unlockedDate: string | null;
}

// Extend Express's Request with the Clerk user id set by verifyClerkAuth
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
